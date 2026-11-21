import { useLocale } from '../locale';
import { NLink } from './NetworkLayout';

export const briefIntents = [
  ['need', 'I NEED', 'Find a partner', 'Найти партнёра'],
  ['offer', 'I OFFER', 'Join the network', 'Стать партнёром'],
] as const;

export function BriefTickets() {
  const { t } = useLocale();
  return (
    <div className="world-cover-choices">
      {briefIntents.map(([id, code, en, ru]) => (
        <NLink
          to={id === 'need' ? '/find-a-partner' : '/join'}
          key={id}
          className="thread-ticket"
          data-intent={id}
        >
          <small>{t(code, id === 'need' ? 'Ищу' : 'Предлагаю')}</small>
          <strong>{t(en, ru)}</strong>
        </NLink>
      ))}
    </div>
  );
}
