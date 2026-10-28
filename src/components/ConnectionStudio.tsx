import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { useLocale } from '../locale';
import { scenarios, scenarioLink } from '../brief';
import { NLink } from './NetworkLayout';

// This is the entry to the brief, not a second intake form.
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
  const [role, setRole] = useState('');
  return (
    <section className="profile-builder section scenario-entry" aria-labelledby="profile-title">
      <div className="wrap">
        <div className="chapter-line">
          <span>04 / CONNECTION ENGINE</span>
          <span>
            {t('One brief. A qualified introduction.', 'Один бриф. Квалифицированное знакомство.')}
          </span>
        </div>
        <div className="profile-heading">
          <h2 className="section-title" id="profile-title">
            {t('Your business.', 'Ваш бизнес.')}
            <br />
            <span>{t('Your next partner.', 'Ваш следующий партнёр.')}</span>
          </h2>
          <p>
            {t(
              'Choose your role. We’ll ask only for the context your partner search needs.',
              'Выберите роль. В брифе останутся вопросы, которые нужны для вашей задачи.',
            )}
          </p>
        </div>
        <div className="profile-workspace">
          <div className="profile-inputs">
            <fieldset>
              <legend>{t('YOUR INTENTION', 'ВАШЕ НАМЕРЕНИЕ')}</legend>
              <div className="profile-role-picker">
                {(['need', 'offer'] as const).map((s) => (
                  <button key={s} aria-pressed={side === s} onClick={() => onSide(s)}>
                    I {s.toUpperCase()}
                    {side === s && <Check size={15} />}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>{t('YOUR ROLE', 'ВАША РОЛЬ')}</legend>
              <div className="scenario-rows">
                {scenarios.map((s, i) => (
                  <button
                    key={s.id}
                    aria-pressed={role === s.id}
                    onClick={() => {
                      setRole(s.id);
                      if (!intentExplicit) onSide(s.side, false);
                    }}
                  >
                    <small>0{i + 1}</small>
                    <span>{t(s.en, s.ru)}</span>
                    {role === s.id ? <Check size={19} /> : <ArrowUpRight size={19} />}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="profile-output">
            <div className="partner-pass">
              <div className="pass-head">
                <span>V</span>
                <span>
                  VlaDDoS
                  <br />
                  NETWORK
                </span>
                <ArrowUpRight size={28} />
              </div>
              <div className="pass-status">
                {t('PRIVATE PARTNERSHIP BRIEF', 'КОНФИДЕНЦИАЛЬНЫЙ ПАРТНЁРСКИЙ БРИФ')}
              </div>
              <h3>I {side.toUpperCase()}</h3>
              <p className="scenario-purpose">
                {side === 'need'
                  ? t(
                      'Find a provider, local operator or commercial partner for a specific task.',
                      'Найти провайдера, локального оператора или коммерческого партнёра под конкретную задачу.',
                    )
                  : t(
                      'Put your capabilities in front of relevant businesses after qualification.',
                      'Представить ваши возможности подходящим компаниям после квалификации.',
                    )}
              </p>
              <div className="pass-context">
                <span>{t('WHAT HAPPENS NEXT', 'СЛЕДУЮЩИЕ ШАГИ')}</span>
                <ol>
                  <li>{t('Define the market and scope', 'Укажите рынок и задачу')}</li>
                  <li>{t('Leave a private business contact', 'Оставьте рабочий контакт')}</li>
                  <li>
                    {t('Deal Desk reviews the opportunity', 'Deal Desk проверит возможность')}
                  </li>
                </ol>
              </div>
              <div className="pass-bottom">
                <span>ASIA / LATAM / AFRICA</span>
                <span>{t('HUMAN REVIEW', 'ЛИЧНАЯ ПРОВЕРКА')}</span>
              </div>
            </div>
            <NLink
              className="profile-submit"
              to={role ? scenarioLink(role, side) : side === 'need' ? '/find-a-partner' : '/join'}
            >
              {t('Build my brief', 'Составить бриф')}
              <ArrowUpRight size={23} />
            </NLink>
            <p className="profile-notice">
              {t(
                'No fee obligation on submission. Partner availability, permission to share and commercial terms are reviewed separately.',
                'Отправка не создаёт обязательств по оплате. Доступность партнёров, разрешение на передачу и коммерческие условия проверяются отдельно.',
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
