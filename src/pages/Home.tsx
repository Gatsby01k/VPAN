import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import { BriefStudio } from '../components/BriefStudio';
import { SelectControl } from '../components/FormControls';
import { restorePartnerProfile } from '../components/partner-profile';
import { useLocale } from '../locale';
import { markets, roles, type RoleId } from '../data';

const entries: Record<
  RoleId,
  { title: [string, string]; text: [string, string]; action: [string, string] }
> = {
  affiliate: {
    title: ['Know the right people?', 'Есть нужные контакты?'],
    text: [
      'Introduce payment teams, PSPs or merchants to PAN. Start by agreeing the scope of your referral and commercial terms.',
      'Приводи в PAN платёжные команды, PSP и мерчантов. Сначала обсуждаем твою рекомендацию и коммерческие условия.',
    ],
    action: ['Discuss a referral', 'Обсудить рекомендации'],
  },
  team: {
    title: ['Own your local expertise.', 'Знаешь местные платежи?'],
    text: [
      'Introduce your payment team to PAN. Tell us your markets, methods and how your operations work.',
      'Представь свою платёжную команду PAN. Расскажи о рынках, методах и том, как устроены ваши операции.',
    ],
    action: ['Introduce my team', 'Представить команду'],
  },
  provider: {
    title: ['Bring your infrastructure.', 'Есть платёжное решение?'],
    text: [
      'Propose your PSP or local solution to PAN. Let’s discuss supported markets, business categories and integration.',
      'Предложи PAN свой PSP или локальное решение. Обсудим рынки, категории бизнеса и интеграцию.',
    ],
    action: ['Propose a solution', 'Предложить решение'],
  },
  merchant: {
    title: ['Make your requirements clear.', 'Нужны платежи для бизнеса?'],
    text: [
      'Tell PAN what your business needs. Your category, markets and payment requirements give us a concrete starting point.',
      'Расскажи PAN, что нужно твоему бизнесу. Категория, рынки и требования к платежам — основа первого разговора.',
    ],
    action: ['Discuss my business', 'Обсудить свой бизнес'],
  },
  regional: {
    title: ['You know the territory.', 'Знаешь рынок изнутри?'],
    text: [
      'Bring local relationships and practical market knowledge to PAN. Tell us who you know and where you can contribute.',
      'Приноси в PAN локальные связи и практический опыт. Расскажи, с кем ты работаешь и где можешь быть полезен.',
    ],
    action: ['Introduce myself', 'Рассказать о себе'],
  },
};

function PartnerCover({ role, onRole }: { role: RoleId; onRole: (id: RoleId) => void }) {
  const { t } = useLocale();
  const entry = entries[role];
  const current = roles.find((r) => r.id === role)!;
  return (
    <section className="pan-cover" id="partners">
      <div className="cover-landscape" aria-hidden="true" />
      <div className="wrap cover-topline">
        <span>PRIVATE AFFILIATE NETWORK</span>
        <span>iGAMING · E-COMMERCE · HIGH-RISK</span>
      </div>
      <div className="wrap cover-composition">
        <div className="cover-manifesto">
          <span className="cover-kicker">
            {t('THE PEOPLE BEHIND THE NEXT MOVE', 'ЛЮДИ, С КОТОРЫМИ ДВИГАЕМСЯ ДАЛЬШЕ')}
          </span>
          <h1>
            <span>{t('STRONG', 'СИЛЬНЫЕ')}</span>
            <span>{t('PARTNERS.', 'ПАРТНЁРЫ.')}</span>
            <span className="cover-gold">{t('ONE PAN.', 'ОДИН PAN.')}</span>
          </h1>
          <p>
            {t(
              'We’re building PAN with affiliates, payment teams, PSPs and merchants. Choose how you want to work with us.',
              'Развиваем PAN вместе с аффилиатами, платёжными командами, PSP и мерчантами. Выбери, с чем ты приходишь к нам.',
            )}
          </p>
          <Link className="cover-scroll" to="/#forge">
            {t('Build your partner profile', 'Собрать партнёрский профиль')}
            <ArrowDown size={16} />
          </Link>
        </div>
        <div className="cover-character">
          <span className="cover-pan" aria-hidden="true">
            PAN
          </span>
          <img
            src="/assets/pan-mascot.webp"
            width="1254"
            height="1254"
            fetchPriority="high"
            alt={t(
              'PAN: the crowned character with gold PAN rings and a magenta grille',
              'Персонаж PAN: корона, золотые кольца PAN и решётка magenta',
            )}
          />
          <span className="cover-signature" aria-hidden="true">
            PRIVATE BY NATURE.
            <br />
            PARTNERS BY CHOICE.
          </span>
        </div>
        <div className="cover-entry" aria-live="polite">
          <div className="cover-entry-label">
            <span>{t('YOUR WAY IN', 'ТВОЙ ВХОД В PAN')}</span>
            <ArrowUpRight size={20} />
          </div>
          <div className="cover-entry-body">
            <div className="cover-mobile-role">
              <span>{t('I am', 'Я')}</span>
              <SelectControl
                label={t('My role in PAN', 'Моя роль в PAN')}
                value={role}
                onChange={(value) => onRole(value as RoleId)}
                options={roles.map((r) => ({
                  value: r.id,
                  label: r.id === 'provider' ? 'PSP' : t(r.title, r.ru),
                }))}
              />
            </div>
            <span className="cover-role">
              {role === 'provider' ? 'PSP / PAYMENT SOLUTIONS' : t(current.title, current.ru)}
            </span>
            <h2>{t(...entry.title)}</h2>
            <p>{t(...entry.text)}</p>
            <Link className="cover-entry-action" to={`/apply?role=${role}`}>
              {t(...entry.action)}
              <ArrowUpRight size={22} />
            </Link>
            <Link className="cover-entry-details" to={current.path}>
              {t('Partnership details', 'Подробнее о сотрудничестве')}
              <Plus size={15} />
            </Link>
          </div>
          <span className="cover-entry-foot">
            {t('DIRECT CONTACT. INDIVIDUAL TERMS.', 'ПРЯМОЙ КОНТАКТ. ИНДИВИДУАЛЬНЫЕ УСЛОВИЯ.')}
          </span>
        </div>
      </div>
      <div
        className="cover-selector wrap"
        role="group"
        aria-label={t('Choose your role in PAN', 'Выберите свою роль в PAN')}
      >
        {roles.map((r, i) => (
          <button key={r.id} aria-pressed={r.id === role} onClick={() => onRole(r.id)}>
            <span>0{i + 1}</span>
            <strong>{r.id === 'provider' ? 'PSP' : t(r.title, r.ru)}</strong>
            <ArrowUpRight size={19} />
          </button>
        ))}
      </div>
    </section>
  );
}

function PartnershipProcess() {
  const { t } = useLocale();
  const steps = [
    {
      title: ['Tell us what you bring.', 'Расскажи, с чем приходишь.'],
      text: [
        'Your role, markets, experience and a way to reach you. Enough context to start a useful conversation.',
        'Твоя роль, рынки, опыт и контакт. Достаточно контекста, чтобы начать предметный разговор.',
      ],
    },
    {
      title: ['Talk to PAN directly.', 'Обсуди всё напрямую с PAN.'],
      text: [
        'We review your profile and contact you if there is a relevant fit. Then we discuss the practical scope of cooperation.',
        'Рассматриваем профиль и связываемся, если есть подходящее направление. Обсуждаем, как именно можем работать вместе.',
      ],
    },
    {
      title: ['Agree the terms first.', 'Сначала — понятные условия.'],
      text: [
        'Before introductions or integration: the scope, responsibilities and commercial terms. Referral attribution is discussed separately.',
        'До рекомендаций или интеграции согласуем задачи, ответственность и коммерческие условия. Авторство рекомендаций обсуждаем отдельно.',
      ],
    },
  ];
  return (
    <section className="pan-process wrap" id="cooperation">
      <div className="chapter-line">
        <span>02 / {t('HOW WE START', 'КАК НАЧИНАЕМ')}</span>
        <span>PAN / PARTNERSHIP</span>
      </div>
      <div className="process-heading">
        <h2>
          {t('GOOD CONNECTIONS.', 'СИЛЬНЫЕ СВЯЗИ.')}
          <br />
          <span>{t('CLEAR AGREEMENTS.', 'ПОНЯТНЫЕ УСЛОВИЯ.')}</span>
        </h2>
        <p>
          {t(
            'A partnership starts with a conversation. Here is what happens after the first click.',
            'Партнёрство начинается с разговора. Вот что происходит после первого клика.',
          )}
        </p>
      </div>
      <div className="process-steps">
        {steps.map((step, i) => (
          <article key={i}>
            <span className="process-number">0{i + 1}</span>
            <div>
              <h3>{t(step.title[0], step.title[1])}</h3>
              <p>{t(step.text[0], step.text[1])}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="process-contact">
        <span>{t('Prefer a direct conversation?', 'Хочешь сразу поговорить?')}</span>
        <a href="https://t.me/PAN_Affiliate" target="_blank" rel="noopener noreferrer">
          PAN / Telegram
          <ArrowUpRight size={19} />
        </a>
      </div>
    </section>
  );
}

function Territories() {
  const { t } = useLocale();
  const [region, setRegion] = useState('Africa');
  const chosen = markets.filter((m) => m.region === region);
  return (
    <section className="pan-territories">
      <div className="wrap">
        <div className="chapter-line">
          <span>03 / {t('LOCAL KNOWLEDGE', 'ЛОКАЛЬНЫЙ ОПЫТ')}</span>
          <Link to="/markets">
            {t('Explore all markets', 'Открыть все рынки')}
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="territory-heading">
          <h2>
            {t('KNOW YOUR', 'ЗНАЕШЬ СВОЙ')}
            <br />
            <span>{t('TERRITORY?', 'РЫНОК?')}</span>
          </h2>
          <p>
            {t(
              'We want to meet people who understand local payments. Choose a market and tell us where your experience fits.',
              'Ищем людей, которые понимают местные платежи. Выбери рынок и расскажи, где полезен твой опыт.',
            )}
          </p>
        </div>
        <div className="territory-body">
          <div
            className="territory-regions"
            role="group"
            aria-label={t('Choose a region', 'Выберите регион')}
          >
            {['Africa', 'LATAM', 'Asia'].map((r) => (
              <button key={r} aria-pressed={r === region} onClick={() => setRegion(r)}>
                {r === 'Africa' ? t('Africa', 'Африка') : r === 'Asia' ? t('Asia', 'Азия') : r}
                <ArrowUpRight size={20} />
              </button>
            ))}
            <p>
              {t(
                'Markets for partnership discussions. Availability is reviewed individually.',
                'Рынки для обсуждения партнёрства. Возможности рассматриваем индивидуально.',
              )}
            </p>
          </div>
          <div className="territory-ledger">
            {chosen.map((m) => (
              <Link key={m.slug} to={`/markets/${m.slug}`}>
                <span className="territory-code">{m.code}</span>
                <div>
                  <strong>{t(m.name, m.ru)}</strong>
                  <span>{m.methods.join(' / ')}</span>
                </div>
                <small>{m.currency}</small>
                <ArrowUpRight size={22} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [role, setRole] = useState<RoleId>('affiliate');
  const [params] = useSearchParams();
  useEffect(() => {
    setRole(restorePartnerProfile(params).role);
  }, [params]);
  return (
    <>
      <PartnerCover role={role} onRole={setRole} />
      <BriefStudio role={role} onRole={setRole} />
      <PartnershipProcess />
      <Territories />
    </>
  );
}
