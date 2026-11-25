import { Download, FileText, Package, ShoppingCart, Truck, Users } from 'lucide-react'
import { useState } from 'react'
import { Boton, Tarjeta, useAvisos } from '../../ui'
import { formatearNumero } from '../../../utils/formato'

const SECCIONES = [
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'proveedores', label: 'Proveedores', icon: Truck },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart, nota: 'Incluye el detalle de productos' },
  { id: 'pedidos', label: 'Pedidos', icon: FileText, nota: 'Incluye el detalle de productos' },
  { id: 'usuarios', label: 'Usuarios', icon: Users, nota: 'Sin contraseñas' }
]

export default function Exportar() {
  const avisos = useAvisos()
  const [cargando, setCargando] = useState(null)

  const handleExportar = async (id, label) => {
    setCargando(id)
    try {
      const respuesta = await window.API.exportar(id)
      if (respuesta.canceled) return
      if (respuesta.success) {
        avisos.exito(
          `${label}: ${formatearNumero(respuesta.registros)} registros exportados`,
          respuesta.filePath
        )
      } else {
        avisos.error(`${label}: no se pudo exportar`, respuesta.message)
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      avisos.error(`${label}: no se pudo exportar`, 'Error al exportar')
    } finally {
      setCargando(null)
    }
  }

  return (
    <div className="space-y-4">
      <Tarjeta>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-texto">Exportar todo</h2>
            <p className="text-sm text-texto-secundario">
              Un solo archivo Excel con una hoja por sección.
            </p>
          </div>
          <Boton
            variante="primario"
            icono={Download}
            onClick={() => handleExportar('todo', 'Todo')}
            disabled={cargando !== null}
          >
            {cargando === 'todo' ? 'Exportando...' : 'Exportar todo'}
          </Boton>
        </div>
      </Tarjeta>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SECCIONES.map(({ id, label, icon: Icono, nota }) => (
          <Tarjeta key={id}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Icono className="h-5 w-5 shrink-0 text-texto-tenue" aria-hidden="true" />
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-texto">{label}</h2>
                  {nota && <p className="text-xs text-texto-tenue">{nota}</p>}
                </div>
              </div>
              <Boton
                tamano="sm"
                icono={Download}
                onClick={() => handleExportar(id, label)}
                disabled={cargando !== null}
              >
                {cargando === id ? 'Exportando...' : 'Exportar'}
              </Boton>
            </div>
          </Tarjeta>
        ))}
      </div>
    </div>
  )
}
