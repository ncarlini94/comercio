import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boton, Campo, CampoConEtiqueta, CasillaVerificacion, Tarjeta } from '../ui'

const Login = () => {
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [mailRecordar, setMailRecordar] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Sin usuarios cargados, se va a la configuración inicial para crear al Propietario.
    window.API.existenUsuarios().then((existen) => {
      if (!existen) navigate('/registro', { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    const guardado = localStorage.getItem('MailGuardado')
    if (guardado) {
      setMail(guardado)
      setMailRecordar(true)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!mail || !password) {
      setMensaje('Por favor, ingrese Mail y contraseña.')
      return
    }
    try {
      const response = await window.API.login({ mail, password })
      if (response.success === true) {
        setMensaje('Login exitoso')
        localStorage.setItem('usuario', response.usuario.usuario)
        if (mailRecordar === true) {
          localStorage.setItem('MailGuardado', mail)
        } else {
          localStorage.removeItem('MailGuardado')
        }
        navigate('/')
      } else {
        setMensaje(response.message)
      }
    } catch (error) {
      console.error('Error al realizar login:', error)
      setMensaje('Error al realizar login')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-fondo p-4">
      <Tarjeta className="w-96">
        <h2 className="mb-5 text-center text-lg font-semibold text-texto">Iniciar sesión</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <CampoConEtiqueta etiqueta="Mail">
            <Campo
              type="text"
              autoComplete="username"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
            />
          </CampoConEtiqueta>

          <CasillaVerificacion
            etiqueta="Recordar mail"
            checked={mailRecordar}
            onChange={() => setMailRecordar(!mailRecordar)}
          />

          <CampoConEtiqueta etiqueta="Contraseña">
            <Campo
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </CampoConEtiqueta>

          <Boton type="submit" variante="primario" anchoCompleto>
            Iniciar sesión
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

export default Login
