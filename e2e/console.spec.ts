import { expect, test } from '@playwright/test';

const experiment = {
  key: 'checkout_button_color',
  name: 'Checkout Button Color',
  enabled: true,
  trafficAllocationBp: 10000,
  createdAt: '2026-05-16T10:00:00Z',
  updatedAt: '2026-05-16T10:00:00Z',
  variants: [
    { key: 'control', weight: 5000, payload: { color: 'blue' } },
    { key: 'green', weight: 5000, payload: { color: 'green' } }
  ]
};

const summary = {
  experimentKey: 'checkout_button_color',
  variants: [
    {
      variantKey: 'control',
      exposureCount: 10,
      eventCountsByMetric: { purchase: 2 },
      totalValuesByMetric: { purchase: 39.98 },
      conversionRatesByMetric: { purchase: 0.2 }
    }
  ]
};

test.beforeEach(async ({ page }) => {
  await page.route('**/actuator/health', (route) => route.fulfill({ json: { status: 'UP' } }));
  await page.route('**/api/v1/experiments/checkout_button_color', (route) => route.fulfill({ json: experiment }));
  await page.route('**/api/v1/metrics/checkout_button_color/summary', (route) => route.fulfill({ json: summary }));
  await page.route('**/api/v1/metrics/checkout_button_color', (route) => route.fulfill({ json: { experimentKey: 'checkout_button_color', metrics: [{ variantKey: 'control', metricName: 'purchase', eventCount: 2, totalValue: 39.98, averageValue: 19.99 }] } }));
  await page.route('**/api/v1/flags/checkout_button_color/assignment', (route) => route.fulfill({ json: { experimentKey: 'checkout_button_color', enabled: true, assigned: true, variantKey: 'control', payload: { color: 'blue' }, assignedAt: '2026-05-16T10:01:00Z', reason: null } }));
  await page.route('**/api/v1/events', (route) => route.fulfill({ json: { accepted: true, experimentKey: 'checkout_button_color', variantKey: 'control', eventName: 'purchase' } }));
});

test('renders dashboard and assignment result', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /A\/B Testing Control Center/i })).toBeVisible();
  await expect(page.getByText('Checkout Button Color')).toBeVisible();
  await page.getByRole('button', { name: 'Get assignment' }).click();
  await expect(page.getByText('Assigned')).toBeVisible();
  await expect(page.getByText('control').first()).toBeVisible();
});

test('submits event tracking form with sanitized metadata preview', async ({ page }) => {
  await page.goto('/events');
  await page.getByLabel('Metadata JSON').fill('{"currency":"EUR","email":"person@example.com"}');
  await expect(page.getByText('[REDACTED_BY_UI]')).toBeVisible();
  await page.getByRole('button', { name: 'Track event' }).click();
  await expect(page.getByText('Accepted', { exact: true })).toBeVisible();
});

test('loads metrics page', async ({ page }) => {
  await page.goto('/metrics');
  await page.getByRole('button', { name: 'Load metrics' }).click();
  await expect(page.getByText('20.00%')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'purchase' })).toBeVisible();
});
