import type { MetricsSummaryResponse } from '../types/api';
import { formatNumber, toPercent } from '../utils/format';
import { EmptyState } from './common/EmptyState';

export function MetricsSummary({ summary }: { summary: MetricsSummaryResponse }) {
  if (summary.variants.length === 0) {
    return <EmptyState title="No metrics yet" message="Trigger assignments and track events to populate this summary." />;
  }

  return (
    <div className="summary-grid">
      {summary.variants.map((variant) => {
        const metricNames = Object.keys(variant.eventCountsByMetric);
        return (
          <article className="metric-panel" key={variant.variantKey}>
            <div className="metric-panel__top">
              <div>
                <span className="eyebrow">Variant</span>
                <h3>{variant.variantKey}</h3>
              </div>
              <strong>{formatNumber(variant.exposureCount)} exposures</strong>
            </div>
            {metricNames.length === 0 ? (
              <p className="muted">No custom events for this variant yet.</p>
            ) : (
              <div className="metric-list">
                {metricNames.map((metricName) => {
                  const conversion = variant.conversionRatesByMetric[metricName] ?? 0;
                  const barWidth = Math.min(100, conversion * 100);
                  return (
                    <div className="metric-line" key={metricName}>
                      <div className="metric-line__header">
                        <span>{metricName}</span>
                        <strong>{toPercent(conversion)}</strong>
                      </div>
                      <div className="progress" aria-label={`${metricName} conversion ${toPercent(conversion)}`}>
                        <span style={{ width: `${barWidth}%` }} />
                      </div>
                      <small>
                        {formatNumber(variant.eventCountsByMetric[metricName] ?? 0)} events · total value {formatNumber(variant.totalValuesByMetric[metricName] ?? 0)}
                      </small>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
