import { ipcMain } from 'electron'
import {
  agregarVenta,
  eliminarVenta,
  obtenerProductosVenta,
  obtenerTodasLasVentas
} from '../controllers/ventas.controller'

ipcMain.handle('obtenerTodasLasVentas', async () => {
  try {
    const ventas = await obtenerTodasLasVentas()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

ipcMain.handle('obtenerProductosVenta', async (event, id) => {
  try {
    const productos = await obtenerProductosVenta(id)
    return productos
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

ipcMain.handle('agregarVenta', async (event, venta) => {
  try {
    const nuevo = await agregarVenta(venta)
    return nuevo
  } catch (error) {
    console.error('Error al agregar la venta:', error)
    return { error: 'Error al agregar la venta' }
  }
})

ipcMain.handle('eliminarVenta', async (event, id) => {
  try {
    const resultado = await eliminarVenta(id)
    return resultado
  } catch (error) {
    console.error('Error al agregar la venta:', error)
    return { error: 'Error al agregar la venta' }
  }
})
