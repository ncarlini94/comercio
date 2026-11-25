import { useState, useEffect } from 'react'
import { Mail, Pencil, Phone, Plus, Trash2, Truck, Users } from 'lucide-react'
import AgregarProveedor from './agregarProveedor/agregarProveedor'
import EditarProveedor from './editarProveedor/editarProveedor'
import { usePermisos } from '../../sesion'
import {
  Pagina,
  Cargando,
  BarraHerramientas,
  Boton,
  BotonIcono,
  Buscador,
  EncabezadoPagina,
  EstadoVacio,
  Tabla,
  TablaCelda,
  TablaCuerpo,
  TablaEncabezado,
  TablaFila,
  TarjetaMetrica,
  useAvisos,
  useConfirmar
} from '../ui'
import { formatearNumero } from '../../utils/formato'

// Los canales devuelven { error } o { success: false, message } cuando algo falla.
const respuestaConError = (r) => Boolean(r?.error) || r?.success === false
const detalleError = (r) => r?.error || r?.message

const telefonosDe = (proveedor) =>
  [proveedor.telefono, proveedor.celular, proveedor.celular2].filter(Boolean)

const Proveedores = () => {
  const { puede } = usePermisos()
  const avisos = useAvisos()
  const confirmar = useConfirmar()
  const [proveedores, setProveedores] = useState([])
  const [cargado, setCargado] = useState(false)
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    mail: '',
    telefono: '',
    celular: '',
    celular2: '',
    direccion: ''
  })
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarProveedores().finally(() => setCargado(true))
  }, [])

  const cargarProveedores = async () => {
    try {
      const data = await window.API.obtenerTodosLosProveedores()
      if (Array.isArray(data)) {
        setProveedores(data)
      } else {
        setProveedores([])
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
      setProveedores([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nombre) {
      setMensaje('El nombre es obligatorio.')
      return
    }
    setLoading(true)
    setMensaje('')
    try {
      let resultado
      if (editingProveedor) {
        resultado = await window.API.actualizarProveedor(editingProveedor.id_proveedores, {
          ...formData
        })
      } else {
        const normalizado = {
          ...formData,
          telefono: formData.telefono ? parseInt(formData.telefono) : null,
          celular: formData.celular ? parseInt(formData.celular) : null,
          celular2: formData.celular2 ? parseInt(formData.celular2) : null
        }
        resultado = await window.API.agregarProveedor(normalizado)
      }
      if (respuestaConError(resultado)) {
        setMensaje(detalleError(resultado) || 'Error al guardar proveedor.')
        avisos.error('No se pudo guardar el proveedor', detalleError(resultado))
      } else {
        avisos.exito(editingProveedor ? 'Proveedor actualizado' : 'Proveedor agregado')
        resetForm()
      }
      cargarProveedores()
    } catch (error) {
      setMensaje('Error al guardar proveedor.')
      console.error('Error al guardar proveedor:', error)
    }
    setLoading(false)
  }

  const handleEdit = (proveedor) => {
    setEditingProveedor(proveedor)
    setFormData({
      nombre: proveedor.nombre || '',
      contacto: proveedor.contacto || '',
      mail: proveedor.mail || '',
      telefono: proveedor.telefono || '',
      celular: proveedor.celular || '',
      celular2: proveedor.celular2 || '',
      direccion: proveedor.direccion || ''
    })
    setMostrarEditar(true)
    setMensaje('')
  }

  const handleDelete = async (proveedor) => {
    const confirmado = await confirmar({
      titulo: 'Borrar proveedor',
      mensaje: `Se borrará "${proveedor.nombre}". Esta acción no se puede deshacer.`,
      textoConfirmar: 'Borrar',
      peligro: true
    })
    if (!confirmado) return
    try {
      const resultado = await window.API.eliminarProveedor(proveedor.id_proveedores)
      if (respuestaConError(resultado)) {
        avisos.error('No se pudo borrar el proveedor', detalleError(resultado))
      } else {
        avisos.exito('Proveedor borrado')
      }
      cargarProveedores()
    } catch (error) {
      console.error('Error al eliminar proveedor:', error)
      avisos.error('No se pudo borrar el proveedor')
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      contacto: '',
      mail: '',
      telefono: '',
      celular: '',
      celular2: '',
      direccion: ''
    })
    setEditingProveedor(null)
    setMostrarEditar(false)
    setMostrarNuevo(false)
    setMensaje('')
  }

  const conMail = proveedores.filter((p) => p.mail).length
  const conTelefono = proveedores.filter((p) => telefonosDe(p).length > 0).length

  const filteredProveedores = proveedores.filter(
    (proveedor) =>
      proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proveedor.contacto || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderLista = () => {
    if (!cargado) return <Cargando texto="Cargando proveedores…" />
    if (proveedores.length === 0) {
      return (
        <EstadoVacio
          icono={Truck}
          titulo="Todavía no hay proveedores"
          descripcion="Los proveedores que agregues aparecen acá."
        />
      )
    }
    if (filteredProveedores.length === 0) {
      return (
        <EstadoVacio
          titulo="No hay resultados"
          descripcion="Probá buscando por otro nombre o contacto."
        />
      )
    }
    return (
      <Tabla desplazable>
        <TablaEncabezado>
          <TablaCelda encabezado>Proveedor</TablaCelda>
          <TablaCelda encabezado>Mail</TablaCelda>
          <TablaCelda encabezado>Teléfonos</TablaCelda>
          <TablaCelda encabezado>Dirección</TablaCelda>
          <TablaCelda encabezado alinear="derecha">
            Acciones
          </TablaCelda>
        </TablaEncabezado>
        <TablaCuerpo>
          {filteredProveedores.map((proveedor) => (
            <TablaFila key={proveedor.id_proveedores}>
              <TablaCelda>
                <p className="font-medium">{proveedor.nombre}</p>
                {proveedor.contacto && (
                  <p className="text-texto-secundario">{proveedor.contacto}</p>
                )}
              </TablaCelda>
              <TablaCelda className="text-texto-secundario">{proveedor.mail || '—'}</TablaCelda>
              <TablaCelda className="whitespace-nowrap text-texto-secundario tabular-nums">
                {telefonosDe(proveedor).length > 0
                  ? telefonosDe(proveedor).map((numero, i) => <p key={i}>{numero}</p>)
                  : '—'}
              </TablaCelda>
              <TablaCelda className="text-texto-secundario">
                {proveedor.direccion || '—'}
              </TablaCelda>
              <TablaCelda alinear="derecha" className="whitespace-nowrap">
                {puede('proveedores.editar') && (
                  <BotonIcono
                    icono={Pencil}
                    etiqueta="Editar"
                    onClick={() => handleEdit(proveedor)}
                  />
                )}
                {puede('proveedores.eliminar') && (
                  <BotonIcono
                    icono={Trash2}
                    etiqueta="Borrar"
                    variante="peligro"
                    onClick={() => handleDelete(proveedor)}
                  />
                )}
              </TablaCelda>
            </TablaFila>
          ))}
        </TablaCuerpo>
      </Tabla>
    )
  }

  return (
    <Pagina>
      <EncabezadoPagina
        icono={Truck}
        titulo="Proveedores"
        subtitulo={`${formatearNumero(proveedores.length)} ${proveedores.length === 1 ? 'proveedor' : 'proveedores'}`}
        acciones={
          puede('proveedores.crear') && (
            <Boton variante="primario" icono={Plus} onClick={() => setMostrarNuevo(true)}>
              Agregar proveedor
            </Boton>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaMetrica
          etiqueta="Proveedores"
          valor={formatearNumero(proveedores.length)}
          icono={Users}
        />
        <TarjetaMetrica etiqueta="Con mail" valor={formatearNumero(conMail)} icono={Mail} />
        <TarjetaMetrica
          etiqueta="Con teléfono"
          valor={formatearNumero(conTelefono)}
          icono={Phone}
        />
      </div>

      <BarraHerramientas>
        <Buscador
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o contacto..."
          etiqueta="Buscar proveedores"
        />
      </BarraHerramientas>

      {renderLista()}

      {mostrarNuevo && (
        <AgregarProveedor
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          mensaje={mensaje}
          resetForm={resetForm}
          loading={loading}
        />
      )}

      {mostrarEditar && (
        <EditarProveedor
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          mensaje={mensaje}
          resetForm={resetForm}
          loading={loading}
        />
      )}
    </Pagina>
  )
}

export default Proveedores
