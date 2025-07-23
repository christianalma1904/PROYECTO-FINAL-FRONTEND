import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
// No es necesario importar componentes específicos de react-bootstrap
// si solo estás usando las clases de CSS de Bootstrap directamente.

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiLogin(email, password);
      authLogin(res.access_token);
      navigate('/dashboard'); // Asumiendo que el dashboard es la página de inicio post-login
    } catch (err: any) {
      console.error(err);
      // Mensaje de error más amigable para el usuario
      setError(err.message || 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
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
        <h2 className="text-center mb-4 fw-bold text-success">Iniciar Sesión</h2> {/* Título con color verde */}

        {error && (
          <div className="alert alert-danger text-center animate__animated animate__fadeIn mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label visually-hidden">Correo electrónico</label>
            <input
              type="email"
              className="form-control form-control-lg" // Campos grandes
              id="emailInput"
              placeholder="Correo electrónico" // Placeholder directo como en el diseño
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
              placeholder="Contraseña" // Placeholder directo como en el diseño
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Contraseña"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-success btn-lg w-100 py-2 fw-bold" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Cargando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Enlace para registrarse con estilo similar al diseño */}
        <p className="text-center mt-4 text-muted">
          ¿No tienes una cuenta? <a href="/register" className="text-decoration-none text-success fw-semibold">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
}