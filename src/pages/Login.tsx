// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, LoginSuccessResponse } from '../api/auth'; 
import { useAuth } from '../context/AuthContext';
// No necesitas jwtDecode aquí directamente, ya lo usa AuthContext

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authContextLogin } = useAuth(); // Obtén la función login del contexto

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: LoginSuccessResponse = await apiLogin(email, password); 

      if (data && data.access_token) {
        // Llama a la función login del contexto, pasándole solo el access_token
        // El contexto se encargará de decodificar el token y guardar la info del usuario.
        authContextLogin(data.access_token); // <--- MODIFICADO: SOLO PASAMOS EL TOKEN

        navigate('/dashboard'); // Redirige después de que el contexto actualice el estado
      } else {
        // Este else ahora es menos probable que se active si la API siempre devuelve access_token
        setError('Respuesta de login inválida: no se recibió un token de acceso.');
      }
    } catch (err: any) {
      console.error("Error en el inicio de sesión:", err);
      setError(err.message || "Error al iniciar sesión. Por favor, verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-5">
      <h1>Login</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          className="form-control my-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="form-control my-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}