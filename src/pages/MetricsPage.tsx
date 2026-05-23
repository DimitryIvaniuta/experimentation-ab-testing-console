import { type FormEvent, useState } from 'react';
import { getMetrics, getMetricsSummary } from '../api/experimentationApi';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { FormField, TextInput } from '../components/common/FormField';
import { Loading } from '../components/common/Loading';
import { MetricsSummary } from '../components/MetricsSummary';
import { DEFAULT_EXPERIMENT_KEY } from '../config/runtime';
import { useAppConfig } from '../state/AppConfigContext';
import type { MetricsResponse, MetricsSummaryResponse } from '../types/api';
import { formatNumber } from '../utils/format';

export function MetricsPage() {
  const { apiBaseUrl } = useAppConfig();
  const [experimentKey, setExperimentKey] = useState(DEFAULT_EXPERIMENT_KEY);
  const [raw, setRaw] = useState<MetricsResponse | null>(null);
  const [summary, setSummary] = useState<MetricsSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const [rawMetrics, metricsSummary] = await Promise.all([
        getMetrics({ apiBaseUrl }, experimentKey.trim()),
        getMetricsSummary({ apiBaseUrl }, experimentKey.trim())
      ]);
      setRaw(rawMetrics);
      setSummary(metricsSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load metrics');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <Card title="Metrics lookup" subtitle="Read raw counters and dashboard summary for one experiment.">
        <form className="inline-form" onSubmit={load}>
          <FormField label="Experiment key"><TextInput value={experimentKey} onChange={(e) => setExperimentKey(e.target.value)} required /></FormField>
          <Button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Load metrics'}</Button>
        </form>
        {loading && <Loading />}
        {error && <Alert tone="danger">{error}</Alert>}
      </Card>
      {summary && <Card title="Summary"><MetricsSummary summary={summary} /></Card>}
      {raw && (
        <Card title="Raw aggregated metrics">
          {raw.metrics.length === 0 ? <EmptyState title="No raw metrics" message="No events have been aggregated for this experiment yet." /> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Variant</th><th>Metric</th><th>Events</th><th>Total value</th><th>Average</th></tr></thead>
                <tbody>
                  {raw.metrics.map((metric) => (
                    <tr key={`${metric.variantKey}-${metric.metricName}`}>
                      <td>{metric.variantKey}</td><td>{metric.metricName}</td><td>{formatNumber(metric.eventCount)}</td><td>{formatNumber(metric.totalValue)}</td><td>{formatNumber(metric.averageValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
