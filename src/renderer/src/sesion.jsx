import { createContext, useContext } from 'react'
import {
  BarChart3,
  FileText,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users
} from 'lucide-react'

// Secciones de la app y el permiso que habilita cada una (con una lista, alcanza con uno).
// Ocultar algo en la interfaz es solo comodidad: el proceso principal valida cada acción.
export const SECCIONES = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/', permisos: ['dashboard.ver'] },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart, path: '/ventas', permisos: ['ventas.ver'] },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: Package,
    path: '/inventario',
    permisos: ['inventario.ver']
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: Truck,
    path: '/proveedores',
    permisos: ['proveedores.ver']
  },
  { id: 'pedidos', label: 'Pedidos', icon: FileText, path: '/pedidos', permisos: ['pedidos.ver'] },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: Users,
    path: '/usuarios',
    permisos: ['usuarios.ver'],
    admin: true
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: ShieldCheck,
    path: '/roles',
    permisos: ['roles.gestionar'],
    admin: true
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: Settings,
    path: '/configuracion',
    permisos: [
      'configuracion.importar',
      'configuracion.exportar',
      'configuracion.respaldos',
      'configuracion.restaurar'
    ],
    admin: true
  }
]

export const SesionContext = createContext({ sesion: null, recargarSesion: async () => {} })

export const usePermisos = () => {
  const { sesion, recargarSesion } = useContext(SesionContext)
  const permisos = new Set(sesion?.permisos ?? [])
  const puede = (permiso) => permisos.has(permiso)
  const puedeAlguno = (lista) => lista.some(puede)
  return { sesion, puede, puedeAlguno, recargarSesion }
}
