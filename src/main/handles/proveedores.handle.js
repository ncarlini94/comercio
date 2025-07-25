import { ipcMain } from 'electron'
import {
  actualizarProveedor,
  agregarProveedor,
  eliminarProveedor,
  obtenerTodosLosProveedores
} from '../controllers/proveedores.controller'

ipcMain.handle('obtenerTodosLosProveedores', async () => {
  try {
    const proveedores = await obtenerTodosLosProveedores()
    return proveedores
  } catch (error) {
    console.error('Error al obtener proveedores:', error)
    return { error: 'Error al obtener proveedores' }
  }
})

ipcMain.handle('agregarProveedor', async (event, proveedor) => {
  try {
    const nuevo = await agregarProveedor(proveedor)
    return nuevo
  } catch (error) {
    console.error('Error al agregar proveedor:', error)
    return { error: 'Error al agregar proveedor' }
  }
})

ipcMain.handle('actualizarProveedor', async (event, id, proveedor) => {
  try {
    const resultado = await actualizarProveedor(id, proveedor)
    return resultado
  } catch (error) {
    console.error('Error al eliminar proveedor:', error)
    return { error: 'Error al eliminar proveedor' }
  }
})

ipcMain.handle('eliminarProveedor', async (event, id) => {
  try {
    const resultado = await eliminarProveedor(id)
    return resultado
  } catch (error) {
    console.error('Error al eliminar proveedor:', error)
    return { error: 'Error al eliminar proveedor' }
  }
})
