import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Moon, Power, Sun } from 'lucide-react'
import PropTypes from 'prop-types'
import { CLAVE_TEMA, cambiarTema, temaActual } from '../../tema'
import { SECCIONES, usePermisos } from '../../sesion'
import { BotonIcono } from '../ui'
import { CLASE_FOCO } from '../ui/estilos'
import { unirClases } from '../../utils/clases'

// Hasta dos iniciales del nombre de usuario: "María López" → "ML", "Dueña" → "D".
const iniciales = (nombre = '') =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')

const ItemMenu = ({ item, activo, alElegir }) => {
  const Icono = item.icon
  return (
    <button
      type="button"
      onClick={() => alElegir(item)}
      aria-current={activo ? 'page' : undefined}
      className={unirClases(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
        CLASE_FOCO,
        activo
          ? 'bg-primario-suave text-primario-texto'
          : 'text-texto-secundario hover:bg-superficie-alt hover:text-texto'
      )}
    >
      <Icono className="h-5 w-5 shrink-0" aria-hidden="true" />
      {item.label}
    </button>
  )
}

ItemMenu.propTypes = {
  item: PropTypes.shape({
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired
  }).isRequired,
  activo: PropTypes.bool,
  alElegir: PropTypes.func.isRequired
}

const Navbar = ({ children, activeSection, onSectionChange }) => {
  const navigate = useNavigate()
  const { sesion, puedeAlguno } = usePermisos()
  const [tema, setTema] = useState(temaActual)

  const alternarTema = () => {
    const nuevo = tema === 'oscuro' ? 'claro' : 'oscuro'
    cambiarTema(nuevo)
    setTema(nuevo)
  }
  const visibles = SECCIONES.filter((s) => puedeAlguno(s.permisos))
  const menuItems = visibles.filter((s) => !s.admin)
  const adminItems = visibles.filter((s) => s.admin)

  const elegir = (item) =>
    onSectionChange ? onSectionChange(item.id) : (window.location.pathname = item.path)

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

  const etiquetaTema = tema === 'oscuro' ? 'Modo oscuro activo' : 'Modo claro activo'

  return (
    <div className="flex h-screen bg-fondo">
      <aside className="flex w-64 shrink-0 flex-col border-r border-borde bg-superficie">
        <div className="flex items-center justify-between gap-2 border-b border-borde px-5 py-4">
          <h1 className="text-xl font-bold text-texto">Comercio</h1>
          <div className="flex items-center gap-1">
            {/* El ícono muestra el modo actual */}
            <BotonIcono
              icono={tema === 'oscuro' ? Moon : Sun}
              etiqueta={etiquetaTema}
              onClick={alternarTema}
            />
            <BotonIcono
              icono={Power}
              etiqueta="Cerrar programa"
              onClick={() => window.API.close()}
            />
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => (
            <ItemMenu
              key={item.id}
              item={item}
              activo={activeSection === item.id}
              alElegir={elegir}
            />
          ))}
          {adminItems.length > 0 && (
            <>
              <p className="px-3 pt-5 pb-1 text-xs font-semibold text-texto-tenue">Administrar</p>
              {adminItems.map((item) => (
                <ItemMenu
                  key={item.id}
                  item={item}
                  activo={activeSection === item.id}
                  alElegir={elegir}
                />
              ))}
            </>
          )}
        </nav>

        <section aria-label="Usuario actual" className="border-t border-borde p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primario-suave text-sm font-semibold text-primario-texto"
              aria-hidden="true"
            >
              {iniciales(sesion?.usuario)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-texto">{sesion?.usuario}</p>
              <p className="truncate text-xs text-texto-tenue">{sesion?.rol}</p>
            </div>
            <BotonIcono icono={LogOut} etiqueta="Cerrar sesión" onClick={handleLogout} />
          </div>
        </section>
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  )
}

Navbar.propTypes = {
  children: PropTypes.node.isRequired,
  activeSection: PropTypes.string,
  onSectionChange: PropTypes.func
}

export default Navbar
