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
  return sesionActual
}

export const obtenerSesion = () => sesionActual

export const sesionTieneRol = (roles) => !!sesionActual && roles.includes(sesionActual.rol)

export const cerrarSesion = () => {
  sesionActual = null
}
