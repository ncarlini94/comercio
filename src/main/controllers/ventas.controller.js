import Inventario from '../models/inventario.model.js'
import ProductosVendidos from '../models/productosVendidos.model.js'
import Ventas from '../models/ventas.model.js'
import sequelize from './../db.js'

export const obtenerTodasLasVentas = async () => {
  try {
    const ventas = await Ventas.findAll({
      include: [
        {
          model: ProductosVendidos,
          as: 'Productos_vendidos'
        }
      ],
      order: [['created_at', 'DESC']]
    })
    return ventas.map((v) => v.toJSON())
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
}

export const obtenerProductosVenta = async (id) => {
  try {
    const ventas = await ProductosVendidos.findAll({
      where: {
        id_ventas: id
      }
    })
    console.log(ventas)
    return ventas.map((v) => v.toJSON())
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    return { error: 'Error al obtener las ventas' }
  }
}

export const agregarVenta = async (venta) => {
  if (!venta || !venta.carrito || !Array.isArray(venta.carrito) || venta.carrito.length === 0) {
    return { error: 'Debes agregar un producto' }
  }
  try {
    let ventaCreada = null
    await sequelize.transaction(async (t) => {
      let total = 0

      // Validar stock y calcular total
      for (const item of venta.carrito) {
        const producto = await Inventario.findByPk(item.id_producto, { transaction: t })
        if (!producto) {
          throw new Error(`Producto ID ${item.id_producto} no encontrado.`)
        }
        if (producto.stock < item.cantidad) {
          throw new Error(`Producto ID ${item.id_producto} stock insuficiente`)
        }
        total += producto.precio * item.cantidad
      }

      // Crear la venta
      ventaCreada = await Ventas.create(
        { total, metodo: venta.metodo, vendedor: venta.vendedor },
        { transaction: t }
      )

      // Registrar productos vendidos y descontar stock
      for (const item of venta.carrito) {
        const producto = await Inventario.findByPk(item.id_producto, { transaction: t })
        await ProductosVendidos.create(
          {
            id_ventas: ventaCreada.id,
            producto: producto.nombre,
            cantidad: item.cantidad,
            precio_unitario: producto.precio
          },
          { transaction: t }
        )

        await producto.decrement('stock', { by: item.cantidad, transaction: t })
      }
    })

    return { message: 'Venta registrada correctamente', venta_id: ventaCreada.id }
  } catch (error) {
    console.error('Error en agregarVenta:', error)
    return { error: error.message || 'Error al registrar la venta' }
  }
}

export const eliminarVenta = async (id) => {
  try {
    await sequelize.transaction(async (t) => {
      const productosVendidos = await ProductosVendidos.findAll({
        where: { id_ventas: id },
        transaction: t
      });

      for (const { producto: nombre, cantidad } of productosVendidos) {
        const productoInv = await Inventario.findOne({
          where: { nombre },      // coincide con item.producto
          transaction: t
        });

        if (productoInv) {
          await productoInv.increment('stock', {
            by: cantidad,
            transaction: t
          });
        } else {
          console.warn(`No hay inventario con nombre “${nombre}”`);
        }
      }

      await ProductosVendidos.destroy({ where: { id_ventas: id }, transaction: t });
      await Ventas.destroy({ where: { id }, transaction: t });
    });

    return { message: 'Venta eliminada y stock restaurado' };
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    return { error: error.message };
  }
}
