import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { invocar, manejadores } from 'electron'
import { prepararBase } from '../helpers/base.js'
import '../../src/main/handles/usuarios.handle.js'
import '../../src/main/handles/inventario.handle.js'
import '../../src/main/handles/proveedores.handle.js'
import '../../src/main/handles/ventas.handle.js'
import '../../src/main/handles/pedidos.handle.js'
import '../../src/main/handles/dashboard.handle.js'
import '../../src/main/handles/importar.handle.js'
import '../../src/main/handles/respaldo.handle.js'
import { manejar, PERMISOS_POR_CANAL, PUBLICO } from '../../src/main/services/canales.js'
import { TODOS_LOS_PERMISOS } from '../../src/main/services/permisos.js'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const leer = (relativa) => fs.readFileSync(path.join(raiz, relativa), 'utf8')
const coincidencias = (textoFuente, expresion) =>
  [...textoFuente.matchAll(expresion)].map((m) => m[1])

const HANDLES_IMPORTADOS = [
  'dashboard.handle.js',
  'importar.handle.js',
  'inventario.handle.js',
  'pedidos.handle.js',
  'proveedores.handle.js',
  'respaldo.handle.js',
  'usuarios.handle.js',
  'ventas.handle.js'
]

// Canales que registra src/main/index.js (no se importa en los tests porque arranca la app).
const canalesDeIndex = coincidencias(leer('src/main/index.js'), /manejar\(\s*'([^']+)'/g)
const canalesRegistrados = () => new Set([...manejadores.keys(), ...canalesDeIndex])

beforeAll(async () => {
  await prepararBase()
})

describe('registro de canales IPC', () => {
  it('el test importa todos los archivos de src/main/handles', () => {
    const archivos = fs.readdirSync(path.join(raiz, 'src/main/handles')).sort()
    expect(archivos).toEqual(HANDLES_IMPORTADOS)
  })

  it('cada canal registrado tiene permisos definidos', () => {
    expect(manejadores.size).toBeGreaterThan(0)
    for (const canal of canalesRegistrados()) {
      expect(PERMISOS_POR_CANAL, canal).toHaveProperty([canal])
    }
  })

  it('cada canal de PERMISOS_POR_CANAL tiene un manejador registrado', () => {
    const registrados = canalesRegistrados()
    for (const canal of Object.keys(PERMISOS_POR_CANAL)) {
      expect(registrados.has(canal), canal).toBe(true)
    }
  })

  it('cada canal que invoca el preload tiene un manejador registrado', () => {
    const canalesPreload = coincidencias(
      leer('src/preload/index.js'),
      /ipcRenderer\.invoke\(\s*'([^']+)'/g
    )
    expect(canalesPreload.length).toBeGreaterThan(40)
    const registrados = canalesRegistrados()
    for (const canal of canalesPreload) {
      expect(registrados.has(canal), canal).toBe(true)
    }
  })

  it('los permisos requeridos por los canales existen en el catálogo', () => {
    for (const [canal, requeridos] of Object.entries(PERMISOS_POR_CANAL)) {
      if (requeridos === PUBLICO) continue
      for (const permiso of requeridos) {
        expect(TODOS_LOS_PERMISOS, `${canal}: ${permiso}`).toContain(permiso)
      }
    }
  })

  it('manejar rechaza un canal sin permisos definidos', () => {
    expect(() => manejar('canalInexistente', () => 'hola')).toThrow(/canalInexistente/)
    expect(manejadores.has('canalInexistente')).toBe(false)
  })
})

describe('canales sin sesión', () => {
  it('todo canal no público responde sinPermisos', async () => {
    const protegidos = [...manejadores.keys()].filter((c) => PERMISOS_POR_CANAL[c] !== PUBLICO)
    const esperados = Object.values(PERMISOS_POR_CANAL).filter((p) => p !== PUBLICO)
    expect(protegidos).toHaveLength(esperados.length)
    for (const canal of protegidos) {
      const respuesta = await invocar(canal)
      expect(respuesta, canal).toMatchObject({ success: false, sinPermisos: true })
    }
  })

  it('los canales públicos responden sin sesión', async () => {
    expect(await invocar('existenUsuarios')).toBe(false)
    expect(await invocar('obtenerSesion')).toBeNull()
    expect(await invocar('cerrarSesion')).toEqual({ success: true })
  })
})
