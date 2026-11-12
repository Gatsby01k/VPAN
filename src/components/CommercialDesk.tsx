import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Copy, Download } from 'lucide-react';
import { useLocale } from '../locale';
import { capabilities, companyTypes, countries, industries, label } from '../network';
import playbook from '../../shared/commercial-playbook.json';
import researchTargets from '../../shared/acquisition-targets.json';

type Row = Record<string, any>;
type Option = { id: string; name: string };
type Field = {
  key: string;
  name: string;
  type?: string;
  options?: Option[];
  optional?: boolean;
  hint?: string;
  multiple?: boolean;
};
type Values = Record<string, any>;
type Request = (path?: string, method?: string, body?: unknown) => Promise<any>;
type Props = {
  section: string;
  data: Row;
  report: Row;
  busy: boolean;
  request: Request;
  perform: (fn: () => Promise<unknown>) => Promise<void>;
  navigate: (tab: string) => void;
  open: (row: Row) => void;
};
const money = (n: number, currency: string) => {
  try {
    const f = new Intl.NumberFormat('en', { style: 'currency', currency });
    return f.format(n / 10 ** (f.resolvedOptions().maximumFractionDigits ?? 2));
  } catch {
    return `${n} ${currency} minor units`;
  }
};
const dateNow = () => new Date().toISOString().slice(0, 10);
const proof: Field = {
  key: 'evidence',
  name: 'Evidence / signed reference',
  type: 'textarea',
  hint: 'Record where the decision or agreement can be verified. Keep sensitive documents in your secure document store.',
};
const opt = (items: Row[], name: (r: Row) => string): Option[] =>
  items.map((r) => ({ id: r.id, name: name(r) }));

function DeskForm({
  title,
  fields,
  action,
  busy,
  onSubmit,
  initial = {},
}: {
  title: string;
  fields: Field[];
  action: string;
  busy: boolean;
  onSubmit: (v: Values) => Promise<unknown>;
  initial?: Values;
}) {
  const { t } = useLocale();
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = Object.fromEntries(
      fields.map((f) => [
        f.key,
        f.multiple ? form.getAll(f.key) : f.type === 'checkbox' ? form.has(f.key) : form.get(f.key),
      ]),
    );
    await onSubmit(values);
  };
  return (
    <details className="commercial-form">
      <summary>{title}</summary>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          {fields.map((f) => (
            <label key={f.key} className={f.type === 'checkbox' ? 'consent' : ''}>
              <span>
                {f.name}
                {f.optional ? t(' · optional', ' · необязательно') : ''}
              </span>
              {f.options ? (
                <select
                  name={f.key}
                  required={!f.optional}
                  multiple={f.multiple}
                  defaultValue={initial[f.key] ?? (f.multiple ? [] : '')}
                >
                  {!f.multiple && <option value="">{t('Select…', 'Выберите…')}</option>}
                  {f.options.map((o) => (
                    <option value={o.id} key={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  name={f.key}
                  required={!f.optional}
                  minLength={10}
                  maxLength={2000}
                  rows={3}
                  defaultValue={initial[f.key] || ''}
                />
              ) : (
                <input
                  name={f.key}
                  type={f.type || 'text'}
                  required={!f.optional}
                  min={
                    f.type === 'number'
                      ? ['collectionDays', 'payoutDays'].includes(f.key)
                        ? 0
                        : 1
                      : undefined
                  }
                  max={f.key === 'shareBps' ? 10000 : undefined}
                  step={f.type === 'number' ? 1 : undefined}
                  maxLength={f.type === 'text' ? 180 : undefined}
                  defaultValue={
                    f.type === 'date'
                      ? (initial[f.key] ?? (f.optional ? '' : dateNow()))
                      : (initial[f.key] ?? '')
                  }
                />
              )}
              {f.hint && <small>{f.hint}</small>}
            </label>
          ))}
          <button className="action" type="submit">
            {action}
            <ArrowUpRight size={16} />
          </button>
        </fieldset>
      </form>
    </details>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="commercial-empty">{children}</p>;
}

export function CommercialDesk({
  section,
  data,
  report,
  busy,
  request,
  perform,
  navigate,
  open,
}: Props) {
  const { t, language } = useLocale();
  const [selected, setSelected] = useState('');
  const [copied, setCopied] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftId, setDraftId] = useState('');
  const [decisionEvidence, setDecisionEvidence] = useState('');
  const save = (path: string, body: unknown, method = 'POST') =>
    perform(() => request('/commercial/' + path, method, body));
  const agreementOptions = opt(
    report.agreements,
    (a) => `${a.evidence} · ${a.currency} · ${a.model}`,
  );
  const affiliateOptions = opt(data.affiliates, (a) => `${a.name} / ${a.code}`);
  const opportunityOptions = opt(report.opportunities, (o) => `${o.reference} · ${o.company_name}`);
  const selectedProspect = data.prospects.find((p: Row) => p.id === selected);
  const exportData = () => {
    const url = URL.createObjectURL(
      new Blob(
        [JSON.stringify({ exportedAt: new Date().toISOString(), commercial: data }, null, 2)],
        { type: 'application/json' },
      ),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `vladdos-commercial-${dateNow()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="commercial-desk">
      {section === 'overview' && (
        <>
          <div className="commercial-title">
            <div>
              <span className="folio">FOUNDER’S DAILY VIEW</span>
              <h2>{t('Move the next deal forward.', 'Следующий шаг к сделке.')}</h2>
            </div>
            <button className="text-link" onClick={exportData}>
              <Download size={16} />
              {t('Export ledger', 'Экспорт учёта')}
            </button>
          </div>
          <div className="commercial-funnel">
            {Object.entries(data.funnel).map(([name, value]) => (
              <div key={name}>
                <strong>{String(value)}</strong>
                <span>
                  {
                    (
                      {
                        received: t('Briefs received', 'Брифы'),
                        qualified: t('Qualified', 'Проверены'),
                        introduced: t('Introduced', 'Познакомлены'),
                        signed: t('Agreements', 'Соглашения'),
                        activated: t('Activated', 'Активированы'),
                        collected: t('Collected statements', 'Оплаченные отчёты'),
                      } as Record<string, string>
                    )[name]
                  }
                </span>
              </div>
            ))}
          </div>
          <p className="commercial-caption">
            {t(
              'Current record counts, not a cohort conversion rate. Collected counts statements with receipt evidence.',
              'Текущие записи, а не когортная конверсия. Получение подтверждается документами.',
            )}
          </p>
          <div className="commercial-finances">
            {data.totals.length ? (
              data.totals.map((r: Row) => (
                <article key={r.currency}>
                  <span className="folio">
                    {r.currency} / {t('NO CURRENCY CONVERSION', 'БЕЗ КОНВЕРТАЦИИ')}
                  </span>
                  <h3>{money(r.collected_net_minor, r.currency)}</h3>
                  <p>{t('Collected net contribution', 'Чистый вклад полученных средств')}</p>
                  <dl>
                    {[
                      [t('Gross fees accrued', 'Начисленный валовой доход'), r.gross_minor],
                      [t('Gross fees collected', 'Полученный валовой доход'), r.collected_minor],
                      [
                        t('Affiliate obligations accrued', 'Начислено аффилиатам'),
                        r.compensation_minor,
                      ],
                      [t('Payable now', 'К выплате сейчас'), r.payout_due_minor],
                      [t('Affiliate payments recorded', 'Выплачено аффилиатам'), r.paid_minor],
                      [t('Paid costs recorded', 'Учтённые расходы'), r.costs_minor],
                      [
                        t('Reserved from collected fees', 'Резерв из полученного'),
                        r.reserved_minor,
                      ],
                      [
                        t('Cash retained after recorded payments', 'Остаток после учтённых выплат'),
                        r.retained_cash_minor,
                      ],
                    ].map(([name, value]) => (
                      <div key={String(name)}>
                        <dt>{name}</dt>
                        <dd>{money(Number(value), r.currency)}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))
            ) : (
              <Empty>
                {t(
                  'No statement-backed revenue yet. Signed terms and real collections will populate this view.',
                  'Пока нет дохода с подтверждёнными отчётами. Здесь появятся реальные начисления и оплаты.',
                )}
              </Empty>
            )}
          </div>
          <p className="commercial-caption">
            {t(
              'Net contribution = collected VlaDDoS fees − all affiliate obligations on those fees − recorded paid costs. Before tax and unrecorded overhead. Retained cash includes unpaid affiliate reserves; it is not free earnings. Amounts are never inferred from partner transaction volume.',
              'Чистый вклад = полученные комиссии VlaDDoS − обязательства аффилиатам с этих сумм − учтённые расходы. До налогов и неучтённых затрат. Остаток включает резерв обязательств; это не свободный доход.',
            )}
          </p>
          <h3>{t('Today’s commercial work', 'Коммерческие задачи на сегодня')}</h3>
          {data.tasks.length ? (
            <ol className="commercial-task-list">
              {data.tasks.map((task: Row, i: number) => (
                <li key={`${task.kind}-${task.id}`}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{task.title}</strong>
                    <small>
                      {task.kind} · {task.due}
                    </small>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => {
                      if (task.kind.startsWith('qualification')) {
                        navigate('opportunities');
                        const row = report.opportunities.find((o: Row) => o.id === task.id);
                        if (row) void open(row);
                      } else
                        navigate(
                          task.kind.includes('outreach')
                            ? 'acquisition'
                            : task.kind.includes('attribution') || task.kind.includes('affiliate')
                              ? 'affiliates'
                              : task.kind.includes('statement') || task.kind.includes('schedule')
                                ? 'agreements'
                                : 'revenue',
                        );
                    }}
                  >
                    {t('Review', 'Открыть')}
                    <ArrowUpRight size={16} />
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <Empty>
              {t(
                'No due tasks. Research a specific business need or review your next statement date.',
                'Нет просроченных задач. Изучите конкретную потребность или следующий отчётный период.',
              )}
            </Empty>
          )}
          <DeskForm
            title={t('Record an actual paid cost', 'Учесть оплаченный расход')}
            busy={busy}
            fields={[
              { key: 'agreementId', name: 'Agreement / currency', options: agreementOptions },
              {
                key: 'amountMinor',
                name: 'Paid cost in minor units',
                type: 'number',
                hint: 'For USD, 100 minor units = $1. For JPY, 1 minor unit = ¥1.',
              },
              { key: 'paidOn', name: 'Paid on', type: 'date' },
              { key: 'receipt', name: 'Unique expense receipt', type: 'textarea' },
            ]}
            action={t('Record expense', 'Сохранить расход')}
            onSubmit={(v) => save('costs', v)}
          />
          <details className="commercial-form">
            <summary>{t('Commercial audit history', 'История коммерческих действий')}</summary>
            {data.events.map((event: Row) => (
              <p key={event.id}>
                <small>
                  {event.at} / {event.kind}
                </small>
                <br />
                {event.detail}
              </p>
            ))}
          </details>
        </>
      )}
      {section === 'affiliates' && (
        <>
          <div className="commercial-title">
            <div>
              <span className="folio">REFERRALS / COMMISSIONS</span>
              <h2>{t('A clear claim. A fair share.', 'Авторство и справедливая доля.')}</h2>
            </div>
          </div>
          <p>
            {t(
              'Register signed referral relationships, adjudicate attribution, then agree all splits before recording the first fee statement. Sub-partner and parent shares both come out of VlaDDoS gross fee revenue.',
              'Фиксируйте договорные отношения, подтверждайте авторство и согласуйте все доли до первого отчёта. Доли субпартнёра и родителя вычитаются из валовой комиссии VlaDDoS.',
            )}
          </p>
          <div className="commercial-two-column">
            <DeskForm
              title={t('Register a referral partner', 'Добавить реферального партнёра')}
              busy={busy}
              fields={[
                { key: 'name', name: 'Legal payee name' },
                {
                  key: 'code',
                  name: 'Unique code',
                  hint: '3–60 lowercase letters, numbers, _ or -.',
                },
                { key: 'contact', name: 'Business contact' },
                {
                  key: 'parentId',
                  name: 'Parent introducer',
                  options: affiliateOptions,
                  optional: true,
                },
                proof,
              ]}
              action="Register partner"
              onSubmit={(v) => save('affiliates', v)}
            />
            <DeskForm
              title={t('Register a referral claim', 'Зафиксировать авторство')}
              busy={busy}
              fields={[
                { key: 'opportunityId', name: 'Referred opportunity', options: opportunityOptions },
                { key: 'affiliateId', name: 'Claimant', options: affiliateOptions },
                { key: 'expiresOn', name: 'Contractual attribution expiry', type: 'date' },
                proof,
              ]}
              action="Register claim"
              onSubmit={(v) => save('claims', v)}
            />
          </div>
          {data.affiliates.length ? (
            <div className="commercial-partners">
              {data.affiliates.map((a: Row) => (
                <article key={a.id}>
                  <span className="folio">{a.parent_id ? 'SUB-PARTNER' : 'INTRODUCER'}</span>
                  <h3>{a.name}</h3>
                  <p>{a.contact}</p>
                  <code>https://www.vladdos.com/?ref={a.code}</code>
                  <button
                    className="text-link"
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(`https://www.vladdos.com/?ref=${a.code}`)
                        .then(() => setCopied(a.id))
                        .catch(() => setCopied('error'));
                    }}
                  >
                    <Copy size={14} />
                    {copied === a.id
                      ? t('Copied', 'Скопировано')
                      : t('Copy referral link', 'Скопировать ссылку')}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <Empty>
              {t(
                'No contracted referral partners recorded.',
                'Договорные реферальные партнёры пока не добавлены.',
              )}
            </Empty>
          )}
          <h3>{t('Attribution decisions', 'Решения об авторстве')}</h3>
          <p className="commercial-caption">
            {t(
              'A referral link creates a pending claim. Confirm company identity, existing relationships, permission, exclusivity and the signed window. Accepted or disputed claims block competing claims for the same company and industry.',
              'Реферальная ссылка создаёт неподтверждённую заявку. Проверьте юрлицо, прежние отношения, разрешения, эксклюзивность и срок. Спорное авторство блокирует конкурирующие заявки.',
            )}
          </p>
          {data.claims.map((c: Row) => (
            <div className="commercial-record" key={c.id}>
              <strong>
                {report.opportunities.find((o: Row) => o.id === c.opportunity_id)?.reference} ·{' '}
                {data.affiliates.find((a: Row) => a.id === c.affiliate_id)?.name}
              </strong>
              <span className={`commercial-state ${c.status}`}>{c.status}</span>
              <p>{c.evidence}</p>
              <DeskForm
                title="Record decision / dispute resolution"
                busy={busy}
                initial={{ expiresOn: c.expires_on }}
                fields={[
                  {
                    key: 'status',
                    name: 'Decision',
                    options: ['accepted', 'disputed', 'rejected'].map((s) => ({ id: s, name: s })),
                  },
                  { key: 'expiresOn', name: 'Signed attribution expiry', type: 'date' },
                  proof,
                ]}
                action="Save evidenced decision"
                onSubmit={(v) => save('claims/' + c.id, v, 'PATCH')}
              />
            </div>
          ))}
          <div className="commercial-two-column">
            <DeskForm
              title={t('Record a signed commission split', 'Зафиксировать договорную долю')}
              busy={busy}
              fields={[
                {
                  key: 'agreementId',
                  name: 'Signed commercial agreement',
                  options: agreementOptions,
                },
                {
                  key: 'claimId',
                  name: 'Accepted claim',
                  options: opt(
                    data.claims.filter((c: Row) => c.status === 'accepted'),
                    (c) =>
                      `${report.opportunities.find((o: Row) => o.id === c.opportunity_id)?.reference} / ${data.affiliates.find((a: Row) => a.id === c.affiliate_id)?.name}`,
                  ),
                },
                {
                  key: 'affiliateId',
                  name: 'Beneficiary (claimant or parent)',
                  options: affiliateOptions,
                },
                {
                  key: 'shareBps',
                  name: 'Share of VlaDDoS gross fees in basis points',
                  type: 'number',
                  hint: '100 bps = 1%. All beneficiary shares combined must be ≤10000. Parent compensation is included in this cap.',
                },
                proof,
              ]}
              action="Record signed split"
              onSubmit={(v) => save('allocations', v)}
            />
            <DeskForm
              title={t('Confirm actual activation', 'Подтвердить активацию')}
              busy={busy}
              fields={[
                {
                  key: 'introductionId',
                  name: 'Introduced relationship',
                  options: opt(
                    report.introductions,
                    (i) =>
                      `${report.opportunities.find((o: Row) => o.id === i.demand_id)?.reference} ↔ ${report.opportunities.find((o: Row) => o.id === i.supply_id)?.reference}`,
                  ),
                },
                { key: 'activatedOn', name: 'Actual activation date', type: 'date' },
                proof,
              ]}
              action="Record activation"
              onSubmit={(v) => save('activations', v)}
            />
          </div>
          <h3>{t('Earned commissions & payout holds', 'Комиссии и ограничения выплат')}</h3>
          {data.obligations.length ? (
            <div className="desk-table-scroll">
              <table>
                <thead>
                  <tr>
                    {['Payee / statement', 'Earned', 'Paid', 'Payable', 'Hold / due date'].map(
                      (x) => (
                        <th key={x}>{x}</th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.obligations.map((o: Row) => (
                    <tr key={o.id + o.revenue_id}>
                      <td>
                        {o.name}
                        <small>
                          {o.period} · {o.share_bps} bps
                        </small>
                      </td>
                      <td>{money(o.earned_minor, o.currency)}</td>
                      <td>{money(o.paid_minor, o.currency)}</td>
                      <td>{money(o.payable_minor, o.currency)}</td>
                      <td>
                        {o.claim_status !== 'accepted'
                          ? 'Attribution dispute'
                          : o.revenue_status !== 'received'
                            ? 'Await collection'
                            : !o.activated_on
                              ? 'Await activation'
                              : !o.due_on
                                ? 'Schedule required'
                                : o.payable_minor
                                  ? 'Ready'
                                  : o.remaining_minor
                                    ? 'Contractual hold'
                                    : 'Paid'}
                        <small>{o.due_on}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty>
              {t(
                'Signed splits and fee statements will create obligations here.',
                'Договорные доли и отчёты сформируют обязательства.',
              )}
            </Empty>
          )}
          <DeskForm
            title={t('Record an actual affiliate payment', 'Учесть выплату аффилиату')}
            busy={busy}
            fields={[
              {
                key: 'obligation',
                name: 'Collected and payable obligation',
                options: data.obligations
                  .filter((o: Row) => o.payable_minor > 0)
                  .map((o: Row) => ({
                    id: `${o.id}|${o.revenue_id}`,
                    name: `${o.name} · ${o.period} · ${money(o.payable_minor, o.currency)} available`,
                  })),
              },
              { key: 'amountMinor', name: 'Amount actually paid in minor units', type: 'number' },
              { key: 'paidOn', name: 'Actual paid date', type: 'date' },
              { key: 'receipt', name: 'Unique payment receipt / bank reference', type: 'textarea' },
            ]}
            action="Record payment evidence"
            onSubmit={(v) => {
              const [allocationId, revenueId] = v.obligation.split('|');
              return save('payouts', { ...v, allocationId, revenueId });
            }}
          />
          <DeskForm
            title="Record an actual affiliate recovery / returned payment"
            busy={busy}
            fields={[
              {
                key: 'payoutId',
                name: 'Original payout',
                options: opt(data.payouts, (p) => `${p.receipt} · ${p.amount_minor} minor units`),
              },
              {
                key: 'amountMinor',
                name: 'Amount actually recovered in minor units',
                type: 'number',
              },
              { key: 'receivedOn', name: 'Recovery received on', type: 'date' },
              { key: 'receipt', name: 'Unique recovery receipt', type: 'textarea' },
            ]}
            action="Record actual recovery"
            onSubmit={(v) => save('recoveries', v)}
          />
          <p className="commercial-caption">
            {t(
              'This records evidence of payments made externally. It does not transfer funds. Payouts require collected fees, actual activation, accepted attribution and sufficient unpaid balance. Disputes freeze releases. Existing paid records are immutable.',
              'Здесь учитываются подтверждения внешних выплат. Деньги не переводятся. Выплаты требуют получения комиссии, активации и бесспорного авторства. Споры приостанавливают выплаты.',
            )}
          </p>
        </>
      )}
      {section === 'agreements' && (
        <>
          <p className="commercial-caption">
            {t(
              'Record a signed agreement below, then add its structured obligations here. A sourcing project can be contracted against a qualified client before an introduction. Other models require an actual introduction.',
              'Сначала сохраните соглашение ниже, затем его обязательства здесь. Поиск можно согласовать с проверенным клиентом до знакомства. Другие модели требуют состоявшегося знакомства.',
            )}
          </p>
          <DeskForm
            title={t(
              'Record signed payer, reporting and payout obligations',
              'Зафиксировать плательщика, отчётность и выплаты',
            )}
            busy={busy}
            initial={{ statementDay: 5, collectionDays: 30, payoutDays: 0 }}
            fields={[
              {
                key: 'agreementId',
                name: 'Signed commercial agreement',
                options: agreementOptions,
              },
              { key: 'payer', name: 'Responsible payer / legal entity', type: 'textarea' },
              {
                key: 'feeBase',
                name: 'Eligible fee basis, calculation and currency',
                type: 'textarea',
              },
              {
                key: 'activationTrigger',
                name: 'Evidenced activation / success trigger',
                type: 'textarea',
              },
              {
                key: 'statementDay',
                name: 'Statement due day of each month (1–28)',
                type: 'number',
              },
              {
                key: 'collectionDays',
                name: 'Collection terms after statement (0–180 days)',
                type: 'number',
              },
              {
                key: 'payoutDays',
                name: 'Affiliate hold after actual collection (0–90 days)',
                type: 'number',
              },
              {
                key: 'exclusions',
                name: 'Exclusions, refunds, tax and existing accounts',
                type: 'textarea',
              },
              {
                key: 'termination',
                name: 'Term, termination and recurring tail',
                type: 'textarea',
              },
              {
                key: 'disputes',
                name: 'Dispute owner, evidence, deadlines and escalation',
                type: 'textarea',
              },
              proof,
            ]}
            action="Record signed obligations"
            onSubmit={(v) => save('schedules', v)}
          />
          {data.schedules.map((s: Row) => (
            <div className="commercial-record" key={s.agreement_id}>
              <strong>
                {report.agreements.find((a: Row) => a.id === s.agreement_id)?.evidence}
              </strong>
              <p>
                Payer: {s.payer}
                <br />
                Basis: {s.fee_base}
                <br />
                Statement day: {s.statement_day} · Collection terms: {s.collection_days} days ·
                Affiliate hold: {s.payout_days} days
              </p>
              <p>
                {s.exclusions}
                <br />
                {s.termination}
                <br />
                {s.disputes}
              </p>
            </div>
          ))}
          <DeskForm
            title="Confirm accepted sourcing deliverables"
            busy={busy}
            fields={[
              {
                key: 'agreementId',
                name: 'Signed sourcing mandate',
                options: opt(
                  report.agreements.filter((a: Row) => a.opportunity_id),
                  (a) => a.evidence,
                ),
              },
              { key: 'deliveredOn', name: 'Accepted delivery date', type: 'date' },
              proof,
            ]}
            action="Record accepted delivery"
            onSubmit={(v) => save('deliveries', v)}
          />
        </>
      )}
      {section === 'acquisition' && (
        <>
          <div className="commercial-title">
            <div>
              <span className="folio">RESEARCH / QUALIFY / REVIEW / FOLLOW THROUGH</span>
              <h2>{t('Start with a real business need.', 'Начните с реальной потребности.')}</h2>
            </div>
          </div>
          <p>
            {t(
              'Capture public company evidence, choose the relevant role and scope, then prepare a specific commercial conversation. Outreach stays under your control. No scraping, auto-sending or LinkedIn automation.',
              'Сохраняйте публичные сведения, выбирайте роль и задачу, готовьте предметный разговор. Отправку контролируете вы. Без скрейпинга и автоматической рассылки.',
            )}
          </p>
          <details className="commercial-form">
            <summary>
              {t(
                'LinkedIn positioning, content & discovery kit',
                'Позиционирование LinkedIn, контент и вопросы',
              )}
            </summary>
            <h3>Profile headline</h3>
            <p>{playbook.headline}</p>
            <h3>About</h3>
            <p>{playbook.about}</p>
            <h3>Draft posts for founder review</h3>
            {playbook.posts.map((post) => (
              <div className="commercial-record" key={post.title}>
                <strong>{post.title}</strong>
                <p>{post.body}</p>
              </div>
            ))}
            <h3>Discovery call</h3>
            <ol>
              {playbook.discovery.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
            <p>{playbook.cadence}</p>
          </details>
          <details className="commercial-form">
            <summary>
              {t(
                'Sourced research starting points · not network partners',
                'Исходные компании для исследования · не партнёры сети',
              )}
            </summary>
            <p className="commercial-caption">
              Public company sources reviewed 10 November 2026. These are uncontacted research
              hypotheses. Review eligibility and restrictions before importing; no partner status or
              commercial agreement is implied.
            </p>
            {researchTargets.map((target) => (
              <div className="commercial-record" key={target.website}>
                <strong>{target.company}</strong>
                <p>{target.research}</p>
                <a
                  className="text-link"
                  href={target.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Review primary source
                  <ArrowUpRight size={16} />
                </a>
                <button
                  className="text-link"
                  disabled={busy || data.prospects.some((p: Row) => p.website === target.website)}
                  onClick={() => void save('prospects', target)}
                >
                  Add to prospect research
                  <ArrowUpRight size={16} />
                </button>
              </div>
            ))}
          </details>
          <DeskForm
            title={t('Research a target company', 'Добавить исследование компании')}
            busy={busy}
            fields={[
              { key: 'company', name: 'Company' },
              { key: 'website', name: 'Official company website', type: 'url' },
              {
                key: 'companyType',
                name: 'Participant role',
                options: companyTypes
                  .filter((r) => r.id !== 'liquidity')
                  .map((r) => ({ id: r.id, name: label(r, language) })),
              },
              {
                key: 'countries',
                name: 'Target countries',
                options: countries.map((r) => ({ id: r.id, name: label(r, language) })),
                multiple: true,
              },
              {
                key: 'capabilities',
                name: 'Relevant capabilities',
                options: capabilities.map((r) => ({ id: r.id, name: label(r, language) })),
                multiple: true,
              },
              {
                key: 'need',
                name: 'Specific business need / qualification hypothesis',
                type: 'textarea',
              },
              { key: 'sourceUrl', name: 'Public evidence URL', type: 'url' },
              { key: 'observedOn', name: 'Source reviewed on', type: 'date' },
              {
                key: 'research',
                name: 'Source-backed research notes (public company information only)',
                type: 'textarea',
              },
            ]}
            action="Save researched target"
            onSubmit={(v) => save('prospects', v)}
          />
          <div className="commercial-acquisition">
            <aside aria-label="Target companies">
              {data.prospects.length ? (
                data.prospects.map((p: Row) => (
                  <button
                    key={p.id}
                    className={selected === p.id ? 'active' : ''}
                    onClick={() => {
                      setSelected(p.id);
                      setDraftId('');
                    }}
                  >
                    <strong>{p.company}</strong>
                    <small>
                      {p.status}
                      {p.research_stale ? ' / refresh evidence' : ''}
                    </small>
                  </button>
                ))
              ) : (
                <Empty>
                  {t(
                    'No targets yet. Add a company with a concrete fit hypothesis.',
                    'Пока нет компаний. Добавьте конкретную гипотезу партнёрства.',
                  )}
                </Empty>
              )}
            </aside>
            {selectedProspect && (
              <article className="commercial-prospect" key={selectedProspect.id}>
                <span className="folio">{selectedProspect.status}</span>
                <h3>{selectedProspect.company}</h3>
                <a
                  className="text-link"
                  href={selectedProspect.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('Review source', 'Открыть источник')}
                  <ArrowUpRight size={16} />
                </a>
                <p>{selectedProspect.research}</p>
                <blockquote>{selectedProspect.profile.need}</blockquote>
                <p className="commercial-caption">
                  {selectedProspect.profile.countries.join(' / ')} ·{' '}
                  {selectedProspect.profile.capabilities.join(' / ')} · reviewed{' '}
                  {selectedProspect.observed_on}
                </p>
                {!['suppressed', 'disqualified'].includes(selectedProspect.status) && (
                  <button
                    className="text-link"
                    disabled={busy}
                    onClick={() => void save('research', { prospectId: selectedProspect.id })}
                  >
                    {t(
                      'Read one official source page',
                      'Прочитать страницу официального источника',
                    )}
                    <ArrowUpRight size={16} />
                  </button>
                )}
                <DeskForm
                  title="Qualification / permission / follow-up"
                  busy={busy}
                  initial={{
                    status: selectedProspect.status,
                    permission: selectedProspect.permission,
                    followUp: selectedProspect.follow_up,
                  }}
                  fields={[
                    {
                      key: 'status',
                      name: 'Stage',
                      options: [
                        'researched',
                        'ready',
                        'contacted',
                        'replied',
                        'qualified',
                        'disqualified',
                        'suppressed',
                      ].map((s) => ({ id: s, name: s })),
                    },
                    {
                      key: 'permission',
                      name: 'Lawful contact basis / permission evidence',
                      type: 'textarea',
                      optional: true,
                    },
                    {
                      key: 'followUp',
                      name: 'Next manual follow-up',
                      type: 'date',
                      optional: true,
                    },
                    proof,
                  ]}
                  action="Save qualification"
                  onSubmit={(v) => save('prospects/' + selectedProspect.id, v, 'PATCH')}
                />
                {!['suppressed', 'disqualified'].includes(selectedProspect.status) && (
                  <div className="commercial-draft-actions">
                    <button
                      className="action"
                      disabled={busy}
                      onClick={() => void save('drafts', { prospectId: selectedProspect.id })}
                    >
                      {t('Prepare outreach draft', 'Подготовить черновик')}
                      <ArrowUpRight size={16} />
                    </button>
                    {data.aiConfigured ? (
                      <DeskForm
                        title="AI-assisted draft from public evidence"
                        busy={busy}
                        fields={[
                          {
                            key: 'publicEvidenceOnly',
                            name: 'I reviewed these notes and approve sharing only public company evidence with the configured AI provider.',
                            type: 'checkbox',
                          },
                        ]}
                        action="Generate for my review"
                        onSubmit={(v) =>
                          save('drafts', {
                            prospectId: selectedProspect.id,
                            ai: true,
                            publicEvidenceOnly: v.publicEvidenceOnly,
                          })
                        }
                      />
                    ) : (
                      <p className="commercial-caption">
                        {t(
                          'AI provider is unconfigured. Evidence-based template drafting is available.',
                          'AI-провайдер не настроен. Доступен черновик по шаблону.',
                        )}
                      </p>
                    )}
                  </div>
                )}
                {data.drafts
                  .filter((d: Row) => d.prospect_id === selectedProspect.id)
                  .map((d: Row) => (
                    <div className="commercial-record" key={d.id}>
                      <span className="folio">
                        {d.method} / {d.status}
                      </span>
                      <label>
                        Draft for human review
                        <textarea
                          rows={10}
                          value={draftId === d.id ? draftBody : d.body}
                          disabled={busy || ['sent', 'cancelled'].includes(d.status)}
                          onChange={(e) => {
                            setDraftId(d.id);
                            setDraftBody(e.target.value);
                          }}
                          maxLength={2400}
                        />
                      </label>
                      {!['sent', 'cancelled'].includes(d.status) && (
                        <>
                          <label>
                            Review / manual send evidence
                            <input
                              value={draftId === d.id ? decisionEvidence : ''}
                              onChange={(e) => {
                                if (draftId !== d.id) setDraftBody(d.body);
                                setDraftId(d.id);
                                setDecisionEvidence(e.target.value);
                              }}
                              minLength={10}
                            />
                          </label>
                          <div className="commercial-draft-actions">
                            {['draft', 'approved'].map((status) => (
                              <button
                                key={status}
                                className="text-link"
                                disabled={busy}
                                onClick={() =>
                                  void save(
                                    'drafts/' + d.id,
                                    {
                                      status,
                                      body: draftId === d.id ? draftBody : d.body,
                                      evidence: draftId === d.id ? decisionEvidence : '',
                                    },
                                    'PATCH',
                                  )
                                }
                              >
                                {status === 'draft'
                                  ? 'Save edits / reset approval'
                                  : 'Approve exact draft'}
                              </button>
                            ))}
                            {d.status === 'approved' && (
                              <>
                                <button
                                  className="text-link"
                                  onClick={() => {
                                    void navigator.clipboard
                                      .writeText(d.body)
                                      .then(() => setCopied(d.id))
                                      .catch(() => setCopied('error'));
                                  }}
                                >
                                  <Copy size={15} />
                                  {copied === d.id ? 'Copied' : 'Copy approved message'}
                                </button>
                                <button
                                  className="text-link"
                                  disabled={busy || (draftId === d.id && draftBody !== d.body)}
                                  onClick={() =>
                                    void save(
                                      'drafts/' + d.id,
                                      {
                                        status: 'sent',
                                        evidence: draftId === d.id ? decisionEvidence : '',
                                      },
                                      'PATCH',
                                    )
                                  }
                                >
                                  Record manual send
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                {['replied', 'qualified'].includes(selectedProspect.status) &&
                  !selectedProspect.opportunity_id && (
                    <DeskForm
                      title="Convert permissioned enquiry into CRM"
                      busy={busy}
                      fields={[
                        {
                          key: 'side',
                          name: 'Commercial intent',
                          options: [
                            { id: 'need', name: 'I NEED' },
                            { id: 'offer', name: 'I OFFER' },
                          ],
                        },
                        {
                          key: 'industry',
                          name: 'Industry',
                          options: industries.map((i) => ({ id: i.id, name: label(i, language) })),
                        },
                        { key: 'contact', name: 'Confirmed business email / Telegram contact' },
                        proof,
                        {
                          key: 'consent',
                          name: 'I have recorded permission to process this actual business enquiry.',
                          type: 'checkbox',
                        },
                      ]}
                      action="Create qualified-context enquiry"
                      onSubmit={(v) => save('convert', { ...v, prospectId: selectedProspect.id })}
                    />
                  )}
                {selectedProspect.opportunity_id && (
                  <p role="status">
                    CRM reference:{' '}
                    {
                      report.opportunities.find(
                        (o: Row) => o.id === selectedProspect.opportunity_id,
                      )?.reference
                    }
                  </p>
                )}
              </article>
            )}
          </div>
        </>
      )}
      {copied === 'error' && (
        <p role="status">Clipboard unavailable. Select and copy the visible text.</p>
      )}
    </div>
  );
}
