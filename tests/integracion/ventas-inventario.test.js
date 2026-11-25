import { beforeEach, describe, expect, it } from 'vitest'
import { invocar } from 'electron'
import {
  crearProducto,
  crearProveedor,
  iniciarComo,
  Inventario,
  prepararBase,
  ProductosVendidos,
  Ventas
} from '../helpers/base.js'
import '../../src/main/handles/ventas.handle.js'
import { agregarVenta, eliminarVenta } from '../../src/main/controllers/ventas.controller.js'
import {
  actualizarProducto,
  eliminarProducto
} from '../../src/main/controllers/inventario.Controller.js'

let yerba
let azucar

const stockDe = async (producto) => (await Inventario.findByPk(producto.id)).stock

beforeEach(async () => {
  await prepararBase()
  const proveedor = await crearProveedor()
  const id_proveedor = proveedor.id_proveedores
  yerba = await crearProducto({ nombre: 'Yerba', precio: 100, stock: 10, id_proveedor })
  azucar = await crearProducto({ nombre: 'Azúcar', precio: 30, stock: 2, id_proveedor })
})

describe('agregarVenta', () => {
  it('calcula el total con los precios de la base y descuenta el stock', async () => {
    const respuesta = await agregarVenta({
      metodo: 'Efectivo',
      vendedor: 'ana',
      // El precio que manda la pantalla se ignora.
      carrito: [
        { id_producto: yerba.id, cantidad: 3, precio: 1 },
        { id_producto: azucar.id, cantidad: 2, precio: 1 }
      ]
    })
    expect(respuesta).toEqual({ message: 'Venta registrada correctamente', venta_id: 1 })

    const venta = await Ventas.findByPk(respuesta.venta_id)
    expect(venta.total).toBe(3 * 100 + 2 * 30)
    expect(venta.metodo).toBe('Efectivo')
    expect(venta.vendedor).toBe('ana')

    const detalle = await ProductosVendidos.findAll({
      where: { id_ventas: venta.id },
      order: [['id', 'ASC']],
      raw: true
    })
    expect(detalle.map((d) => [d.producto, d.cantidad, d.precio_unitario])).toEqual([
      ['Yerba', 3, 100],
      ['Azúcar', 2, 30]
    ])
    expect(await stockDe(yerba)).toBe(7)
    expect(await stockDe(azucar)).toBe(0)
  })

  it('con stock insuficiente no guarda nada', async () => {
    const respuesta = await agregarVenta({
      metodo: 'Efectivo',
      carrito: [
        { id_producto: yerba.id, cantidad: 1 },
        { id_producto: azucar.id, cantidad: 3 }
      ]
    })
    expect(respuesta).toEqual({ error: `Producto ID ${azucar.id} stock insuficiente` })
    expect(await Ventas.count()).toBe(0)
    expect(await ProductosVendidos.count()).toBe(0)
    expect(await stockDe(yerba)).toBe(10)
    expect(await stockDe(azucar)).toBe(2)
  })

  it('si falla al guardar la venta, no queda nada guardado', async () => {
    // Un método de pago inválido falla al crear la venta, después de validar el stock.
    const respuesta = await agregarVenta({
      metodo: 'Trueque',
      carrito: [{ id_producto: yerba.id, cantidad: 1 }]
    })
    expect(respuesta).toHaveProperty('error')
    expect(await Ventas.count()).toBe(0)
    expect(await stockDe(yerba)).toBe(10)
  })

  it('rechaza un carrito vacío o ausente', async () => {
    const mensaje = { error: 'Debes agregar un producto' }
    expect(await agregarVenta({ metodo: 'Efectivo', carrito: [] })).toEqual(mensaje)
    expect(await agregarVenta({ metodo: 'Efectivo' })).toEqual(mensaje)
    expect(await agregarVenta(null)).toEqual(mensaje)
    expect(await Ventas.count()).toBe(0)
  })

  it('el canal agregarVenta funciona con el permiso ventas.crear', async () => {
    await iniciarComo({ rol: 'Vendedor' })
    const respuesta = await invocar('agregarVenta', {
      metodo: 'Debito',
      carrito: [{ id_producto: yerba.id, cantidad: 2 }]
    })
    expect(respuesta.message).toBe('Venta registrada correctamente')
    expect(await stockDe(yerba)).toBe(8)
    // El Vendedor no puede anular ventas.
    expect(await invocar('eliminarVenta', respuesta.venta_id)).toMatchObject({ sinPermisos: true })
    expect(await Ventas.count()).toBe(1)
  })
})

describe('eliminarVenta', () => {
  it('borra la venta y devuelve el stock', async () => {
    const { venta_id } = await agregarVenta({
      metodo: 'Efectivo',
      carrito: [
        { id_producto: yerba.id, cantidad: 4 },
        { id_producto: azucar.id, cantidad: 1 }
      ]
    })
    expect(await stockDe(yerba)).toBe(6)

    expect(await eliminarVenta(venta_id)).toEqual({ message: 'Venta eliminada y stock restaurado' })
    expect(await Ventas.count()).toBe(0)
    expect(await ProductosVendidos.count()).toBe(0)
    expect(await stockDe(yerba)).toBe(10)
    expect(await stockDe(azucar)).toBe(2)
  })

  it('guarda el id del producto en el detalle de la venta', async () => {
    const { venta_id } = await agregarVenta({
      metodo: 'Efectivo',
      carrito: [{ id_producto: yerba.id, cantidad: 2 }]
    })
    const detalle = await ProductosVendidos.findOne({ where: { id_ventas: venta_id } })
    expect(detalle.id_producto).toBe(yerba.id)
    expect(detalle.producto).toBe('Yerba')
  })

  it('devuelve el stock aunque el producto se haya renombrado después de la venta', async () => {
    const { venta_id } = await agregarVenta({
      metodo: 'Efectivo',
      carrito: [{ id_producto: yerba.id, cantidad: 3 }]
    })
    await Inventario.update({ nombre: 'Yerba premium' }, { where: { id: yerba.id } })

    await eliminarVenta(venta_id)
    expect(await stockDe(yerba)).toBe(10)
  })

  it('una venta anterior sin id de producto devuelve el stock buscando por nombre', async () => {
    const venta = await Ventas.create({ total: 200, metodo: 'Efectivo' })
    await ProductosVendidos.create({
      id_ventas: venta.id,
      id_producto: null,
      producto: 'Yerba',
      cantidad: 2,
      precio_unitario: 100
    })

    await eliminarVenta(venta.id)
    expect(await stockDe(yerba)).toBe(12)
  })

  it('borrar un producto no borra el detalle de las ventas que lo incluyen', async () => {
    const { venta_id } = await agregarVenta({
      metodo: 'Efectivo',
      carrito: [{ id_producto: yerba.id, cantidad: 1 }]
    })
    await eliminarProducto(yerba.id)

    expect(await Ventas.findByPk(venta_id)).not.toBeNull()
    const detalle = await ProductosVendidos.findAll({ where: { id_ventas: venta_id } })
    expect(detalle).toHaveLength(1)
    expect(detalle[0].producto).toBe('Yerba')
  })
})

describe('inventario', () => {
  it('actualizarProducto con un id inexistente devuelve un error', async () => {
    expect(await actualizarProducto(9999, { precio: 5 })).toEqual({
      error: 'Producto no encontrado'
    })
  })

  it('actualizarProducto guarda los cambios', async () => {
    const respuesta = await actualizarProducto(yerba.id, { precio: 150 })
    expect(respuesta.precio).toBe(150)
    expect((await Inventario.findByPk(yerba.id)).precio).toBe(150)
  })

  it('eliminarProducto con un id inexistente devuelve un error', async () => {
    expect(await eliminarProducto(9999)).toEqual({ error: 'Producto no encontrado' })
    expect(await Inventario.count()).toBe(2)
  })
})
