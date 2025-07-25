import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/navbar/navbar'
import { useState, useEffect } from 'react'

export default function PrivatedLayout() {
  const sectionByPath = {
    '/': 'dashboard',
    '/inventario': 'inventory',
    '/Proveedores': 'suppliers',
    '/ventas': 'sales',
    '/pedidos': 'orders'
  }

  const isAuthenticated = !!localStorage.getItem('token')
  const location = useLocation()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState(
    sectionByPath[location.pathname] || 'dashboard'
  )

  useEffect(() => {
    setActiveSection(sectionByPath[location.pathname] || 'dashboard')
  }, [location.pathname])

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId)
    const path = Object.entries(sectionByPath).find(([, id]) => id === sectionId)?.[0]
    if (path) navigate(path)
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
