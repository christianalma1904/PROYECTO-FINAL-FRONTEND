// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importa LoginSuccessResponse junto con la función login
import { login as apiLogin, LoginSuccessResponse } from '../api/auth'; 
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

// Interfaz para el objeto 'claims' dentro del token JWT
// Asegúrate de que 'role' coincida con la clave de rol en tu token JWT.
interface DecodedToken {
  sub: number; // Subject (generalmente el ID del usuario)
  role: string; // ¡Esta es la clave para el rol!
  iat: number; // Issued At
  exp: number; // Expiration
  // Agrega otras propiedades si tu token contiene más información útil (ej. 'email')
}

// ELIMINA ESTA INTERFAZ YA QUE AHORA IMPORTAS LoginSuccessResponse
// interface LoginResponse { /* ... */ } 

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
      // Ahora 'data' será de tipo LoginSuccessResponse que sí tiene 'access_token' y 'user'
      const data: LoginSuccessResponse = await apiLogin(email, password); 

      if (data && data.access_token) {
        // Llama a la función login del contexto para manejar el token y el usuario
        // El contexto se encargará de guardar en localStorage y actualizar el estado global
        authContextLogin(data.access_token, data.user); // <--- ¡PASANDO EL OBJETO user COMPLETO!

        navigate('/dashboard'); // Redirige después de que el contexto actualice el estado
      } else {
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