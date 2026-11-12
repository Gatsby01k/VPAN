import type { ReactNode } from 'react';
import { NLink as Link } from './NetworkLayout';
import { SignatureArrow } from './ConnectionProtocol';

export function ThreadLink({
  to,
  children,
  variant = 'editorial',
  direction = 'diagonal',
  className = '',
}: {
  to: string;
  children: ReactNode;
  variant?: 'editorial' | 'utility';
  direction?: Parameters<typeof SignatureArrow>[0]['direction'];
  className?: string;
}) {
  return (
    <Link className={`connection-link ${className}`} data-variant={variant} to={to}>
      <span>{children}</span>
      <SignatureArrow direction={direction} />
    </Link>
  );
}
