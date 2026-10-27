import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { useLocale } from '../locale';
import { regions, countries, industries, capabilities, label } from '../network';
import { NLink } from './NetworkLayout';
export function ConnectionStudio({
  side,
  onSide,
}: {
  side: 'need' | 'offer';
  onSide: (side: 'need' | 'offer') => void;
}) {
  const { t, language } = useLocale();
  const [region, setRegion] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [industry, setIndustry] = useState('');
  const [chosenCapabilities, setCapabilities] = useState<string[]>([]);
  const toggle = (items: string[], id: string) =>
    items.includes(id) ? items.filter((v) => v !== id) : [...items, id];
  const chosen = countries.filter((c) => selected.includes(c.id));
  const query = new URLSearchParams({
    industry,
    markets: selected.join(','),
    capabilities: chosenCapabilities.join(','),
  });
  return (
    <section className="profile-builder section" aria-labelledby="profile-title">
      <div className="wrap">
        <div className="chapter-line">
          <span>04 / THE CONNECTION ENGINE</span>
          <span>{t('A private brief. A human review.', 'Короткий бриф. Личная проверка.')}</span>
        </div>
        <div className="profile-heading">
          <h2 className="section-title" id="profile-title">
            {t('Your partner', 'Партнёрский')}
            <br />
            <span>{t('brief.', 'бриф.')}</span>
          </h2>
          <p>
            {t(
              'Start with what you need or offer. Industry, country and capabilities give an introduction its context. Your choices carry into the contact form.',
              'Начните с задачи или предложения. Индустрия, страна и возможности задают контекст знакомства. Выбор перенесётся в форму обращения.',
            )}
          </p>
        </div>
        <div className="profile-workspace">
          <div className="profile-inputs">
            <fieldset>
              <legend>01 / {t('I NEED OR I OFFER', 'ЗАДАЧА ИЛИ ПРЕДЛОЖЕНИЕ')}</legend>
              <div
                className="profile-role-picker"
                role="group"
                aria-label={t('Your intention', 'Ваше намерение')}
              >
                {(['need', 'offer'] as const).map((value) => (
                  <button key={value} aria-pressed={side === value} onClick={() => onSide(value)}>
                    I {value.toUpperCase()}
                    {side === value && <Check size={15} />}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>02 / {t('YOUR INDUSTRY', 'ВАША ИНДУСТРИЯ')}</legend>
              <div className="profile-role-picker">
                {industries.map((item) => (
                  <button
                    key={item.id}
                    aria-pressed={industry === item.id}
                    onClick={() => setIndustry(item.id)}
                  >
                    {label(item, language)}
                    {industry === item.id && <Check size={15} />}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="country-picker">
              <legend>03 / {t('REGION → COUNTRY', 'РЕГИОН → СТРАНА')}</legend>
              <div className="country-region-tabs" role="group" aria-label={t('Region', 'Регион')}>
                {regions.map((r) => (
                  <button
                    key={r.id}
                    aria-pressed={region === r.id}
                    onClick={() => {
                      setRegion(r.id);
                      setSelected([]);
                    }}
                  >
                    {label(r, language)}
                  </button>
                ))}
              </div>
              <div className="profile-market-picker">
                {region ? (
                  countries
                    .filter((c) => c.region === region)
                    .map((c) => (
                      <button
                        key={c.id}
                        aria-pressed={selected.includes(c.id)}
                        onClick={() => setSelected(toggle(selected, c.id))}
                      >
                        <span>{label(c, language)}</span>
                        <small>{c.currency}</small>
                        {selected.includes(c.id) && <Check size={14} />}
                      </button>
                    ))
                ) : (
                  <p className="profile-help">
                    {t(
                      'Choose a region to see its countries.',
                      'Выберите регион, чтобы увидеть страны.',
                    )}
                  </p>
                )}
              </div>
            </fieldset>
            <fieldset>
              <legend>
                04 /{' '}
                {side === 'need'
                  ? t('WHAT DO YOU NEED?', 'ЧТО ВАМ НУЖНО?')
                  : t('WHAT CAN YOU OFFER?', 'ЧТО ВЫ ПРЕДЛАГАЕТЕ?')}
              </legend>
              <div className="profile-role-picker">
                {capabilities.map((c) => (
                  <button
                    key={c.id}
                    aria-pressed={chosenCapabilities.includes(c.id)}
                    onClick={() => setCapabilities(toggle(chosenCapabilities, c.id))}
                  >
                    {label(c, language)}
                    {chosenCapabilities.includes(c.id) && <Check size={14} />}
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
                {t('OPPORTUNITY PROFILE / FOR DISCUSSION', 'ПРОФИЛЬ ВОЗМОЖНОСТИ / ДЛЯ ОБСУЖДЕНИЯ')}
              </div>
              <h3>I {side.toUpperCase()}</h3>
              <dl>
                <div>
                  <dt>{t('Industry', 'Индустрия')}</dt>
                  <dd>
                    {label(
                      industries.find((i) => i.id === industry),
                      language,
                    ) || t('Choose your industry', 'Выберите индустрию')}
                  </dd>
                </div>
                <div>
                  <dt>{t('Countries', 'Страны')}</dt>
                  <dd>
                    {chosen.length
                      ? chosen.map((c) => label(c, language)).join(' / ')
                      : t('Choose a country', 'Выберите страну')}
                  </dd>
                </div>
                <div>
                  <dt>{t('Capabilities', 'Возможности')}</dt>
                  <dd>
                    {chosenCapabilities.length
                      ? capabilities
                          .filter((c) => chosenCapabilities.includes(c.id))
                          .map((c) => label(c, language))
                          .join(' / ')
                      : t('To be discussed', 'Обсудим вместе')}
                  </dd>
                </div>
              </dl>
              <div className="pass-context">
                <span>{t('BEFORE AN INTRODUCTION', 'ДО ЗНАКОМСТВА')}</span>
                <ul>
                  <li>{t('Company and operating scope', 'Компания и границы работы')}</li>
                  <li>
                    {t('Evidence and commercial intent', 'Подтверждения и коммерческая задача')}
                  </li>
                  <li>{t('Permission and agreed terms', 'Разрешение и согласованные условия')}</li>
                </ul>
              </div>
              <div className="pass-bottom">
                <span>{chosen.map((c) => c.code).join(' · ') || 'GEO / —'}</span>
                <span>{t('HUMAN REVIEW', 'ЛИЧНАЯ ПРОВЕРКА')}</span>
              </div>
            </div>
            <NLink
              className="profile-submit"
              to={(side === 'need' ? '/find-a-partner' : '/join') + '?' + query.toString()}
            >
              {t('Continue the conversation', 'Продолжить разговор')}
              <ArrowUpRight size={23} />
            </NLink>
            <p className="profile-notice">
              {t(
                'Your brief is not an available offer or a confirmed match. No contact details are shared at this stage.',
                'Бриф не является доступным предложением или подтверждённым совпадением. Контакты на этом этапе не передаются.',
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
