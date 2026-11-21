import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useLocale } from '../locale';
import { SignatureArrow } from './ConnectionProtocol';

type ContactAddressProps = {
  label: string;
  address: string;
  href: string;
  copyLabel: string;
  external?: boolean;
};

export function ContactAddress({ label, address, href, copyLabel, external }: ContactAddressProps) {
  const { t } = useLocale();
  const value = useRef<HTMLElement>(null);
  const [feedback, setFeedback] = useState<'copied' | 'manual' | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setFeedback('copied');
    } catch {
      const selection = window.getSelection();
      if (value.current && selection) {
        const range = document.createRange();
        range.selectNodeContents(value.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setFeedback('manual');
    }
  }

  return (
    <div className="contact-address">
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        <span className="contact-label">{label}</span>
        <strong ref={value}>{address}</strong>
        <SignatureArrow />
      </a>
      <button type="button" onClick={copy} aria-label={copyLabel} title={copyLabel}>
        {feedback === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </button>
      <span role="status" className="contact-copy-status">
        {feedback === 'copied' && t('Copied', 'Скопировано')}
        {feedback === 'manual' && t('Copy the address manually.', 'Скопируйте адрес вручную.')}
      </span>
    </div>
  );
}
