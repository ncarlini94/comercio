import { manejar } from '../services/canales.js'
import {
  obtenerTotalProductos,
  obtenerUltimasVentas,
  obtenerTotalVentasHoy,
  obtenerProductosStockBajo,
  obtenerTotalProveedores,
  obtenerTotalStockBajo,
  obtenerProductosMasVendidos
} from '../controllers/dashboard.Controller'

manejar('obtenerTotalProductos', async () => {
  try {
    const ventas = await obtenerTotalProductos()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

manejar('obtenerTotalProveedores', async () => {
  try {
    const ventas = await obtenerTotalProveedores()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

manejar('obtenerTotalVentasHoy', async (event, fecha) => {
  try {
    const ventas = await obtenerTotalVentasHoy(fecha)
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

manejar('obtenerTotalStockBajo', async () => {
  try {
    const ventas = await obtenerTotalStockBajo()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

manejar('obtenerUltimasVentas', async () => {
  try {
    const ventas = await obtenerUltimasVentas()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

manejar('obtenerProductosStockBajo', async () => {
  try {
    const ventas = await obtenerProductosStockBajo()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

manejar('obtenerProductosMasVendidos', async () => {
  try {
    const productosMasVendidos = await obtenerProductosMasVendidos()
    return productosMasVendidos
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})
