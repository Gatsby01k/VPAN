import { useEffect, useRef, useState } from 'react';
import { startLiquidFlow } from './liquid-flow';

export function LiquidSculpture({ alt }: { alt: string }) {
  const image = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const source = image.current;
    const surface = canvas.current;
    if (!source || !surface) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let dispose = () => {};
    const sync = () => {
      dispose();
      dispose = () => {};
      setLive(false);
      if (preference.matches || !source.complete || !source.naturalWidth) return;
      try {
        dispose = startLiquidFlow(surface, source, setLive);
      } catch {
        // The original artwork remains visible if this device cannot run the effect.
      }
    };
    source.addEventListener('load', sync);
    preference.addEventListener('change', sync);
    sync();
    return () => {
      dispose();
      source.removeEventListener('load', sync);
      preference.removeEventListener('change', sync);
    };
  }, []);
  return (
    <div className="sculpture-object-layer" data-flow={live ? 'live' : 'still'}>
      <img
        ref={image}
        className="deck-hero-object"
        src="/assets/pan-core-cutout-v2.webp"
        width="1089"
        height="1445"
        fetchPriority="high"
        alt={alt}
      />
      <canvas
        ref={canvas}
        className="sculpture-liquid"
        width="768"
        height="1019"
        aria-hidden="true"
      />
    </div>
  );
}
