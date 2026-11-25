import { Pencil, Plus, ShieldCheck, UserCheck, UserX, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AgregarUsuario from './agregarUsuario/agregarUsuario'
import EditarUsuario from './editarUsuario/editarUsuario'
import { usePermisos } from '../../sesion'
import {
  Pagina,
  BarraHerramientas,
  Boton,
  BotonIcono,
  Buscador,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Selector,
  Tabla,
  TablaCelda,
  TablaCuerpo,
  TablaEncabezado,
  TablaFila,
  TarjetaMetrica,
  useAvisos
} from '../ui'
import { formatearNumero } from '../../utils/formato'

const FORM_INICIAL = { usuario: '', mail: '', password: '', rol: '' }

// Hasta dos iniciales del nombre de usuario: "María López" → "ML".
const iniciales = (nombre = '') =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')

// El filtro combina estado y rol en un solo selector: "estado:Activo" o "rol:Vendedor".
const cumpleFiltro = (usuario, filtro) => {
  if (!filtro) return true
  const [tipo, valor] = filtro.split(/:(.*)/s)
  return tipo === 'estado' ? usuario.estado === valor : usuario.rol === valor
}

const Usuarios = () => {
  const { sesion, puede, recargarSesion } = usePermisos()
  const avisos = useAvisos()
  const [usuarios, setUsuarios] = useState([])
  const [cargado, setCargado] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [mensaje, setMensaje] = useState('')
  const [editando, setEditando] = useState(null)
  // Solo los roles que la sesión puede asignar; el proceso principal también lo valida.
  const [rolesDisponibles, setRolesDisponibles] = useState([])

  useEffect(() => {
    window.API.obtenerRoles().then((respuesta) => {
      if (respuesta.success) {
        setRolesDisponibles(respuesta.roles.filter((r) => r.asignable).map((r) => r.nombre))
      }
    })
  }, [])

  const obtenerUsuarios = async () => {
    try {
      const resultado = await window.API.obtenerUsuarios()
      setUsuarios(Array.isArray(resultado) ? resultado : [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      setUsuarios([])
    } finally {
      setCargado(true)
    }
  }

  useEffect(() => {
    obtenerUsuarios()
  }, [])

  const guardarEdicion = async (id, cambios) => {
    const respuesta = await window.API.editarUsuario(id, cambios)
    if (respuesta.success) {
      setEditando(null)
      avisos.exito('Usuario actualizado')
      obtenerUsuarios()
      if (id === sesion?.id_usuario) recargarSesion()
    }
    return respuesta
  }

  const cerrarFormulario = () => {
    setMostrarFormulario(false)
    setFormData(FORM_INICIAL)
    setMensaje('')
  }

  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    try {
      const response = await window.API.registro({ ...formData, estado: 'Activo' })
      if (response.success === true) {
        cerrarFormulario()
        avisos.exito('Usuario creado', formData.usuario)
        obtenerUsuarios()
      } else {
        setMensaje(response.message || 'Error al crear el usuario')
      }
    } catch (error) {
      console.error('Error al crear usuario:', error)
      setMensaje('Error al crear el usuario')
    }
  }

  const metricas = useMemo(() => {
    const activos = usuarios.filter((u) => u.estado === 'Activo').length
    return {
      activos,
      inactivos: usuarios.length - activos,
      roles: [...new Set(usuarios.map((u) => u.rol))].sort((a, b) => a.localeCompare(b))
    }
  }, [usuarios])

  const termino = busqueda.toLowerCase()
  const visibles = usuarios.filter(
    (usuario) =>
      cumpleFiltro(usuario, filtro) &&
      (usuario.usuario.toLowerCase().includes(termino) ||
        usuario.mail.toLowerCase().includes(termino) ||
        usuario.rol.toLowerCase().includes(termino) ||
        usuario.estado.toLowerCase().includes(termino))
  )

  const cantidad = usuarios.length
  const subtitulo = `${formatearNumero(cantidad)} usuario${cantidad === 1 ? '' : 's'} registrado${cantidad === 1 ? '' : 's'}`

  return (
    <Pagina>
      <EncabezadoPagina
        icono={Users}
        titulo="Usuarios"
        subtitulo={subtitulo}
        acciones={
          puede('usuarios.crear') && (
            <Boton variante="primario" icono={Plus} onClick={() => setMostrarFormulario(true)}>
              Nuevo usuario
            </Boton>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <TarjetaMetrica
          etiqueta="Activos"
          valor={formatearNumero(metricas.activos)}
          icono={UserCheck}
        />
        <TarjetaMetrica
          etiqueta="Inactivos"
          valor={formatearNumero(metricas.inactivos)}
          icono={UserX}
        />
        <TarjetaMetrica
          etiqueta="Roles en uso"
          valor={formatearNumero(metricas.roles.length)}
          icono={ShieldCheck}
        />
      </div>

      <BarraHerramientas>
        <Buscador
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar usuario"
          etiqueta="Buscar usuario"
        />
        <Selector
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          aria-label="Filtrar por rol o estado"
          className="w-full sm:w-56"
        >
          <option value="">Todos los usuarios</option>
          <optgroup label="Estado">
            <option value="estado:Activo">Activos</option>
            <option value="estado:Inactivo">Inactivos</option>
          </optgroup>
          {metricas.roles.length > 0 && (
            <optgroup label="Rol">
              {metricas.roles.map((rol) => (
                <option key={rol} value={`rol:${rol}`}>
                  {rol}
                </option>
              ))}
            </optgroup>
          )}
        </Selector>
      </BarraHerramientas>

      {!cargado ? null : visibles.length === 0 ? (
        <EstadoVacio
          icono={Users}
          titulo={cantidad === 0 ? 'No hay usuarios' : 'Sin resultados'}
          descripcion={
            cantidad === 0
              ? 'Los usuarios nuevos aparecen acá.'
              : 'Ningún usuario coincide con la búsqueda o el filtro.'
          }
        />
      ) : (
        <Tabla desplazable>
          <TablaEncabezado>
            <TablaCelda encabezado>Usuario</TablaCelda>
            <TablaCelda encabezado>Mail</TablaCelda>
            <TablaCelda encabezado>Rol</TablaCelda>
            <TablaCelda encabezado>Estado</TablaCelda>
            <TablaCelda encabezado alinear="derecha">
              Acciones
            </TablaCelda>
          </TablaEncabezado>
          <TablaCuerpo>
            {visibles.map((usuario) => (
              <TablaFila key={usuario.id_usuario}>
                <TablaCelda>
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primario-suave text-xs font-semibold text-primario-texto"
                      aria-hidden="true"
                    >
                      {iniciales(usuario.usuario)}
                    </span>
                    <span className="font-medium whitespace-nowrap">{usuario.usuario}</span>
                  </div>
                </TablaCelda>
                <TablaCelda className="text-texto-secundario">{usuario.mail}</TablaCelda>
                <TablaCelda>
                  <Insignia variante="primario">{usuario.rol}</Insignia>
                </TablaCelda>
                <TablaCelda>
                  <Insignia variante={usuario.estado === 'Activo' ? 'exito' : 'peligro'}>
                    {usuario.estado}
                  </Insignia>
                </TablaCelda>
                <TablaCelda alinear="derecha">
                  {usuario.editable && (
                    <BotonIcono
                      icono={Pencil}
                      etiqueta="Editar usuario"
                      onClick={() => setEditando(usuario)}
                    />
                  )}
                </TablaCelda>
              </TablaFila>
            ))}
          </TablaCuerpo>
        </Tabla>
      )}

      {editando && (
        <EditarUsuario
          usuario={editando}
          rolesAsignables={rolesDisponibles}
          esUnoMismo={editando.id_usuario === sesion?.id_usuario}
          onGuardar={guardarEdicion}
          onCancelar={() => setEditando(null)}
        />
      )}

      {mostrarFormulario && (
        <AgregarUsuario
          onSubmit={handleCrearUsuario}
          formData={formData}
          setFormData={setFormData}
          rolesDisponibles={rolesDisponibles}
          mensaje={mensaje}
          onCancel={cerrarFormulario}
        />
      )}
    </Pagina>
  )
}

export default Usuarios
