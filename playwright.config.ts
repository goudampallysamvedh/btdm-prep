import { defineConfig, devices } from '@playwright/test'

// Runs against the production build (npm run build first) so the service worker is real.
// Set E2E_URL to test a deployed copy instead, e.g. E2E_URL=https://you.github.io/btdm-prep/
const remote = process.env.E2E_URL

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: remote ?? 'http://localhost:4173/btdm-prep/',
    trace: 'off',
  },
  projects: [
    { name: 'phone', use: { ...devices['iPhone 13'], browserName: 'chromium', viewport: { width: 390, height: 844 } } },
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } } },
  ],
  webServer: remote ? undefined : {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/btdm-prep/',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
