import { getExperiment, getHealth, getMetricsSummary } from '../api/experimentationApi';
import { AssignmentTester } from '../components/forms/AssignmentTester';
import { Alert } from '../components/common/Alert';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ExperimentDetails } from '../components/ExperimentDetails';
import { MetricsSummary } from '../components/MetricsSummary';
import { ProductionReadinessPanel } from '../components/ProductionReadinessPanel';
import { DEFAULT_EXPERIMENT_KEY } from '../config/runtime';
import { useAsync } from '../hooks/useAsync';
import { useAppConfig } from '../state/AppConfigContext';

export function DashboardPage() {
  const { apiBaseUrl } = useAppConfig();
  const health = useAsync((signal) => getHealth({ apiBaseUrl, signal }), [apiBaseUrl]);
  const experiment = useAsync((signal) => getExperiment({ apiBaseUrl, signal }, DEFAULT_EXPERIMENT_KEY), [apiBaseUrl]);
  const summary = useAsync((signal) => getMetricsSummary({ apiBaseUrl, signal }, DEFAULT_EXPERIMENT_KEY), [apiBaseUrl]);

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Banking-style rollout governance</p>
          <h2>Ship features safely with deterministic assignments and auditable metrics.</h2>
          <p>Use this console to create experiments, test stable assignments, track conversion events, and review variant performance.</p>
        </div>
        <div className="hero-kpis">
          <div><span>Backend</span><strong>{health.data?.status ?? 'Unknown'}</strong></div>
          <div><span>Default experiment</span><strong>{DEFAULT_EXPERIMENT_KEY}</strong></div>
          <div><span>Privacy</span><strong>No browser ID storage</strong></div>
        </div>
      </section>
      <div className="grid-two">
        <Card title="Backend health" actions={health.data && <Badge tone={health.data.status === 'UP' ? 'success' : 'danger'} label={health.data.status} />}>
          {health.loading && <Loading />}
          {health.error && <Alert tone="danger">{health.error}</Alert>}
          {health.data && <p className="muted">Actuator health endpoint is reachable.</p>}
        </Card>
        <Card title="Default experiment snapshot">
          {experiment.loading && <Loading />}
          {experiment.error && <Alert tone="warning">{experiment.error}</Alert>}
          {experiment.data && <ExperimentDetails experiment={experiment.data} />}
        </Card>
      </div>
      <AssignmentTester />
      <ProductionReadinessPanel />
      <Card title="Variant metrics summary" subtitle="Dashboard-ready metrics returned by /api/v1/metrics/{experimentKey}/summary.">
        {summary.loading && <Loading />}
        {summary.error && <Alert tone="warning">{summary.error}</Alert>}
        {summary.data && <MetricsSummary summary={summary.data} />}
      </Card>
    </div>
  );
}
