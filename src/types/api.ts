export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonRecord = Record<string, JsonValue>;

export interface VariantResponse {
  key: string;
  weight: number;
  payload: JsonRecord;
}

export interface ExperimentResponse {
  key: string;
  name: string;
  enabled: boolean;
  trafficAllocationBp: number;
  variants: VariantResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantRequest {
  key: string;
  weight: number;
  payload: JsonRecord;
}

export interface CreateExperimentRequest {
  key: string;
  name: string;
  enabled: boolean;
  trafficAllocationBp: number;
  variants: CreateVariantRequest[];
}

export interface AssignmentResponse {
  experimentKey: string;
  enabled: boolean;
  assigned: boolean;
  variantKey: string | null;
  payload: JsonRecord;
  assignedAt: string | null;
  reason: string | null;
}

export interface TrackEventRequest {
  experimentKey: string;
  userId: string;
  eventName: string;
  value: number;
  metadata: JsonRecord;
}

export interface TrackEventResponse {
  accepted: boolean;
  experimentKey: string;
  variantKey: string | null;
  eventName: string;
}

export interface MetricResponse {
  variantKey: string;
  metricName: string;
  eventCount: number;
  totalValue: number;
  averageValue: number;
}

export interface MetricsResponse {
  experimentKey: string;
  metrics: MetricResponse[];
}

export interface VariantMetricSummaryResponse {
  variantKey: string;
  exposureCount: number;
  eventCountsByMetric: Record<string, number>;
  totalValuesByMetric: Record<string, number>;
  conversionRatesByMetric: Record<string, number>;
}

export interface MetricsSummaryResponse {
  experimentKey: string;
  variants: VariantMetricSummaryResponse[];
}

export interface BackendHealthResponse {
  status: string;
  components?: Record<string, unknown>;
}

export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}
