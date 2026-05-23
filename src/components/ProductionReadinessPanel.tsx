import { Badge } from './common/Badge';
import { Card } from './common/Card';

const checks = [
  'Admin token is held only in memory',
  'Raw user IDs are never stored in browser storage',
  'Metadata is redacted before event submission',
  'Requests use no-store cache mode and request IDs',
  'Experiment payload JSON rejects prototype-pollution keys',
  'Production API URL policy requires HTTPS'
];

export function ProductionReadinessPanel() {
  return (
    <Card title="Production readiness controls" subtitle="Frontend safeguards implemented around the A/B testing workflows.">
      <div className="readiness-list">
        {checks.map((check) => (
          <div className="readiness-item" key={check}>
            <Badge tone="success" label="Enabled" />
            <span>{check}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
