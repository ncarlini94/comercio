// La restauración cierra la conexión compartida: estos tests van en su propio archivo y la
// restauración real es el último paso.
import fs from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app, registro } from 'electron'
import { carpetaTemporal, crearProveedor, crearUsuario, prepararBase } from '../helpers/base.js'
import { consultarArchivo, contarFilas } from '../helpers/sqlite.js'
import { dbPath } from '../../src/main/db.js'
import { copiarBaseA } from '../../src/main/services/respaldo/respaldo.js'
import {
  analizarRespaldo,
  cancelarRestauracion,
  restaurarRespaldo
} from '../../src/main/services/respaldo/restauracion.js'

const carpeta = carpetaTemporal('comercio-restaurar-prueba-')
const enCarpeta = (nombre) => path.join(carpeta, nombre)
const temporalesDeAnalisis = () =>
  fs.readdirSync(app.getPath('temp')).filter((a) => a.startsWith('comercio-restaurar-'))
const nombresDeProveedores = async (archivo) =>
  (await consultarArchivo(archivo, 'SELECT nombre FROM "Proveedores" ORDER BY nombre')).map(
    (f) => f.nombre
  )

// Copia de la base actual con un cambio aplicado.
const copiaModificada = async (nombre, sql) => {
  const archivo = enCarpeta(nombre)
  await copiarBaseA(archivo)
  await consultarArchivo(archivo, sql)
  return archivo
}

let copiaValida

beforeAll(async () => {
  await prepararBase()
  await crearUsuario({ rol: 'Propietario' })
  await crearProveedor({ nombre: 'Original' })
  await crearProveedor({ nombre: 'Respaldado', mail: 'respaldado@proveedor.test' })
  copiaValida = enCarpeta('copia-valida.db')
  await copiarBaseA(copiaValida)
  // Cambio posterior a la copia: es lo que debe quedar en la copia previa a restaurar.
  await crearProveedor({ nombre: 'Posterior', mail: 'posterior@proveedor.test' })
})

afterAll(() => {
  fs.rmSync(carpeta, { recursive: true, force: true })
})

describe('analizarRespaldo', () => {
  it('restaurar sin analizar pide elegir una copia', async () => {
    expect(await restaurarRespaldo({ reiniciar: false })).toEqual({
      success: false,
      requiereElegir: true,
      message: 'Primero elija la copia a restaurar'
    })
  })

  it('rechaza un archivo que no es SQLite', async () => {
    const archivo = enCarpeta('texto.db')
    fs.writeFileSync(archivo, 'esto no es una base de datos '.repeat(200))
    expect(await analizarRespaldo(archivo)).toEqual({
      success: false,
      message: 'El archivo no es una copia de seguridad válida'
    })
    expect(temporalesDeAnalisis()).toEqual([])
  })

  it('rechaza un archivo inexistente', async () => {
    expect(await analizarRespaldo(enCarpeta('no-existe.db'))).toEqual({
      success: false,
      message: 'El archivo no existe'
    })
  })

  it('rechaza una base a la que le faltan tablas', async () => {
    const archivo = enCarpeta('incompleta.db')
    await consultarArchivo(archivo, 'CREATE TABLE "Usuarios" (id_usuario INTEGER)')
    const resultado = await analizarRespaldo(archivo)
    expect(resultado.success).toBe(false)
    expect(resultado.message).toMatch(/^La copia no es compatible con esta versión: /)
    expect(resultado.message).toMatch(/falta la tabla Inventario/)
    expect(resultado.message).not.toMatch(/falta la tabla Roles/)
    expect(temporalesDeAnalisis()).toEqual([])
  })

  it('rechaza una base a la que le faltan columnas', async () => {
    const archivo = await copiaModificada(
      'sin-columna.db',
      'ALTER TABLE "Proveedores" DROP COLUMN celular2'
    )
    const resultado = await analizarRespaldo(archivo)
    expect(resultado.success).toBe(false)
    expect(resultado.message).toMatch(/Proveedores no tiene celular2/)
  })

  it('rechaza la base de datos que está en uso', async () => {
    const mensaje = { success: false, message: 'Ese archivo es la base de datos que está en uso' }
    expect(await analizarRespaldo(dbPath)).toEqual(mensaje)
    expect(await analizarRespaldo(dbPath.toUpperCase())).toEqual(mensaje)
  })

  it('acepta una copia anterior sin la tabla Roles', async () => {
    const archivo = await copiaModificada('sin-roles.db', 'DROP TABLE "Roles"')
    const resultado = await analizarRespaldo(archivo)
    expect(resultado.success).toBe(true)
    expect(resultado.info.conteos.proveedores).toBe(3)
  })

  it('cancelar borra la copia temporal analizada', async () => {
    expect((await analizarRespaldo(copiaValida)).success).toBe(true)
    expect(temporalesDeAnalisis()).toHaveLength(1)
    expect(cancelarRestauracion()).toEqual({ success: true })
    expect(temporalesDeAnalisis()).toEqual([])
    expect((await restaurarRespaldo({ reiniciar: false })).requiereElegir).toBe(true)
  })
})

describe('restaurarRespaldo', () => {
  it('restaura exactamente lo analizado y guarda una copia de los datos anteriores', async () => {
    const analisis = await analizarRespaldo(copiaValida)
    expect(analisis).toMatchObject({
      success: true,
      info: {
        archivo: copiaValida,
        tamanio: fs.statSync(copiaValida).size,
        conteos: { usuarios: 1, productos: 0, proveedores: 2, ventas: 0, pedidos: 0 }
      }
    })

    // El archivo original cambia después del análisis: no debe afectar lo restaurado.
    await consultarArchivo(
      copiaValida,
      `INSERT INTO "Proveedores" (nombre, contacto, mail, telefono, celular, celular2, direccion,
        created_at, updated_at)
       VALUES ('Agregado después', 'x', 'x@x.test', 1, 1, 1, 'x', '2026-01-01', '2026-01-01')`
    )

    const resultado = await restaurarRespaldo({ reiniciar: false })
    expect(resultado).toMatchObject({ success: true, reinicia: false })

    expect(await nombresDeProveedores(dbPath)).toEqual(['Original', 'Respaldado'])

    expect(path.dirname(resultado.copiaPrevia)).toBe(
      path.join(app.getPath('userData'), 'respaldos-previos')
    )
    expect(path.basename(resultado.copiaPrevia)).toMatch(/^comercio-antes-de-restaurar-.*\.db$/)
    expect(await nombresDeProveedores(resultado.copiaPrevia)).toEqual([
      'Original',
      'Posterior',
      'Respaldado'
    ])
    expect(await contarFilas(resultado.copiaPrevia, 'Usuarios')).toBe(1)

    expect(temporalesDeAnalisis()).toEqual([])
    expect(fs.existsSync(`${dbPath}.restaurando`)).toBe(false)

    // Sin reinicio pedido, no se relanza la app.
    await new Promise((resolver) => setTimeout(resolver, 2300))
    expect(registro.relanzamientos).toBe(0)
  })
})
