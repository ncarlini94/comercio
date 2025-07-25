import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [mailRecordar, setMailRecordar] = useState(false)
  const navigate = useNavigate()

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
        localStorage.setItem('token', response.token)
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
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold text-center mb-4">Iniciar Sesión</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="mail" className="block text-gray-700">
              Mail:
            </label>
            <input
              type="mail"
              id="Mail"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
              className="w-full text-black bg-gray-200 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="mail" className=" text-gray-700">
              Recordar mail?
            </label>
            <input
              type="checkbox"
              id="MailRecordar"
              checked={mailRecordar}
              onChange={() => setMailRecordar(!mailRecordar)}
              className=" ms-4 w-8 focus:outline-none focus:ring-0 text-black bg-gray-200 rounded border border-gray-300 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="contraseña" className="block text-gray-700">
              Contraseña:
            </label>
            <input
              type="password"
              id="contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-black bg-gray-200 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Iniciar Sesión
          </button>
        </form>
        {mensaje && <p className="mt-4 text-center text-red-500">{mensaje}</p>}
        <button
          onClick={() => navigate('/registro')}
          className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600 transition duration-200"
        >
          Registrarse
        </button>
      </div>
    </div>
  )
}

export default Login
