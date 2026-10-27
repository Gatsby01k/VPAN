import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
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
}: {
  to: string;
  children: ReactNode;
  down?: boolean;
}) {
  return (
    <Link className="thread-link" to={to}>
      <span className="thread-eye" aria-hidden="true" />
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
              'Meet exchange and OTC teams with relevant local payment expertise.',
              'Знакомьтесь с командами обмена и OTC с опытом локальных платежей.',
            )}
          </p>
          <div className="editorial-rows">
            {[
              ['/teams', t('Exchange & OTC teams', 'Команды обмена и OTC')],
              ['/payment-partners', t('Local payment partners', 'Локальные платёжные партнёры')],
              ['/merchants', t('Business counterparties', 'Бизнес-партнёры')],
            ].map(([to, label], i) => (
              <Link to={to} key={to}>
                <small>0{i + 1}</small>
                <span>{label}</span>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            ))}
          </div>
          <ThreadLink to="/apply?category=Exchange">
            {t('Discuss a partnership', 'Обсудить партнёрство')}
          </ThreadLink>
        </div>
      </div>
      <SceneFoot number="05" label="THE OTHER SIDE">
        <a href="mailto:hello@vladdos.com">hello@vladdos.com</a>
      </SceneFoot>
    </section>
  );
}
