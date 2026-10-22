import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronDown, Plus } from 'lucide-react';
import { BriefStudio } from '../components/BriefStudio';
import { partnerProfileQuery, restorePartnerProfile } from '../components/partner-profile';
import { KnowledgeTeaser } from '../components/KnowledgeTeaser';
import { NetworkConsole } from '../components/NetworkConsole';
import { useLocale } from '../locale';
import { markets, type RoleId } from '../data';

const directions = [
  {
    id: 'affiliate',
    label: ['I introduce partners', 'Рекомендую партнёров'],
    caption: ['Affiliates & introducers', 'Аффилиаты и рекомендации'],
    title: ['A clear agreement behind every introduction.', 'Рекомендация с понятными условиями.'],
    description: [
      'Know a payment team, PSP or business that could work with PAN? Tell us about the connection. We discuss referral ownership, the qualifying result and commercial terms before an introduction.',
      'Знаете платёжную команду, PSP или бизнес, которому может быть полезен PAN? Расскажите о контакте. До знакомства обсудим авторство рекомендации, ожидаемый результат и коммерческие условия.',
    ],
    discussion: [
      'Who you want to introduce, their markets and the terms of your participation.',
      'Кого вы рекомендуете, на каких рынках он работает и на каких условиях участвуете вы.',
    ],
    action: ['Discuss an introduction', 'Обсудить рекомендацию'],
  },
  {
    id: 'provider',
    label: ['I offer payment solutions', 'Предлагаю платёжное решение'],
    caption: ['PSPs & payment teams', 'PSP и платёжные команды'],
    title: [
      'Your local infrastructure. A new partnership.',
      'Ваша инфраструктура. Новое партнёрство.',
    ],
    description: [
      'Bring a PSP, local payment method or operating team to PAN. Show us the markets you cover, the businesses you support and how your operations work.',
      'Предложите PAN свой PSP, локальный метод или платёжную команду. Расскажите о рынках, подходящих категориях бизнеса и том, как устроена ваша работа.',
    ],
    discussion: [
      'Supported methods, integration, payment reconciliation and each side’s responsibilities.',
      'Поддерживаемые методы, интеграцию, сверку платежей и ответственность сторон.',
    ],
    action: ['Present my solution', 'Представить решение'],
  },
  {
    id: 'merchant',
    label: ['I need payment partners', 'Ищу платёжных партнёров'],
    caption: ['Merchants & businesses', 'Мерчанты и бизнес'],
    title: [
      'Start with the payment flow your business needs.',
      'Начнём с платежей вашего бизнеса.',
    ],
    description: [
      'Which markets are you entering? How do your customers pay? Describe your business and payment flow so we can assess a relevant partnership.',
      'На какие рынки вы выходите? Как платят ваши клиенты? Опишите бизнес и платёжный сценарий — по этим деталям оценим возможности сотрудничества.',
    ],
    discussion: [
      'Business category, target markets, payment methods and onboarding requirements.',
      'Категорию бизнеса, целевые рынки, нужные методы и требования к подключению.',
    ],
    action: ['Discuss my requirements', 'Обсудить задачу'],
  },
  {
    id: 'regional',
    label: ['Local expertise', 'Локальная экспертиза'],
    caption: ['Regional partners', 'Региональные партнёры'],
    title: ['Local knowledge comes from working there.', 'Локальный опыт начинается с практики.'],
    description: [
      'You know the providers, payment habits and people in your market. Tell PAN where you work and which relationships you can bring to a partnership.',
      'Вы знаете провайдеров, платёжные привычки и людей своего рынка. Расскажите PAN, где работаете и какие связи можете привнести в партнёрство.',
    ],
    discussion: [
      'Your market experience, contacts and scope of cooperation.',
      'Ваш опыт на рынке, контакты и формат сотрудничества.',
    ],
    action: ['Introduce myself', 'Рассказать о себе'],
  },
] as const;

function Cover({ role, onRole }: { role: RoleId; onRole: (role: RoleId) => void }) {
  return (
    <section className="pan-deck" aria-labelledby="pan-heading">
      <NetworkConsole role={role} onRole={onRole} />
    </section>
  );
}

function PartnershipDirections({ role, onRole }: { role: RoleId; onRole: (role: RoleId) => void }) {
  const { t } = useLocale();
  const selected = role === 'team' ? 'provider' : role;
  const current = directions.find((d) => d.id === selected)!;
  return (
    <section className="signal-partners" id="partners" aria-labelledby="directions-heading">
      <div className="wrap">
        <div className="signal-section-heading">
          <div>
            <p className="signal-overline">01 / {t('WORK WITH PAN', 'СОТРУДНИЧЕСТВО С PAN')}</p>
            <h2 id="directions-heading">
              {t('Where do you fit in?', 'Как вы можете работать с PAN?')}
            </h2>
          </div>
          <p>
            {t(
              'Bring a connection, a payment solution or a business requirement. Each starts a different conversation.',
              'Рекомендация, платёжное решение или задача бизнеса — выберите, с чего начнём разговор.',
            )}
          </p>
        </div>
        <div className="signal-direction-layout">
          <div
            className="signal-direction-options"
            role="group"
            aria-label={t('Your partnership goal', 'Ваша задача')}
          >
            {directions.slice(0, 3).map((direction, index) => (
              <button
                type="button"
                key={direction.id}
                aria-pressed={selected === direction.id}
                aria-controls="direction-description"
                onClick={() => onRole(direction.id)}
              >
                <span className="signal-direction-index">0{index + 1}</span>
                <span>
                  <strong>{t(direction.label[0], direction.label[1])}</strong>
                  <small>{t(direction.caption[0], direction.caption[1])}</small>
                </span>
                <span className="signal-direction-mark">
                  {selected === direction.id ? <Check size={17} /> : <ArrowUpRight size={19} />}
                </span>
              </button>
            ))}
            <Link
              className="signal-regional"
              to="/apply?role=regional"
              aria-current={role === 'regional' ? 'true' : undefined}
            >
              {t('Local expertise & regional contacts', 'Локальный опыт и региональные связи')}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="signal-direction-detail" id="direction-description" aria-live="polite">
            <span className="signal-detail-kicker">
              PAN / {t(current.caption[0], current.caption[1])}
            </span>
            <h3>{t(current.title[0], current.title[1])}</h3>
            <p>{t(current.description[0], current.description[1])}</p>
            {selected === 'provider' && (
              <div
                className="signal-team-switch"
                role="group"
                aria-label={t('Type of payment partner', 'Тип платёжного партнёра')}
              >
                <button
                  type="button"
                  aria-pressed={role === 'provider'}
                  onClick={() => onRole('provider')}
                >
                  PSP / {t('Solution', 'Решение')}
                </button>
                <button type="button" aria-pressed={role === 'team'} onClick={() => onRole('team')}>
                  {t('Payment team', 'Платёжная команда')}
                </button>
              </div>
            )}
            <div className="signal-discussion">
              <span>{t('What we will discuss', 'Что обсудим')}</span>
              <p>{t(current.discussion[0], current.discussion[1])}</p>
            </div>
            <Link className="signal-action" to={`/apply?role=${role}`}>
              {role === 'team'
                ? t('Introduce my team', 'Представить команду')
                : t(current.action[0], current.action[1])}
              <ArrowUpRight size={18} />
            </Link>
            <span className="signal-detail-note">
              {t(
                'Scope and commercial terms are agreed before cooperation begins.',
                'Формат работы и коммерческие условия согласуем до старта.',
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Territories() {
  const { t } = useLocale();
  return (
    <section className="signal-territories wrap" aria-labelledby="territories-heading">
      <div className="signal-section-heading">
        <div>
          <p className="signal-overline">02 / {t('LOCAL EXPERTISE', 'ЛОКАЛЬНАЯ ЭКСПЕРТИЗА')}</p>
          <h2 id="territories-heading">
            {t('Every market', 'У каждого рынка')}
            <br />
            <span>{t('works differently.', 'свои правила.')}</span>
          </h2>
        </div>
        <p>
          {t(
            'Local methods, customer habits and operating experience matter. We want to meet people who work with these markets first-hand.',
            'Важны местные методы, привычки клиентов и опыт команды. Ищем партнёров, которые знают эти рынки по своей ежедневной работе.',
          )}
        </p>
      </div>
      <div className="signal-market-list">
        {(['Africa', 'LATAM', 'Asia'] as const).map((region, index) => (
          <div className="signal-market-region" key={region}>
            <div>
              <span>0{index + 1}</span>
              <h3>
                {region === 'Africa'
                  ? t('Africa', 'Африка')
                  : region === 'Asia'
                    ? t('Asia', 'Азия')
                    : 'LATAM'}
              </h3>
            </div>
            <div>
              {markets
                .filter((market) => market.region === region)
                .map((market) => (
                  <Link to={`/markets/${market.slug}`} key={market.slug}>
                    <span>{market.code}</span>
                    {t(market.name, market.ru)}
                    <ArrowUpRight size={14} />
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
      <div className="signal-market-foot">
        <p>
          {t(
            'Markets shown are open for partnership discussions. Method availability and business eligibility are reviewed for each request.',
            'Это рынки для обсуждения партнёрства. Доступность методов и возможность работы с вашим бизнесом проверяем по запросу.',
          )}
        </p>
        <Link className="signal-direct" to="/markets">
          {t('Explore markets & methods', 'Рынки и платёжные методы')}
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}

function PartnershipProcess() {
  const { t } = useLocale();
  return (
    <section className="signal-process wrap" aria-labelledby="process-heading">
      <div>
        <p className="signal-overline">03 / {t('THE NEXT STEP', 'СЛЕДУЮЩИЙ ШАГ')}</p>
        <h2 id="process-heading">
          {t('From a first contact to clear terms.', 'От знакомства — к понятным условиям.')}
        </h2>
      </div>
      <ol>
        {[
          [
            t('Give us the context', 'Дайте контекст'),
            t(
              'Your role, markets and a contact we can reach directly.',
              'Ваша роль, рынки и контакт для прямой связи.',
            ),
          ],
          [
            t('Discuss the practical fit', 'Разберём задачу'),
            t(
              'We review the request and clarify the experience, methods and responsibilities it needs.',
              'Уточним запрос, опыт, методы и необходимые роли сторон.',
            ),
          ],
          [
            t('Put the terms first', 'Согласуем до старта'),
            t(
              'Scope, responsibilities and commercial terms come before introductions or integration.',
              'Задачи, ответственность и коммерческие условия — до рекомендаций или интеграции.',
            ),
          ],
        ].map(([title, text], index) => (
          <li key={index}>
            <span>0{index + 1}</span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Home() {
  const { t } = useLocale();
  const [role, setRole] = useState<RoleId>('affiliate');
  const [params] = useSearchParams();
  const profileQuery = partnerProfileQuery(params);
  const location = useLocation();
  const [briefOpen, setBriefOpen] = useState(false);
  useEffect(() => {
    setRole(restorePartnerProfile(new URLSearchParams(profileQuery)).role);
  }, [profileQuery]);
  useEffect(() => {
    if (location.hash === '#forge') setBriefOpen(true);
  }, [location.hash]);
  return (
    <div className="signal-home">
      <Cover role={role} onRole={setRole} />
      <PartnershipDirections role={role} onRole={setRole} />
      <div className="signal-brief-area wrap">
        <details
          id="forge"
          open={briefOpen}
          onToggle={(event) => setBriefOpen(event.currentTarget.open)}
        >
          <summary>
            <Plus size={19} />
            <span>
              <strong>{t('Have a specific proposal?', 'Есть конкретное предложение?')}</strong>
              <small>
                {t(
                  'Put your role, markets and payment methods into one brief.',
                  'Соберите роль, рынки и платёжные методы в одном брифе.',
                )}
              </small>
            </span>
            <ChevronDown size={18} />
          </summary>
          <BriefStudio role={role} onRole={setRole} />
        </details>
      </div>
      <Territories />
      <PartnershipProcess />
      <KnowledgeTeaser />
    </div>
  );
}
