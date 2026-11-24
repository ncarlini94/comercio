// Restauración con el reinicio por defecto. Va en su propio archivo porque la restauración
// cierra la conexión compartida y solo se puede hacer una vez por proceso.
import fs from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { registro } from 'electron'
import { carpetaTemporal, crearProveedor, prepararBase } from '../helpers/base.js'
import { contarFilas } from '../helpers/sqlite.js'
import { dbPath } from '../../src/main/db.js'
import { copiarBaseA } from '../../src/main/services/respaldo/respaldo.js'
import {
  analizarRespaldo,
  restaurarRespaldo
} from '../../src/main/services/respaldo/restauracion.js'

const carpeta = carpetaTemporal('comercio-reinicio-prueba-')
const copia = path.join(carpeta, 'copia.db')

beforeAll(async () => {
  await prepararBase()
  await copiarBaseA(copia)
  await crearProveedor()
})

afterAll(() => {
  fs.rmSync(carpeta, { recursive: true, force: true })
})

describe('restaurarRespaldo con reinicio', () => {
  it('restaura y programa el reinicio de la app a los 2 segundos', async () => {
    expect((await analizarRespaldo(copia)).success).toBe(true)
    const resultado = await restaurarRespaldo()
    expect(resultado).toMatchObject({ success: true, reinicia: true })
    expect(await contarFilas(dbPath, 'Proveedores')).toBe(0)

    // Todavía no se reinició: se espera a que la pantalla reciba la respuesta.
    expect(registro.relanzamientos).toBe(0)
    await new Promise((resolver) => setTimeout(resolver, 2300))
    expect(registro.relanzamientos).toBe(1)
    expect(registro.salidas).toEqual([0])
  })
})
