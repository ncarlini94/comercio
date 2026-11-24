// Corre Vitest con el Node que trae Electron (ELECTRON_RUN_AS_NODE). Así el módulo nativo
// sqlite3, compilado para Electron por "electron-builder install-app-deps", carga bien.
// Uso: npm test            → corre todos los tests una vez
//      npm test -- --watch → modo observador
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const electron = require('electron')
// vitest.mjs no está en los "exports" del paquete, por eso se arma la ruta directa.
const vitest = fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url))

const argumentos = process.argv.slice(2)
const modo = argumentos.includes('--watch') ? [] : ['run']

const proceso = spawn(electron, [vitest, ...modo, ...argumentos], {
  stdio: 'inherit',
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
})
proceso.on('exit', (codigo) => process.exit(codigo ?? 1))
