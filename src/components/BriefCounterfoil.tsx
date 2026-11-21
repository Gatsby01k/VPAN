import { useRef } from 'react';
import { Check, ChevronDown, Pencil, Plus } from 'lucide-react';
import { useLocale } from '../locale';

export type ScopeField = 'role' | 'industry' | 'country' | 'capability';
export type ScopeRow = { field: ScopeField; title: string; value: string };

interface Props {
  mobile?: boolean;
  rows: ScopeRow[];
  methods: string;
  currencies: string;
  disabled: boolean;
  onEdit: (field: ScopeField) => void;
}

export function BriefCounterfoil({ mobile, rows, methods, currencies, disabled, onEdit }: Props) {
  const { t } = useLocale();
  const pocket = useRef<HTMLDetailsElement>(null);
  const completed = rows.filter((row) => row.value).length;
  const count = `${completed} / ${rows.length}`;
  const title = t('Your brief', 'Ваш бриф');
  const status = t('Draft · not submitted', 'Черновик · не отправлен');
  const contents = (
    <>
      <progress
        value={completed}
        max={rows.length}
        aria-label={t('Completed scope sections', 'Заполнено разделов задачи')}
      />
      <nav aria-label={t('Edit brief sections', 'Изменить разделы брифа')}>
        {rows.map(({ field, title, value }) => (
          <button
            type="button"
            key={field}
            disabled={disabled}
            data-filled={!!value}
            onClick={() => {
              if (pocket.current) pocket.current.open = false;
              onEdit(field);
            }}
          >
            <i className="counterfoil-punch" aria-hidden="true">
              {value && <Check size={12} />}
            </i>
            <span>
              {value && <span className="counterfoil-label">{title}</span>}
              <strong>{value || title}</strong>
            </span>
            {value ? (
              <Pencil size={14} aria-hidden="true" />
            ) : (
              <Plus size={15} aria-hidden="true" />
            )}
          </button>
        ))}
      </nav>
      {(methods || currencies) && (
        <dl className="counterfoil-extras">
          {methods && (
            <div>
              <dt>{t('Methods', 'Методы')}</dt>
              <dd>{methods}</dd>
            </div>
          )}
          {currencies && (
            <div>
              <dt>{t('Settlement', 'Расчёты')}</dt>
              <dd>{currencies}</dd>
            </div>
          )}
        </dl>
      )}
      <p className="counterfoil-status">{status}</p>
    </>
  );
  if (mobile) {
    return (
      <details className="brief-counterfoil counterfoil-pocket" ref={pocket}>
        <summary>
          <span>{title}</span>
          <small>{count}</small>
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        {contents}
      </details>
    );
  }
  return (
    <aside className="brief-counterfoil counterfoil-sheet" aria-label={title}>
      <div className="counterfoil-heading">
        <h2>{title}</h2>
        <small>{count}</small>
      </div>
      {contents}
    </aside>
  );
}
