import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold text-center mb-2">Configuración inicial</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
          Cree la cuenta del Propietario del comercio.
        </p>
        <form onSubmit={handleRegistro} className="space-y-4">
          <div>
            <label htmlFor="usuario" className="block text-gray-700 dark:text-gray-300">
              Usuario:
            </label>
            <input
              className="validar w-full text-black dark:text-gray-100 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="mail" className="block text-gray-700 dark:text-gray-300">
              Correo Electrónico:
            </label>
            <input
              className="validar w-full text-black dark:text-gray-100 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              id="mail"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="contraseña" className="block text-gray-700 dark:text-gray-300">
              Contraseña:
            </label>
            <input
              className="validar w-full text-black dark:text-gray-100 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Crear cuenta
          </button>
        </form>
        {mensaje && <p className="mt-4 text-center text-red-500">{mensaje}</p>}
      </div>
    </div>
  )
}

export default Registro
