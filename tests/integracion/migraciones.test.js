import fs from 'node:fs'
import path from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  carpetaTemporal,
  crearProducto,
  crearProveedor,
  Inventario,
  prepararBase,
  sequelize,
  Ventas
} from '../helpers/base.js'
import { aplicarMigraciones } from '../../src/main/services/migraciones.js'
import {
  analizarRespaldo,
  cancelarRestauracion
} from '../../src/main/services/respaldo/restauracion.js'

// Esquema de Productos_vendidos anterior a la columna id_producto.
const TABLA_ANTERIOR = `CREATE TABLE \`Productos_vendidos\` (
  \`id\` INTEGER PRIMARY KEY AUTOINCREMENT,
  \`id_ventas\` INTEGER NOT NULL,
  \`producto\` TEXT NOT NULL,
  \`cantidad\` INTEGER NOT NULL,
  \`precio_unitario\` REAL NOT NULL,
  \`created_at\` TEXT NOT NULL,
  \`updated_at\` TEXT NOT NULL
)`

const columnasDe = async (tabla) => {
  const [columnas] = await sequelize.query(`PRAGMA table_info("${tabla}")`)
  return columnas.map((c) => c.name)
}

// Copia completa de todas las tablas (todas las filas, todas las columnas).
const fotoDeLaBase = async () => {
  const [tablas] = await sequelize.query(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  )
  const foto = {}
  for (const { name } of tablas) {
    const [filas] = await sequelize.query(`SELECT * FROM "${name}" ORDER BY rowid`)
    foto[name] = filas
  }
  return foto
}

// Base con Productos_vendidos en el formato anterior y datos de ventas reales.
const prepararBaseAnterior = async () => {
  await prepararBase()
  const proveedor = await crearProveedor()
  const id_proveedor = proveedor.id_proveedores
  const yerba = await crearProducto({ nombre: 'Yerba', stock: 10, id_proveedor })
  // Dos productos con el mismo nombre: una venta de "Fideos" es ambigua.
  await crearProducto({ nombre: 'Fideos', stock: 5, id_proveedor })
  await crearProducto({ nombre: 'Fideos', stock: 7, id_proveedor })
  const venta = await Ventas.create({ total: 500, metodo: 'Efectivo', vendedor: 'Ana' })

  await sequelize.query('DROP TABLE `Productos_vendidos`')
  await sequelize.query(TABLA_ANTERIOR)
  const ahora = new Date().toISOString()
  const fila = (producto, cantidad) =>
    sequelize.query(
      'INSERT INTO `Productos_vendidos` (id_ventas, producto, cantidad, precio_unitario, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      { replacements: [venta.id, producto, cantidad, 100, ahora, ahora] }
    )
  await fila('Yerba', 2) // coincide con un solo producto
  await fila('Fideos', 1) // coincide con dos productos: ambiguo
  await fila('Producto borrado', 4) // no coincide con ninguno
  return { yerba }
}

beforeEach(async () => {
  await prepararBase()
})

describe('migración: id_producto en el detalle de ventas', () => {
  it('agrega la columna sin borrar ni modificar ningún dato existente', async () => {
    await prepararBaseAnterior()
    expect(await columnasDe('Productos_vendidos')).not.toContain('id_producto')
    const antes = await fotoDeLaBase()

    await aplicarMigraciones()

    expect(await columnasDe('Productos_vendidos')).toContain('id_producto')
    const despues = await fotoDeLaBase()
    // Mismas tablas y misma cantidad de filas en cada una.
    expect(Object.keys(despues)).toEqual(Object.keys(antes))
    for (const tabla of Object.keys(antes)) {
      expect(despues[tabla]).toHaveLength(antes[tabla].length)
    }
    // Cada fila conserva todos sus valores anteriores; solo se agrega id_producto.
    for (const tabla of Object.keys(antes)) {
      despues[tabla].forEach((fila, i) => {
        const { id_producto: _nueva, ...resto } = fila
        expect(tabla === 'Productos_vendidos' ? resto : fila).toEqual(antes[tabla][i])
      })
    }
  })

  it('completa el id solo cuando el nombre coincide con un único producto', async () => {
    const { yerba } = await prepararBaseAnterior()

    await aplicarMigraciones()

    const [filas] = await sequelize.query(
      'SELECT producto, id_producto FROM `Productos_vendidos` ORDER BY id'
    )
    expect(filas).toEqual([
      { producto: 'Yerba', id_producto: yerba.id },
      { producto: 'Fideos', id_producto: null },
      { producto: 'Producto borrado', id_producto: null }
    ])
  })

  it('aplicarla dos veces no cambia nada', async () => {
    await prepararBaseAnterior()
    await aplicarMigraciones()
    const primera = await fotoDeLaBase()

    await aplicarMigraciones()
    expect(await fotoDeLaBase()).toEqual(primera)
  })

  it('en una base nueva, que ya tiene la columna, no cambia nada', async () => {
    const proveedor = await crearProveedor()
    await crearProducto({ nombre: 'Yerba', id_proveedor: proveedor.id_proveedores })
    const antes = await fotoDeLaBase()

    await aplicarMigraciones()
    expect(await fotoDeLaBase()).toEqual(antes)
    expect(await Inventario.count()).toBe(1)
  })

  it('una copia de seguridad sin la columna nueva se puede restaurar', async () => {
    await prepararBaseAnterior()
    const carpeta = carpetaTemporal()
    const copia = path.join(carpeta, 'copia-anterior.db')
    await sequelize.query(`VACUUM INTO '${copia.replace(/'/g, "''")}'`)
    // La base en uso vuelve al formato nuevo; la copia queda en el formato anterior.
    await aplicarMigraciones()

    const resultado = await analizarRespaldo(copia)
    expect(resultado).toMatchObject({ success: true })
    expect(resultado.info.conteos.ventas).toBe(1)
    cancelarRestauracion()
    fs.rmSync(carpeta, { recursive: true, force: true })
  })
})
