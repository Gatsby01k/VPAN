import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, X } from 'lucide-react';
import { useLocale } from '../locale';

export function Crown() {
  return (
    <svg className="pan-crown" viewBox="0 0 44 36" fill="none" aria-hidden="true">
      <path
        d="m5 13 8 7 8-16 8 16 10-7-5 18H10L5 13Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M11 35h22" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="4" cy="10" r="2" fill="currentColor" />
      <circle cx="21" cy="3" r="2" fill="currentColor" />
      <circle cx="40" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="PAN home">
      <Crown />
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
  return (
    <Link to={to} className={`action ${secondary ? 'action-secondary' : ''} ${className}`}>
      <span>{children}</span>
      <span className="action-icon">
        <ArrowUpRight size={19} strokeWidth={1.7} />
      </span>
    </Link>
  );
}

export function Reveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return <div className={className}>{children}</div>;
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
        <span className="display-accent accent">{accent}</span>
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
  return <div className={`spotlight ${className}`}>{children}</div>;
}
