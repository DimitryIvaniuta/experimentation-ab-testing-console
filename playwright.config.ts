import { defineConfig, devices } from '@playwright/test';

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const e2eBaseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:5174';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : '50%',
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: e2eBaseUrl,
    trace: 'on-first-retry',
    launchOptions: executablePath ? {
      executablePath,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    } : {}
  },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5174 --strictPort',
    url: e2eBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
