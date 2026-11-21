export function FieldNotebook({ cover = false }: { cover?: boolean }) {
  return (
    <div className="field-notebook" aria-hidden="true">
      <img
        src="/assets/editorial/field-notebook-960.webp"
        srcSet="/assets/editorial/field-notebook-240.webp 240w, /assets/editorial/field-notebook-480.webp 480w, /assets/editorial/field-notebook-960.webp 960w"
        sizes={
          cover
            ? '(max-width: 740px) 92vw, (max-width: 1450px) 45vw, 710px'
            : '(max-width: 740px) 100px, (max-width: 1450px) 36vw, 580px'
        }
        width="960"
        height="640"
        alt=""
        loading={cover ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}
