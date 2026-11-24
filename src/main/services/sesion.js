import { permisosDeRol, rolTienePermiso } from './permisos.js'

// Sesión del usuario logueado, guardada en el proceso principal.
// El renderer no puede modificarla: solo se establece con un login válido.
let sesionActual = null

export const iniciarSesion = (usuario) => {
  sesionActual = {
    id_usuario: usuario.id_usuario,
    usuario: usuario.usuario,
    mail: usuario.mail,
    rol: usuario.rol
  }
  return sesionConPermisos()
}

export const obtenerSesion = () => sesionActual

// Sesión con la lista de permisos actual de su rol (para la interfaz).
export const sesionConPermisos = () =>
  sesionActual ? { ...sesionActual, permisos: permisosDeRol(sesionActual.rol) } : null

export const sesionTienePermiso = (permiso) =>
  !!sesionActual && rolTienePermiso(sesionActual.rol, permiso)

export const sesionTieneAlgunPermiso = (permisos) => permisos.some(sesionTienePermiso)

export const cerrarSesion = () => {
  sesionActual = null
}
