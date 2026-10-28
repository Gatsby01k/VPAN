import test from 'node:test';
import assert from 'node:assert/strict';
import {
  THREAD_ART,
  createRopeModel,
  threadEnd,
  stepSpring,
  fitThreadArt,
} from '../src/components/thread-physics.ts';
const peak = { pull: 1, x: 55, y: -45, side: 1 };
const simulate = (pose, fps = 120, seconds = 7) => {
  const rope = createRopeModel();
  for (let i = 0; i < fps * seconds; i++) rope.step(pose, 1 / fps);
  return rope;
};
const stretch = (rope) =>
  Math.max(
    ...rope.lengths.map((length, i) =>
      Math.abs(
        Math.hypot(rope.nodes[i + 1].x - rope.nodes[i].x, rope.nodes[i + 1].y - rope.nodes[i].y) /
          length -
          1,
      ),
    ),
  );
const bend = (points) =>
  Math.max(
    ...points.slice(1, -1).map((b, i) => {
      const a = points[i],
        c = points[i + 2],
        x = b.x - a.x,
        y = b.y - a.y,
        u = c.x - b.x,
        v = c.y - b.y;
      return Math.abs(Math.atan2(x * v - y * u, x * u + y * v));
    }),
  );

test('the cord stays attached to the unchanged gold spool under the strongest allowed drag', () => {
  const rope = simulate(peak);
  for (let i = 0; i < 13; i++)
    assert.deepEqual({ x: rope.nodes[i].x, y: rope.nodes[i].y }, rope.source[i]);
  const end = threadEnd(peak),
    cos = Math.cos(end.angle),
    sin = Math.sin(end.angle);
  assert.ok(Math.abs(rope.nodes.at(-1).x - (end.x - 73 * cos + 4 * sin)) < 1e-8);
  assert.ok(Math.abs(rope.nodes.at(-1).y - (end.y - 73 * sin - 4 * cos)) < 1e-8);
});

test('normal tension and maximum mouse drag preserve segment lengths within one percent', () => {
  for (const pose of [
    { pull: 0.8, x: 0, y: 0, side: 0 },
    peak,
    { pull: 0, x: -35, y: 35, side: -1 },
  ])
    assert.ok(stretch(simulate(pose)) < 0.01);
});

test('bending stiffness prevents sharp kinks while a pull propagates through the loop', () => {
  const rope = createRopeModel(),
    spring = { value: 0, velocity: 0 };
  let worst = 0;
  for (let i = 0; i < 720; i++) {
    stepSpring(spring, i < 360 ? 1 : 0, 1 / 120, 7);
    rope.step(
      { pull: spring.value, x: spring.value * 55, y: spring.value * -45, side: spring.value },
      1 / 120,
    );
    worst = Math.max(worst, bend(rope.nodes));
  }
  assert.ok(worst < Math.PI / 3, `Maximum bend ${(worst * 180) / Math.PI}`);
});

test('the rope carries inertia after release, then sleeps and stops moving', () => {
  const rope = simulate(peak);
  const rest = { pull: 0, x: 0, y: 0, side: 0 };
  rope.step(rest, 1 / 120);
  assert.equal(rope.moving, true);
  for (let i = 0; i < 1200; i++) rope.step(rest, 1 / 120);
  assert.equal(rope.moving, false);
  const before = rope.nodes.map((p) => ({ ...p }));
  rope.step(rest, 1 / 60);
  assert.deepEqual(rope.nodes, before);
});

test('physical substeps and springs give consistent results on 30, 60 and 120 Hz displays', () => {
  const results = [30, 60, 120].map((fps) => simulate(peak, fps));
  for (let i = 0; i < results[0].nodes.length; i++) {
    assert.ok(
      Math.hypot(
        results[0].nodes[i].x - results[2].nodes[i].x,
        results[0].nodes[i].y - results[2].nodes[i].y,
      ) < 0.1,
    );
  }
  for (const fps of [30, 60, 120]) {
    const spring = { value: 0, velocity: 0 };
    for (let i = 0; i < fps * 2; i++) stepSpring(spring, 1, 1 / fps, 7);
    assert.ok(Math.abs(spring.value - 1) < 0.00002);
  }
});

test('the rigid ring remains inside the artwork and mobile object-fit retains the original crop', () => {
  const end = threadEnd(peak);
  assert.ok(end.x + 34 < THREAD_ART.width);
  assert.deepEqual(fitThreadArt(1586, 992, 'cover', '50% 50%'), { sx: 1, sy: 1, ox: 0, oy: 0 });
  const fit = fitThreadArt(390 * 1.45, 325, 'cover', '30% 50%');
  assert.equal(fit.sx, fit.sy);
  assert.ok(Math.abs((325 - 992 * fit.sy) / 2 - fit.oy) < 0.00001);
});
