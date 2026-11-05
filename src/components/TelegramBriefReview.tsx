import { useState, useRef } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Copy, Send } from 'lucide-react';
import { useLocale } from '../locale';
import { telegramDraft, telegramUsername, telegramUrl } from '../telegram';
import './telegram-brief.css';

export function TelegramBriefReview({ text, onEdit }: { text: string; onEdit: () => void }) {
  const { t } = useLocale();
  const [copiedText, setCopiedText] = useState('');
  const [copyFailed, setCopyFailed] = useState(false);
  const preview = useRef<HTMLTextAreaElement>(null);
  const draft = telegramDraft(text);
  const copied = copiedText === text;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setCopyFailed(false);
    } catch {
      preview.current?.focus();
      preview.current?.select();
      setCopyFailed(true);
    }
  };
  return (
    <section
      className="telegram-review"
      id="telegram-brief-review"
      tabIndex={-1}
      aria-labelledby="telegram-review-title"
    >
      <div className="telegram-review-top">
        <span className="folio">
          {t('MESSAGE PREVIEW · NOT SENT', 'ПРЕДПРОСМОТР · НЕ ОТПРАВЛЕНО')}
        </span>
        <span className="telegram-review-badge">
          <Send size={13} aria-hidden="true" /> Telegram
        </span>
      </div>
      <h2 id="telegram-review-title">
        {t('Your brief.', 'Ваш бриф.')}
        <em>{t('A direct conversation.', 'Прямой разговор.')}</em>
      </h2>
      <p className="telegram-review-intro">
        {t(
          'Check the text, open the private chat and press Send in Telegram.',
          'Проверьте текст, откройте личный чат и нажмите «Отправить» в Telegram.',
        )}
      </p>
      <a
        className="telegram-recipient"
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>{t('RECIPIENT', 'ПОЛУЧАТЕЛЬ')}</span>
        <strong>@{telegramUsername}</strong>
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
      <label className="telegram-preview-label" htmlFor="telegram-message-preview">
        {t('Full message', 'Полный текст сообщения')}
      </label>
      <textarea
        ref={preview}
        id="telegram-message-preview"
        className="telegram-preview"
        readOnly
        rows={12}
        value={text}
        spellCheck={false}
      />
      {!draft.prefilled && (
        <p className="telegram-long-notice" role="status">
          {t(
            'This brief is too long to prefill safely. Copy the complete text, open Telegram and paste it into the chat.',
            'Бриф слишком длинный для надёжной подстановки. Скопируйте полный текст, откройте Telegram и вставьте его в чат.',
          )}
        </p>
      )}
      <div className="telegram-review-actions">
        <a
          className="action telegram-open"
          href={draft.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{t('Open Telegram', 'Открыть Telegram')}</span>
          <ArrowUpRight size={19} aria-hidden="true" />
        </a>
        <button type="button" className="telegram-copy" onClick={() => void copy()}>
          {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
          {t('Copy full text', 'Скопировать весь текст')}
        </button>
      </div>
      <p className="telegram-copy-status" role="status">
        {copyFailed
          ? t(
              'The text is selected. Copy it manually, then paste it into Telegram.',
              'Текст выделен. Скопируйте его вручную и вставьте в Telegram.',
            )
          : copied
            ? t('Full text copied.', 'Полный текст скопирован.')
            : '\u00a0'}
      </p>
      <p className="telegram-delivery-note">
        {t(
          'Opening the chat does not send the message. If Telegram does not fill it in, use Copy full text. The site cannot confirm delivery or issue a Deal Desk receipt for this message.',
          'Открытие чата не отправляет сообщение. Если Telegram не подставит текст, используйте копирование. Сайт не подтверждает доставку и не выдаёт номер Deal Desk для этого сообщения.',
        )}
      </p>
      <button type="button" className="telegram-edit" onClick={onEdit}>
        <ArrowLeft size={16} aria-hidden="true" />
        {t('Edit my brief', 'Изменить бриф')}
      </button>
    </section>
  );
}
