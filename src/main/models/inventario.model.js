import { DataTypes } from '@sequelize/core'
import sequelize from '../db.js'
import Proveedores from './proveedores.model.js'

const Inventario = sequelize.define(
  'Inventario',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    costo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    stock_minimo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'Inventario',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

Inventario.belongsTo(Proveedores, {
  foreignKey: 'id_proveedor',
  as: 'Proveedor'
})

export default Inventario
