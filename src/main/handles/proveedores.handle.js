import { manejar } from '../services/canales.js'
import {
  actualizarProveedor,
  agregarProveedor,
  eliminarProveedor,
  obtenerTodosLosProveedores
} from '../controllers/proveedores.controller'

manejar('obtenerTodosLosProveedores', async () => {
  try {
    const proveedores = await obtenerTodosLosProveedores()
    return proveedores
  } catch (error) {
    console.error('Error al obtener proveedores:', error)
    return { error: 'Error al obtener proveedores' }
  }
})

manejar('agregarProveedor', async (event, proveedor) => {
  try {
    const nuevo = await agregarProveedor(proveedor)
    return nuevo
  } catch (error) {
    console.error('Error al agregar proveedor:', error)
    return { error: 'Error al agregar proveedor' }
  }
})

manejar('actualizarProveedor', async (event, id, proveedor) => {
  try {
    const resultado = await actualizarProveedor(id, proveedor)
    return resultado
  } catch (error) {
    console.error('Error al eliminar proveedor:', error)
    return { error: 'Error al eliminar proveedor' }
  }
})

manejar('eliminarProveedor', async (event, id) => {
  try {
    const resultado = await eliminarProveedor(id)
    return resultado
  } catch (error) {
    console.error('Error al eliminar proveedor:', error)
    return { error: 'Error al eliminar proveedor' }
  }
})
