import { DataTypes } from '@sequelize/core'
import sequelize from '../db.js'

// Los usuarios referencian el rol por su nombre (Usuarios.rol), así las bases existentes
// siguen funcionando sin migrar datos.
const Roles = sequelize.define(
  'Roles',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    // Lista de permisos en JSON, por ejemplo ["ventas.ver","ventas.crear"].
    permisos: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]'
    },
    // Rol del sistema (Propietario): no se puede editar ni borrar.
    sistema: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'Roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

export default Roles
