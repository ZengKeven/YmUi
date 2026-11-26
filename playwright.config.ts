import { defineConfig } from '@playwright/test'

const components = 'http://127.0.0.1:4186'
const playground = 'http://127.0.0.1:4187'

export default defineConfig({
  testDir: './tests',
  use: { channel: process.env.PLAYWRIGHT_CHANNEL },
  projects: [
    { name: 'components', testIgnore: '**/playground.spec.ts', use: { baseURL: components } },
    { name: 'playground', testMatch: '**/playground.spec.ts', use: { baseURL: playground } },
  ],
  webServer: [
    { command: 'vite --host 127.0.0.1 --port 4186 --strictPort', url: `${components}/tests/fixture/` },
    { command: 'npm run preview:playground -- --host 127.0.0.1 --port 4187 --strictPort', url: `${playground}/button/` },
  ],
})
