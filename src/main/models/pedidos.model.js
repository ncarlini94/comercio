import { DataTypes } from '@sequelize/core'
import sequelize from '../db.js'

const Pedidos = sequelize.define(
  'Pedidos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    proveedor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'Pedido', 'Aprobado', 'Cancelado'),
      allowNull: true,
      defaultValue: 'Pendiente'
    },
    nota: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

export default Pedidos
