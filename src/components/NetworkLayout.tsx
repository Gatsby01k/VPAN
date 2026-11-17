import type { ReactNode } from 'react';
import { Link, useLinkClickHandler, type LinkProps } from 'react-router-dom';
import { useLocale } from '../locale';
import { SignatureArrow } from './ConnectionProtocol';
import { startPageTurn } from './pageTurn';

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
  const openLink = useLinkClickHandler(target, props);
  return (
    <Link
      to={target}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.reloadDocument ||
          props.mask ||
          (props.target && props.target !== '_self') ||
          event.currentTarget.hasAttribute('download')
        )
          return;
        const url = new URL(event.currentTarget.href);
        if (url.origin === location.origin && startPageTurn(url.pathname, () => openLink(event)))
          event.preventDefault();
      }}
    >
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
