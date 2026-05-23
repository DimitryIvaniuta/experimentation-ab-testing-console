import { useAppConfig } from '../../state/AppConfigContext';

export function Header() {
  const { apiBaseUrl } = useAppConfig();
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Experimentation Console</p>
        <h1>A/B Testing Control Center</h1>
      </div>
      <div className="header-status" aria-label="API target">
        <span className="status-dot" />
        <span>{apiBaseUrl || 'same-origin / Vite proxy'}</span>
      </div>
    </header>
  );
}
