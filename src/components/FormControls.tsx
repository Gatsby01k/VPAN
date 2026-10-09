import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown, Gamepad2, Layers3, ShoppingBag } from 'lucide-react';
import { useLocale } from '../locale';

interface SelectOption {
  value: string;
  label: string;
}

export function SelectControl({
  value,
  onChange,
  options,
  label,
  id,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label: string;
  id?: string;
  disabled?: boolean;
}) {
  const uid = useId();
  const listId = `${uid}-options`;
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef({ text: '', time: 0 });
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const [active, setActive] = useState(0);
  const selected = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  const show = (index = selected) => {
    const rect = trigger.current?.getBoundingClientRect();
    if (rect) setAbove(innerHeight - rect.bottom < 280 && rect.top > 280);
    setActive(index);
    setOpen(true);
  };
  const choose = (index: number) => {
    if (options[index] && options[index].value !== value) onChange(options[index].value);
    search.current = { text: '', time: 0 };
    setOpen(false);
  };
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const resize = () => setOpen(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', resize);
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const menu = root.current?.querySelector<HTMLElement>('.pan-select-menu');
    const option = root.current?.querySelector<HTMLElement>(
      `#${CSS.escape(`${uid}-option-${active}`)}`,
    );
    if (!menu || !option) return;
    if (option.offsetTop < menu.scrollTop) menu.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > menu.scrollTop + menu.clientHeight)
      menu.scrollTop = option.offsetTop + option.offsetHeight - menu.clientHeight;
  }, [active, open, uid]);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const keyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    const { key } = event;
    if (key === 'Tab') {
      if (open) choose(active);
      return;
    }
    if (key === 'Escape') {
      if (open) {
        event.preventDefault();
        event.stopPropagation();
        search.current = { text: '', time: 0 };
        setOpen(false);
      }
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (open) choose(active);
      else show();
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(key)) {
      event.preventDefault();
      if (!open) show(key === 'Home' ? 0 : key === 'End' ? options.length - 1 : selected);
      else if (key === 'ArrowUp' && event.altKey) choose(active);
      else
        setActive((current) =>
          key === 'Home'
            ? 0
            : key === 'End'
              ? options.length - 1
              : Math.max(
                  0,
                  Math.min(
                    options.length - 1,
                    current +
                      (key === 'ArrowDown'
                        ? 1
                        : key === 'ArrowUp'
                          ? -1
                          : key === 'PageDown'
                            ? 10
                            : -10),
                  ),
                ),
        );
      return;
    }
    if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const text = now - search.current.time < 700 ? search.current.text + key : key;
      search.current = { text, time: now };
      const repeated = [...text].every((char) => char.toLowerCase() === key.toLowerCase());
      const term = (repeated ? key : text).toLocaleLowerCase();
      const start = repeated && open ? active + 1 : 0;
      for (let offset = 0; offset < options.length; offset++) {
        const index = (start + offset) % options.length;
        if (options[index].label.toLocaleLowerCase().startsWith(term)) {
          if (open) setActive(index);
          else show(index);
          break;
        }
      }
    }
  };

  return (
    <div className={`pan-select ${open ? 'is-open' : ''} ${above ? 'opens-above' : ''}`} ref={root}>
      <button
        id={id}
        ref={trigger}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${uid}-option-${active}` : undefined}
        disabled={disabled}
        onKeyDown={keyboard}
        onBlur={() => setOpen(false)}
        onClick={() => (open ? setOpen(false) : show())}
      >
        <span>{options[selected]?.label || value}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="pan-select-menu" id={listId} role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`${uid}-option-${index}`}
              role="option"
              aria-selected={value === option.value}
              className={active === index ? 'is-active' : ''}
              onPointerDown={(event) => event.preventDefault()}
              onPointerMove={() => setActive(index)}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {value === option.value && <Check size={15} aria-hidden="true" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryPicker({
  value,
  onChange,
  label,
  optional = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  optional?: boolean;
}) {
  const { t } = useLocale();
  const name = useId();
  const options = [
    {
      value: 'iGaming',
      title: 'iGaming',
      detail: t('Gaming & betting', 'Игры и ставки'),
      Icon: Gamepad2,
    },
    {
      value: 'e-commerce',
      title: 'e-commerce',
      detail: t('Online commerce', 'Онлайн-торговля'),
      Icon: ShoppingBag,
    },
    {
      value: 'other',
      title: t('Other', 'Другая'),
      detail: t('Your business category', 'Ваша категория бизнеса'),
      Icon: Layers3,
    },
  ];
  return (
    <fieldset className="category-picker">
      <legend>
        {label}
        {optional && <span>{t('Optional', 'Необязательно')}</span>}
      </legend>
      <div className="category-cards">
        {options.map(({ value: option, title, detail, Icon }) => (
          <label key={option} className={`category-card ${value === option ? 'is-selected' : ''}`}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <Icon className="category-icon" size={21} strokeWidth={1.5} aria-hidden="true" />
            <span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </span>
            <span className="category-check" aria-hidden="true">
              {value === option && <Check size={13} />}
            </span>
          </label>
        ))}
      </div>
      {optional && (
        <button
          className="category-clear"
          type="button"
          disabled={!value}
          onClick={() => onChange('')}
        >
          {t('Clear selection', 'Снять выбор')}
        </button>
      )}
    </fieldset>
  );
}
