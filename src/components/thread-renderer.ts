import {
  THREAD_ART,
  MAIN_GUIDE,
  TAIL_GUIDE,
  traceGuide,
  createRopeModel,
  threadEnd,
  stepSpring,
  type Point,
  type ThreadPose,
} from './thread-physics';

const vertex = `
precision highp float;
attribute vec2 a_position;
attribute vec2 a_normal;
attribute vec2 a_uv;
attribute vec2 a_center;
attribute float a_edge;
uniform vec2 u_view, u_scale, u_offset, u_shift;
uniform float u_radius;
varying vec2 v_uv, v_center;
varying float v_edge;
void main(){
  vec2 p=a_position+a_normal*u_radius*a_edge+u_shift;
  vec2 screen=(p*u_scale+u_offset)/u_view;
  gl_Position=vec4(screen.x*2.0-1.0,1.0-screen.y*2.0,0.0,1.0);
  v_uv=a_uv;v_center=a_center;v_edge=a_edge;
}`;
const fragment = `
precision highp float;
uniform sampler2D u_image, u_background;
uniform float u_kind, u_opacity;
varying vec2 v_uv, v_center;
varying float v_edge;
float pink(vec3 c){return smoothstep(0.04,0.18,c.r-c.g)*smoothstep(0.005,0.09,c.b-c.g);}
void main(){
  if(u_kind<0.5){gl_FragColor=texture2D(u_background,v_uv);return;}
  if(u_kind<1.5){
    vec3 tex=texture2D(u_image,v_uv).rgb;
    vec3 centre=texture2D(u_image,v_center).rgb;
    vec3 edge=centre*vec3(0.67,0.54,0.64);
    vec3 colour=mix(edge,tex,pink(tex));
    float alpha=1.0-smoothstep(0.83,1.0,abs(v_edge));
    gl_FragColor=vec4(colour,alpha);return;
  }
  if(u_kind<2.5){
    float alpha=exp(-v_edge*v_edge*4.5)*(1.0-smoothstep(0.8,1.0,abs(v_edge)))*u_opacity;
    gl_FragColor=vec4(0.23,0.13,0.08,alpha);return;
  }
  vec3 c=texture2D(u_image,v_uv).rgb;
  vec2 p=v_uv*vec2(1586.0,992.0);
  float ring=1.0-smoothstep(31.0,34.0,length(p-vec2(1446.0,685.0)));
  float alpha=max(ring,pink(c));
  if(u_kind>3.5){
    float shadow=1.0-smoothstep(25.0,43.0,length(p-vec2(1446.0,685.0)));
    gl_FragColor=vec4(0.23,0.13,0.08,max(shadow,pink(c)*0.6)*u_opacity);
  }else gl_FragColor=vec4(c,alpha);
}`;

function normals(points: Point[]) {
  return points.map((_, i) => {
    const a = points[Math.max(0, i - 1)],
      b = points[Math.min(points.length - 1, i + 1)],
      length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: -(b.y - a.y) / length, y: (b.x - a.x) / length };
  });
}

function smoothStrand(points: Point[]) {
  const result: Point[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[Math.max(0, i - 1)],
      b = points[i],
      c = points[i + 1],
      d = points[Math.min(points.length - 1, i + 2)];
    for (let j = 0; j < 3; j++) {
      const t = j / 3,
        t2 = t * t,
        t3 = t2 * t;
      const value = (axis: 'x' | 'y') =>
        0.5 *
        (2 * b[axis] +
          (-a[axis] + c[axis]) * t +
          (2 * a[axis] - 5 * b[axis] + 4 * c[axis] - d[axis]) * t2 +
          (-a[axis] + 3 * b[axis] - 3 * c[axis] + d[axis]) * t3);
      result.push({ x: value('x'), y: value('y') });
    }
  }
  result.push(points.at(-1)!);
  return result;
}

// Follow the actual pink centre, retaining the original braid rather than painting a new tube.
function refine(points: Point[], pixels: Uint8ClampedArray) {
  const ns = normals(points);
  return points.map((p, i) => {
    let weight = 0,
      offset = 0;
    for (let t = -12; t <= 12; t += 0.5) {
      const x = Math.round(p.x + ns[i].x * t),
        y = Math.round(p.y + ns[i].y * t),
        at = (y * 1586 + x) * 4;
      const r = pixels[at],
        g = pixels[at + 1],
        b = pixels[at + 2];
      const score = Math.max(0, r - g - 35) * Math.max(0, b - g - 5) * Math.exp((-t * t) / 65);
      offset += score * t;
      weight += score;
    }
    const move = weight ? offset / weight : 0;
    return { x: p.x + ns[i].x * move, y: p.y + ns[i].y * move };
  });
}

function backgroundPlate(
  image: HTMLImageElement,
  clean: HTMLImageElement,
  main: Point[],
  tail: Point[],
) {
  const base = document.createElement('canvas');
  base.width = 1586;
  base.height = 992;
  const ctx = base.getContext('2d')!;
  ctx.drawImage(image, 0, 0, 1586, 992);
  const mask = document.createElement('canvas');
  mask.width = 1586;
  mask.height = 992;
  const m = mask.getContext('2d')!;
  m.strokeStyle = 'white';
  m.fillStyle = 'white';
  m.lineCap = 'round';
  m.lineJoin = 'round';
  m.filter = 'blur(6px)';
  m.lineWidth = 43;
  const stroke = (points: Point[], skip = 0) => {
    m.beginPath();
    points.slice(skip).forEach((p, i) => {
      if (i) m.lineTo(p.x + 1, p.y + 7);
      else m.moveTo(p.x + 1, p.y + 7);
    });
    m.stroke();
  };
  stroke(main, 2);
  stroke(tail);
  m.beginPath();
  m.arc(1446, 688, 43, 0, Math.PI * 2);
  m.fill();
  m.beginPath();
  m.ellipse(1386, 685, 42, 34, 0, 0, Math.PI * 2);
  m.fill();
  const patch = document.createElement('canvas');
  patch.width = 1586;
  patch.height = 992;
  const c = patch.getContext('2d')!;
  c.drawImage(clean, 0, 0, 1586, 992);
  c.globalCompositeOperation = 'destination-in';
  c.drawImage(mask, 0, 0);
  ctx.drawImage(patch, 0, 0);
  return base;
}

type Mesh = {
  buffer: WebGLBuffer;
  indices: WebGLBuffer;
  count: number;
  data: Float32Array;
  source: Point[];
  capped?: boolean;
};
export function createThreadRenderer(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  clean: HTMLImageElement,
) {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: true,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  });
  if (!gl) return null;
  const buffers: WebGLBuffer[] = [],
    textures: WebGLTexture[] = [],
    shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  const dispose = () => {
    buffers.forEach((x) => gl.deleteBuffer(x));
    textures.forEach((x) => gl.deleteTexture(x));
    shaders.forEach((x) => gl.deleteShader(x));
    if (program) gl.deleteProgram(program);
  };
  try {
    program = gl.createProgram();
    if (!program) throw Error('No graphics program');
    const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision
      ? 'highp'
      : 'mediump';
    for (const [type, code] of [
      [gl.VERTEX_SHADER, vertex],
      [
        gl.FRAGMENT_SHADER,
        fragment.replace('precision highp float;', `precision ${precision} float;`),
      ],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw Error('No shader');
      shaders.push(shader);
      gl.shaderSource(shader, code);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error('Shader compilation');
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('Shader linking');
    gl.useProgram(program);
    const locations = Object.fromEntries(
      ['view', 'scale', 'offset', 'shift', 'radius', 'kind', 'opacity'].map((x) => [
        x,
        gl.getUniformLocation(program!, `u_${x}`),
      ]),
    );
    const attributes = ['position', 'normal', 'uv', 'center', 'edge'].map((x) =>
      gl.getAttribLocation(program!, `a_${x}`),
    );
    const original = document.createElement('canvas');
    original.width = 1586;
    original.height = 992;
    const context = original.getContext('2d')!;
    context.drawImage(image, 0, 0, 1586, 992);
    const pixels = context.getImageData(0, 0, 1586, 992).data;
    const mainSource = refine(traceGuide(MAIN_GUIDE, 116), pixels),
      tailSource = refine(traceGuide(TAIL_GUIDE, 24), pixels);
    const tip = tailSource.at(-1)!;
    const previousTip = tailSource.at(-2)!;
    const tipLength = Math.hypot(tip.x - previousTip.x, tip.y - previousTip.y);
    for (const distance of [2.2, 4.2, 5.6])
      tailSource.push({
        x: tip.x + ((tip.x - previousTip.x) / tipLength) * distance,
        y: tip.y + ((tip.y - previousTip.y) / tipLength) * distance,
      });
    // Keep the attachment coordinate exact; it joins the unchanged ring-and-knot sprite.
    mainSource[0] = { x: 590, y: 478 };
    mainSource[mainSource.length - 1] = { x: 1373, y: 681 };
    const model = createRopeModel(mainSource);
    const background = backgroundPlate(image, clean, mainSource, tailSource);
    for (const [unit, source] of [
      [0, background],
      [1, image],
    ] as const) {
      const texture = gl.createTexture();
      if (!texture) throw Error('No texture');
      textures.push(texture);
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }
    gl.uniform1i(gl.getUniformLocation(program, 'u_background'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const mesh = (source: Point[], quad = false): Mesh => {
      const buffer = gl.createBuffer(),
        indices = gl.createBuffer();
      if (!buffer || !indices) throw Error('No mesh');
      buffers.push(buffer, indices);
      const data = new Float32Array((quad ? 4 : source.length * 2) * 9),
        elements: number[] = [];
      if (quad) elements.push(0, 1, 2, 2, 1, 3);
      else
        for (let i = 0; i < source.length - 1; i++) {
          const a = i * 2;
          elements.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
        }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elements), gl.STATIC_DRAW);
      return { buffer, indices, count: elements.length, data, source };
    };
    const main = mesh(smoothStrand(mainSource)),
      tail = mesh(tailSource),
      back = mesh([], true),
      sprite = mesh([], true);
    tail.capped = true;
    const fillRibbon = (m: Mesh, points: Point[]) => {
      const n = normals(points),
        ns = normals(m.source);
      points.forEach((p, i) => {
        for (let side = 0; side < 2; side++) {
          const sign = side ? 1 : -1,
            cap = m.capped ? Math.max(0, i - (points.length - 4)) : 0,
            taper = [1, 0.94, 0.68, 0][cap],
            origin = m.source[i - cap],
            offset = (i * 2 + side) * 9;
          m.data.set(
            [
              p.x,
              p.y,
              n[i].x * taper,
              n[i].y * taper,
              (origin.x + ns[i - cap].x * sign * 6.8) / 1586,
              (origin.y + ns[i - cap].y * sign * 6.8) / 992,
              origin.x / 1586,
              origin.y / 992,
              sign,
            ],
            offset,
          );
        }
      });
    };
    const fillQuad = (m: Mesh, points: Point[], uv: Point[]) =>
      points.forEach((p, i) =>
        m.data.set([p.x, p.y, 0, 0, uv[i].x / 1586, uv[i].y / 992, 0, 0, 0], i * 9),
      );
    const corners = [
      { x: 0, y: 0 },
      { x: 1586, y: 0 },
      { x: 0, y: 992 },
      { x: 1586, y: 992 },
    ];
    fillQuad(back, corners, corners);
    const spriteSource = [
      { x: 1354, y: 642 },
      { x: 1488, y: 642 },
      { x: 1354, y: 730 },
      { x: 1488, y: 730 },
    ];
    const upload = (m: Mesh) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, m.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, m.data, gl.DYNAMIC_DRAW);
    };
    const bind = (m: Mesh) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, m.buffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.indices);
      for (let i = 0; i < attributes.length; i++) {
        gl.enableVertexAttribArray(attributes[i]);
        gl.vertexAttribPointer(
          attributes[i],
          i === 4 ? 1 : 2,
          gl.FLOAT,
          false,
          36,
          i === 4 ? 32 : i * 8,
        );
      }
    };
    upload(back);
    const paint = (
      m: Mesh,
      kind: number,
      radius = 0,
      dx = 0,
      dy = 0,
      opacity = 1,
      start = 0,
      count = m.count,
    ) => {
      bind(m);
      gl.uniform1f(locations.kind, kind);
      gl.uniform1f(locations.radius, radius);
      gl.uniform2f(locations.shift, dx, dy);
      gl.uniform1f(locations.opacity, opacity);
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, start * 2);
    };
    const cross = main.source.findIndex((p) => p.x > 904 && p.y > 695);
    const split = Math.max(1, cross) * 6;
    let tailAttach = mainSource.length - 2;
    for (let i = Math.floor(mainSource.length * 0.7); i < mainSource.length; i++)
      if (
        Math.abs(mainSource[i].x - tailSource[0].x) <
        Math.abs(mainSource[tailAttach].x - tailSource[0].x)
      )
        tailAttach = i;
    const sway = { value: 0, velocity: 0 };
    let lastAttach = { ...mainSource[tailAttach] },
      tailMoving = false;
    return {
      get moving() {
        return model.moving || tailMoving;
      },
      draw(
        pose: ThreadPose,
        width: number,
        height: number,
        fit: { sx: number; sy: number; ox: number; oy: number },
        seconds = 1 / 60,
      ) {
        if (gl.isContextLost() || width <= 0 || height <= 0) return false;
        model.step(pose, seconds);
        const anchor = model.nodes[tailAttach],
          origin = mainSource[tailAttach];
        const kick = (anchor.x - lastAttach.x) * 1.2 + (anchor.y - lastAttach.y) * 0.6;
        stepSpring(sway, kick, seconds, 6);
        lastAttach = { x: anchor.x, y: anchor.y };
        tailMoving = Math.abs(sway.value) > 0.002 || Math.abs(sway.velocity) > 0.01;
        const angle = sway.value * 0.035,
          cos = Math.cos(angle),
          sin = Math.sin(angle),
          base = tailSource[0];
        const tailPoints = tailSource.map((p) => ({
          x: base.x + anchor.x - origin.x + (p.x - base.x) * cos - (p.y - base.y) * sin,
          y: base.y + anchor.y - origin.y + (p.x - base.x) * sin + (p.y - base.y) * cos,
        }));
        fillRibbon(main, smoothStrand(model.nodes));
        fillRibbon(tail, tailPoints);
        upload(main);
        upload(tail);
        const end = threadEnd(pose),
          c = Math.cos(end.angle),
          s = Math.sin(end.angle);
        fillQuad(
          sprite,
          spriteSource.map((p) => ({
            x: end.x + (p.x - 1446) * c - (p.y - 685) * s,
            y: end.y + (p.x - 1446) * s + (p.y - 685) * c,
          })),
          spriteSource,
        );
        upload(sprite);
        const ratio = Math.min(window.devicePixelRatio || 1, 2, 2560 / width),
          w = Math.round(width * ratio),
          h = Math.round(height * ratio);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
        gl.uniform2f(locations.view, width, height);
        gl.uniform2f(locations.scale, fit.sx, fit.sy);
        gl.uniform2f(locations.offset, fit.ox, fit.oy);
        paint(back, 0);
        const lift = Math.min(3, Math.abs(pose.y) * 0.08 + Math.abs(sway.value) * 2);
        paint(main, 2, 17 + lift, 2, 9 + lift, 0.12);
        paint(main, 2, 9, 1, 4, 0.2);
        paint(tail, 2, 14 + lift, 2, 7 + lift, 0.16);
        paint(sprite, 4, 0, 2, 7 + lift, 0.14);
        paint(main, 1, 6.4, 0, 0, 1, split, main.count - split);
        paint(tail, 1, 5.6);
        // The outgoing strand lies above the returning loop at the crossing.
        paint(main, 2, 9, 1, 4, 0.12, 0, split);
        paint(main, 1, 6.4, 0, 0, 1, 0, split);
        paint(sprite, 3);
        if (import.meta.env.DEV) {
          let turn = 0;
          for (let i = 1; i < model.nodes.length - 1; i++) {
            const a = model.nodes[i - 1],
              b = model.nodes[i],
              c = model.nodes[i + 1],
              x = b.x - a.x,
              y = b.y - a.y,
              u = c.x - b.x,
              v = c.y - b.y;
            turn = Math.max(turn, Math.abs(Math.atan2(x * v - y * u, x * u + y * v)));
          }
          canvas.dataset.ropeBend = ((turn * 180) / Math.PI).toFixed(2);
          canvas.dataset.ropeDraws = String(Number(canvas.dataset.ropeDraws || 0) + 1);
          canvas.dataset.ropeMoving = String(model.moving);
        }
        return true;
      },
      dispose,
    };
  } catch {
    dispose();
    return null;
  }
}
