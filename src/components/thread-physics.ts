export const THREAD_ART = { width: 1586, height: 992, endX: 1446, endY: 685 };
export type Point = { x: number; y: number };
export type Spring = { value: number; velocity: number };
export type ThreadPose = { pull: number; x: number; y: number; side: number };
export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Traced through the original illustration in its original pixel coordinates.
export const MAIN_GUIDE = [
  [590, 478],
  [634, 501],
  [693, 542],
  [760, 590],
  [827, 638],
  [891, 682],
  [927, 724],
  [923, 754],
  [889, 781],
  [834, 802],
  [774, 817],
  [722, 818],
  [690, 809],
  [677, 791],
  [680, 772],
  [700, 750],
  [743, 726],
  [800, 704],
  [860, 686],
  [930, 672],
  [1002, 665],
  [1070, 670],
  [1150, 679],
  [1230, 686],
  [1310, 685],
  [1373, 681],
];
export const TAIL_GUIDE = [
  [1243, 685],
  [1276, 673],
  [1297, 655],
  [1309, 634],
  [1308, 612],
  [1298, 596],
  [1288, 588],
];

export function stepSpring(spring: Spring, target: number, seconds: number, frequency: number) {
  const offset = spring.value - target,
    decay = Math.exp(-frequency * seconds),
    c = spring.velocity + frequency * offset;
  spring.value = target + (offset + c * seconds) * decay;
  spring.velocity = (spring.velocity - frequency * c * seconds) * decay;
}

export function traceGuide(guide: number[][], count: number): Point[] {
  const dense: Point[] = [];
  for (let i = 0; i < guide.length - 1; i++) {
    const a = guide[Math.max(0, i - 1)],
      b = guide[i],
      c = guide[i + 1],
      d = guide[Math.min(guide.length - 1, i + 2)];
    for (let j = 0; j < 16; j++) {
      const t = j / 16,
        t2 = t * t,
        t3 = t2 * t;
      const value = (axis: number) =>
        0.5 *
        (2 * b[axis] +
          (-a[axis] + c[axis]) * t +
          (2 * a[axis] - 5 * b[axis] + 4 * c[axis] - d[axis]) * t2 +
          (-a[axis] + 3 * b[axis] - 3 * c[axis] + d[axis]) * t3);
      dense.push({ x: value(0), y: value(1) });
    }
  }
  const last = guide[guide.length - 1];
  dense.push({ x: last[0], y: last[1] });
  const distance = [0];
  for (let i = 1; i < dense.length; i++)
    distance.push(
      distance[i - 1] + Math.hypot(dense[i].x - dense[i - 1].x, dense[i].y - dense[i - 1].y),
    );
  const result: Point[] = [];
  let index = 1;
  for (let i = 0; i < count; i++) {
    const length = (distance.at(-1)! * i) / (count - 1);
    while (index < dense.length - 1 && distance[index] < length) index++;
    const t = (length - distance[index - 1]) / (distance[index] - distance[index - 1] || 1);
    result.push({
      x: dense[index - 1].x + (dense[index].x - dense[index - 1].x) * t,
      y: dense[index - 1].y + (dense[index].y - dense[index - 1].y) * t,
    });
  }
  return result;
}

export function threadEnd(pose: ThreadPose) {
  return {
    x: THREAD_ART.endX + pose.pull * 38 + pose.x + pose.side * 5,
    y: THREAD_ART.endY - pose.pull * 18 + pose.y - pose.side * 7,
    angle: clamp((pose.y - pose.pull * 9) * 0.0018 - pose.side * 0.009, -0.06, 0.06),
  };
}

export function createRopeModel(source = traceGuide(MAIN_GUIDE, 116)) {
  const nodes = source.map((p) => ({ ...p, px: p.x, py: p.y }));
  const lengths = source.slice(1).map((p, i) => Math.hypot(p.x - source[i].x, p.y - source[i].y));
  const bendLengths = source.map((_, i) => {
    const a = source[Math.max(0, i - 1)],
      b = source[Math.min(source.length - 1, i + 1)];
    return Math.hypot(b.x - a.x, b.y - a.y);
  });
  const fixed = 13;
  let quiet = 0,
    unchanged = 0,
    previousKey = '',
    moving = true;
  return {
    source,
    nodes,
    lengths,
    get moving() {
      return moving;
    },
    step(pose: ThreadPose, elapsed: number) {
      const key = [pose.pull, pose.x, pose.y, pose.side].map((v) => v.toFixed(4)).join(',');
      if (key !== previousKey) {
        quiet = 0;
        unchanged = 0;
        moving = true;
        previousKey = key;
      } else unchanged += elapsed;
      if (!moving) return;
      const end = threadEnd(pose),
        cos = Math.cos(end.angle),
        sin = Math.sin(end.angle);
      const attach = { x: end.x - 73 * cos + 4 * sin, y: end.y - 73 * sin - 4 * cos };
      const dx = attach.x - source.at(-1)!.x,
        dy = attach.y - source.at(-1)!.y;
      const steps = Math.max(1, Math.ceil(Math.min(elapsed, 0.05) * 120)),
        dt = Math.min(elapsed, 0.05) / steps;
      let largest = 0;
      for (let sub = 0; sub < steps; sub++) {
        const before = nodes.map((p) => ({ x: p.x, y: p.y }));
        for (let i = fixed; i < nodes.length - 1; i++) {
          const n = nodes[i],
            origin = source[i],
            t = i / (nodes.length - 1);
          const carried = smooth(0.48, 1, t),
            slack = smooth(690, 775, origin.y) * (1 - smooth(0.66, 0.84, t));
          const gx = origin.x + dx * carried + pose.pull * 11 * slack,
            gy = origin.y + dy * carried - pose.pull * 24 * slack;
          const vx = (n.x - n.px) * Math.exp(-dt * 10),
            vy = (n.y - n.py) * Math.exp(-dt * 10);
          n.px = n.x;
          n.py = n.y;
          n.x += vx + (gx - n.x) * dt * dt * 55;
          n.y += vy + (gy - n.y) * dt * dt * 55;
        }
        // Fixed segment lengths transmit the pull through the slack; the weave never stretches.
        nodes.at(-1)!.x = attach.x;
        nodes.at(-1)!.y = attach.y;
        for (let iteration = 0; iteration < 84; iteration++) {
          // Bending stiffness and a minimum bend radius prevent buckling into a sharp kink.
          for (let i = fixed - 1; i < nodes.length - 1; i++) {
            const a = nodes[i - 1],
              b = nodes[i + 1];
            const ax = i - 1 < fixed ? 0 : 1,
              bx = i + 1 === nodes.length - 1 ? 0 : 1,
              weight = ax + bx;
            if (!weight) continue;
            const dx = b.x - a.x,
              dy = b.y - a.y,
              d = Math.hypot(dx, dy) || 1;
            const minimum = (lengths[i - 1] + lengths[i]) * 0.94;
            const target = Math.max(minimum, bendLengths[i]);
            if (d < target) {
              const strength = d < minimum ? 0.8 : 0.18;
              const correction = ((d - target) / d / weight) * strength;
              a.x += dx * correction * ax;
              a.y += dy * correction * ax;
              b.x -= dx * correction * bx;
              b.y -= dy * correction * bx;
            }
          }
          for (let j = 0; j < lengths.length; j++) {
            const i = iteration % 2 ? lengths.length - 1 - j : j,
              a = nodes[i],
              b = nodes[i + 1];
            const ax = i < fixed ? 0 : 1,
              bx = i + 1 === nodes.length - 1 ? 0 : 1,
              weight = ax + bx;
            if (!weight) continue;
            const x = b.x - a.x,
              y = b.y - a.y,
              length = Math.hypot(x, y) || 1,
              correction = (length - lengths[i]) / length / weight;
            a.x += x * correction * ax;
            a.y += y * correction * ax;
            b.x -= x * correction * bx;
            b.y -= y * correction * bx;
          }
          for (let i = 0; i < fixed; i++) {
            nodes[i].x = source[i].x;
            nodes[i].y = source[i].y;
          }
          nodes.at(-1)!.x = attach.x;
          nodes.at(-1)!.y = attach.y;
        }
        for (let i = fixed; i < nodes.length; i++)
          largest = Math.max(
            largest,
            Math.hypot(nodes[i].x - before[i].x, nodes[i].y - before[i].y),
          );
      }
      quiet = largest < 0.016 ? quiet + elapsed : 0;
      moving = quiet < 0.22 && unchanged < 4;
    },
  };
}

export function fitThreadArt(width: number, height: number, fit: string, position: string) {
  const scale = Math.max(width / THREAD_ART.width, height / THREAD_ART.height),
    sx = fit === 'fill' ? width / THREAD_ART.width : scale,
    sy = fit === 'fill' ? height / THREAD_ART.height : scale;
  const parts = position.split(' ');
  const percent = (value: string | undefined) => {
    if (value === 'left' || value === 'top') return 0;
    if (value === 'right' || value === 'bottom') return 1;
    return value?.endsWith('%') ? parseFloat(value) / 100 : 0.5;
  };
  return {
    sx,
    sy,
    ox: (width - THREAD_ART.width * sx) * percent(parts[0]),
    oy: (height - THREAD_ART.height * sy) * percent(parts[1]),
  };
}
