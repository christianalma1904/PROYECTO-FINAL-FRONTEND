import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Añadido estado de carga
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => { // Cambiado a recibir evento para usar e.preventDefault()
    e.preventDefault(); // Previene el recargo de la página
    setError(null);
    setLoading(true); // Activa el estado de carga

    if (!nombre || !email || !password) {
      setError("Todos los campos son obligatorios.");
      setLoading(false); // Desactiva la carga si hay un error de validación local
      return;
    }

    try {
      await register(nombre, email, password);
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      // Mensaje de error más específico para el usuario
      setError(err.message || "Error al registrar usuario. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false); // Desactiva el estado de carga al finalizar
    }
  };

  return (
    // Usamos d-flex y flex-column para centrar verticalmente si la altura es suficiente
    // Añadimos py-5 para un padding vertical en todos los tamaños, y px-3 para padding horizontal en móviles
    <div className="d-flex flex-column justify-content-center align-items-center py-5 px-3" style={{ minHeight: '100vh' }}>
      {/*
        Card de Bootstrap:
        - shadow para una sombra sutil
        - p-4 para padding interno
        - mx-auto para centrado horizontal
        - w-100 para que ocupe el 100% del ancho disponible
        - maxWidth: 400px es un buen tamaño de partida
      */}
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Registro de Usuario</h2>

        {error && (
          <div className="alert alert-danger text-center animate__animated animate__fadeIn mb-3" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}> {/* Usar onSubmit en el form y vincularlo al handler */}
          <div className="mb-3">
            <label htmlFor="nombreInput" className="form-label visually-hidden">Nombre completo</label>
            <input
              type="text"
              className="form-control form-control-lg" // form-control-lg para campos más grandes
              id="nombreInput"
              placeholder="Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              aria-label="Nombre completo"
              autoComplete="name" // Autocompletado para el nombre
            />
          </div>

          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label visually-hidden">Correo electrónico</label>
            <input
              type="email"
              className="form-control form-control-lg" // form-control-lg para campos más grandes
              id="emailInput"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Correo electrónico"
              autoComplete="email" // Autocompletado para el email
            />
          </div>

          <div className="mb-4">
            <label htmlFor="passwordInput" className="form-label visually-hidden">Contraseña</label>
            <input
              type="password"
              className="form-control form-control-lg" // form-control-lg para campos más grandes
              id="passwordInput"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Contraseña"
              autoComplete="new-password" // Sugerencia para nueva contraseña
            />
          </div>

          <button type="submit" className="btn btn-success btn-lg w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registrando...
              </>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        {/* Enlace para volver al login */}
        <p className="text-center mt-3">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
}