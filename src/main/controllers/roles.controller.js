import sequelize from '../db.js'
import Roles from '../models/roles.model.js'
import Usuarios from '../models/usuarios.model.js'
import {
  CATALOGO_PERMISOS,
  leerPermisos,
  permisosDeRol,
  permisosIncluidos,
  recargarRoles,
  ROL_PROPIETARIO,
  TODOS_LOS_PERMISOS
} from '../services/permisos.js'
import { obtenerSesion } from '../services/sesion.js'

const MAX_NOMBRE = 40

const rolDeSesion = () => obtenerSesion()?.rol

// Se puede gestionar un rol si sus permisos están incluidos en los propios.
const puedeGestionar = (permisos) => permisosIncluidos(permisos, rolDeSesion())

const validarDatos = async ({ nombre, descripcion = '', permisos }, idActual = null) => {
  if (typeof nombre !== 'string' || nombre.trim().length === 0) return 'Falta el nombre del rol'
  if (nombre.trim().length > MAX_NOMBRE) return `El nombre admite hasta ${MAX_NOMBRE} caracteres`
  if (typeof descripcion !== 'string') return 'Descripción inválida'
  if (!Array.isArray(permisos)) return 'Permisos inválidos'
  const invalidos = permisos.filter((p) => !TODOS_LOS_PERMISOS.includes(p))
  if (invalidos.length > 0) return `Permisos desconocidos: ${invalidos.join(', ')}`
  if (!puedeGestionar(permisos)) return 'No puede dar permisos que usted no tiene'

  // Nombre único sin distinguir mayúsculas.
  const roles = await Roles.findAll({ attributes: ['id', 'nombre'], raw: true })
  const repetido = roles.find(
    (r) => r.id !== idActual && r.nombre.toLowerCase() === nombre.trim().toLowerCase()
  )
  if (repetido) return 'Ya existe un rol con ese nombre'
  return null
}

const aRespuesta = (rol, usuariosPorRol) => {
  const permisos = rol.nombre === ROL_PROPIETARIO ? TODOS_LOS_PERMISOS : leerPermisos(rol.permisos)
  return {
    id: rol.id,
    nombre: rol.nombre,
    descripcion: rol.descripcion,
    permisos,
    sistema: Boolean(rol.sistema),
    usuarios: usuariosPorRol.get(rol.nombre) ?? 0,
    // Para la interfaz: si la sesión puede asignarlo o editarlo.
    asignable: puedeGestionar(permisos),
    editable: !rol.sistema && rol.nombre !== rolDeSesion() && puedeGestionar(permisos)
  }
}

export const obtenerCatalogoPermisos = () => CATALOGO_PERMISOS

export const obtenerRoles = async () => {
  const roles = await Roles.findAll({ order: [['id', 'ASC']], raw: true })
  const conteos = await Usuarios.findAll({
    attributes: ['rol', [sequelize.fn('COUNT', sequelize.col('id_usuario')), 'total']],
    group: ['rol'],
    raw: true
  })
  const usuariosPorRol = new Map(conteos.map((c) => [c.rol, Number(c.total)]))
  return roles.map((r) => aRespuesta(r, usuariosPorRol))
}

export const crearRol = async (datos = {}) => {
  try {
    const error = await validarDatos(datos)
    if (error) return { success: false, message: error }
    const permisos = [...new Set(datos.permisos)]
    await Roles.create({
      nombre: datos.nombre.trim(),
      descripcion: (datos.descripcion ?? '').trim(),
      permisos: JSON.stringify(permisos)
    })
    // El cambio ya quedó guardado; si falla la recarga, se reintenta en el próximo cambio o al reiniciar.
    await recargarRoles().catch((error) => console.error('Error al recargar roles:', error))
    return { success: true, message: 'Rol creado' }
  } catch (error) {
    console.error('Error al crear rol:', error)
    return { success: false, message: 'Error al crear el rol' }
  }
}

export const actualizarRol = async (id, datos = {}) => {
  try {
    const rol = await Roles.findByPk(id)
    if (!rol) return { success: false, message: 'Rol no encontrado' }
    if (rol.sistema) return { success: false, message: 'El rol Propietario no se puede modificar' }
    if (rol.nombre === rolDeSesion()) {
      return { success: false, message: 'No puede modificar su propio rol' }
    }
    if (!puedeGestionar(permisosDeRol(rol.nombre))) {
      return { success: false, message: 'No puede modificar un rol con más permisos que el suyo' }
    }
    const error = await validarDatos(datos, rol.id)
    if (error) return { success: false, message: error }

    const nombreAnterior = rol.nombre
    const nombreNuevo = datos.nombre.trim()
    // El cambio de nombre se aplica también a los usuarios que tienen ese rol.
    await sequelize.transaction(async (transaction) => {
      await rol.update(
        {
          nombre: nombreNuevo,
          descripcion: (datos.descripcion ?? '').trim(),
          permisos: JSON.stringify([...new Set(datos.permisos)])
        },
        { transaction }
      )
      if (nombreNuevo !== nombreAnterior) {
        await Usuarios.update({ rol: nombreNuevo }, { where: { rol: nombreAnterior }, transaction })
      }
    })
    // El cambio ya quedó guardado; si falla la recarga, se reintenta en el próximo cambio o al reiniciar.
    await recargarRoles().catch((error) => console.error('Error al recargar roles:', error))
    return { success: true, message: 'Rol actualizado' }
  } catch (error) {
    console.error('Error al actualizar rol:', error)
    return { success: false, message: 'Error al actualizar el rol' }
  }
}

export const eliminarRol = async (id) => {
  try {
    const rol = await Roles.findByPk(id)
    if (!rol) return { success: false, message: 'Rol no encontrado' }
    if (rol.sistema) return { success: false, message: 'El rol Propietario no se puede borrar' }
    if (!puedeGestionar(permisosDeRol(rol.nombre))) {
      return { success: false, message: 'No puede borrar un rol con más permisos que el suyo' }
    }
    const asignados = await Usuarios.count({ where: { rol: rol.nombre } })
    if (asignados > 0) {
      return {
        success: false,
        message: `No se puede borrar: ${asignados} usuario(s) tienen este rol. Asígneles otro rol primero.`
      }
    }
    await rol.destroy()
    // El cambio ya quedó guardado; si falla la recarga, se reintenta en el próximo cambio o al reiniciar.
    await recargarRoles().catch((error) => console.error('Error al recargar roles:', error))
    return { success: true, message: 'Rol borrado' }
  } catch (error) {
    console.error('Error al borrar rol:', error)
    return { success: false, message: 'Error al borrar el rol' }
  }
}
