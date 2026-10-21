import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronDown, Plus } from 'lucide-react';
import { BriefStudio } from '../components/BriefStudio';
import { restorePartnerProfile } from '../components/partner-profile';
import { KnowledgeTeaser } from '../components/KnowledgeTeaser';
import { NetworkConsole } from '../components/NetworkConsole';
import { useLocale } from '../locale';
import { markets, type RoleId } from '../data';

const directions = [
  {
    id: 'affiliate',
    label: ['I have connections', 'У меня есть контакты'],
    caption: ['Affiliates & introducers', 'Аффилиаты и рекомендации'],
    title: ['A good introduction goes a long way.', 'Знакомьте с теми, кого знаете.'],
    description: [
      'Introduce payment teams, PSPs or merchants to PAN. Tell us who you work with and where your connections can help.',
      'Рекомендуйте PAN платёжные команды, PSP или мерчантов. Расскажите, с кем работаете и на каких рынках можете быть полезны.',
    ],
    discussion: [
      'Referral ownership, a qualifying introduction and your commercial terms.',
      'Авторство рекомендации, результат знакомства и ваше вознаграждение.',
    ],
    action: ['Discuss an introduction', 'Обсудить рекомендацию'],
  },
  {
    id: 'provider',
    label: ['I offer payment solutions', 'У меня платёжное решение'],
    caption: ['PSPs & payment teams', 'PSP и платёжные команды'],
    title: ['Bring your payment expertise.', 'Предложите свою инфраструктуру.'],
    description: [
      'Present your PSP, local payment solution or operating team to PAN. Start with the markets and methods you actually support.',
      'Представьте PAN свой PSP, локальное решение или команду. Начните с рынков и методов, с которыми действительно работаете.',
    ],
    discussion: [
      'Business categories, integration, operations and responsibilities.',
      'Категории бизнеса, интеграция, операции и ответственность сторон.',
    ],
    action: ['Present my solution', 'Представить решение'],
  },
  {
    id: 'merchant',
    label: ['I have a business request', 'У меня задача для бизнеса'],
    caption: ['Merchants & businesses', 'Мерчанты и бизнес'],
    title: ['Start with what your business needs.', 'Расскажите, что нужно бизнесу.'],
    description: [
      'Describe your business, markets and payment requirements. We will review whether your request fits PAN’s current direction.',
      'Опишите бизнес, рынки и требования к платежам. Рассмотрим, соответствует ли запрос текущим направлениям PAN.',
    ],
    discussion: [
      'Your business category, payment flow, markets and onboarding requirements.',
      'Ваша категория, платёжный сценарий, рынки и требования к подключению.',
    ],
    action: ['Discuss my requirements', 'Обсудить задачу'],
  },
  {
    id: 'regional',
    label: ['Local expertise', 'Локальная экспертиза'],
    caption: ['Regional partners', 'Региональные партнёры'],
    title: ['You know the people on the ground.', 'Знаете людей и местный рынок.'],
    description: [
      'Introduce your regional contacts and practical payment experience to PAN. Tell us where you work and how you can contribute.',
      'Представьте PAN свои региональные связи и практический платёжный опыт. Расскажите, где работаете и чем можете быть полезны.',
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
            <p className="signal-overline">
              01 / {t('YOUR WAY INTO PAN', 'ВАШЕ НАПРАВЛЕНИЕ В PAN')}
            </p>
            <h2 id="directions-heading">{t('What brings you here?', 'С чем вы к PAN?')}</h2>
          </div>
          <p>
            {t(
              'Choose what you want to discuss. We will take it from there.',
              'Выберите, что хотите обсудить. Дальше — предметный разговор.',
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
                'Terms are agreed individually, before cooperation.',
                'Условия согласуем индивидуально, до начала работы.',
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
            {t('Know the market.', 'Знать рынок.')}
            <br />
            <span>{t('Know the people.', 'Знать людей.')}</span>
          </h2>
        </div>
        <p>
          {t(
            'We want to meet people who understand payments on the ground. These are markets for partnership discussions.',
            'Ищем людей, которые понимают местные платежи. Эти рынки открыты для обсуждения партнёрства.',
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
            'Payment availability and business fit are confirmed individually.',
            'Доступность методов и совместимость бизнеса подтверждаем отдельно.',
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
        <h2 id="process-heading">{t('A conversation first.', 'Сначала — разговор.')}</h2>
      </div>
      <ol>
        {[
          [
            t('Introduce yourself', 'Расскажите о себе'),
            t('Your role, markets and a work contact.', 'Ваша роль, рынки и рабочий контакт.'),
          ],
          [
            t('Discuss the fit', 'Обсудим возможности'),
            t(
              'We review your experience and business request.',
              'Рассмотрим опыт и ваш бизнес-запрос.',
            ),
          ],
          [
            t('Agree before starting', 'Согласуем условия'),
            t(
              'Scope, responsibilities and commercial terms.',
              'Задачи, ответственность и коммерческие условия.',
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
  const location = useLocation();
  const [briefOpen, setBriefOpen] = useState(false);
  useEffect(() => {
    setRole(restorePartnerProfile(params).role);
  }, [params]);
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
              <strong>{t('Already have the details?', 'Уже знаете все детали?')}</strong>
              <small>
                {t(
                  'Build, save or share a full partner brief.',
                  'Соберите, сохраните или передайте подробный партнёрский бриф.',
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
