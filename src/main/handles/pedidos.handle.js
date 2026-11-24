import { manejar } from '../services/canales.js'
import {
  actualizarPedido,
  agregarPedido,
  eliminarPedido,
  obtenerTodosLosPedidos,
  obtenerTodosLosProductosPedidos
} from '../controllers/pedidos.Controller'

manejar('obtenerTodosLosPedidos', async () => {
  try {
    const pedidos = await obtenerTodosLosPedidos()
    return pedidos
  } catch (error) {
    console.error('Error al obtener pedidos:', error)
    return { error: 'Error al obtener pedidos' }
  }
})

manejar('obtenerTodosLosProductosPedidos', async (event, id) => {
  try {
    const productos = await obtenerTodosLosProductosPedidos(id)
    return productos
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return { error: 'Error al obtener productos' }
  }
})

manejar('agregarPedido', async (event, pedido) => {
  try {
    const nuevo = await agregarPedido(pedido)
    return nuevo
  } catch (error) {
    console.error('Error al agregar pedido:', error)
    return { error: 'Error al agregar pedido' }
  }
})

manejar('actualizarPedido', async (event, id, pedido) => {
  try {
    const resultado = await actualizarPedido(id, pedido)
    return resultado
  } catch (error) {
    console.error('Error al eliminar pedido:', error)
    return { error: 'Error al eliminar pedido' }
  }
})

manejar('eliminarPedido', async (event, id) => {
  try {
    const resultado = await eliminarPedido(id)
    return resultado
  } catch (error) {
    console.error('Error al eliminar proveedor:', error)
    return { error: 'Error al eliminar proveedor' }
  }
})
