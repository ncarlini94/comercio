import { DataTypes } from '@sequelize/core'
import sequelize from '../db.js'

const Usuarios = sequelize.define(
  'Usuarios',
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    rol: {
      // Nombre del rol (tabla Roles). En SQLite la columna ya era TEXT, no hace falta migrar.
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'Activo',
      allowNull: false
    }
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

export default Usuarios
