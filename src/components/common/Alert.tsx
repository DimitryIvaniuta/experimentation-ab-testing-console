import type { ReactNode } from 'react';

export function Alert({ tone = 'info', children }: { tone?: 'success' | 'warning' | 'danger' | 'info'; children: ReactNode }) {
  return <div className={`alert alert--${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>{children}</div>;
}
