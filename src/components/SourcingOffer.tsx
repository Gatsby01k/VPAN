import { useRef, useState } from 'react';
import { useLocale } from '../locale';
import { capabilities, countries, label, paymentMethodLabel } from '../network';

type SourcingScope = {
  language?: 'en' | 'ru';
  countries?: string[];
  methods?: string[];
  capabilities?: string[];
};

export type SourcingLead = {
  id: string;
  repeated: { country: string; method: string; companies: number } | null;
};

export type AtlasPipeline = {
  briefs: number;
  collected: { currency: string; amount_minor: number }[];
};

export function SourcingOffer({ profile }: { profile: SourcingScope }) {
  const { t, language } = useLocale();
  const draftLanguage = profile.language ?? language;
  const markets = countries
    .filter((country) => profile.countries?.includes(country.id))
    .map((country) => label(country, draftLanguage))
    .join(', ');
  const methods = (profile.methods || [])
    .map((method) => paymentMethodLabel(method, draftLanguage))
    .join(', ');
  const requested = capabilities
    .filter((capability) => profile.capabilities?.includes(capability.id))
    .map((capability) => label(capability, draftLanguage))
    .join(', ');
  const scope = [markets, methods, requested].filter(Boolean).join(' / ');
  const draft =
    draftLanguage === 'ru'
      ? `Здравствуйте! По вашей задаче (${scope}) можем предложить отдельный платный поиск партнёров. Сначала согласуем критерии, сроки и фиксированную стоимость. По итогам вы получите список найденных кандидатов с результатами проверки и открытыми вопросами. Если подходящих вариантов не окажется, мы покажем, что проверили и где возникли ограничения. Хотите обсудить объём поиска?`
      : `Hello! We can offer a paid partner search for your brief (${scope}). We would first agree the criteria, timeline and fixed fee. You would receive a shortlist with our findings and open questions. If no suitable options turn up, we would share what we checked and where we found limitations. Would you like to discuss the scope?`;
  const field = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<'copied' | 'select' | ''>('');
  const copy = async () => {
    const input = field.current;
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input.value);
      setStatus('copied');
    } catch {
      input.focus();
      input.select();
      setStatus('select');
    }
  };

  return (
    <details className="commercial-form desk-sourcing-offer">
      <summary>{t('Draft a paid search offer', 'Черновик предложения на платный поиск')}</summary>
      <div>
        <p>
          {t(
            'Review the scope before sharing. Agree the fee and timeline with the client.',
            'Перед отправкой проверьте объём работ. Согласуйте стоимость и сроки с клиентом.',
          )}
        </p>
        <label>
          {t('Editable draft', 'Редактируемый черновик')}
          <textarea
            ref={field}
            lang={draftLanguage}
            key={draft}
            rows={7}
            defaultValue={draft}
            onChange={() => setStatus('')}
          />
        </label>
        <button type="button" className="text-link" onClick={() => void copy()}>
          {t('Copy offer', 'Скопировать предложение')}
        </button>
        <span role="status">
          {status === 'copied' && t('Copied.', 'Скопировано.')}
          {status === 'select' && t('Copy the selected text.', 'Скопируйте выделенный текст.')}
        </span>
      </div>
    </details>
  );
}
