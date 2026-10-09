import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { useInView, useReducedMotion } from 'motion/react';

const Sculpture = lazy(() => import('./Sculpture'));
class ArtBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StaticArt /> : this.props.children;
  }
}
function StaticArt() {
  return (
    <div className="sculpture-static">
      <span />
      <span />
      <span />
      <i />
    </div>
  );
}

export function HeroArt() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '100px' });
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    if (context) {
      context.getExtension('WEBGL_lose_context')?.loseContext();
      setReady(true);
    }
  }, []);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return (
    <div ref={ref} className="hero-art" aria-hidden="true">
      <div className="art-halo" />
      <div className="art-cross art-cross-top">+</div>
      <div className="art-cross art-cross-bottom">+</div>
      <div className="art-label art-label-top">PAN / CONNECTION ENGINE</div>
      <ArtBoundary>
        <Suspense fallback={<StaticArt />}>
          {ready ? (
            <Sculpture reduced={Boolean(reduced)} active={inView && visible} />
          ) : (
            <StaticArt />
          )}
        </Suspense>
      </ArtBoundary>
      <div className="art-label art-label-bottom">
        <span className="signal-dot" /> PEOPLE. MARKETS. POSSIBILITIES.
      </div>
    </div>
  );
}
