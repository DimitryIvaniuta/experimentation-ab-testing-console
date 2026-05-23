import { type FormEvent, useState } from 'react';
import { getExperiment } from '../api/experimentationApi';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { FormField, TextInput } from '../components/common/FormField';
import { Loading } from '../components/common/Loading';
import { CreateExperimentForm } from '../components/forms/CreateExperimentForm';
import { ExperimentDetails } from '../components/ExperimentDetails';
import { DEFAULT_EXPERIMENT_KEY } from '../config/runtime';
import { useAppConfig } from '../state/AppConfigContext';
import type { ExperimentResponse } from '../types/api';

export function ExperimentsPage() {
  const { apiBaseUrl } = useAppConfig();
  const [lookupKey, setLookupKey] = useState(DEFAULT_EXPERIMENT_KEY);
  const [experiment, setExperiment] = useState<ExperimentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setExperiment(await getExperiment({ apiBaseUrl }, lookupKey.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to read experiment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <Card title="Find experiment" subtitle="Backend currently exposes lookup by key, not full list pagination.">
        <form className="inline-form" onSubmit={lookup}>
          <FormField label="Experiment key"><TextInput value={lookupKey} onChange={(e) => setLookupKey(e.target.value)} required /></FormField>
          <Button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Load'}</Button>
        </form>
        {loading && <Loading />}
        {error && <Alert tone="danger">{error}</Alert>}
        {experiment && <ExperimentDetails experiment={experiment} />}
      </Card>
      <CreateExperimentForm />
    </div>
  );
}
