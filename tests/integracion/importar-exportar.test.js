import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { invocar, respuestasDialogo } from 'electron'
import {
  carpetaTemporal,
  crearProducto,
  crearProveedor,
  crearUsuario,
  iniciarComo,
  Inventario,
  Pedidos,
  prepararBase,
  ProductosPedidos,
  Proveedores,
  sequelize
} from '../helpers/base.js'
import '../../src/main/handles/importar.handle.js'
import importar from '../../src/main/services/import/importar.js'
import exportar from '../../src/main/services/export/exportar.js'
import { agregarVenta } from '../../src/main/controllers/ventas.controller.js'
import { crearRol } from '../../src/main/controllers/roles.controller.js'

const carpeta = carpetaTemporal('comercio-excel-')
let numeroArchivo = 0

// Escribe un Excel con una hoja a partir de filas (la primera es el encabezado).
const escribirExcel = (filas) => {
  const archivo = path.join(carpeta, `archivo-${++numeroArchivo}.xlsx`)
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, XLSX.utils.aoa_to_sheet(filas), 'Hoja1')
  XLSX.writeFile(libro, archivo)
  return archivo
}

const leerHoja = (archivo, hoja) => XLSX.utils.sheet_to_json(XLSX.readFile(archivo).Sheets[hoja])
const rutaNueva = () => path.join(carpeta, `exportado-${++numeroArchivo}.xlsx`)

let proveedor

beforeEach(async () => {
  await prepararBase()
  respuestasDialogo.abrir = null
  respuestasDialogo.guardar = null
  proveedor = await crearProveedor()
})

afterAll(() => {
  fs.rmSync(carpeta, { recursive: true, force: true })
})

const ENCABEZADO_INVENTARIO = [
  ' Nombre ',
  'DESCRIPCION',
  'Costo',
  'Precio',
  'Stock',
  'Stock_Minimo',
  'Id_Proveedor'
]

describe('importar inventario', () => {
  it('normaliza encabezados, informa errores por fila y cuenta duplicados', async () => {
    await crearProducto({ nombre: 'Yerba', id_proveedor: proveedor.id_proveedores })
    const id = proveedor.id_proveedores
    const archivo = escribirExcel([
      ENCABEZADO_INVENTARIO,
      [' Café ', 'Molido', 40, 80, 5, 1, id], // fila 2: válida
      ['Té', 'Saquitos', 'abc', 20, 1.5, 1, id], // fila 3: números inválidos
      ['Mate', 'Calabaza', 10, 20, 3, 1, 99], // fila 4: proveedor inexistente
      ['yerba', 'Repetida en la base', 10, 20, 3, 1, id], // fila 5: duplicado
      ['CAFÉ', 'Repetido en el archivo', 10, 20, 3, 1, id], // fila 6: duplicado
      ['', 'Sin nombre', 10, 20, 3, 1, id] // fila 7: falta el nombre
    ])

    const resultado = await importar('inventario', archivo)
    expect(resultado).toEqual({
      success: true,
      total: 6,
      insertados: 1,
      duplicados: 2,
      errores: [
        {
          fila: 3,
          mensaje:
            '"costo" debe ser un número mayor o igual a 0, "stock" debe ser un número entero mayor o igual a 0'
        },
        { fila: 4, mensaje: 'no existe el proveedor con id 99' },
        { fila: 7, mensaje: 'falta "nombre"' }
      ]
    })

    const productos = await Inventario.findAll({ order: [['id', 'ASC']], raw: true })
    expect(productos.map((p) => p.nombre)).toEqual(['Yerba', 'Café'])
    expect(productos[1]).toMatchObject({ descripcion: 'Molido', costo: 40, precio: 80, stock: 5 })
  })

  it('rechaza números negativos', async () => {
    const archivo = escribirExcel([
      ENCABEZADO_INVENTARIO,
      ['Té', 'Saquitos', 10, -5, 1, 1, proveedor.id_proveedores]
    ])
    const resultado = await importar('inventario', archivo)
    expect(resultado.insertados).toBe(0)
    expect(resultado.errores).toEqual([
      { fila: 2, mensaje: '"precio" debe ser un número mayor o igual a 0' }
    ])
    expect(await Inventario.count()).toBe(0)
  })

  it('un archivo sin filas de datos no importa nada', async () => {
    const archivo = escribirExcel([ENCABEZADO_INVENTARIO])
    expect(await importar('inventario', archivo)).toEqual({
      success: false,
      message: 'El archivo no tiene filas para importar'
    })
  })

  it('rechaza una sección que no se puede importar', async () => {
    const archivo = escribirExcel([ENCABEZADO_INVENTARIO])
    expect(await importar('ventas', archivo)).toEqual({
      success: false,
      message: 'La sección "ventas" no se puede importar'
    })
  })
})

describe('importar proveedores', () => {
  it('inserta los válidos, cuenta duplicados por nombre y mail e informa errores', async () => {
    const archivo = escribirExcel([
      ['Nombre', 'Contacto', 'Mail', 'Telefono', 'Celular', 'Celular2', 'Direccion'],
      ['Lácteos Sur', 'Beto', 'sur@proveedor.test', 111, 222, 333, 'Calle 2'], // fila 2
      ['distribuidora norte', 'Ana', 'NORTE@proveedor.test', 1, 2, 3, 'Calle 1'], // fila 3: duplicado
      ['Bebidas', 'Caro', 'bebidas@proveedor.test', 'sin número', 2, 3, 'Calle 3'], // fila 4
      ['Lácteos Sur', 'Otro', 'sur@proveedor.test', 1, 2, 3, 'Calle 9'] // fila 5: duplicado
    ])
    const resultado = await importar('proveedores', archivo)
    expect(resultado).toEqual({
      success: true,
      total: 4,
      insertados: 1,
      duplicados: 2,
      errores: [{ fila: 4, mensaje: '"telefono" debe ser un número entero mayor o igual a 0' }]
    })
    const nombres = (await Proveedores.findAll({ order: [['id_proveedores', 'ASC']] })).map(
      (p) => p.nombre
    )
    expect(nombres).toEqual(['Distribuidora Norte', 'Lácteos Sur'])
  })
})

describe('canal importar', () => {
  it('importa el archivo elegido en el diálogo', async () => {
    await iniciarComo({ rol: 'Propietario' })
    respuestasDialogo.abrir = {
      canceled: false,
      filePaths: [
        escribirExcel([
          ENCABEZADO_INVENTARIO,
          ['Café', 'Molido', 40, 80, 5, 1, proveedor.id_proveedores]
        ])
      ]
    }
    const resultado = await invocar('importar', 'inventario')
    expect(resultado).toMatchObject({ success: true, insertados: 1 })
    expect(await Inventario.count()).toBe(1)
  })

  it('si se cancela el diálogo no importa nada', async () => {
    await iniciarComo({ rol: 'Propietario' })
    expect(await invocar('importar', 'inventario')).toEqual({ success: false, canceled: true })
  })
})

// Datos de todas las secciones para exportar.
const cargarDatos = async () => {
  const id_proveedor = proveedor.id_proveedores
  const yerba = await crearProducto({ nombre: 'Yerba', precio: 100, stock: 10, id_proveedor })
  await crearProducto({ nombre: 'Azúcar', precio: 30, stock: 5, id_proveedor })
  await agregarVenta({
    metodo: 'Efectivo',
    vendedor: 'ana',
    carrito: [{ id_producto: yerba.id, cantidad: 3 }]
  })
  const pedido = await Pedidos.create({ proveedor: 'Distribuidora Norte', total: 100 })
  await ProductosPedidos.create({
    id_pedido: pedido.id,
    id_producto: yerba.id,
    producto: 'Yerba',
    cantidad: 2,
    costo: 50
  })
  await crearUsuario({ rol: 'Propietario', mail: 'ana@comercio.test' })
}

describe('exportar', () => {
  it('exporta todo en 7 hojas', async () => {
    await cargarDatos()
    const archivo = rutaNueva()
    const resultado = await exportar('todo', archivo)
    // 2 productos, 1 proveedor, 1 venta, 1 detalle, 1 pedido, 1 detalle, 1 usuario.
    expect(resultado).toEqual({ success: true, filePath: archivo, registros: 8 })
    expect(XLSX.readFile(archivo).SheetNames).toEqual([
      'Inventario',
      'Proveedores',
      'Ventas',
      'Ventas - Detalle',
      'Pedidos',
      'Pedidos - Detalle',
      'Usuarios'
    ])
  })

  it.each([
    ['inventario', ['Inventario']],
    ['proveedores', ['Proveedores']],
    ['ventas', ['Ventas', 'Ventas - Detalle']],
    ['pedidos', ['Pedidos', 'Pedidos - Detalle']],
    ['usuarios', ['Usuarios']]
  ])('exporta la sección %s', async (seccion, hojas) => {
    await cargarDatos()
    const archivo = rutaNueva()
    expect((await exportar(seccion, archivo)).success).toBe(true)
    expect(XLSX.readFile(archivo).SheetNames).toEqual(hojas)
  })

  it('la hoja Usuarios no incluye la contraseña', async () => {
    await cargarDatos()
    const archivo = rutaNueva()
    await exportar('usuarios', archivo)
    const [usuario] = leerHoja(archivo, 'Usuarios')
    expect(usuario).toMatchObject({ mail: 'ana@comercio.test', rol: 'Propietario' })
    expect(usuario).not.toHaveProperty('password')
    expect(JSON.stringify(usuario)).not.toMatch(/\$2[aby]\$/)
  })

  it('el detalle de ventas y pedidos incluye el subtotal', async () => {
    await cargarDatos()
    const archivo = rutaNueva()
    await exportar('todo', archivo)
    expect(leerHoja(archivo, 'Ventas - Detalle')).toEqual([
      { id_venta: 1, producto: 'Yerba', cantidad: 3, precio_unitario: 100, subtotal: 300 }
    ])
    expect(leerHoja(archivo, 'Pedidos - Detalle')[0]).toMatchObject({ subtotal: 100 })
    expect(leerHoja(archivo, 'Ventas')[0]).toMatchObject({ total: 300, metodo: 'Efectivo' })
  })

  it('el inventario exportado se vuelve a importar sin errores', async () => {
    await cargarDatos()
    const archivo = rutaNueva()
    await exportar('inventario', archivo)
    await sequelize.query('DELETE FROM "Inventario"')

    const resultado = await importar('inventario', archivo)
    expect(resultado).toMatchObject({ success: true, insertados: 2, duplicados: 0, errores: [] })
    const nombres = (await Inventario.findAll({ order: [['id', 'ASC']] })).map((p) => p.nombre)
    expect(nombres).toEqual(['Yerba', 'Azúcar'])
  })

  it('rechaza una sección inválida sin crear el archivo', async () => {
    const archivo = rutaNueva()
    expect(await exportar('clientes', archivo)).toEqual({
      success: false,
      message: 'La sección "clientes" no se puede exportar'
    })
    expect(fs.existsSync(archivo)).toBe(false)
  })

  it('el canal exportar exige usuarios.ver para usuarios y todo', async () => {
    await iniciarComo({ rol: 'Propietario' })
    await crearRol({ nombre: 'Exportador', permisos: ['configuracion.exportar'] })
    await iniciarComo({ rol: 'Exportador' })
    const archivo = rutaNueva()
    respuestasDialogo.guardar = { canceled: false, filePath: archivo }

    expect(await invocar('exportar', 'todo')).toMatchObject({ sinPermisos: true })
    expect(await invocar('exportar', 'usuarios')).toMatchObject({ sinPermisos: true })
    expect(fs.existsSync(archivo)).toBe(false)

    expect(await invocar('exportar', 'inventario')).toMatchObject({ success: true })
    expect(fs.existsSync(archivo)).toBe(true)
  })
})
