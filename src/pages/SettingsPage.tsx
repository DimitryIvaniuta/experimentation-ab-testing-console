import { type FormEvent, useState } from 'react';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { FormField, TextInput } from '../components/common/FormField';
import { maskSecret } from '../config/runtime';
import { useAppConfig } from '../state/AppConfigContext';

export function SettingsPage() {
  const { apiBaseUrl, adminToken, setApiBaseUrl, setAdminToken } = useAppConfig();
  const [nextApiBaseUrl, setNextApiBaseUrl] = useState(apiBaseUrl);
  const [nextAdminToken, setNextAdminToken] = useState(adminToken);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      setApiBaseUrl(nextApiBaseUrl);
      setAdminToken(nextAdminToken);
      setMessage('Settings updated in memory. Refreshing the browser clears the admin token.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid settings');
    }
  }

  function clearAdminToken() {
    setNextAdminToken('');
    setAdminToken('');
    setMessage('Admin token cleared from memory.');
  }

  return (
    <div className="page-stack">
      <Card title="Runtime settings" subtitle="Configure current browser session only. Sensitive values are not stored in localStorage.">
        <form className="stack" onSubmit={save}>
          <FormField label="API base URL" hint="Leave empty for same-origin requests or Vite proxy. Production builds require HTTPS except localhost.">
            <TextInput value={nextApiBaseUrl} onChange={(e) => setNextApiBaseUrl(e.target.value)} placeholder="https://api.example.com" />
          </FormField>
          <FormField label="Admin token" hint={`Current token: ${maskSecret(adminToken)}. Sent only as X-Admin-Token for create experiment requests.`}>
            <TextInput type="password" value={nextAdminToken} onChange={(e) => setNextAdminToken(e.target.value)} autoComplete="off" />
          </FormField>
          {!adminToken && <Alert tone="warning">Admin token is empty. Experiment creation will fail until a token is configured.</Alert>}
          {message && <Alert tone="success">{message}</Alert>}
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={clearAdminToken}>Clear token</Button>
            <Button type="submit">Save for current session</Button>
          </div>
        </form>
      </Card>
      <Alert tone="warning">For real production, replace the demo admin token pattern with OAuth2/OIDC and role-based admin authorization at the API gateway/backend layer.</Alert>
    </div>
  );
}
