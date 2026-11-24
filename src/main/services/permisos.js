import Roles from '../models/roles.model.js'

// Catálogo de permisos por acción. Es la única lista válida: los roles solo pueden tener estos.
export const CATALOGO_PERMISOS = [
  { id: 'dashboard.ver', seccion: 'Dashboard', nombre: 'Ver el panel de control' },

  { id: 'ventas.ver', seccion: 'Ventas', nombre: 'Ver ventas' },
  { id: 'ventas.crear', seccion: 'Ventas', nombre: 'Crear venta' },
  { id: 'ventas.anular', seccion: 'Ventas', nombre: 'Anular venta' },

  { id: 'inventario.ver', seccion: 'Inventario', nombre: 'Ver productos' },
  { id: 'inventario.crear', seccion: 'Inventario', nombre: 'Crear producto' },
  { id: 'inventario.editar', seccion: 'Inventario', nombre: 'Editar producto y precio' },
  { id: 'inventario.eliminar', seccion: 'Inventario', nombre: 'Borrar producto' },

  { id: 'proveedores.ver', seccion: 'Proveedores', nombre: 'Ver proveedores' },
  { id: 'proveedores.crear', seccion: 'Proveedores', nombre: 'Crear proveedor' },
  { id: 'proveedores.editar', seccion: 'Proveedores', nombre: 'Editar proveedor' },
  { id: 'proveedores.eliminar', seccion: 'Proveedores', nombre: 'Borrar proveedor' },

  { id: 'pedidos.ver', seccion: 'Pedidos', nombre: 'Ver pedidos' },
  { id: 'pedidos.crear', seccion: 'Pedidos', nombre: 'Crear pedido' },
  {
    id: 'pedidos.cambiarEstado',
    seccion: 'Pedidos',
    nombre: 'Cambiar estado (aprobar suma el stock)'
  },
  { id: 'pedidos.eliminar', seccion: 'Pedidos', nombre: 'Borrar pedido' },

  { id: 'usuarios.ver', seccion: 'Usuarios', nombre: 'Ver usuarios' },
  { id: 'usuarios.crear', seccion: 'Usuarios', nombre: 'Crear usuario' },
  {
    id: 'usuarios.editar',
    seccion: 'Usuarios',
    nombre: 'Editar usuario (rol, estado, contraseña)'
  },

  { id: 'roles.gestionar', seccion: 'Roles', nombre: 'Crear, editar y borrar roles' },

  { id: 'configuracion.importar', seccion: 'Configuración', nombre: 'Importar datos' },
  { id: 'configuracion.exportar', seccion: 'Configuración', nombre: 'Exportar datos' },
  {
    id: 'configuracion.respaldos',
    seccion: 'Configuración',
    nombre: 'Configurar y crear copias de seguridad'
  },
  {
    id: 'configuracion.restaurar',
    seccion: 'Configuración',
    nombre: 'Restaurar una copia (reemplaza todos los datos)'
  }
]

export const TODOS_LOS_PERMISOS = CATALOGO_PERMISOS.map((p) => p.id)
export const ROL_PROPIETARIO = 'Propietario'

// Roles que se crean la primera vez. Propietario siempre tiene todos los permisos.
const ROLES_INICIALES = [
  {
    nombre: 'Administrador',
    descripcion: 'Gestiona el comercio, los usuarios y la configuración',
    permisos: TODOS_LOS_PERMISOS.filter((p) => p !== 'configuracion.restaurar')
  },
  {
    nombre: 'Vendedor',
    descripcion: 'Registra ventas y consulta el stock',
    permisos: [
      'dashboard.ver',
      'ventas.ver',
      'ventas.crear',
      'inventario.ver',
      'proveedores.ver',
      'pedidos.ver'
    ]
  }
]

// Copia en memoria de los permisos de cada rol; se recarga cada vez que cambia un rol.
let permisosPorRol = new Map()

const leerPermisos = (texto) => {
  try {
    const lista = JSON.parse(texto)
    return Array.isArray(lista) ? lista.filter((p) => TODOS_LOS_PERMISOS.includes(p)) : []
  } catch {
    return []
  }
}

export const recargarRoles = async () => {
  const roles = await Roles.findAll({ raw: true })
  permisosPorRol = new Map(
    roles.map((r) => [
      r.nombre,
      new Set(r.nombre === ROL_PROPIETARIO ? TODOS_LOS_PERMISOS : leerPermisos(r.permisos))
    ])
  )
}

// Crea Propietario si falta y, en una base sin roles, también Administrador y Vendedor.
export const inicializarRoles = async () => {
  const existentes = await Roles.count()
  const propietario = await Roles.findOne({ where: { nombre: ROL_PROPIETARIO } })
  if (!propietario) {
    await Roles.create({
      nombre: ROL_PROPIETARIO,
      descripcion: 'Dueño del comercio, con todos los permisos',
      permisos: JSON.stringify(TODOS_LOS_PERMISOS),
      sistema: true
    })
  }
  if (existentes === 0) {
    for (const rol of ROLES_INICIALES) {
      await Roles.create({ ...rol, permisos: JSON.stringify(rol.permisos) })
    }
  }
  await recargarRoles()
}

export const permisosDeRol = (nombreRol) => [...(permisosPorRol.get(nombreRol) ?? [])]

export const rolExiste = (nombreRol) => permisosPorRol.has(nombreRol)

export const rolTienePermiso = (nombreRol, permiso) =>
  permisosPorRol.get(nombreRol)?.has(permiso) ?? false

// true si todos los permisos de "subconjunto" están en el rol "rol". Evita que alguien asigne
// o cree un rol con más permisos que los propios.
export const permisosIncluidos = (subconjunto, nombreRol) => {
  const propios = permisosPorRol.get(nombreRol)
  return !!propios && subconjunto.every((p) => propios.has(p))
}

export { leerPermisos }
