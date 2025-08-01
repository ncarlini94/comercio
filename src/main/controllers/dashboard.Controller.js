import Inventario from '../models/inventario.model'
import ProductosVendidos from '../models/productosVendidos.model'
import Proveedores from '../models/proveedores.model'
import Ventas from '../models/ventas.model'
import { where, Op, col, fn, literal } from '@sequelize/core'

export const obtenerTotalProductos = async () => {
  try {
    const total = await Inventario.count()
    return { totalProductos: total }
  } catch (error) {
    console.error('Error al obtener los productos:', error)
    return { error: 'Error al obtener los productos' }
  }
}

export const obtenerTotalProveedores = async () => {
  try {
    const total = await Proveedores.count()
    return { totalProveedores: total }
  } catch (error) {
    console.error('Error al obtener los proveedores:', error)
    return { error: 'Error al obtener los proveedores' }
  }
}

export const obtenerTotalVentasHoy = async (fecha) => {
  try {
    const inicio = new Date(`${fecha}T00:00:00.000`)
    const fin = new Date(inicio)
    fin.setDate(fin.getDate() + 1)

    const sumaHoy = await Ventas.sum('total', {
      where: {
        created_at: {
          [Op.gte]: inicio,
          [Op.lt]: fin
        }
      }
    })

    return { totalVentasHoy: sumaHoy }
  } catch (error) {
    console.error('Error al sumar ventas de hoy:', error)
    throw new Error('No se pudo calcular el total de ventas de hoy')
  }
}

export const obtenerTotalStockBajo = async () => {
  try {
    const totalStockBajo = await Inventario.count({
      where: where(col('stock'), Op.lt, col('stock_minimo'))
    })
    return { totalStockBajo: totalStockBajo }
  } catch (error) {
    console.error('Error al contar productos con stock bajo:', error)
    return { error: 'No se pudo contar productos con stock bajo' }
  }
}

export const obtenerUltimasVentas = async () => {
  try {
    const ventas = await Ventas.findAll({
      include: [
        {
          model: ProductosVendidos,
          as: 'Productos_vendidos'
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    })
    return ventas.map((v) => v.toJSON())
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
}

export const obtenerProductosStockBajo = async () => {
  try {
    const productosBajos = await Inventario.findAll({
      where: {
        stock: { [Op.lt]: col('stock_minimo') }
      },
      include: [{ model: Proveedores, as: 'Proveedor' }],
      order: [['stock', 'ASC']]
    })

    return productosBajos.map((p) => p.toJSON())
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error)
    return { error: 'No se pudo obtener los productos con stock bajo' }
  }
}

export const obtenerProductosMasVendidos = async (limit = 10) => {
  try {
    const topProductos = await ProductosVendidos.findAll({
      attributes: ['producto', [fn('sum', col('cantidad')), 'totalVendido']],
      group: ['producto'],
      order: [[literal('totalVendido'), 'DESC']],
      limit,
      raw: true
    })
    return topProductos
  } catch (error) {
    console.error('Error al obtener los productos más vendidos:', error)
    return { error: 'No se pudo obtener los productos más vendidos' }
  }
}
