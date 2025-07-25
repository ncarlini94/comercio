import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Registro = () => {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [mail, setMail] = useState('')
  const [mensaje, setMensaje] = useState('')

  const handleRegistro = async (e) => {
    e.preventDefault()
    if (!usuario || !password || !mail) {
      setMensaje('Por favor, complete todos los campos.')
      return
    }
    try {
      const response = await window.API.registro({ usuario, mail, password })
      console.log(response)
      if (response.success === true) {
        setMensaje('Registro exitoso')
        navigate('/login')
      } else {
        setMensaje(response.message)
      }
    } catch (error) {
      console.error('Error en el registro:', error)
      alert('Error al registrar el usuario')
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold text-center mb-4">Registro</h2>
        <form onSubmit={handleRegistro} className="space-y-4">
          <div>
            <label htmlFor="usuario" className="block text-gray-700">
              Usuario:
            </label>
            <input
              className="w-full text-black bg-gray-200 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="mail" className="block text-gray-700">
              Correo Electrónico:
            </label>
            <input
              className="w-full text-black bg-gray-200 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              id="mail"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="contraseña" className="block text-gray-700">
              Contraseña:
            </label>
            <input
              className="w-full text-black bg-gray-200 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            Registrar
          </button>
        </form>
        {mensaje && <p className="mt-4 text-center text-red-500">{mensaje}</p>}
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600 transition duration-200"
        >
          Login
        </button>
      </div>
    </div>
  )
}

export default Registro
