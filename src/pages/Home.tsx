import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import {
  ArrowDown,
  ArrowUpRight,
  Fingerprint,
  Globe2,
  Layers3,
  Network,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import { Action, Eyebrow, Reveal, Spotlight } from '../components/UI';
import { HeroArt } from '../components/HeroArt';
import { useLocale } from '../locale';
import { markets, roles } from '../data';

function Hero() {
  const { t } = useLocale();
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -50]);
  return (
    <section className="hero wrap" ref={ref}>
      <div className="hero-topline">
        <Eyebrow>
          {t('Private affiliate network / High-risk', 'Партнёрская сеть / High-risk')}
        </Eyebrow>
        <span className="hero-edition">PAN® / BLACK LABEL</span>
      </div>
      <div className="hero-grid">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-line">
              <motion.span
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              >
                {t('YOUR', 'ВАШИ')}
              </motion.span>
            </span>
            <span className="title-line">
              <motion.span
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.08, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              >
                {t('NETWORK.', 'СВЯЗИ.')}
              </motion.span>
            </span>
            <span className="title-line hero-title-accent">
              <motion.span
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.16, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              >
                {t('AMPLIFIED.', 'ВАШ ПЛЮС.')}
              </motion.span>
            </span>
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            <p className="hero-description">
              {t(
                'Your next advantage in high-risk commerce. We connect affiliates, PSPs, payment teams and merchants across iGaming and e-commerce.',
                'Ваше преимущество в high-risk. Соединяем аффилиатов, PSP, платёжные команды и мерчантов в iGaming и e-commerce.',
              )}
            </p>
            <div className="hero-actions">
              <Action to="/apply">{t('Become a partner', 'Стать партнёром')}</Action>
              <Link className="text-link" to="/markets">
                {t('Explore markets', 'Посмотреть рынки')}
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
        <motion.div className="hero-art-wrap" style={{ y }}>
          <HeroArt />
          <div className="hero-art-caption">
            <span>01—∞</span>
            <p>
              {t(
                'A network is only as strong as the people inside it.',
                'Сила сети — в людях, которые её создают.',
              )}
            </p>
          </div>
        </motion.div>
      </div>
      <div className="hero-bottom">
        <Link to="/#partners" className="scroll-cue">
          <span className="scroll-cue-icon">
            <ArrowDown size={16} />
          </span>
          {t('Find your place', 'Найдите своё направление')}
        </Link>
        <span>
          {t('Independent network', 'Независимая сеть')}
          <i>✳</i>
          {t('Individual terms', 'Индивидуальные условия')}
          <i>✳</i>
          {t('Real introductions', 'Прямые знакомства')}
        </span>
      </div>
    </section>
  );
}

function Marquee() {
  const text = ['LOCAL EXPERTISE', 'GLOBAL AMBITION', 'DIRECT CONNECTIONS', 'PAN BLACK LABEL'];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((n) => (
          <div key={n}>
            {text.map((word) => (
              <span key={word}>
                {word}
                <i>✳</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Partners() {
  const { t } = useLocale();
  const icons = [Network, Layers3, Shuffle, Globe2];
  return (
    <section id="partners" className="section wrap partner-section">
      <Reveal>
        <div className="section-title-row">
          <div>
            <Eyebrow number="01">{t('Find your place', 'Найдите своё направление')}</Eyebrow>
            <h2 className="section-title">
              {t('Different strengths.', 'Разные сильные стороны.')}
              <br />
              <span className="serif">{t('One network.', 'Одна сеть.')}</span>
            </h2>
          </div>
          <p className="section-description">
            {t(
              'Bring what you do best. We start with your experience, your market and the people you know.',
              'Привносите то, в чём вы сильны. Начинаем с вашего опыта, рынка и людей, которых вы знаете.',
            )}
          </p>
        </div>
      </Reveal>
      <div className="partner-grid">
        {roles.slice(0, 4).map((role, index) => {
          const Icon = icons[index];
          return (
            <Reveal key={role.id} delay={index * 0.065}>
              <Spotlight className={`partner-card partner-card-${index}`}>
                <Link to={role.path} className="partner-card-link">
                  <div className="partner-card-top">
                    <span>0{index + 1}</span>
                    <ArrowUpRight size={24} strokeWidth={1.4} />
                  </div>
                  <div className="partner-card-symbol" aria-hidden="true">
                    <Icon strokeWidth={0.9} />
                  </div>
                  <div className="partner-card-copy">
                    <h3>{t(role.title, role.ru)}</h3>
                    <p>{t(role.short, role.shortRu)}</p>
                  </div>
                  <div className="partner-card-bottom">
                    <span>{t('Explore partnership', 'О партнёрстве')}</span>
                    <span className="small-dot" />
                  </div>
                </Link>
              </Spotlight>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Manifesto() {
  const { t } = useLocale();
  return (
    <section className="manifesto section">
      <div className="wrap manifesto-grid">
        <Reveal>
          <Eyebrow number="02">{t('A better kind of network', 'Другой уровень связей')}</Eyebrow>
          <h2 className="manifesto-title">
            {t('THE RIGHT', 'НУЖНЫЕ')}
            <br />
            {t('PEOPLE.', 'ЛЮДИ.')}
            <br />
            <span className="serif">
              {t('The next', 'Новые')}
              <br />
              {t('possibility.', 'возможности.')}
            </span>
          </h2>
        </Reveal>
        <div className="manifesto-details">
          <Reveal>
            <p className="manifesto-lead">
              {t(
                'Business starts with trust. Great partnerships start with context.',
                'Бизнес начинается с доверия. Хорошее партнёрство — с понимания контекста.',
              )}
            </p>
          </Reveal>
          {[
            [
              Fingerprint,
              t('Clear introductions', 'Понятные знакомства'),
              t(
                'Discuss referral attribution and commercial terms before moving forward.',
                'Согласовывайте авторство рекомендации и коммерческие условия до следующих шагов.',
              ),
            ],
            [
              Globe2,
              t('Local understanding', 'Знание местных рынков'),
              t(
                'Relevant relationships across selected markets, currencies and payment methods.',
                'Подходящие связи в выбранных рынках, валютах и платёжных методах.',
              ),
            ],
            [
              Sparkles,
              t('Individual fit', 'Индивидуальный подход'),
              t(
                'Each partnership is reviewed on its merits. Honest conversations, no generic promises.',
                'Каждое партнёрство рассматриваем отдельно. Предметный разговор без общих обещаний.',
              ),
            ],
          ].map(([Icon, title, text], i) => {
            const I = Icon as typeof Fingerprint;
            return (
              <Reveal className="manifesto-item" key={String(title)} delay={i * 0.04}>
                <I size={21} strokeWidth={1.3} />
                <div>
                  <h3>{title as string}</h3>
                  <p>{text as string}</p>
                </div>
                <span>0{i + 1}</span>
              </Reveal>
            );
          })}
          <Reveal>
            <Link className="text-link" to="/about">
              {t('The thinking behind PAN', 'Принципы PAN')}
              <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </div>
      </div>
      <div className="manifesto-background-type" aria-hidden="true">
        PAN.
      </div>
    </section>
  );
}

function MarketPreview() {
  const { t } = useLocale();
  return (
    <section className="market-preview section">
      <div className="wrap market-preview-grid">
        <div>
          <Reveal>
            <Eyebrow number="03">
              {t('Local insight. Global outlook.', 'Локальные знания. Широкий взгляд.')}
            </Eyebrow>
            <h2 className="section-title">
              {t('Beyond', 'За пределами')}
              <br />
              <span className="serif">{t('borders.', 'границ.')}</span>
            </h2>
            <p className="market-preview-description">
              {t(
                'We are building relationships across Africa, Asia and Latin America. Start with the market you know.',
                'Мы развиваем связи в Африке, Азии и Латинской Америке. Начните с рынка, который знаете.',
              )}
            </p>
            <Action to="/markets" secondary>
              {t('Explore the markets', 'Посмотреть рынки')}
            </Action>
          </Reveal>
          <div className="market-coordinate" aria-hidden="true">
            <Globe2 strokeWidth={0.55} />
            <span>PAN / MARKET EXPLORER</span>
          </div>
        </div>
        <div className="market-preview-list">
          {markets.slice(0, 5).map((market, i) => (
            <Reveal key={market.slug} delay={i * 0.04}>
              <Link to={`/markets/${market.slug}`} className="market-preview-row">
                <span className="market-code">{market.code}</span>
                <div>
                  <h3>{t(market.name, market.ru)}</h3>
                  <span>{market.methods.slice(0, 2).join(' / ')}</span>
                </div>
                <span className="market-currency">{market.currency}</span>
                <span className="market-preview-arrow">
                  <ArrowUpRight size={24} strokeWidth={1.3} />
                </span>
              </Link>
            </Reveal>
          ))}
          <p className="market-preview-note">
            <span className="small-dot" />
            {t(
              'Exploring partnerships. Availability is reviewed individually.',
              'Развиваем партнёрства. Доступность обсуждается индивидуально.',
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const { t } = useLocale();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end center'] });
  return (
    <section className="section process-section wrap" id="process" ref={ref}>
      <div className="process-intro">
        <Eyebrow number="04">{t('How we connect', 'Как мы работаем')}</Eyebrow>
        <h2 className="section-title">
          {t('A conversation.', 'Знакомство.')}
          <br />
          <span className="serif">{t('Then a connection.', 'Затем партнёрство.')}</span>
        </h2>
        <p className="section-description">
          {t(
            'A focused introduction. A practical review. Terms everyone understands.',
            'Короткое знакомство. Предметная оценка. Условия, понятные всем.',
          )}
        </p>
        <Action to="/apply">{t('Start your introduction', 'Начать знакомство')}</Action>
      </div>
      <div className="process-steps">
        <div className="process-line">
          <motion.span style={{ scaleY: scrollYProgress }} />
        </div>
        {[
          [
            t('Tell us your story.', 'Расскажите о себе.'),
            t(
              'Your role, your markets and what you bring. A few useful details are enough to start.',
              'Ваша роль, рынки и то, что вы предлагаете. Для начала достаточно нескольких полезных деталей.',
            ),
            '01',
          ],
          [
            t('Find the right fit.', 'Найдите общий интерес.'),
            t(
              'We review your experience and discuss where a relevant partnership could exist.',
              'Мы рассмотрим ваш опыт и обсудим, где может возникнуть подходящее партнёрство.',
            ),
            '02',
          ],
          [
            t('Agree the next move.', 'Согласуйте следующий шаг.'),
            t(
              'Scope, responsibilities and commercial terms are discussed before introductions progress.',
              'Сфера работы, ответственность и коммерческие условия обсуждаются до следующих шагов.',
            ),
            '03',
          ],
        ].map(([title, text, index]) => (
          <Reveal className="process-step" key={index}>
            <span className="process-step-index">{index}</span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            <ArrowUpRight size={21} strokeWidth={1} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLocale();
  return (
    <>
      <Hero />
      <Marquee />
      <Partners />
      <Manifesto />
      <MarketPreview />
      <Process />
      <section className="home-closing">
        <div className="wrap">
          <Reveal>
            <Eyebrow>{t('For people who know people', 'Для тех, кто знает людей')}</Eyebrow>
            <Link to="/apply" className="closing-link">
              <h2>
                {t('GOOD PEOPLE.', 'НУЖНЫЕ ЛЮДИ.')}
                <br />
                <span className="serif">{t('Better business.', 'Больше возможностей.')}</span>
              </h2>
              <span className="closing-arrow">
                <ArrowUpRight strokeWidth={1} />
              </span>
            </Link>
            <p>
              {t(
                'Bring your experience. Let’s see what we can build together.',
                'Привносите свой опыт. Посмотрим, что сможем создать вместе.',
              )}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
