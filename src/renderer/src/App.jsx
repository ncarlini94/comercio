import { HashRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './components/dashboard/dashboard'
import Inventario from './components/inventario/inventario'
import Proveedores from './components/proveedores/proveedores'
import Login from './components/login/login'
import PublicLayout from './layouts/PublicLayout'
import PrivatedLayout from './layouts/PrivatedLayout'
import Registro from './components/registro/registro'
import Ventas from './components/ventas/ventas'
import Pedidos from './components/pedidos/pedidos'
import Usuarios from './components/usuarios/usuarios'
import Panel from './components/panel/panel'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Route>
        <Route element={<PrivatedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracion" element={<Panel />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
