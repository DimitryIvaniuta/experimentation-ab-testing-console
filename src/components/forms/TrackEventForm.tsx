import { type FormEvent, useMemo, useState } from 'react';
import { trackEvent } from '../../api/experimentationApi';
import { DEFAULT_EXPERIMENT_KEY } from '../../config/runtime';
import { parsePlainJsonObject } from '../../security/safeJson';
import { sanitizeMetadata } from '../../security/metadataSanitizer';
import { useAppConfig } from '../../state/AppConfigContext';
import type { TrackEventResponse } from '../../types/api';
import { Alert } from '../common/Alert';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { FormField, TextArea, TextInput } from '../common/FormField';
import { JsonPreview } from '../common/JsonPreview';

export function TrackEventForm() {
  const { apiBaseUrl } = useAppConfig();
  const [experimentKey, setExperimentKey] = useState(DEFAULT_EXPERIMENT_KEY);
  const [userId, setUserId] = useState('user-123');
  const [eventName, setEventName] = useState('purchase');
  const [value, setValue] = useState(19.99);
  const [metadata, setMetadata] = useState(`{
  "currency": "EUR",
  "source": "frontend-console"
}`);
  const [result, setResult] = useState<TrackEventResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sanitizedPreview = useMemo(() => {
    try {
      return sanitizeMetadata(parsePlainJsonObject(metadata));
    } catch {
      return null;
    }
  }, [metadata]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!Number.isFinite(value) || value < 0) throw new Error('Event value must be a finite non-negative number.');
      const sanitizedMetadata = sanitizeMetadata(parsePlainJsonObject(metadata));
      const response = await trackEvent({ apiBaseUrl }, {
        experimentKey: experimentKey.trim(),
        userId: userId.trim(),
        eventName: eventName.trim(),
        value,
        metadata: sanitizedMetadata
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to track event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Track conversion or custom event" subtitle="Calls POST /api/v1/events and aggregates metrics by assigned variant.">
      <form className="stack" onSubmit={submit}>
        <div className="form-grid form-grid--two">
          <FormField label="Experiment key"><TextInput value={experimentKey} onChange={(e) => setExperimentKey(e.target.value)} required maxLength={120} /></FormField>
          <FormField label="User ID"><TextInput value={userId} onChange={(e) => setUserId(e.target.value)} required maxLength={240} /></FormField>
          <FormField label="Event name"><TextInput value={eventName} onChange={(e) => setEventName(e.target.value)} required maxLength={160} /></FormField>
          <FormField label="Value"><TextInput type="number" min={0} step="0.01" value={value} onChange={(e) => setValue(Number(e.target.value))} required /></FormField>
        </div>
        <FormField label="Metadata JSON" hint="Obvious PII/secrets are redacted in the preview and sent payload.">
          <TextArea value={metadata} onChange={(e) => setMetadata(e.target.value)} rows={7} required />
        </FormField>
        {sanitizedPreview && <JsonPreview value={sanitizedPreview} />}
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="form-actions"><Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Track event'}</Button></div>
      </form>
      {result && (
        <div className="result-panel__header">
          <Badge tone={result.accepted ? 'success' : 'warning'} label={result.accepted ? 'Accepted' : 'Rejected'} />
          <strong>{result.eventName}</strong>
          <span>Variant: {result.variantKey ?? 'none'}</span>
        </div>
      )}
    </Card>
  );
}
