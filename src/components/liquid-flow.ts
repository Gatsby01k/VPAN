const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * .5 + .5;
  gl_Position = vec4(a_position, 0., 1.);
}`;

const fragmentSource = `
precision highp float;
uniform sampler2D u_art;
uniform float u_time;
uniform vec2 u_texel;
varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
             mix(hash(i + vec2(0., 1.)), hash(i + 1.), f.x), f.y);
}
float fluid(vec2 p) {
  return .65 * noise(p) + .35 * noise(p * 2.13 + 7.4);
}
float pink(vec3 c) {
  // Gold has no blue component: the hue gate leaves it and the stone untouched.
  return smoothstep(.12, .38, c.r - c.g)
       * smoothstep(.06, .26, c.b - c.g * .85)
       * smoothstep(.2, .6, c.r);
}
void channel(vec2 p, vec2 from, vec2 to, inout float closest, inout vec2 direction, inout float progress) {
  vec2 axis = to - from;
  float t = clamp(dot(p - from, axis) / dot(axis, axis), 0., 1.);
  float distanceToAxis = length(p - from - axis * t);
  if (distanceToAxis < closest) {
    closest = distanceToAxis;
    direction = normalize(axis);
    progress = t;
  }
}
void main() {
  vec4 original = texture2D(u_art, v_uv);
  if (original.a < .004) { gl_FragColor = original; return; }
  vec2 p = vec2(v_uv.x, 1. - v_uv.y);
  float hue = pink(original.rgb);
  vec3 nearby = texture2D(u_art, v_uv + u_texel * vec2(4., 0.)).rgb
              + texture2D(u_art, v_uv - u_texel * vec2(4., 0.)).rgb
              + texture2D(u_art, v_uv + u_texel * vec2(0., 4.)).rgb
              + texture2D(u_art, v_uv - u_texel * vec2(0., 4.)).rgb;
  float spill = pink(nearby * .25) * (1. - hue);
  if (hue < .004 && spill < .004) { gl_FragColor = original; return; }
  float closest = .07;
  vec2 direction = p.y < .52 ? vec2(0., -1.) : vec2(0., 1.);
  float progress = p.y * 2.;
  // Four actual conduits in the owner's artwork; liquid travels out from the hub.
  channel(p, vec2(.39, .46), vec2(.17, .39), closest, direction, progress);
  channel(p, vec2(.64, .47), vec2(.83, .40), closest, direction, progress);
  channel(p, vec2(.42, .56), vec2(.23, .63), closest, direction, progress);
  channel(p, vec2(.62, .56), vec2(.82, .64), closest, direction, progress);

  vec2 perpendicular = vec2(-direction.y, direction.x);
  vec2 advected = p * vec2(64., 85.) - direction * u_time * 2.4;
  float turbulence = fluid(advected);
  float fine = noise(advected * 2.1 + perpendicular * u_time * .7);
  float filament = smoothstep(.48, .87, turbulence * .72 + fine * .28);
  float surge = .5 + .5 * sin(progress * 9. - u_time * 1.8 + turbulence * 2.6);

  // Refraction stays inside the original pink hue mask and never moves the silhouette.
  vec2 offset = perpendicular * (turbulence - .5) * .0022 * hue;
  vec4 refracted = texture2D(u_art, v_uv + vec2(offset.x, -offset.y));
  float safeRefraction = hue * pink(refracted.rgb) * .55;
  vec3 color = mix(original.rgb, refracted.rgb, safeRefraction);
  color *= 1. - hue * (.08 + (1. - turbulence) * .08);
  vec3 emission = mix(vec3(1., .015, .31), vec3(1., .32, .66), filament);
  float energy = hue * (.09 + filament * .30 + surge * .09);
  color += emission * energy;

  // Light spills onto the adjacent material, with the same slow local current.
  float reflected = spill * .045 * (.6 + surge * .4);
  color += vec3(1., .015, .28) * reflected;
  gl_FragColor = vec4(min(color, vec3(1.)), original.a);
}`;

/** Progressive enhancement of the original texture; failure always retains the image. */
export function startLiquidFlow(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  ready: (active: boolean) => void,
): () => void {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });
  if (!gl) return () => {};
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    gl.deleteShader(shader);
    return null;
  };
  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    if (program) gl.deleteProgram(program);
    return () => {};
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return () => {};
  }
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  if (!buffer || !texture) {
    if (buffer) gl.deleteBuffer(buffer);
    if (texture) gl.deleteTexture(texture);
    gl.deleteProgram(program);
    return () => {};
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const release = () => {
    gl.useProgram(null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  };
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  } catch {
    release();
    return () => {};
  }
  if (gl.getError() !== gl.NO_ERROR) {
    release();
    return () => {};
  }
  gl.uniform1i(gl.getUniformLocation(program, 'u_art'), 0);
  gl.uniform2f(
    gl.getUniformLocation(program, 'u_texel'),
    1 / image.naturalWidth,
    1 / image.naturalHeight,
  );
  const time = gl.getUniformLocation(program, 'u_time');
  const resize = () => {
    const height = Math.round(
      Math.min(1280, Math.max(480, canvas.clientHeight * Math.min(devicePixelRatio, 1.5))),
    );
    canvas.height = height;
    canvas.width = Math.round((height * image.naturalWidth) / image.naturalHeight);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  resize();
  if (gl.getError() !== gl.NO_ERROR) {
    release();
    return () => {};
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  let frame = 0;
  let visible = true;
  let disposed = false;
  let last = 0;
  const start = performance.now();
  const draw = (now: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden || gl.isContextLost()) return;
    if (now - last >= 1000 / 30) {
      gl.uniform1f(time, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      last = now;
    }
    frame = requestAnimationFrame(draw);
  };
  const syncVisibility = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!disposed && visible && !document.hidden) frame = requestAnimationFrame(draw);
  };
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncVisibility();
  });
  intersection.observe(canvas);
  const lost = () => {
    cancelAnimationFrame(frame);
    ready(false);
  };
  canvas.addEventListener('webglcontextlost', lost);
  document.addEventListener('visibilitychange', syncVisibility);
  gl.uniform1f(time, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  ready(true);
  syncVisibility();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    intersection.disconnect();
    resizeObserver.disconnect();
    canvas.removeEventListener('webglcontextlost', lost);
    document.removeEventListener('visibilitychange', syncVisibility);
    release();
  };
}
