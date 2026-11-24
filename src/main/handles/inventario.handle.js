import { manejar } from '../services/canales.js'
import {
  actualizarProducto,
  agregarProducto,
  eliminarProducto,
  obtenerTodosLosProductos
} from '../controllers/inventario.controller'

manejar('obtenerTodosLosProductos', async () => {
  try {
    const productos = await obtenerTodosLosProductos()
    return productos
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return { error: 'Error al obtener productos' }
  }
})

manejar('agregarProducto', async (event, producto) => {
  try {
    const nuevo = await agregarProducto(producto)
    return nuevo
  } catch (error) {
    console.error('Error al agregar producto:', error)
    return { error: 'Error al agregar producto' }
  }
})

manejar('actualizarProducto', async (event, id, producto) => {
  try {
    const resultado = await actualizarProducto(id, producto)
    return resultado
  } catch (error) {
    console.error('Error al actualizar el producto:', error)
    return { error: 'Error al actualizar el producto' }
  }
})

manejar('eliminarProducto', async (event, id) => {
  try {
    const resultado = await eliminarProducto(id)
    return resultado
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return { error: 'Error al eliminar producto' }
  }
})
