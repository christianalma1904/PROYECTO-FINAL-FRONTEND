import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
// Si vas a usar componentes de react-bootstrap para el formulario, los importarías aquí
// import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';


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
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      // Mensaje de error más amigable para el usuario
      setError(err.message || 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Usamos d-flex y flex-column para centrar verticalmente si la altura es suficiente
    // Añadimos py-5 para un padding vertical en todos los tamaños, y px-3 para padding horizontal en móviles
    // La clase h-100 asegura que ocupe el 100% de la altura disponible dentro de su padre si es flex
    <div className="d-flex flex-column justify-content-center align-items-center py-5 px-3" style={{ minHeight: '100vh' }}>
      {/*
        Card de Bootstrap:
        - shadow para una sombra sutil
        - p-4 para padding interno
        - mx-auto para centrado horizontal (margen auto en x)
        - w-100 para que ocupe el 100% del ancho disponible
        - max-width: 400px es bueno, pero podemos hacerla responsive con w-sm-75 w-md-50 w-lg-30
          o simplemente limitarla con una clase de Bootstrap como col-12 col-md-6 col-lg-4 dentro de un Row/Col
          Para este caso, manteniendo tu estilo, ajustaremos el maxWidth con responsive classes.
      */}
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Iniciar sesión</h2>

        {error && (
          <div className="alert alert-danger text-center animate__animated animate__fadeIn mb-3" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label visually-hidden">Correo electrónico</label> {/* visually-hidden para accesibilidad si ya hay placeholder */}
            <input
              type="email"
              className="form-control form-control-lg" // form-control-lg para campos más grandes y fáciles de tocar
              id="emailInput"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Correo electrónico"
              autoComplete="email" // Sugerencia de autocompletado del navegador
            />
          </div>

          <div className="mb-4">
            <label htmlFor="passwordInput" className="form-label visually-hidden">Contraseña</label> {/* visually-hidden para accesibilidad si ya hay placeholder */}
            <input
              type="password"
              className="form-control form-control-lg" // form-control-lg para campos más grandes
              id="passwordInput"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Contraseña"
              autoComplete="current-password" // Sugerencia de autocompletado del navegador
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
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

        {/* Puedes añadir un enlace para registrarse si no lo tienes en el Navbar */}
        <p className="text-center mt-3">
          ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
}