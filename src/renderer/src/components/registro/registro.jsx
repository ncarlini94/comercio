import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boton, Campo, CampoConEtiqueta, Tarjeta } from '../ui'

// Pantalla de configuración inicial: solo se usa para crear la cuenta del Propietario
// cuando todavía no existe ningún usuario. El resto de los usuarios se crean desde "Usuarios".
const Registro = () => {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const estado = 'Activo'
  const [mail, setMail] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    window.API.existenUsuarios().then((existen) => {
      if (existen) navigate('/login', { replace: true })
    })
  }, [navigate])

  const handleRegistro = async (e) => {
    e.preventDefault()
    if (!usuario || !password || !mail) {
      setMensaje('Por favor, complete todos los campos.')
      return
    }
    try {
      const response = await window.API.registro({
        usuario,
        mail,
        password,
        rol: 'Propietario',
        estado
      })
      if (response.success === true) {
        setMensaje('Registro exitoso')
        navigate('/login')
      } else {
        setMensaje(response.message)
      }
    } catch (error) {
      console.error('Error en el registro:', error)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-fondo p-4">
      <Tarjeta className="w-96">
        <h2 className="mb-1 text-center text-lg font-semibold text-texto">Configuración inicial</h2>
        <p className="mb-5 text-center text-sm text-texto-secundario">
          Cree la cuenta del Propietario del comercio.
        </p>
        <form onSubmit={handleRegistro} className="space-y-4">
          <CampoConEtiqueta etiqueta="Usuario">
            <Campo
              className="validar"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </CampoConEtiqueta>
          <CampoConEtiqueta etiqueta="Correo electrónico">
            <Campo
              className="validar"
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
            />
          </CampoConEtiqueta>
          <CampoConEtiqueta etiqueta="Contraseña">
            <Campo
              className="validar"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </CampoConEtiqueta>

          <Boton type="submit" variante="primario" anchoCompleto>
            Crear cuenta
          </Boton>
        </form>
        {mensaje && (
          <p role="alert" className="mt-4 text-center text-sm text-peligro-texto">
            {mensaje}
          </p>
        )}
      </Tarjeta>
    </div>
  )
}

export default Registro
