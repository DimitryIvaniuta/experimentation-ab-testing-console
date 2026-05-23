export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info' }) {
  return <span className={`badge badge--${tone}`}>{label}</span>;
}
