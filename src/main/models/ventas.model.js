import { DataTypes } from '@sequelize/core'
import sequelize from '../db.js'
import ProductosVendidos from './productosVendidos.model.js'

const Ventas = sequelize.define(
  'Ventas',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    metodo: {
      type: DataTypes.ENUM('Efectivo', 'Mercado Pago', 'Debito', 'Credito'),
      allowNull: false
    },
    vendedor: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

Ventas.hasMany(ProductosVendidos, {
  foreignKey: 'id_ventas',
  as: 'Productos_vendidos'
})

export default Ventas
