import { useEffect, useRef, type ReactNode, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import { useLocale } from '../locale';

const MotionLink = motion.create(Link);

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="PAN home">
      <span className="brand-word">
        PAN<span className="brand-dot">.</span>
      </span>
      {!compact && (
        <span className="brand-caption">
          PRIVATE AFFILIATE
          <br />
          NETWORK
        </span>
      )}
    </Link>
  );
}

export function Action({
  to,
  children,
  secondary = false,
  className = '',
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 24 }),
    sy = useSpring(y, { stiffness: 240, damping: 24 });
  const move = (e: PointerEvent<HTMLAnchorElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.13);
    y.set((e.clientY - r.top - r.height / 2) * 0.18);
  };
  return (
    <MotionLink
      to={to}
      className={`action ${secondary ? 'action-secondary' : ''} ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <span>{children}</span>
      <span className="action-icon">
        <ArrowUpRight size={19} strokeWidth={1.7} />
      </span>
    </MotionLink>
  );
}

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      data-reveal
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, number }: { children: ReactNode; number?: string }) {
  return (
    <div className="eyebrow">
      <span className="signal-dot" />
      {number && <span className="eyebrow-index">{number} /</span>}
      <span>{children}</span>
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
}) {
  return (
    <section className="page-heading wrap">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="display">
        <span>{title}</span>
        <span className="serif accent">{accent}</span>
      </h1>
      <div className="page-heading-bottom">
        <p>{description}</p>
        <span className="heading-orbit" aria-hidden="true">
          <ArrowUpRight size={38} strokeWidth={1} />
        </span>
      </div>
    </section>
  );
}

let modalLocks = 0;
let originalOverflow = '';
export function Dialog({
  open,
  onClose,
  title,
  children,
  className = '',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useLocale();
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    dialog.showModal();
    if (modalLocks++ === 0) {
      originalOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      dialog.close();
      if (--modalLocks === 0) document.documentElement.style.overflow = originalOverflow;
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-inner">
        <button
          className="icon-button dialog-close"
          onClick={onClose}
          aria-label={t('Close', 'Закрыть')}
        >
          <X size={21} />
        </button>
        {open && children}
      </div>
    </dialog>
  );
}

export function Spotlight({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`spotlight ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        ref.current?.style.setProperty('--pointer-x', `${e.clientX - r.left}px`);
        ref.current?.style.setProperty('--pointer-y', `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}
