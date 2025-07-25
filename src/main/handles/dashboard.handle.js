import { ipcMain } from 'electron'
import {
  obtenerTotalProductos,
  obtenerUltimasVentas,
  obtenerTotalVentasHoy,
  obtenerProductosStockBajo,
  obtenerTotalProveedores,
  obtenerTotalStockBajo
} from '../controllers/dashboard.Controller'

ipcMain.handle('obtenerTotalProductos', async () => {
  try {
    const ventas = await obtenerTotalProductos()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

ipcMain.handle('obtenerTotalProveedores', async () => {
  try {
    const ventas = await obtenerTotalProveedores()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

ipcMain.handle('obtenerTotalVentasHoy', async (event, fecha) => {
  try {
    const ventas = await obtenerTotalVentasHoy(fecha)
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

ipcMain.handle('obtenerTotalStockBajo', async () => {
  try {
    const ventas = await obtenerTotalStockBajo()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

ipcMain.handle('obtenerUltimasVentas', async () => {
  try {
    const ventas = await obtenerUltimasVentas()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})

ipcMain.handle('obtenerProductosStockBajo', async () => {
  try {
    const ventas = await obtenerProductosStockBajo()
    return ventas
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
})
