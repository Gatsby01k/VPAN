import { Check, Store, Network, MapPin, ArrowLeftRight, Waypoints, Handshake } from 'lucide-react';
import { scenarios } from '../brief';
import { useLocale } from '../locale';

const roleIcons: Record<string, typeof Store> = {
  merchant: Store,
  psp: Network,
  'local-partner': MapPin,
  otc: ArrowLeftRight,
  affiliate: Waypoints,
  strategic: Handshake,
  liquidity: ArrowLeftRight,
};

export function BriefRolePicker({
  value,
  onChange,
  invalid = false,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const { t } = useLocale();
  const options: { id: string; en: string; ru: string }[] = [...scenarios];
  if (value === 'liquidity')
    options.push({ id: 'liquidity', en: 'Liquidity provider', ru: 'Поставщик ликвидности' });
  return (
    <fieldset
      className="engine-role-options"
      aria-describedby={invalid ? 'engine-role-error' : undefined}
    >
      <legend className="sr-only">
        {t('Which describes your business?', 'Что описывает ваш бизнес?')}
      </legend>
      {options.map((option) => {
        const Icon = roleIcons[option.id] || Handshake;
        return (
          <label className="engine-role-option" data-selected={value === option.id} key={option.id}>
            <input
              type="radio"
              name="companyType"
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              required
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? 'engine-role-error' : undefined}
            />
            <Icon className="engine-role-icon" size={21} strokeWidth={1.5} aria-hidden="true" />
            <span className="engine-role-name">{t(option.en, option.ru)}</span>
            <span className="engine-role-mark" aria-hidden="true">
              {value === option.id && <Check size={13} />}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
