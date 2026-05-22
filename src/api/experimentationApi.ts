import { requestJson } from './http';
import type {
  AssignmentResponse,
  BackendHealthResponse,
  CreateExperimentRequest,
  ExperimentResponse,
  MetricsResponse,
  MetricsSummaryResponse,
  TrackEventRequest,
  TrackEventResponse
} from '../types/api';

export interface ApiContext {
  apiBaseUrl: string;
  adminToken: string;
  signal?: AbortSignal;
}

type ReadApiContext = Pick<ApiContext, 'apiBaseUrl' | 'signal'>;

export function getHealth(ctx: ReadApiContext) {
  return requestJson<BackendHealthResponse>(ctx.apiBaseUrl, '/actuator/health', { signal: ctx.signal });
}

export function getExperiment(ctx: ReadApiContext, key: string) {
  return requestJson<ExperimentResponse>(ctx.apiBaseUrl, `/api/v1/experiments/${encodeURIComponent(key)}`, { signal: ctx.signal });
}

export function createExperiment(ctx: ApiContext, request: CreateExperimentRequest) {
  return requestJson<ExperimentResponse, CreateExperimentRequest>(ctx.apiBaseUrl, '/api/v1/experiments', {
    method: 'POST',
    adminToken: ctx.adminToken,
    body: request,
    signal: ctx.signal
  });
}

export function getAssignment(ctx: ReadApiContext, experimentKey: string, userId: string) {
  return requestJson<AssignmentResponse>(ctx.apiBaseUrl, `/api/v1/flags/${encodeURIComponent(experimentKey)}/assignment`, {
    userId,
    signal: ctx.signal
  });
}

export function trackEvent(ctx: ReadApiContext, request: TrackEventRequest) {
  return requestJson<TrackEventResponse, TrackEventRequest>(ctx.apiBaseUrl, '/api/v1/events', {
    method: 'POST',
    body: request,
    signal: ctx.signal
  });
}

export function getMetrics(ctx: ReadApiContext, experimentKey: string) {
  return requestJson<MetricsResponse>(ctx.apiBaseUrl, `/api/v1/metrics/${encodeURIComponent(experimentKey)}`, { signal: ctx.signal });
}

export function getMetricsSummary(ctx: ReadApiContext, experimentKey: string) {
  return requestJson<MetricsSummaryResponse>(ctx.apiBaseUrl, `/api/v1/metrics/${encodeURIComponent(experimentKey)}/summary`, { signal: ctx.signal });
}
