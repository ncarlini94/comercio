import Inventario from '../models/inventario.model.js'
import Proveedores from '../models/proveedores.model.js'

export const obtenerTodosLosProductos = async () => {
  try {
    const productos = await Inventario.findAll({
      include: [
        {
          model: Proveedores,
          as: 'Proveedor',
          attributes: ['id_proveedores', 'nombre', 'telefono', 'direccion']
        }
      ],
      order: [['created_at', 'DESC']]
    })
    if (!productos || productos.length === 0) {
      return { error: 'No se encontraron productos' }
    }
    return productos.map((p) => p.toJSON())
  } catch (error) {
    console.error('Error al obtener los productos:', error)
    return { error: 'Error al obtener los productos' }
  }
}

export const agregarProducto = async (producto) => {
  try {
    const nuevoProducto = await Inventario.create(producto)
    return nuevoProducto.toJSON()
  } catch (error) {
    console.error('Error al agregar el producto:', error)
    return { error: 'Error al agregar el producto' }
  }
}

export const actualizarProducto = async (id, producto) => {
  try {
    const Producto = await Inventario.findByPk(id)
    if (!producto) {
      return { error: 'Producto no encontrado' }
    }
    await Producto.update(producto)
    return Producto.toJSON()
  } catch (error) {
    console.error('Error al actualizar el producto:', error)
    return { error: 'Error al actualizar el producto' }
  }
}

export const eliminarProducto = async (id) => {
  try {
    const producto = await Inventario.findByPk(id)
    if (!producto) {
      return { error: 'Producto no encontrado' }
    }
    await producto.destroy()
    return { message: 'Producto eliminado exitosamente' }
  } catch (error) {
    console.error('Error al eliminar el producto:', error)
    return { error: 'Error al eliminar el producto' }
  }
}

export const obtenerProductoPorId = async (id) => {
  try {
    const producto = await Inventario.findByPk(id)
    if (!producto) {
      return { error: 'Producto no encontrado' }
    }
    return producto.toJSON()
  } catch (error) {
    console.error('Error al obtener el producto:', error)
    return { error: 'Error al obtener el producto' }
  }
}
