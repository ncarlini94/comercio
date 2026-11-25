import { DataTypes } from '@sequelize/core'
import sequelize from '../db.js'

const ProductosVendidos = sequelize.define(
  'Productos_vendidos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_ventas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Id del producto vendido. Puede ser null en ventas anteriores a esta columna (se usa el
    // nombre) y no tiene restricción hacia Inventario: borrar un producto no afecta las ventas.
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Nombre del producto al momento de la venta (queda como registro histórico).
    producto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precio_unitario: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

export default ProductosVendidos
