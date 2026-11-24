import Usuarios from '../models/usuarios.model.js'
import jwt from 'jsonwebtoken'
import {
  descifrarContraseniaAnterior,
  esHashBcrypt,
  hashearContrasenia,
  igualarTiempoDeRespuesta,
  verificarContrasenia
} from '../services/contrasenias.js'
import { cerrarSesion, iniciarSesion, obtenerSesion, sesionTieneRol } from '../services/sesion.js'

const SECRET = 'COMERCIO'
const ROLES = ['Propietario', 'Administrador', 'Vendedor']
const ROLES_GESTION_USUARIOS = ['Propietario', 'Administrador']

const puedeGestionarUsuarios = () => sesionTieneRol(ROLES_GESTION_USUARIOS)

export const existenUsuarios = async () => {
  const total = await Usuarios.count()
  return total > 0
}

export const login = async (mail, password) => {
  // Cualquier intento de login termina la sesión anterior, aunque falle.
  cerrarSesion()
  try {
    if (typeof mail !== 'string' || typeof password !== 'string') {
      return { success: false, message: 'Usuario o contraseña incorrectos' }
    }
    const usuario = await Usuarios.findOne({
      where: { mail }
    })
    if (usuario) {
      const { valida, formatoAnterior } = await verificarContrasenia(password, usuario.password)
      if (valida) {
        // Si quedó en el formato anterior (cifrado por equipo), se pasa a bcrypt.
        if (formatoAnterior) {
          await usuario
            .update({ password: await hashearContrasenia(password) })
            .catch((error) => console.error('No se pudo actualizar la contraseña:', error))
        }
        const token = jwt.sign(
          { id: usuario.id_usuario, mail: usuario.mail, usuario: usuario.usuario },
          SECRET
        )
        const sesion = iniciarSesion(usuario.get({ plain: true }))
        return {
          success: true,
          message: 'Login exitoso',
          usuario: sesion,
          token
        }
      } else {
        return {
          success: false,
          message: 'Usuario o contraseña incorrectos'
        }
      }
    } else {
      // Mismo trabajo que con una contraseña incorrecta, para no revelar qué mails existen.
      await igualarTiempoDeRespuesta(password)
      return {
        success: false,
        message: 'Usuario o contraseña incorrectos'
      }
    }
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
      rol = 'Propietario'
    } else {
      const sesion = obtenerSesion()
      if (!puedeGestionarUsuarios()) {
        return { success: false, message: 'No tiene permisos para crear usuarios' }
      }
      if (!ROLES.includes(rol)) {
        return { success: false, message: 'Rol inválido' }
      }
      if (rol === 'Propietario' && sesion.rol !== 'Propietario') {
        return {
          success: false,
          message: 'Solo un Propietario puede crear otro Propietario'
        }
      }
    }

    const verificar = await Usuarios.findOne({
      where: { mail }
    })
    if (verificar) {
      return {
        success: false,
        message: 'El usuario ya existe'
      }
    }
    // bcrypt solo usa los primeros 72 bytes: una contraseña más larga se rechaza.
    if (typeof password !== 'string' || password.length === 0) {
      return { success: false, message: 'La contraseña es obligatoria' }
    }
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return { success: false, message: 'La contraseña es demasiado larga (máximo 72 caracteres)' }
    }
    await Usuarios.create({
      usuario,
      password: await hashearContrasenia(password),
      mail,
      rol,
      estado
    })
    return {
      success: true,
      message: 'Registro exitoso'
    }
  } catch (error) {
    console.error('Error al realizar registro:', error)
    return { success: false, message: 'Error al realizar registro' }
  }
}

export const obtenerUsuarios = async () => {
  if (!puedeGestionarUsuarios()) {
    return { success: false, error: 'No tiene permisos para ver usuarios' }
  }
  try {
    const usuarios = await Usuarios.findAll({
      attributes: { exclude: ['password'] }
    })
    return usuarios.map((p) => p.toJSON())
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return { success: false, error: 'Error al obtener usuarios' }
  }
}
