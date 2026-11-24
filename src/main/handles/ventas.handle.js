import { manejar } from '../services/canales.js'
import {
  agregarVenta,
  eliminarVenta,
  obtenerProductosVenta,
  obtenerTodasLasVentas
} from '../controllers/ventas.controller'

manejar('obtenerTodasLasVentas', async () => {
  try {
    const ventas = await obtenerTodasLasVentas()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

manejar('obtenerProductosVenta', async (event, id) => {
  try {
    const productos = await obtenerProductosVenta(id)
    return productos
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

manejar('agregarVenta', async (event, venta) => {
  try {
    const nuevo = await agregarVenta(venta)
    return nuevo
  } catch (error) {
    console.error('Error al agregar la venta:', error)
    return { error: 'Error al agregar la venta' }
  }
})

manejar('eliminarVenta', async (event, id) => {
  try {
    const resultado = await eliminarVenta(id)
    return resultado
  } catch (error) {
    console.error('Error al agregar la venta:', error)
    return { error: 'Error al agregar la venta' }
  }
})
