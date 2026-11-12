import { useState } from 'react';
import { useLocale } from '../locale';
import { scenarios, scenarioLink } from '../brief';
import { ThreadLink } from './Editorial';
import { EditorialRule, IntentStitch, SignatureArrow } from './ConnectionProtocol';
import { useTelegramDelivery } from '../useDelivery';

export function ConnectionStudio({
  side,
  onSide,
  intentExplicit = false,
}: {
  side: 'need' | 'offer';
  onSide: (side: 'need' | 'offer', explicit?: boolean) => void;
  intentExplicit?: boolean;
}) {
  const { t } = useLocale();
  const telegramBriefEnabled = useTelegramDelivery();
  const [role, setRole] = useState('');
  const selected = scenarios.find((scenario) => scenario.id === role);

  return (
    <section className="brief-entry counter-grid" aria-labelledby="profile-title">
      <div className="brief-entry-title">
        <EditorialRule />
        <span className="folio">CONNECTION ENGINE</span>
        <h2 id="profile-title">{t('Set your brief in motion.', 'Начните с брифа.')}</h2>
        <p>
          {t(
            'Choose your intention and, if you like, prefill your role.',
            'Выберите намерение и при желании укажите свою роль.',
          )}
        </p>
      </div>
      <div className="brief-entry-form">
        <fieldset>
          <legend className="sr-only">{t('Your intention', 'Ваше намерение')}</legend>
          <div className="brief-entry-intent">
            {(['need', 'offer'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={side === option}
                onClick={() => onSide(option)}
              >
                I {option.toUpperCase()}
                <SignatureArrow direction="forward" />
              </button>
            ))}
          </div>
          <IntentStitch side={side} />
        </fieldset>
        <label>
          <span>{t('Your role (optional)', 'Ваша роль (необязательно)')}</span>
          <select
            value={role}
            onChange={(event) => {
              const next = scenarios.find((scenario) => scenario.id === event.target.value);
              setRole(next?.id ?? '');
              if (next && !intentExplicit) onSide(next.side, false);
            }}
          >
            <option value="">{t('Select a role', 'Выберите роль')}</option>
            {scenarios.map((scenario) => (
              <option value={scenario.id} key={scenario.id}>
                {t(scenario.en, scenario.ru)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="brief-entry-next">
        <p>
          {telegramBriefEnabled
            ? t(
                'Define the scope, review the message and send it in a private Telegram chat.',
                'Укажите задачу, проверьте сообщение и отправьте его в личном чате Telegram.',
              )
            : t(
                'Define the scope and leave a private contact so we can review the opportunity.',
                'Укажите задачу и оставьте конфиденциальный контакт для рассмотрения возможности.',
              )}
        </p>
        <ThreadLink
          to={
            selected
              ? scenarioLink(selected.id, side)
              : side === 'need'
                ? '/find-a-partner'
                : '/join'
          }
        >
          {t('Build my brief', 'Составить бриф')}
        </ThreadLink>
      </div>
    </section>
  );
}
