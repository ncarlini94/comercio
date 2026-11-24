import { beforeEach, describe, expect, it } from 'vitest'
import { invocar } from 'electron'
import { crearUsuario, iniciarComo, prepararBase, Roles, Usuarios } from '../helpers/base.js'
import '../../src/main/handles/ventas.handle.js'
import {
  actualizarRol,
  crearRol,
  eliminarRol,
  obtenerRoles
} from '../../src/main/controllers/roles.controller.js'
import { TODOS_LOS_PERMISOS } from '../../src/main/services/permisos.js'
import { iniciarSesion, sesionTienePermiso } from '../../src/main/services/sesion.js'

const PERMISOS_VENDEDOR = [
  'dashboard.ver',
  'ventas.ver',
  'ventas.crear',
  'inventario.ver',
  'proveedores.ver',
  'pedidos.ver'
]

const buscarRol = (nombre) => Roles.findOne({ where: { nombre } })
const permisosGuardados = async (nombre) => JSON.parse((await buscarRol(nombre)).permisos)

beforeEach(async () => {
  await prepararBase()
})

describe('roles iniciales', () => {
  it('crea Propietario, Administrador y Vendedor con sus permisos', async () => {
    await iniciarComo({ rol: 'Propietario' })
    const roles = await obtenerRoles()
    expect(roles.map((r) => r.nombre)).toEqual(['Propietario', 'Administrador', 'Vendedor'])

    const [propietario, administrador, vendedor] = roles
    expect(TODOS_LOS_PERMISOS).toHaveLength(24)
    expect(propietario.permisos).toEqual(TODOS_LOS_PERMISOS)
    expect(propietario.sistema).toBe(true)
    expect(administrador.permisos).toEqual(
      TODOS_LOS_PERMISOS.filter((p) => p !== 'configuracion.restaurar')
    )
    expect(vendedor.permisos).toEqual(PERMISOS_VENDEDOR)
    expect(propietario.usuarios).toBe(1)
  })
})

describe('crearRol', () => {
  it('guarda el nombre sin espacios y sin permisos repetidos', async () => {
    await iniciarComo({ rol: 'Propietario' })
    const respuesta = await crearRol({
      nombre: '  Cajero  ',
      descripcion: ' Cobra ',
      permisos: ['ventas.ver', 'ventas.ver']
    })
    expect(respuesta).toEqual({ success: true, message: 'Rol creado' })
    const rol = await buscarRol('Cajero')
    expect(rol.descripcion).toBe('Cobra')
    expect(JSON.parse(rol.permisos)).toEqual(['ventas.ver'])
  })

  it('rechaza un nombre repetido sin distinguir mayúsculas ni espacios', async () => {
    await iniciarComo({ rol: 'Propietario' })
    const respuesta = await crearRol({ nombre: '  vendedor ', permisos: [] })
    expect(respuesta).toEqual({ success: false, message: 'Ya existe un rol con ese nombre' })
    expect(await Roles.count()).toBe(3)
  })

  it('rechaza un permiso desconocido', async () => {
    await iniciarComo({ rol: 'Propietario' })
    const respuesta = await crearRol({ nombre: 'Cajero', permisos: ['ventas.ver', 'cosa.rara'] })
    expect(respuesta).toEqual({ success: false, message: 'Permisos desconocidos: cosa.rara' })
    expect(await buscarRol('Cajero')).toBeNull()
  })

  it('no permite dar permisos que la sesión no tiene', async () => {
    await iniciarComo({ rol: 'Administrador' })
    const respuesta = await crearRol({
      nombre: 'Restaurador',
      permisos: ['configuracion.restaurar']
    })
    expect(respuesta).toEqual({
      success: false,
      message: 'No puede dar permisos que usted no tiene'
    })
    expect(await buscarRol('Restaurador')).toBeNull()
  })
})

describe('actualizarRol y eliminarRol', () => {
  it('el rol Propietario no se puede modificar ni borrar', async () => {
    await iniciarComo({ rol: 'Propietario' })
    const propietario = await buscarRol('Propietario')
    expect(await actualizarRol(propietario.id, { nombre: 'Dueño', permisos: [] })).toEqual({
      success: false,
      message: 'El rol Propietario no se puede modificar'
    })
    expect(await eliminarRol(propietario.id)).toEqual({
      success: false,
      message: 'El rol Propietario no se puede borrar'
    })
    expect(await buscarRol('Propietario')).not.toBeNull()
  })

  it('nadie puede modificar su propio rol', async () => {
    await iniciarComo({ rol: 'Administrador' })
    const administrador = await buscarRol('Administrador')
    const respuesta = await actualizarRol(administrador.id, {
      nombre: 'Administrador',
      permisos: ['dashboard.ver']
    })
    expect(respuesta).toEqual({ success: false, message: 'No puede modificar su propio rol' })
    expect(await permisosGuardados('Administrador')).toContain('usuarios.editar')
  })

  it('renombrar un rol actualiza el rol de sus usuarios', async () => {
    await iniciarComo({ rol: 'Propietario' })
    const vendedor = await crearUsuario({ rol: 'Vendedor' })
    const rol = await buscarRol('Vendedor')
    const respuesta = await actualizarRol(rol.id, {
      nombre: 'Cajero',
      permisos: PERMISOS_VENDEDOR
    })
    expect(respuesta).toEqual({ success: true, message: 'Rol actualizado' })
    expect(await buscarRol('Vendedor')).toBeNull()
    expect((await Usuarios.findByPk(vendedor.id_usuario)).rol).toBe('Cajero')
  })

  it('no se borra un rol con usuarios; sin usuarios sí', async () => {
    await iniciarComo({ rol: 'Propietario' })
    const vendedor = await crearUsuario({ rol: 'Vendedor' })
    const rol = await buscarRol('Vendedor')

    const rechazo = await eliminarRol(rol.id)
    expect(rechazo.success).toBe(false)
    expect(rechazo.message).toMatch(/1 usuario\(s\) tienen este rol/)
    expect(await buscarRol('Vendedor')).not.toBeNull()

    await vendedor.update({ rol: 'Administrador' })
    expect(await eliminarRol(rol.id)).toEqual({ success: true, message: 'Rol borrado' })
    expect(await buscarRol('Vendedor')).toBeNull()
  })

  it('los cambios de permisos se aplican en el momento a la sesión', async () => {
    const propietario = await iniciarComo({ rol: 'Propietario' })
    const vendedor = await crearUsuario({ rol: 'Vendedor' })
    const rol = await buscarRol('Vendedor')

    await actualizarRol(rol.id, {
      nombre: 'Vendedor',
      permisos: [...PERMISOS_VENDEDOR, 'ventas.anular']
    })
    iniciarSesion(vendedor.get({ plain: true }))
    expect(sesionTienePermiso('ventas.anular')).toBe(true)

    iniciarSesion(propietario.get({ plain: true }))
    await actualizarRol(rol.id, { nombre: 'Vendedor', permisos: ['dashboard.ver'] })
    iniciarSesion(vendedor.get({ plain: true }))
    expect(sesionTienePermiso('ventas.ver')).toBe(false)
    expect(await invocar('obtenerTodasLasVentas')).toMatchObject({ sinPermisos: true })
  })
})
