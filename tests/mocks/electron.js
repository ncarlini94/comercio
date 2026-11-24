// Reemplazo del módulo "electron" para los tests de Vitest (configurado como alias en
// vitest.config.mjs). Los tests corren con el Node de Electron (ELECTRON_RUN_AS_NODE), donde
// las APIs de la app no existen. Cada archivo de test recibe una carpeta de datos propia.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const rutas = {
  userData: fs.mkdtempSync(path.join(os.tmpdir(), 'comercio-test-')),
  temp: os.tmpdir(),
  documents: os.tmpdir()
}
rutas.temp = fs.mkdtempSync(path.join(rutas.userData, 'tmp-'))

// Al terminar el proceso del test se borra su carpeta de datos temporal.
process.on('exit', () => {
  try {
    fs.rmSync(rutas.userData, { recursive: true, force: true })
  } catch {
    // En Windows un archivo puede seguir abierto un instante; queda en %TEMP%.
  }
})

export const registro = { relanzamientos: 0, salidas: [] }

export const app = {
  getPath: (nombre) => rutas[nombre] ?? rutas.userData,
  setPath: (nombre, valor) => {
    rutas[nombre] = valor
  },
  on: () => {},
  relaunch: () => {
    registro.relanzamientos++
  },
  exit: (codigo) => {
    registro.salidas.push(codigo)
  },
  quit: () => {}
}

// Cifrado simulado del formato anterior de contraseñas: solo "descifra" lo que cifró.
export const safeStorage = {
  encryptString: (texto) => Buffer.from(`cifrado:${texto}`),
  decryptString: (buffer) => {
    const texto = buffer.toString()
    if (!texto.startsWith('cifrado:')) throw new Error('No se puede descifrar en este equipo')
    return texto.slice('cifrado:'.length)
  }
}

// Respuestas configurables de los diálogos de archivos.
export const respuestasDialogo = { abrir: null, guardar: null }

export const dialog = {
  showOpenDialog: async () => respuestasDialogo.abrir ?? { canceled: true, filePaths: [] },
  showSaveDialog: async () => respuestasDialogo.guardar ?? { canceled: true }
}

// Guarda los manejadores registrados para poder invocarlos como lo haría el renderer.
export const manejadores = new Map()

export const ipcMain = {
  handle: (canal, fn) => {
    if (manejadores.has(canal)) throw new Error(`Canal registrado dos veces: ${canal}`)
    manejadores.set(canal, fn)
  },
  on: () => {}
}

export const BrowserWindow = { fromWebContents: () => null, getAllWindows: () => [] }

export const invocar = (canal, ...args) => {
  const fn = manejadores.get(canal)
  if (!fn) throw new Error(`Canal sin manejador: ${canal}`)
  return fn({ sender: null }, ...args)
}

export default { app, safeStorage, dialog, ipcMain, BrowserWindow }
