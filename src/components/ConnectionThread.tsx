import { useEffect, useRef } from 'react';
import { useLocale } from '../locale';
import {
  clamp,
  THREAD_ART,
  fitThreadArt,
  threadEnd,
  stepSpring,
  type Spring,
  type ThreadPose,
} from './thread-physics';
import './connection-thread.css';

type Side = 'need' | 'offer';
type ThreadControls = { choose: (side: Side, explicit: boolean) => void };
const socketOffset = { need: -94, offer: 90 };

export function ConnectionThread({
  side,
  explicit,
  onSide,
}: {
  side: Side;
  explicit: boolean;
  onSide: (side: Side) => void;
}) {
  const { t } = useLocale();
  const art = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef<ThreadControls | null>(null);
  const choice = useRef({ side, explicit, onSide });
  choice.current = { side, explicit, onSide };

  useEffect(() => {
    controls.current?.choose(side, explicit);
  }, [side, explicit]);

  useEffect(() => {
    const root = art.current;
    const img = image.current;
    const surface = canvas.current;
    const end = root?.querySelector<HTMLButtonElement>('.connection-thread-end');
    if (!root || !img || !surface || !end) return;
    const region = root.closest('section') || root;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let teardown: (() => void) | undefined;
    let generation = 0;
    let destroyed = false;

    // Deliberately lazy: no GPU context or animation module for a static/offscreen scene.
    const start = async () => {
      const current = ++generation;
      teardown?.();
      teardown = undefined;
      if (reduce.matches || destroyed) return;
      try {
        const clean = new Image();
        clean.src = '/assets/editorial/connection-clean-v2.webp';
        const [graphics] = await Promise.all([
          import('./thread-renderer'),
          img.decode(),
          clean.decode(),
        ]);
        if (destroyed || current !== generation || reduce.matches) return;
        const renderer = graphics.createThreadRenderer(surface, img, clean);
        if (!renderer) return;

        const springs = {
          pull: { value: 0, velocity: 0 },
          x: { value: 0, velocity: 0 },
          y: { value: 0, velocity: 0 },
          side: { value: 0, velocity: 0 },
        } satisfies Record<string, Spring>;
        const target = { pull: 0, x: 0, y: 0, side: 0 };
        let frame = 0;
        let previous = 0;
        let visible = true;
        let alive = true;
        let dirty = true;
        let width = 1;
        let height = 1;
        let left = 0;
        let top = 0;
        let fit = fitThreadArt(1, 1, 'cover', '50% 50%');
        let drag: {
          id: number;
          x: number;
          y: number;
          sx: number;
          sy: number;
          moved: boolean;
          candidate?: Side;
        } | null = null;
        let suppressClick = false;

        const pose = (): ThreadPose => ({
          pull: springs.pull.value,
          x: springs.x.value,
          y: springs.y.value,
          side: springs.side.value,
        });
        const placeEnd = (p: ThreadPose) => {
          const moved = threadEnd(p);
          end.style.left = `${left + moved.x * fit.sx + fit.ox}px`;
          end.style.top = `${top + moved.y * fit.sy + fit.oy}px`;
          end.style.setProperty('--end-size', `${Math.max(48, 68 * fit.sx)}px`);
        };
        const tick = (now: number) => {
          frame = 0;
          if (!alive || !visible || document.hidden) {
            previous = 0;
            return;
          }
          const seconds = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60;
          previous = now;
          let moving = false;
          for (const key of ['pull', 'x', 'y', 'side'] as const) {
            const s = springs[key];
            stepSpring(s, target[key], seconds, key === 'pull' ? 7 : 11);
            if (Math.abs(s.value - target[key]) > 0.0005 || Math.abs(s.velocity) > 0.004)
              moving = true;
            else {
              s.value = target[key];
              s.velocity = 0;
            }
          }
          const p = pose();
          if (dirty || moving || renderer.moving) {
            if (renderer.draw(p, width, height, fit, seconds)) {
              root.dataset.threadMotion = 'ready';
              placeEnd(p);
            }
            dirty = false;
          }
          if (renderer.moving) moving = true;
          if (moving) frame = requestAnimationFrame(tick);
          else previous = 0;
        };
        const wake = () => {
          dirty = true;
          if (!frame && visible && !document.hidden && alive) frame = requestAnimationFrame(tick);
        };
        const resize = () => {
          const rect = img.getBoundingClientRect();
          const bounds = root.getBoundingClientRect();
          width = rect.width;
          height = rect.height;
          left = rect.left - bounds.left;
          top = rect.top - bounds.top;
          const css = getComputedStyle(img);
          fit = fitThreadArt(width, height, css.objectFit, css.objectPosition);
          Object.assign(surface.style, {
            width: `${width}px`,
            height: `${height}px`,
            left: `${left}px`,
            top: `${top}px`,
          });
          // A resize must also refresh a sleeping/hidden canvas before it is exposed again.
          if (renderer.draw(pose(), width, height, fit, 0)) {
            root.dataset.threadMotion = 'ready';
            placeEnd(pose());
          }
          wake();
        };
        const settle = (side: Side, selected: boolean) => {
          target.side = selected ? (side === 'offer' ? 1 : -1) : 0;
          target.pull = selected ? 0.5 : 0;
          target.x = -target.pull * 38 - target.side * 5;
          target.y = (selected ? socketOffset[side] : 0) + target.pull * 18 + target.side * 7;
          wake();
        };
        const leave = () => {
          if (!drag) settle(choice.current.side, choice.current.explicit);
        };
        const pointer = (event: PointerEvent) => {
          if (drag?.id === event.pointerId) {
            const dx = (event.clientX - drag.x) / fit.sx;
            const dy = (event.clientY - drag.y) / fit.sy;
            if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 5) drag.moved = true;
            target.pull = 0.45;
            target.x = clamp(drag.sx + dx, -84, 66);
            target.y = clamp(drag.sy + dy, -114, 114);
            const offset = threadEnd(target).y - THREAD_ART.endY;
            drag.candidate = Math.abs(offset) >= 36 ? (offset < 0 ? 'need' : 'offer') : undefined;
            root.dataset.candidate = drag.candidate ?? '';
            wake();
          } else if (event.pointerType === 'mouse' && !choice.current.explicit) {
            const bounds = root.getBoundingClientRect();
            const px = (event.clientX - bounds.left - left - fit.ox) / fit.sx;
            const py = (event.clientY - bounds.top - top - fit.oy) / fit.sy;
            const strength =
              1 - clamp(Math.hypot(px - THREAD_ART.endX, py - THREAD_ART.endY) / 200);
            target.x = clamp((px - THREAD_ART.endX) * 0.2, -16, 16) * strength;
            target.y = clamp((py - THREAD_ART.endY) * 0.2, -14, 14) * strength;
            wake();
          }
        };
        const down = (event: PointerEvent) => {
          if (event.button !== 0 || !event.isPrimary) return;
          suppressClick = false;
          drag = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            sx: springs.x.value,
            sy: springs.y.value,
            moved: false,
          };
          end.setPointerCapture(event.pointerId);
          root.dataset.dragging = 'true';
        };
        const release = (event: PointerEvent) => {
          if (!drag || drag.id !== event.pointerId) return;
          const selected = event.type === 'pointerup' && drag.moved ? drag.candidate : undefined;
          suppressClick = drag.moved;
          drag = null;
          delete root.dataset.dragging;
          delete root.dataset.candidate;
          if (selected) {
            settle(selected, true);
            choice.current.onSide(selected);
          } else {
            leave();
          }
        };
        const click = (event: MouseEvent) => {
          if (suppressClick && event.detail > 0) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
          suppressClick = false;
        };
        const lost = () => {
          if (drag && end.hasPointerCapture(drag.id)) end.releasePointerCapture(drag.id);
          drag = null;
          alive = false;
          cancelAnimationFrame(frame);
          delete root.dataset.threadMotion;
          delete root.dataset.dragging;
          delete root.dataset.candidate;
          end.removeAttribute('style');
          teardown?.();
        };
        const visibility = () => {
          if (document.hidden) {
            cancelAnimationFrame(frame);
            frame = 0;
            previous = 0;
          } else {
            resize();
          }
        };
        controls.current = { choose: settle };
        const intersection = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            if (visible) resize();
            else {
              cancelAnimationFrame(frame);
              frame = 0;
              previous = 0;
            }
          },
          { rootMargin: '80px' },
        );
        const size = new ResizeObserver(resize);
        size.observe(root);
        intersection.observe(root);
        window.addEventListener('resize', resize, { passive: true });
        region.addEventListener('pointermove', pointer as EventListener, { passive: true });
        region.addEventListener('pointerleave', leave);
        end.addEventListener('pointerdown', down);
        window.addEventListener('pointerup', release);
        window.addEventListener('pointercancel', release);
        end.addEventListener('click', click, true);
        end.addEventListener('lostpointercapture', release);
        surface.addEventListener('webglcontextlost', lost);
        document.addEventListener('visibilitychange', visibility);
        resize();
        controls.current.choose(choice.current.side, choice.current.explicit);
        teardown = () => {
          alive = false;
          cancelAnimationFrame(frame);
          controls.current = null;
          intersection.disconnect();
          size.disconnect();
          window.removeEventListener('resize', resize);
          region.removeEventListener('pointermove', pointer as EventListener);
          region.removeEventListener('pointerleave', leave);
          end.removeEventListener('pointerdown', down);
          window.removeEventListener('pointerup', release);
          window.removeEventListener('pointercancel', release);
          end.removeEventListener('click', click, true);
          end.removeEventListener('lostpointercapture', release);
          surface.removeEventListener('webglcontextlost', lost);
          document.removeEventListener('visibilitychange', visibility);
          delete root.dataset.threadMotion;
          delete root.dataset.dragging;
          delete root.dataset.candidate;
          end.removeAttribute('style');
          renderer.dispose();
        };
      } catch {
        // The supplied image and native link are also the no-JS/no-GPU rendering.
      }
    };
    const nearby = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          nearby.disconnect();
          void start();
        }
      },
      { rootMargin: '300px' },
    );
    nearby.observe(root);
    const preference = () => {
      void start();
    };
    reduce.addEventListener('change', preference);
    return () => {
      destroyed = true;
      generation++;
      nearby.disconnect();
      reduce.removeEventListener('change', preference);
      teardown?.();
    };
  }, []);

  return (
    <div ref={art} className="connection-thread-art" data-intent={explicit ? side : undefined}>
      <div className="connection-thread-print">
        <img
          ref={image}
          src="/assets/editorial/connection.webp"
          alt=""
          width="1586"
          height="992"
          loading="lazy"
        />
        <canvas ref={canvas} className="connection-thread-canvas" aria-hidden="true" />
      </div>
      <div className="connection-sockets" aria-hidden="true">
        <span data-socket="need">
          <b>I NEED</b>
          <i />
        </span>
        <span data-socket="offer">
          <b>I OFFER</b>
          <i />
        </span>
      </div>
      <button
        type="button"
        className="connection-thread-end"
        title={t('Drag the ring or switch intent', 'Потяните кольцо или переключите намерение')}
        aria-label={t('Switch connection intent', 'Переключить намерение')}
        onClick={() => onSide(side === 'need' ? 'offer' : 'need')}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
          event.preventDefault();
          onSide(event.key === 'ArrowUp' ? 'need' : 'offer');
        }}
      />
    </div>
  );
}
