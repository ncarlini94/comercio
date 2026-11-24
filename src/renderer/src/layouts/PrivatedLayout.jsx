import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/navbar/navbar'
import { useState, useEffect } from 'react'

export default function PrivatedLayout() {
  const sectionByPath = {
    '/': 'dashboard',
    '/inventario': 'inventario',
    '/proveedores': 'proveedores',
    '/ventas': 'ventas',
    '/pedidos': 'pedidos',
    '/usuarios': 'usuarios',
    '/configuracion': 'configuracion'
  }

  const location = useLocation()
  const navigate = useNavigate()
  // null = verificando, true/false = resultado de la sesión en el proceso principal
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [activeSection, setActiveSection] = useState(
    sectionByPath[location.pathname] || 'dashboard'
  )

  useEffect(() => {
    window.API.obtenerSesion().then((sesion) => {
      if (sesion) {
        localStorage.setItem('usuario', sesion.usuario)
        localStorage.setItem('Rol', sesion.rol)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        localStorage.removeItem('Rol')
        setIsAuthenticated(false)
      }
    })
  }, [])

  useEffect(() => {
    setActiveSection(sectionByPath[location.pathname] || 'dashboard')
  }, [location.pathname])

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId)
    const path = Object.entries(sectionByPath).find(([, id]) => id === sectionId)?.[0]
    if (path) navigate(path)
  }

  if (isAuthenticated === null) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return (
    <Navbar activeSection={activeSection} onSectionChange={handleSectionChange}>
      <Outlet />
    </Navbar>
  )
}
