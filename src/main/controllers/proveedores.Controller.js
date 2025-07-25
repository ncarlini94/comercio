import Proveedores from '../models/proveedores.model.js'

export const obtenerTodosLosProveedores = async () => {
  try {
    const proveedores = await Proveedores.findAll({
      order: [['created_at', 'DESC']]
    })
    if (!proveedores || proveedores.length === 0) {
      return { error: 'No se encontraron proveedores' }
    }
    return proveedores.map((p) => p.toJSON())
  } catch (error) {
    console.error('Error al obtener los proveedores:', error)
    return { error: 'Error al obtener los proveedores' }
  }
}

export const agregarProveedor = async (proveedor) => {
  try {
    const nuevoProveedor = await Proveedores.create(proveedor)
    return nuevoProveedor.toJSON()
  } catch (error) {
    console.error('Error al agregar el proveedor:', error)
    return { error: 'Error al agregar el proveedor' }
  }
}

export const actualizarProveedor = async (id, proveedor) => {
  try {
    const Proveedor = await Proveedores.findByPk(id)
    if (!Proveedor) {
      return { error: 'Proveedor no encontrado' }
    }
    console.log(Proveedor)
    await Proveedor.update(proveedor)
    return Proveedor.toJSON()
  } catch (error) {
    console.error('Error al actualizar el proveedor:', error)
    return { error: 'Error al actualizar el proveedor' }
  }
}

export const eliminarProveedor = async (id) => {
  try {
    const proveedor = await Proveedores.findByPk(id)
    if (!proveedor) {
      return { error: 'Producto no encontrado' }
    }
    await proveedor.destroy()
    return { message: 'Proveedor eliminado exitosamente' }
  } catch (error) {
    console.error('Error al eliminar el proveedor:', error)
    return { error: 'Error al eliminar el proveedor' }
  }
}

export const obtenerProveedorPorId = async (id) => {
  try {
    const proveedor = await Proveedores.findByPk(id)
    if (!proveedor) {
      return { error: 'Proveedor no encontrado' }
    }
    return proveedor.toJSON()
  } catch (error) {
    console.error('Error al obtener el proveedor:', error)
    return { error: 'Error al obtener el proveedor' }
  }
}
