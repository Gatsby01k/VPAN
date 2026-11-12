import './connection-protocol.css';

type Direction = 'forward' | 'diagonal' | 'down' | 'return' | 'up';

export function SignatureArrow({ direction = 'diagonal' }: { direction?: Direction }) {
  return (
    <svg
      className="signature-arrow"
      data-direction={direction}
      viewBox="0 0 32 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="signature-eye" cx="5" cy="13.5" r="2.6" />
      <path className="signature-shaft" d="M7.6 13.5c7.4 0 8.6-5 16.9-5" />
      <path className="signature-tip" d="m19.5 4.4 6.1 4.1-4.4 5.4m1.8-1.9-1.8-.5" />
    </svg>
  );
}

export function NavigationGlyph({ search = false }: { search?: boolean }) {
  return (
    <svg className="navigation-glyph" viewBox="0 0 28 24" fill="none" aria-hidden="true">
      {search ? (
        <>
          <circle cx="12" cy="10" r="6" />
          <path d="M8 10h8m-4-4v8m4.5.5 7 6" />
        </>
      ) : (
        <>
          <path d="M2 7h9c4 0 5 5 9 5h5M2 17h8c4 0 6-5 10-5" />
          <circle cx="25" cy="12" r="2" />
        </>
      )}
    </svg>
  );
}

export function EditorialRule() {
  return (
    <div className="editorial-rule" aria-hidden="true">
      <i />
    </div>
  );
}

export function IntentStitch({ side }: { side: 'need' | 'offer' }) {
  return (
    <span className="intent-stitch" data-side={side} aria-hidden="true">
      <i />
    </span>
  );
}

export function ThreadProgress({
  state,
  label,
}: {
  state: 'pending' | 'resolved' | 'error';
  label?: string;
}) {
  return (
    <span
      className="thread-progress"
      data-state={state}
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 84 22" fill="none" aria-hidden="true">
        <circle cx="5" cy="11" r="3.5" />
        <circle cx="79" cy="11" r="3.5" />
        <path
          className="progress-thread"
          pathLength="1"
          d={
            state === 'error'
              ? 'M8.5 11H27c5 0 5-5 9-5m12 10c4 0 4-5 9-5h18.5'
              : state === 'resolved'
                ? 'M8.5 11h67'
                : 'M8.5 11H23c9 0 12 8 19 8s11-16 19-16c5 0 7 8 14.5 8'
          }
        />
      </svg>
    </span>
  );
}
