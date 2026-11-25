import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from '../components/navbar/navbar'
import { SECCIONES, SesionContext } from '../sesion'

const tieneAcceso = (sesion, seccion) => seccion.permisos.some((p) => sesion.permisos.includes(p))

export default function PrivatedLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  // undefined = verificando, null = sin sesión, objeto = sesión del proceso principal
  const [sesion, setSesion] = useState(undefined)

  const recargarSesion = useCallback(async () => {
    const actual = await window.API.obtenerSesion()
    if (actual) {
      // Solo para mostrar el nombre (por ejemplo, en Ventas); los permisos vienen de la sesión.
      localStorage.setItem('usuario', actual.usuario)
    } else {
      localStorage.removeItem('usuario')
    }
    setSesion(actual ?? null)
    return actual
  }, [])

  useEffect(() => {
    recargarSesion()
  }, [recargarSesion])

  const contexto = useMemo(() => ({ sesion, recargarSesion }), [sesion, recargarSesion])
  const seccionActual = SECCIONES.find((s) => s.path === location.pathname)

  if (sesion === undefined) return null
  if (sesion === null) return <Navigate to="/login" />

  // Ruta sin permiso: se redirige a la primera sección habilitada.
  if (seccionActual && !tieneAcceso(sesion, seccionActual)) {
    const primera = SECCIONES.find((s) => tieneAcceso(sesion, s))
    if (primera) return <Navigate to={primera.path} replace />
    return (
      <SesionContext.Provider value={contexto}>
        <Navbar activeSection="" onSectionChange={() => {}}>
          <p className="text-texto-secundario">
            Su rol no tiene acceso a ninguna sección. Consulte al administrador.
          </p>
        </Navbar>
      </SesionContext.Provider>
    )
  }

  const irASeccion = (id) => {
    const seccion = SECCIONES.find((s) => s.id === id)
    if (seccion) navigate(seccion.path)
  }

  return (
    <SesionContext.Provider value={contexto}>
      <Navbar activeSection={seccionActual?.id ?? ''} onSectionChange={irASeccion}>
        <Outlet />
      </Navbar>
    </SesionContext.Provider>
  )
}
