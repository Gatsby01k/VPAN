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
        <p className="folio">EXCHANGE / OTC / LOCAL PAYMENTS</p>
        <Title id="exchange-title" className="editorial-title">
          {t('Value moves.', 'Ценность движется.')}
          <em>{t('People connect.', 'Люди объединяют.')}</em>
        </Title>
        <div className="exchange-details">
          <p>
            {t(
              'Find exchange, OTC and settlement counterparties. Operating scope and eligibility are reviewed before an introduction.',
              'Находите контрагентов по обмену, OTC и расчётам. Границы работы и допустимость проверяем до знакомства.',
            )}
          </p>
          <div className="editorial-rows">
            {[
              [
                '/find-a-partner?industry=exchange&capabilities=liquidity',
                t('Liquidity relationships', 'Партнёры по ликвидности'),
              ],
              [
                '/find-a-partner?industry=exchange&capabilities=settlement',
                t('Settlement relationships', 'Партнёры по расчётам'),
              ],
              ['/join?industry=exchange', t('Introduce your offer', 'Представить предложение')],
            ].map(([to, label], i) => (
              <Link to={to} key={to}>
                <small>0{i + 1}</small>
                <span>{label}</span>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            ))}
          </div>
          <ThreadLink to="/find-a-partner?industry=exchange" arrow>
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
