import { useNavigate } from 'react-router-dom'
import { Package, Users, ShoppingCart, FileText, BarChart3 } from 'lucide-react'
import PropTypes from 'prop-types'
const Navbar = ({ children, activeSection, onSectionChange }) => {
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/' },
    { id: 'sales', label: 'Ventas', icon: ShoppingCart, path: '/ventas' },
    { id: 'inventory', label: 'Inventario', icon: Package, path: '/inventario' },
    { id: 'suppliers', label: 'Proveedores', icon: Users, path: '/proveedores' },
    { id: 'orders', label: 'Pedidos', icon: FileText, path: '/pedidos' }
  ]

  const handleLogout = () => {
    if (localStorage.MailGuardado) {
      const recordarMail = localStorage.MailGuardado
      localStorage.clear()
      localStorage.setItem('MailGuardado', recordarMail)
    }
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-lg flex flex-col justify-between">
        <div>
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">Sistema Comercial</h1>
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
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
