import { defineConfig } from '@playwright/test'

// Tests de punta a punta: abren la app de Electron compilada (out/main/index.js) con una
// carpeta de datos temporal. Se corren con `npm run test:e2e`, que compila antes.
export default defineConfig({
  testDir: 'tests/e2e',
  // Una sola app abierta a la vez.
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: 'list'
})
