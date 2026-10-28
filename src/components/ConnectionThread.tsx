import { useEffect, useRef } from 'react';
import { NLink } from './NetworkLayout';
import { useLocale } from '../locale';
import {
  clamp,
  fitThreadArt,
  threadEnd,
  stepSpring,
  type Spring,
  type ThreadPose,
} from './thread-physics';
import './connection-thread.css';

type ThreadControls = { choose: (side: 'need' | 'offer', explicit: boolean) => void };

export function ConnectionThread({
  side,
  explicit,
}: {
  side: 'need' | 'offer';
  explicit: boolean;
}) {
  const { t } = useLocale();
  const art = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef<ThreadControls | null>(null);
  const choice = useRef({ side, explicit });
  choice.current = { side, explicit };

  useEffect(() => {
    controls.current?.choose(side, explicit);
  }, [side, explicit]);

  useEffect(() => {
    const root = art.current;
    const img = image.current;
    const surface = canvas.current;
    const end = root?.querySelector<HTMLAnchorElement>('.connection-thread-end');
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
        let artTop = 0;
        let focused = false;
        let drag: {
          id: number;
          x: number;
          y: number;
          sx: number;
          sy: number;
          moved: boolean;
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
        const scroll = () => {
          const y = artTop - window.scrollY;
          const viewport = window.innerHeight;
          target.pull = clamp((viewport * 0.78 - y - root.clientHeight * 0.3) / (viewport * 0.65));
          wake();
        };
        const resize = () => {
          const rect = img.getBoundingClientRect();
          const bounds = root.getBoundingClientRect();
          width = rect.width;
          height = rect.height;
          left = rect.left - bounds.left;
          top = rect.top - bounds.top;
          artTop = bounds.top + window.scrollY;
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
          scroll();
        };
        const leave = () => {
          if (drag) return;
          target.x = 0;
          target.y = focused ? -10 : 0;
          wake();
        };
        const pointer = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return;
          if (drag && drag.id === event.pointerId) {
            const dx = (event.clientX - drag.x) / fit.sx,
              dy = (event.clientY - drag.y) / fit.sy;
            if (Math.hypot(dx, dy) > 5) drag.moved = true;
            target.x = clamp(drag.sx + dx, -35, 55);
            target.y = clamp(drag.sy + dy, -45, 35);
            wake();
            return;
          }
          const bounds = root.getBoundingClientRect();
          const px = (event.clientX - bounds.left - left - fit.ox) / fit.sx;
          const py = (event.clientY - bounds.top - top - fit.oy) / fit.sy;
          const moved = threadEnd(pose());
          const distance = Math.hypot(px - moved.x, py - moved.y);
          const strength = 1 - clamp(distance / 240);
          target.x = clamp((px - moved.x) * 0.3, -22, 22) * strength;
          target.y = clamp((py - moved.y) * 0.3, -19, 19) * strength;
          wake();
        };
        const down = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse' || event.button !== 0) return;
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
          suppressClick = drag.moved;
          if (end.hasPointerCapture(event.pointerId)) end.releasePointerCapture(event.pointerId);
          drag = null;
          delete root.dataset.dragging;
          leave();
        };
        const click = (event: MouseEvent) => {
          if (suppressClick && event.detail > 0) event.preventDefault();
          suppressClick = false;
        };
        const focus = () => {
          focused = true;
          target.y = -10;
          wake();
        };
        const blur = () => {
          focused = false;
          leave();
        };
        const lost = () => {
          if (drag && end.hasPointerCapture(drag.id)) end.releasePointerCapture(drag.id);
          drag = null;
          alive = false;
          cancelAnimationFrame(frame);
          delete root.dataset.threadMotion;
          delete root.dataset.dragging;
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
        controls.current = {
          choose(next, explicitChoice) {
            target.side = explicitChoice ? (next === 'offer' ? 1 : -1) : 0;
            wake();
          },
        };
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
        window.addEventListener('scroll', scroll, { passive: true });
        window.addEventListener('resize', resize, { passive: true });
        region.addEventListener('pointermove', pointer as EventListener, { passive: true });
        region.addEventListener('pointerleave', leave);
        end.addEventListener('focus', focus);
        end.addEventListener('blur', blur);
        end.addEventListener('pointerdown', down);
        window.addEventListener('pointerup', release);
        window.addEventListener('pointercancel', release);
        end.addEventListener('click', click);
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
          window.removeEventListener('scroll', scroll);
          window.removeEventListener('resize', resize);
          region.removeEventListener('pointermove', pointer as EventListener);
          region.removeEventListener('pointerleave', leave);
          end.removeEventListener('focus', focus);
          end.removeEventListener('blur', blur);
          end.removeEventListener('pointerdown', down);
          window.removeEventListener('pointerup', release);
          window.removeEventListener('pointercancel', release);
          end.removeEventListener('click', click);
          surface.removeEventListener('webglcontextlost', lost);
          document.removeEventListener('visibilitychange', visibility);
          delete root.dataset.threadMotion;
          delete root.dataset.dragging;
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
    <div ref={art} className="scene-art connection-thread-art">
      <img
        ref={image}
        src="/assets/editorial/connection.webp"
        alt=""
        width="1586"
        height="992"
        loading="lazy"
      />
      <canvas ref={canvas} className="connection-thread-canvas" aria-hidden="true" />
      <NLink
        to={side === 'need' ? '/find-a-partner' : '/join'}
        className="connection-thread-end"
        draggable={false}
        title={t('Pull the thread', 'Потяните за нить')}
        aria-label={
          side === 'need'
            ? t('Take the other end — find a partner', 'Возьмите другой конец — найти партнёра')
            : t('Take the other end — join the network', 'Возьмите другой конец — стать партнёром')
        }
      >
        <span className="connection-thread-you folio" aria-hidden="true">
          {t('YOU', 'ВЫ')}
        </span>
      </NLink>
    </div>
  );
}
