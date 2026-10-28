import type { ReactNode } from 'react';
import { NLink as Link } from './NetworkLayout';
import { ArrowDown, ArrowUpRight, ArrowRight } from 'lucide-react';
import { useLocale } from '../locale';

export function SceneArt({ name, priority = false }: { name: string; priority?: boolean }) {
  return (
    <div className="scene-art" aria-hidden="true">
      <img
        src={`/assets/editorial/${name}.webp`}
        alt=""
        width="1586"
        height="992"
        fetchPriority={priority ? 'high' : undefined}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}

export function ThreadLink({
  to,
  children,
  down = false,
  arrow = false,
}: {
  to: string;
  children: ReactNode;
  down?: boolean;
  arrow?: boolean;
}) {
  return (
    <Link className="thread-link" to={to}>
      <span className={`thread-eye ${arrow ? 'thread-eye-arrow' : ''}`} aria-hidden="true">
        {arrow && <ArrowRight size={23} />}
      </span>
      <span>{children}</span>
      {down ? <ArrowDown aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
    </Link>
  );
}

export function SceneFoot({
  number,
  label,
  children,
}: {
  number: string;
  label: string;
  children?: ReactNode;
}) {
  return (
    <div className="scene-foot">
      <span className="folio">
        {number} / {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

export function ExchangeScene({ heading = false }: { heading?: boolean }) {
  const { t } = useLocale();
  const Title = heading ? 'h1' : 'h2';
  return (
    <section
      className="editorial-scene exchange-scene"
      id="exchange"
      aria-labelledby="exchange-title"
    >
      <SceneArt name="exchange" priority={heading} />
      <div className="scene-copy exchange-copy">
        <p className="folio">PAYMENTS / LOCAL OPERATIONS / COMMERCIAL PARTNERS</p>
        <Title id="exchange-title" className="editorial-title">
          {t('Value moves.', 'Ценность движется.')}
          <em>{t('People connect.', 'Люди объединяют.')}</em>
        </Title>
        <div className="exchange-details">
          <p>
            {t(
              'Find payment providers, local operators and commercial counterparties. Each industry has its own requirements; every introduction starts with qualification.',
              'Находите платёжных провайдеров, локальных операторов и коммерческих контрагентов. У каждой индустрии свои требования; каждое знакомство начинается с проверки.',
            )}
          </p>
          <div className="editorial-rows">
            {[
              [
                '/find-a-partner?industry=payments&capabilities=local-methods',
                t('Local payment infrastructure', 'Локальная платёжная инфраструктура'),
              ],
              [
                '/find-a-partner?industry=commerce&capabilities=collections,payouts',
                t('Merchant acceptance & payouts', 'Приём и выплаты для мерчантов'),
              ],
              [
                '/find-a-partner?industry=exchange',
                t('Exchange & OTC relationships', 'Партнёрства для обмена и OTC'),
              ],
            ].map(([to, label], i) => (
              <Link to={to} key={to}>
                <small>0{i + 1}</small>
                <span>{label}</span>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            ))}
          </div>
          <ThreadLink to="/industries" arrow>
            {t('Discuss a partnership', 'Обсудить партнёрство')}
          </ThreadLink>
        </div>
      </div>
      <SceneFoot number="05" label={t('THE OTHER SIDE', 'ДРУГАЯ СТОРОНА')}>
        <a href="mailto:hello@vladdos.com">hello@vladdos.com</a>
      </SceneFoot>
    </section>
  );
}
