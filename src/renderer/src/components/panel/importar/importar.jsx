import { AlertTriangle, CheckCircle2, Copy, Package, Truck, Upload } from 'lucide-react'
import { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Boton,
  Insignia,
  Tabla,
  TablaCelda,
  TablaCuerpo,
  TablaEncabezado,
  TablaFila,
  Tarjeta,
  TarjetaMetrica,
  useAvisos
} from '../../ui'
import TituloConIcono from '../TituloConIcono'
import { formatearNumero } from '../../../utils/formato'

const SECCIONES = [
  {
    id: 'inventario',
    label: 'Inventario',
    icon: Package,
    columnas: ['nombre', 'descripcion', 'costo', 'precio', 'stock', 'stock_minimo', 'id_proveedor'],
    nota: 'El id_proveedor debe existir. Los productos con un nombre ya cargado se omiten.'
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: Truck,
    columnas: ['nombre', 'contacto', 'mail', 'telefono', 'celular', 'celular2', 'direccion'],
    nota: 'Los proveedores con el mismo nombre y mail que uno ya cargado se omiten.'
  }
]

const MAX_ERRORES_VISIBLES = 50

export default function Importar() {
  const avisos = useAvisos()
  const [cargando, setCargando] = useState(null)
  const [resultado, setResultado] = useState(null)

  const handleImportar = async (seccion) => {
    setCargando(seccion.id)
    setResultado(null)
    try {
      const respuesta = await window.API.importar(seccion.id)
      if (respuesta.canceled) return
      if (respuesta.success) setResultado({ seccion: seccion.label, ...respuesta })
      else avisos.error(`No se pudo importar ${seccion.label.toLowerCase()}`, respuesta.message)
    } catch (error) {
      console.error('Error al importar:', error)
      avisos.error(`No se pudo importar ${seccion.label.toLowerCase()}`, 'Error al importar')
    } finally {
      setCargando(null)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-texto-secundario">
        Seleccione un archivo Excel (.xlsx). La primera fila debe tener los nombres de las columnas.
        Para obtener un archivo de ejemplo, exporte la sección desde &quot;Exportar&quot;.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {SECCIONES.map((seccion) => {
          return (
            <Tarjeta
              key={seccion.id}
              titulo={<TituloConIcono icono={seccion.icon}>{seccion.label}</TituloConIcono>}
            >
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium text-texto-secundario">
                    Columnas requeridas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {seccion.columnas.map((columna) => (
                      <Insignia key={columna}>
                        <code>{columna}</code>
                      </Insignia>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-texto-tenue">{seccion.nota}</p>
                <Boton
                  icono={Upload}
                  onClick={() => handleImportar(seccion)}
                  disabled={cargando !== null}
                >
                  {cargando === seccion.id ? 'Importando...' : 'Seleccionar archivo'}
                </Boton>
              </div>
            </Tarjeta>
          )
        })}
      </div>

      {resultado && <ResultadoImportacion resultado={resultado} />}
    </div>
  )
}

function ResultadoImportacion({ resultado }) {
  const { errores = [] } = resultado
  const hayErrores = errores.length > 0
  return (
    <section className="space-y-4" aria-label={`Resultado: ${resultado.seccion}`}>
      <h3 className="text-base font-semibold text-texto">Resultado: {resultado.seccion}</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <TarjetaMetrica
          etiqueta="Importados"
          valor={formatearNumero(resultado.insertados ?? 0)}
          icono={CheckCircle2}
          tendencia="Filas nuevas"
          direccion="sube"
        />
        <TarjetaMetrica
          etiqueta="Repetidos"
          valor={formatearNumero(resultado.duplicados ?? 0)}
          icono={Copy}
          tendencia="Ya existían"
          direccion="neutra"
        />
        <TarjetaMetrica
          etiqueta="Con errores"
          valor={formatearNumero(errores.length)}
          icono={AlertTriangle}
          tendencia={hayErrores ? 'Filas que no se cargaron' : 'Sin errores'}
          direccion={hayErrores ? 'baja' : 'neutra'}
        />
      </div>

      {hayErrores && (
        <div className="space-y-2">
          <Tabla className="max-h-64 overflow-y-auto">
            <TablaEncabezado>
              <TablaCelda encabezado alinear="derecha" className="w-20">
                Fila
              </TablaCelda>
              <TablaCelda encabezado>Problema</TablaCelda>
            </TablaEncabezado>
            <TablaCuerpo>
              {errores.slice(0, MAX_ERRORES_VISIBLES).map(({ fila, mensaje }) => (
                <TablaFila key={fila}>
                  <TablaCelda alinear="derecha">{fila}</TablaCelda>
                  <TablaCelda>{mensaje}</TablaCelda>
                </TablaFila>
              ))}
            </TablaCuerpo>
          </Tabla>
          {errores.length > MAX_ERRORES_VISIBLES && (
            <p className="text-xs text-texto-tenue">
              Se muestran los primeros {MAX_ERRORES_VISIBLES} errores de {errores.length}.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

ResultadoImportacion.propTypes = {
  resultado: PropTypes.shape({
    seccion: PropTypes.string.isRequired,
    insertados: PropTypes.number,
    duplicados: PropTypes.number,
    errores: PropTypes.arrayOf(
      PropTypes.shape({ fila: PropTypes.number, mensaje: PropTypes.string })
    )
  }).isRequired
}
