import { Badge } from './common/Badge';
import { JsonPreview } from './common/JsonPreview';
import type { ExperimentResponse } from '../types/api';
import { formatBasisPoints, formatDateTime } from '../utils/format';

export function ExperimentDetails({ experiment }: { experiment: ExperimentResponse }) {
  return (
    <div className="details-grid">
      <div className="detail-row"><span>Name</span><strong>{experiment.name}</strong></div>
      <div className="detail-row"><span>Key</span><strong>{experiment.key}</strong></div>
      <div className="detail-row"><span>Status</span><Badge tone={experiment.enabled ? 'success' : 'warning'} label={experiment.enabled ? 'Enabled' : 'Disabled'} /></div>
      <div className="detail-row"><span>Traffic allocation</span><strong>{formatBasisPoints(experiment.trafficAllocationBp)}</strong></div>
      <div className="detail-row"><span>Created</span><strong>{formatDateTime(experiment.createdAt)}</strong></div>
      <div className="detail-row"><span>Updated</span><strong>{formatDateTime(experiment.updatedAt)}</strong></div>
      <div className="variant-grid">
        {experiment.variants.map((variant) => (
          <article className="variant-card" key={variant.key}>
            <div className="variant-card__header">
              <strong>{variant.key}</strong>
              <Badge tone="info" label={formatBasisPoints(variant.weight)} />
            </div>
            <JsonPreview value={variant.payload} />
          </article>
        ))}
      </div>
    </div>
  );
}
