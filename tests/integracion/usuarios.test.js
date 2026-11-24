import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { invocar } from 'electron'
import { CLAVE, crearUsuario, iniciarComo, prepararBase, Usuarios } from '../helpers/base.js'
import '../../src/main/handles/usuarios.handle.js'
import {
  editarUsuario,
  login,
  obtenerUsuarios,
  registro
} from '../../src/main/controllers/usuarios.controller.js'
import { crearRol } from '../../src/main/controllers/roles.controller.js'
import { TODOS_LOS_PERMISOS } from '../../src/main/services/permisos.js'
import { iniciarSesion, obtenerSesion } from '../../src/main/services/sesion.js'

const CREDENCIALES_INVALIDAS = { success: false, message: 'Usuario o contraseña incorrectos' }
const recargar = (usuario) => Usuarios.findByPk(usuario.id_usuario)

beforeEach(async () => {
  await prepararBase()
})

describe('registro', () => {
  it('la primera cuenta siempre es Propietario activo', async () => {
    const respuesta = await registro('ana', 'ana@comercio.test', CLAVE, 'Vendedor', 'Inactivo')
    expect(respuesta).toEqual({ success: true, message: 'Registro exitoso' })
    const guardado = await Usuarios.findOne({ where: { mail: 'ana@comercio.test' } })
    expect(guardado.rol).toBe('Propietario')
    expect(guardado.estado).toBe('Activo')
  })

  it('después de la primera cuenta requiere el permiso usuarios.crear', async () => {
    await crearUsuario({ rol: 'Propietario' })
    const sinSesion = await registro('beto', 'beto@comercio.test', CLAVE, 'Vendedor')
    expect(sinSesion).toEqual({ success: false, message: 'No tiene permisos para crear usuarios' })

    await iniciarComo({ rol: 'Vendedor' })
    const comoVendedor = await registro('beto', 'beto@comercio.test', CLAVE, 'Vendedor')
    expect(comoVendedor).toEqual({
      success: false,
      message: 'No tiene permisos para crear usuarios'
    })
    expect(await Usuarios.findOne({ where: { mail: 'beto@comercio.test' } })).toBeNull()
  })

  it('crea el usuario con el rol pedido si la sesión puede asignarlo', async () => {
    await iniciarComo({ rol: 'Administrador' })
    const respuesta = await registro(' beto ', ' beto@comercio.test ', CLAVE, 'Vendedor')
    expect(respuesta.success).toBe(true)
    const guardado = await Usuarios.findOne({ where: { mail: 'beto@comercio.test' } })
    expect(guardado.usuario).toBe('beto')
    expect(guardado.rol).toBe('Vendedor')
  })

  it('no permite asignar un rol con más permisos que el propio', async () => {
    await iniciarComo({ rol: 'Administrador' })
    const respuesta = await registro('beto', 'beto@comercio.test', CLAVE, 'Propietario')
    expect(respuesta).toEqual({
      success: false,
      message: 'No puede asignar un rol con más permisos que el suyo'
    })
    expect(await Usuarios.findOne({ where: { mail: 'beto@comercio.test' } })).toBeNull()
  })

  it('rechaza un mail repetido aunque tenga espacios', async () => {
    await iniciarComo({ rol: 'Propietario', mail: 'ana@comercio.test' })
    const respuesta = await registro('otra', '  ana@comercio.test ', CLAVE, 'Vendedor')
    expect(respuesta).toEqual({ success: false, message: 'Ya existe un usuario con ese mail' })
    expect(await Usuarios.count()).toBe(1)
  })
})

describe('editarUsuario', () => {
  it('no permite cambiar el propio rol ni el propio estado', async () => {
    const yo = await iniciarComo({ rol: 'Propietario' })
    expect(await editarUsuario(yo.id_usuario, { rol: 'Vendedor' })).toEqual({
      success: false,
      message: 'No puede cambiar su propio rol'
    })
    expect(await editarUsuario(yo.id_usuario, { estado: 'Inactivo' })).toEqual({
      success: false,
      message: 'No puede cambiar su propio estado'
    })
    const guardado = await recargar(yo)
    expect(guardado.rol).toBe('Propietario')
    expect(guardado.estado).toBe('Activo')
  })

  it('no permite editar a un usuario con un rol con más permisos que el propio', async () => {
    const propietario = await crearUsuario({ rol: 'Propietario', usuario: 'dueño' })
    await iniciarComo({ rol: 'Administrador' })
    const respuesta = await editarUsuario(propietario.id_usuario, { usuario: 'cambiado' })
    expect(respuesta).toEqual({
      success: false,
      message: 'No puede editar a un usuario con un rol con más permisos que el suyo'
    })
    expect((await recargar(propietario)).usuario).toBe('dueño')
  })

  it('solo un Propietario edita a un Propietario, aunque otro rol tenga todos los permisos', async () => {
    const propietario = await iniciarComo({ rol: 'Propietario', usuario: 'dueño' })
    expect((await crearRol({ nombre: 'Total', permisos: TODOS_LOS_PERMISOS })).success).toBe(true)
    const total = await crearUsuario({ rol: 'Total' })
    const administrador = await crearUsuario({ rol: 'Administrador', usuario: 'admin' })

    iniciarSesion(total.get({ plain: true }))
    const rechazo = await editarUsuario(propietario.id_usuario, { usuario: 'cambiado' })
    expect(rechazo.success).toBe(false)
    expect((await recargar(propietario)).usuario).toBe('dueño')

    // Ese mismo rol sí puede editar a usuarios que no son Propietario.
    const permitido = await editarUsuario(administrador.id_usuario, { usuario: 'admin2' })
    expect(permitido.success).toBe(true)
    expect((await recargar(administrador)).usuario).toBe('admin2')
  })

  it('siempre queda al menos un Propietario activo', async () => {
    const primero = await crearUsuario({ rol: 'Propietario' })
    const segundo = await crearUsuario({ rol: 'Propietario' })

    iniciarSesion(primero.get({ plain: true }))
    expect((await editarUsuario(segundo.id_usuario, { estado: 'Inactivo' })).success).toBe(true)

    // El segundo sigue con la sesión abierta e intenta dejar sin Propietario activo.
    iniciarSesion(segundo.get({ plain: true }))
    const mensaje = { success: false, message: 'Tiene que quedar al menos un Propietario activo' }
    expect(await editarUsuario(primero.id_usuario, { estado: 'Inactivo' })).toEqual(mensaje)
    expect(await editarUsuario(primero.id_usuario, { rol: 'Administrador' })).toEqual(mensaje)
    const guardado = await recargar(primero)
    expect(guardado.rol).toBe('Propietario')
    expect(guardado.estado).toBe('Activo')
  })

  it('rechaza un mail que ya usa otro usuario, también con espacios', async () => {
    await iniciarComo({ rol: 'Propietario', mail: 'ana@comercio.test' })
    const otro = await crearUsuario({ rol: 'Vendedor', mail: 'beto@comercio.test' })
    const mensaje = { success: false, message: 'Ya existe un usuario con ese mail' }
    expect(await editarUsuario(otro.id_usuario, { mail: 'ana@comercio.test' })).toEqual(mensaje)
    expect(await editarUsuario(otro.id_usuario, { mail: '  ana@comercio.test  ' })).toEqual(mensaje)
    expect((await recargar(otro)).mail).toBe('beto@comercio.test')
  })

  it('acepta el propio mail con espacios alrededor sin informarlo como repetido', async () => {
    await iniciarComo({ rol: 'Propietario', mail: 'ana@comercio.test' })
    const otro = await crearUsuario({ rol: 'Vendedor', mail: 'beto@comercio.test' })
    const respuesta = await editarUsuario(otro.id_usuario, {
      mail: '  beto@comercio.test  ',
      usuario: 'Beto Nuevo'
    })
    expect(respuesta.success).toBe(true)
    const guardado = await recargar(otro)
    expect(guardado.mail).toBe('beto@comercio.test')
    expect(guardado.usuario).toBe('Beto Nuevo')
  })

  it('cambia la contraseña guardándola con hash', async () => {
    await iniciarComo({ rol: 'Propietario' })
    const otro = await crearUsuario({ rol: 'Vendedor', mail: 'beto@comercio.test' })
    const respuesta = await editarUsuario(otro.id_usuario, { password: 'nueva-clave-9' })
    expect(respuesta.success).toBe(true)
    expect(respuesta.usuario).not.toHaveProperty('password')

    const guardada = (await recargar(otro)).password
    expect(guardada).toMatch(/^\$2[aby]\$/)
    expect(await bcrypt.compare('nueva-clave-9', guardada)).toBe(true)
    expect((await login('beto@comercio.test', 'nueva-clave-9')).success).toBe(true)
    expect(await login('beto@comercio.test', CLAVE)).toEqual(CREDENCIALES_INVALIDAS)
  })
})

describe('login', () => {
  it('inicia sesión y no devuelve la contraseña', async () => {
    await crearUsuario({ rol: 'Vendedor', mail: 'beto@comercio.test' })
    const respuesta = await login('beto@comercio.test', CLAVE)
    expect(respuesta.success).toBe(true)
    expect(respuesta.usuario).not.toHaveProperty('password')
    expect(respuesta.usuario.rol).toBe('Vendedor')
    expect(respuesta.usuario.permisos).toContain('ventas.crear')
    expect(obtenerSesion()).toMatchObject({ mail: 'beto@comercio.test', rol: 'Vendedor' })
  })

  it('mail inexistente y contraseña incorrecta devuelven el mismo mensaje', async () => {
    await crearUsuario({ mail: 'ana@comercio.test' })
    expect(await login('nadie@comercio.test', CLAVE)).toEqual(CREDENCIALES_INVALIDAS)
    expect(await login('ana@comercio.test', 'incorrecta')).toEqual(CREDENCIALES_INVALIDAS)
    expect(obtenerSesion()).toBeNull()
  })

  it('un usuario inactivo no entra, y solo se avisa con la contraseña correcta', async () => {
    await crearUsuario({ mail: 'ana@comercio.test', estado: 'Inactivo' })
    expect(await login('ana@comercio.test', 'incorrecta')).toEqual(CREDENCIALES_INVALIDAS)

    const respuesta = await login('ana@comercio.test', CLAVE)
    expect(respuesta.success).toBe(false)
    expect(respuesta.message).toMatch(/inactivo/)
    expect(obtenerSesion()).toBeNull()
  })

  it('el canal login abre la sesión que luego devuelve obtenerSesion', async () => {
    await crearUsuario({ rol: 'Vendedor', mail: 'beto@comercio.test' })
    const respuesta = await invocar('login', { mail: 'beto@comercio.test', password: CLAVE })
    expect(respuesta.success).toBe(true)
    expect(await invocar('obtenerSesion')).toMatchObject({ mail: 'beto@comercio.test' })
  })
})

describe('obtenerUsuarios', () => {
  it('no incluye contraseñas e indica cuáles puede editar la sesión', async () => {
    await crearUsuario({ rol: 'Propietario', mail: 'ana@comercio.test' })
    await iniciarComo({ rol: 'Administrador', mail: 'admin@comercio.test' })
    await crearUsuario({ rol: 'Vendedor', mail: 'beto@comercio.test' })

    const usuarios = await obtenerUsuarios()
    expect(usuarios).toHaveLength(3)
    for (const usuario of usuarios) expect(usuario).not.toHaveProperty('password')
    const editable = Object.fromEntries(usuarios.map((u) => [u.mail, u.editable]))
    expect(editable).toEqual({
      'ana@comercio.test': false,
      'admin@comercio.test': true,
      'beto@comercio.test': true
    })
  })
})
