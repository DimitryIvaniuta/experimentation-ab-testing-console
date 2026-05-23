import { type FormEvent, useState } from 'react';
import { getAssignment } from '../../api/experimentationApi';
import { DEFAULT_EXPERIMENT_KEY } from '../../config/runtime';
import { useAppConfig } from '../../state/AppConfigContext';
import type { AssignmentResponse } from '../../types/api';
import { formatDateTime } from '../../utils/format';
import { Alert } from '../common/Alert';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { FormField, TextInput } from '../common/FormField';
import { JsonPreview } from '../common/JsonPreview';
import { Loading } from '../common/Loading';

export function AssignmentTester() {
  const { apiBaseUrl } = useAppConfig();
  const [experimentKey, setExperimentKey] = useState(DEFAULT_EXPERIMENT_KEY);
  const [userId, setUserId] = useState('user-123');
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await getAssignment({ apiBaseUrl }, experimentKey.trim(), userId.trim());
      setAssignment(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to get assignment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Deterministic assignment tester" subtitle="Calls GET /api/v1/flags/{experimentKey}/assignment and emits exposure event.">
      <form className="form-grid" onSubmit={submit}>
        <FormField label="Experiment key">
          <TextInput value={experimentKey} onChange={(e) => setExperimentKey(e.target.value)} required maxLength={120} />
        </FormField>
        <FormField label="User ID" hint="Sent only in X-User-Id header. Not stored by the browser.">
          <TextInput value={userId} onChange={(e) => setUserId(e.target.value)} required maxLength={240} />
        </FormField>
        <div className="form-actions"><Button type="submit" disabled={loading}>{loading ? 'Checking...' : 'Get assignment'}</Button></div>
      </form>
      {loading && <Loading label="Requesting assignment" />}
      {error && <Alert tone="danger">{error}</Alert>}
      {assignment && (
        <div className="result-panel">
          <div className="result-panel__header">
            <Badge tone={assignment.assigned ? 'success' : 'warning'} label={assignment.assigned ? 'Assigned' : 'Not assigned'} />
            <strong>{assignment.variantKey ?? assignment.reason ?? 'No variant'}</strong>
            <span>{formatDateTime(assignment.assignedAt)}</span>
          </div>
          <JsonPreview value={assignment.payload} />
        </div>
      )}
    </Card>
  );
}
