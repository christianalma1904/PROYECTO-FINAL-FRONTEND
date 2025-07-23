import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!nombre || !email || !password) {
      setError("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      await register(nombre, email, password);
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al registrar usuario. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenedor principal con el fondo verde degradado
    // min-vh-100 asegura que ocupe al menos el 100% de la altura de la vista
    // d-flex, justify-content-center, align-items-center para centrar el contenido
    <div
      className="d-flex justify-content-center align-items-center min-vh-100 py-5"
      style={{
        background: 'linear-gradient(to bottom right, #e6ffe6, #c2f0c2, #85e085)', // Degradado de verdes sutiles
      }}
    >
      {/*
        Card de Bootstrap para el formulario:
        - shadow-lg: Sombra grande para un efecto de profundidad.
        - p-4 p-md-5: Padding responsivo, más grande en pantallas medianas y superiores.
        - rounded-4: Bordes más redondeados.
        - bg-white: Fondo blanco para el card.
        - w-100: Ocupa el 100% del ancho del padre.
        - max-width: 450px: Limita el ancho máximo para que no se extienda demasiado en pantallas grandes.
      */}
      <div className="card shadow-lg p-4 p-md-5 bg-white rounded-4" style={{ maxWidth: '450px', width: '100%' }}>
        <h2 className="text-center mb-4 fw-bold text-success">Regístrate</h2> {/* Título con color verde */}

        {error && (
          <div className="alert alert-danger text-center animate__animated animate__fadeIn mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="nombreInput" className="form-label visually-hidden">Nombre completo</label>
            <input
              type="text"
              className="form-control form-control-lg" // Campos grandes
              id="nombreInput"
              placeholder="Nombre completo" // Placeholder actualizado
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              aria-label="Nombre completo"
              autoComplete="name"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label visually-hidden">Correo electrónico</label>
            <input
              type="email"
              className="form-control form-control-lg" // Campos grandes
              id="emailInput"
              placeholder="Correo electrónico" // Placeholder actualizado
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Correo electrónico"
              autoComplete="email"
            />
          </div>

          <div className="mb-4"> {/* mb-4 para más espacio antes del botón */}
            <label htmlFor="passwordInput" className="form-label visually-hidden">Contraseña</label>
            <input
              type="password"
              className="form-control form-control-lg" // Campos grandes
              id="passwordInput"
              placeholder="Contraseña" // Placeholder actualizado
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Contraseña"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-success btn-lg w-100 py-2 fw-bold" disabled={loading}>
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

        {/* Enlace para volver al login con estilo similar al diseño */}
        <p className="text-center mt-4 text-muted">
          ¿Ya tienes una cuenta? <a href="/login" className="text-decoration-none text-success fw-semibold">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
}