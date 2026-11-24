import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  Users,
  ShoppingCart,
  FileText,
  BarChart3,
  Truck,
  Settings,
  Moon,
  Sun
} from 'lucide-react'
import PropTypes from 'prop-types'
import { CLAVE_TEMA, cambiarTema, temaActual } from '../../tema'

const Navbar = ({ children, activeSection, onSectionChange }) => {
  const navigate = useNavigate()
  const rol = localStorage.getItem('Rol')
  const [tema, setTema] = useState(temaActual)

  const alternarTema = () => {
    const nuevo = tema === 'oscuro' ? 'claro' : 'oscuro'
    cambiarTema(nuevo)
    setTema(nuevo)
  }
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/' },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart, path: '/ventas' },
    { id: 'inventario', label: 'Inventario', icon: Package, path: '/inventario' },
    { id: 'proveedores', label: 'Proveedores', icon: Truck, path: '/proveedores' },
    { id: 'pedidos', label: 'Pedidos', icon: FileText, path: '/pedidos' }
  ]
  const adminItems = [
    { id: 'usuarios', label: 'Usuarios', icon: Users, path: '/usuarios' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, path: '/configuracion' }
  ]

  const handleLogout = async () => {
    await window.API.cerrarSesion()
    // Se conservan las preferencias del equipo: mail recordado y tema.
    const conservar = ['MailGuardado', CLAVE_TEMA]
      .map((clave) => [clave, localStorage.getItem(clave)])
      .filter(([, valor]) => valor !== null)
    localStorage.clear()
    conservar.forEach(([clave, valor]) => localStorage.setItem(clave, valor))
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-between">
        <div>
          <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Comercio
            </h1>
            <button
              onClick={alternarTema}
              title={tema === 'oscuro' ? 'Modo oscuro activo' : 'Modo claro activo'}
              aria-label={tema === 'oscuro' ? 'Modo oscuro activo' : 'Modo claro activo'}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {/* El ícono muestra el modo actual */}
              {tema === 'oscuro' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
          <nav className="mt-6">
            <div>
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      onSectionChange
                        ? onSectionChange(item.id)
                        : (window.location.pathname = item.path)
                    }
                    className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                )
              })}
            </div>
            <div className="p-4 border-t dark:border-gray-700">
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Administrar</h1>
            </div>
            <div>
              {(rol === 'Propietario' || rol === 'Administrador') &&
                adminItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        onSectionChange
                          ? onSectionChange(item.id)
                          : (window.location.pathname = item.path)
                      }
                      className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </button>
                  )
                })}
            </div>
          </nav>
        </div>
        <div className="p-6">
          <button
            className="w-full bg-red-600/80 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
          <button
            className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800 transition mt-3"
            onClick={() => window.API.close()}
          >
            Cerrar programa
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-3">{children}</div>
      </div>
    </div>
  )
}

Navbar.propTypes = {
  children: PropTypes.node.isRequired,
  activeSection: PropTypes.string,
  onSectionChange: PropTypes.func
}

export default Navbar
