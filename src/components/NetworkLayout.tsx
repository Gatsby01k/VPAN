import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useLocale } from '../locale';
import { SignatureArrow } from './ConnectionProtocol';

export function NLink({ to, children, ...props }: LinkProps) {
  const { language } = useLocale();
  let target = to;
  if (typeof to === 'string' && to.startsWith('/')) {
    const [path, hash] = to.split('#');
    const [name, query] = path.split('?');
    const params = new URLSearchParams(query);
    if (language === 'ru') params.set('lang', 'ru');
    target = name + (params.size ? '?' + params.toString() : '') + (hash ? '#' + hash : '');
  }
  return (
    <Link to={target} {...props}>
      {children}
    </Link>
  );
}
export function Arrow() {
  return <SignatureArrow />;
}
export function Action({
  to,
  children,
  light = false,
}: {
  to: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <NLink className={'action' + (light ? ' action-light' : '')} to={to}>
      {children}
      <Arrow />
    </NLink>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
