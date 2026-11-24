import Usuarios from '../models/usuarios.model.js'
import {
  descifrarContraseniaAnterior,
  esHashBcrypt,
  hashearContrasenia,
  igualarTiempoDeRespuesta,
  verificarContrasenia
} from '../services/contrasenias.js'
import {
  cerrarSesion,
  iniciarSesion,
  obtenerSesion,
  sesionConPermisos,
  sesionTienePermiso
} from '../services/sesion.js'
import {
  permisosDeRol,
  permisosIncluidos,
  rolExiste,
  ROL_PROPIETARIO
} from '../services/permisos.js'

const ESTADOS = ['Activo', 'Inactivo']
const CREDENCIALES_INVALIDAS = { success: false, message: 'Usuario o contraseña incorrectos' }

// Un usuario solo puede asignar roles (y editar usuarios con roles) cuyos permisos ya tiene.
const puedeAsignarRol = (rol) => permisosIncluidos(permisosDeRol(rol), obtenerSesion()?.rol)

// A un Propietario solo lo edita otro Propietario, aunque exista un rol con todos los permisos.
const puedeEditarUsuarioCon = (rol) =>
  puedeAsignarRol(rol) && (rol !== ROL_PROPIETARIO || obtenerSesion()?.rol === ROL_PROPIETARIO)

const validarContrasenia = (password) => {
  if (typeof password !== 'string' || password.length === 0) return 'La contraseña es obligatoria'
  // bcrypt solo usa los primeros 72 bytes: una contraseña más larga se rechaza.
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return 'La contraseña es demasiado larga (máximo 72 caracteres)'
  }
  return null
}

const validarTexto = (valor, campo) =>
  typeof valor === 'string' && valor.trim().length > 0 ? null : `Falta ${campo}`

const sinContrasenia = (usuario) => {
  const { password: _password, ...resto } = usuario.get({ plain: true })
  return resto
}

const propietariosActivos = () =>
  Usuarios.count({ where: { rol: ROL_PROPIETARIO, estado: 'Activo' } })

export const existenUsuarios = async () => {
  const total = await Usuarios.count()
  return total > 0
}

export const login = async (mail, password) => {
  // Cualquier intento de login termina la sesión anterior, aunque falle.
  cerrarSesion()
  try {
    if (typeof mail !== 'string' || typeof password !== 'string') return CREDENCIALES_INVALIDAS
    const usuario = await Usuarios.findOne({ where: { mail } })
    if (!usuario) {
      // Mismo trabajo que con una contraseña incorrecta, para no revelar qué mails existen.
      await igualarTiempoDeRespuesta(password)
      return CREDENCIALES_INVALIDAS
    }
    const { valida, formatoAnterior } = await verificarContrasenia(password, usuario.password)
    if (!valida) return CREDENCIALES_INVALIDAS

    // Se informa solo después de validar la contraseña.
    if (usuario.estado !== 'Activo') {
      return { success: false, message: 'El usuario está inactivo. Consulte al administrador.' }
    }
    if (!rolExiste(usuario.rol)) {
      return { success: false, message: 'El usuario no tiene un rol válido asignado' }
    }
    // Si quedó en el formato anterior (cifrado por equipo), se pasa a bcrypt.
    if (formatoAnterior) {
      await usuario
        .update({ password: await hashearContrasenia(password) })
        .catch((error) => console.error('No se pudo actualizar la contraseña:', error))
    }
    return { success: true, message: 'Login exitoso', usuario: iniciarSesion(usuario.get()) }
  } catch (error) {
    console.error('Error al realizar login:', error)
    return { success: false, message: 'Error al realizar login' }
  }
}

// Pasa a bcrypt todas las contraseñas del formato anterior que se puedan leer en este equipo.
// Las que no se pueden leer (base traída de otra PC) quedan igual y se informan.
export const migrarContraseniasAnteriores = async () => {
  const usuarios = await Usuarios.findAll({ attributes: ['id_usuario', 'mail', 'password'] })
  let migradas = 0
  const noLegibles = []
  let fallidas = 0
  for (const usuario of usuarios) {
    if (esHashBcrypt(usuario.password)) continue
    const anterior = descifrarContraseniaAnterior(usuario.password)
    if (anterior === null) {
      noLegibles.push(usuario.mail)
      continue
    }
    // Un error en un usuario no frena al resto; se reintenta al próximo inicio o en su login.
    try {
      await usuario.update({ password: await hashearContrasenia(anterior) })
      migradas++
    } catch (error) {
      fallidas++
      console.error(`No se pudo migrar la contraseña del usuario ${usuario.id_usuario}:`, error)
    }
  }
  if (migradas > 0) console.log(`Contraseñas pasadas a bcrypt: ${migradas}`)
  if (noLegibles.length > 0) {
    console.warn(`Contraseñas que no se pudieron leer en este equipo: ${noLegibles.length}`)
  }
  return { migradas, noLegibles, fallidas }
}

export const registro = async (usuario, mail, password, rol, estado = 'Activo') => {
  try {
    const esPrimerUsuario = !(await existenUsuarios())

    if (esPrimerUsuario) {
      // La primera cuenta del sistema siempre es la del Propietario.
      rol = ROL_PROPIETARIO
      estado = 'Activo'
    } else {
      if (!sesionTienePermiso('usuarios.crear')) {
        return { success: false, message: 'No tiene permisos para crear usuarios' }
      }
      if (!rolExiste(rol)) return { success: false, message: 'Rol inválido' }
      if (!puedeAsignarRol(rol)) {
        return { success: false, message: 'No puede asignar un rol con más permisos que el suyo' }
      }
      if (!ESTADOS.includes(estado)) return { success: false, message: 'Estado inválido' }
    }

    const error =
      validarTexto(usuario, 'el nombre de usuario') ||
      validarTexto(mail, 'el mail') ||
      validarContrasenia(password)
    if (error) return { success: false, message: error }

    // Se compara sin espacios, igual que como se guarda.
    if (await Usuarios.findOne({ where: { mail: mail.trim() } })) {
      return { success: false, message: 'Ya existe un usuario con ese mail' }
    }
    await Usuarios.create({
      usuario: usuario.trim(),
      password: await hashearContrasenia(password),
      mail: mail.trim(),
      rol,
      estado
    })
    return { success: true, message: 'Registro exitoso' }
  } catch (error) {
    console.error('Error al realizar registro:', error)
    return { success: false, message: 'Error al realizar registro' }
  }
}

// cambios: { usuario?, mail?, rol?, estado?, password? }
export const editarUsuario = async (id, cambios = {}) => {
  try {
    const sesion = obtenerSesion()
    const usuario = await Usuarios.findByPk(id)
    if (!usuario) return { success: false, message: 'Usuario no encontrado' }

    if (!puedeEditarUsuarioCon(usuario.rol)) {
      return {
        success: false,
        message: 'No puede editar a un usuario con un rol con más permisos que el suyo'
      }
    }

    const esUnoMismo = usuario.id_usuario === sesion.id_usuario
    const nuevo = {}

    if (cambios.usuario !== undefined) {
      const error = validarTexto(cambios.usuario, 'el nombre de usuario')
      if (error) return { success: false, message: error }
      nuevo.usuario = cambios.usuario.trim()
    }
    if (cambios.mail !== undefined && cambios.mail !== usuario.mail) {
      const error = validarTexto(cambios.mail, 'el mail')
      if (error) return { success: false, message: error }
      if (await Usuarios.findOne({ where: { mail: cambios.mail.trim() } })) {
        return { success: false, message: 'Ya existe un usuario con ese mail' }
      }
      nuevo.mail = cambios.mail.trim()
    }
    if (cambios.rol !== undefined && cambios.rol !== usuario.rol) {
      if (esUnoMismo) return { success: false, message: 'No puede cambiar su propio rol' }
      if (!rolExiste(cambios.rol)) return { success: false, message: 'Rol inválido' }
      if (!puedeAsignarRol(cambios.rol)) {
        return { success: false, message: 'No puede asignar un rol con más permisos que el suyo' }
      }
      nuevo.rol = cambios.rol
    }
    if (cambios.estado !== undefined && cambios.estado !== usuario.estado) {
      if (esUnoMismo) return { success: false, message: 'No puede cambiar su propio estado' }
      if (!ESTADOS.includes(cambios.estado)) return { success: false, message: 'Estado inválido' }
      nuevo.estado = cambios.estado
    }
    if (cambios.password !== undefined && cambios.password !== '') {
      const error = validarContrasenia(cambios.password)
      if (error) return { success: false, message: error }
      nuevo.password = await hashearContrasenia(cambios.password)
    }

    // Siempre tiene que quedar al menos un Propietario activo.
    const dejaDeSerPropietarioActivo =
      usuario.rol === ROL_PROPIETARIO &&
      usuario.estado === 'Activo' &&
      ((nuevo.rol && nuevo.rol !== ROL_PROPIETARIO) || nuevo.estado === 'Inactivo')
    if (dejaDeSerPropietarioActivo && (await propietariosActivos()) <= 1) {
      return { success: false, message: 'Tiene que quedar al menos un Propietario activo' }
    }

    if (Object.keys(nuevo).length === 0) {
      return { success: true, message: 'Sin cambios', usuario: sinContrasenia(usuario) }
    }
    await usuario.update(nuevo)
    // Si se editó a sí mismo (nombre o mail), se actualiza la sesión.
    if (esUnoMismo) iniciarSesion(usuario.get())
    return { success: true, message: 'Usuario actualizado', usuario: sinContrasenia(usuario) }
  } catch (error) {
    console.error('Error al editar usuario:', error)
    return { success: false, message: 'Error al editar el usuario' }
  }
}

export const obtenerUsuarios = async () => {
  try {
    const usuarios = await Usuarios.findAll({ attributes: { exclude: ['password'] } })
    // "editable" le indica a la interfaz si se puede editar según los permisos de la sesión.
    const puedeEditar = sesionTienePermiso('usuarios.editar')
    return usuarios.map((u) => ({
      ...u.toJSON(),
      editable: puedeEditar && puedeEditarUsuarioCon(u.rol)
    }))
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return { success: false, error: 'Error al obtener usuarios' }
  }
}

export { sesionConPermisos }
