import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// Se ejecuta con `npm test`, que corre Vitest con el Node de Electron: el módulo nativo
// sqlite3 está compilado para Electron y no carga con el Node común.
export default defineConfig({
  resolve: {
    alias: {
      electron: resolve('tests/mocks/electron.js')
    }
  },
  test: {
    include: ['tests/unit/**/*.test.js', 'tests/integracion/**/*.test.js'],
    environment: 'node',
    globalSetup: ['tests/setup/limpieza.js'],
    // Procesos separados: cada archivo tiene su propia base de datos temporal.
    pool: 'forks',
    testTimeout: 20000,
    hookTimeout: 20000
  }
})
