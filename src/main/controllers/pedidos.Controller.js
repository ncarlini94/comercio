import Pedidos from '../models/pedidos.model'
import Inventario from '../models/inventario.model'
import sequelize from './../db.js'
import ProductosPedidos from '../models/productosPedidos.model.js'

export const obtenerTodosLosPedidos = async () => {
  try {
    const pedidos = await Pedidos.findAll({
      order: [['created_at', 'DESC']]
    })
    if (!pedidos || pedidos.length === 0) {
      return { error: 'No se encontraron pedidos' }
    }
    return pedidos.map((p) => p.toJSON())
  } catch (error) {
    console.error('Error al obtener los pedidos:', error)
    return { error: 'Error al obtener los pedidos' }
  }
}

export const obtenerTodosLosProductosPedidos = async (id) => {
  try {
    const productos = await ProductosPedidos.findAll({
      where: {
        id_pedido: id
      }
    })
    console.log(productos)
    if (!productos || productos.length === 0) {
      return { error: 'No se encontraron productos' }
    }
    return productos.map((p) => p.toJSON())
  } catch (error) {
    console.error('Error al obtener los productos:', error)
    return { error: 'Error al obtener los productos' }
  }
}

export const agregarPedido = async (pedido) => {
  if (
    !pedido ||
    !pedido.productos ||
    !Array.isArray(pedido.productos) ||
    pedido.productos.length === 0
  ) {
    return { error: 'Debes agregar un producto' }
  }
  try {
    await sequelize.transaction(async (t) => {
      let total = 0

      for (const item of pedido.productos) {
        const producto = await Inventario.findByPk(item.id_producto, { transaction: t })
        if (!producto) {
          throw new Error(`Producto ID ${item.id_producto} no encontrado.`)
        }
        total += producto.precio * item.cantidad
      }

      const pedidoCreado = await Pedidos.create(
        {
          proveedor: pedido.proveedor,
          total,
          estado: pedido.estado,
          nota: pedido.nota
        },
        { transaction: t }
      )

      for (const item of pedido.productos) {
        await ProductosPedidos.create(
          {
            id_pedido: pedidoCreado.id,
            id_producto: item.id_producto,
            producto: item.producto,
            cantidad: item.cantidad,
            costo: item.costo
          },
          { transaction: t }
        )
      }
    })
  } catch (error) {
    console.error('Error al agregar el pedido:', error)
    return { error: 'Error al agregar el pedido' }
  }
}

export const actualizarPedido = async (id, estado) => {
  const Pedido = await Pedidos.findByPk(id)
  if (!Pedido) {
    return { error: 'Pedido no encontrado' }
  }
  try {
    if (estado === 'Aprobado') {
      await sequelize.transaction(async (t) => {
        let productos = []
        productos = await ProductosPedidos.findAll({
          where: {
            id_pedido: id
          }
        })
        for (const item of productos) {
          const producto = await Inventario.findByPk(item.id_producto, { transaction: t })
          console.log('Producto:', producto)
          await producto.update({ costo: item.costo })
          await producto.increment('stock', { by: item.cantidad, transaction: t })
        }

        await Pedidos.update({ estado: estado }, { where: { id } }, { transaction: t })

        return Pedido.toJSON()
      })
    } else {
      await Pedidos.update({ estado: estado }, { where: { id } })

      return Pedido.toJSON()
    }
  } catch (error) {
    console.error('Error al actualizar el pedido:', error)
    return { error: 'Error al actualizar el pedido' }
  }
}

export const eliminarPedido = async (id) => {
  try {
    const pedido = await Pedidos.findByPk(id)
    if (!pedido) {
      return { error: 'Pedido no encontrado' }
    }
    await pedido.destroy()
    return { message: 'Pedido eliminado exitosamente' }
  } catch (error) {
    console.error('Error al eliminar el pedido:', error)
    return { error: 'Error al eliminar el pedido' }
  }
}

export const obtenerPedidoPorId = async (id) => {
  try {
    const pedido = await Pedidos.findByPk(id)
    if (!pedido) {
      return { error: 'Proveedor no encontrado' }
    }
    return pedido.toJSON()
  } catch (error) {
    console.error('Error al obtener el pedido:', error)
    return { error: 'Error al obtener el pedido' }
  }
}
