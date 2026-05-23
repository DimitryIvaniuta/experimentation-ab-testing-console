export function Loading({ label = 'Loading...' }: { label?: string }) {
  return <div className="loading" aria-live="polite"><span className="spinner" />{label}</div>;
}
