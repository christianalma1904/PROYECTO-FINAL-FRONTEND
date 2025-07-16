// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { jwtDecode } from 'jwt-decode'; // ¡Importa jwtDecode!

// Interfaz para el objeto 'claims' dentro del token JWT
// Asegúrate de que 'role' coincida con la clave de rol en tu token JWT.
interface DecodedToken {
  sub: number; // Subject (generalmente el ID del usuario)
  role: string; // ¡Esta es la clave para el rol!
  iat: number; // Issued At
  exp: number; // Expiration
  // Agrega otras propiedades si tu token contiene más información útil (ej. 'email')
}

// Interfaz para la respuesta esperada de la función 'login' en src/api/auth.ts
// Ahora esperamos que solo venga el access_token directamente.
interface LoginResponse {
  access_token: string;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    setError(null); // Limpia cualquier error previo
    setLoading(true); // Activa el indicador de carga

    try {
      // La función 'login' ahora solo devuelve { access_token: string }
      const data: LoginResponse = await login(email, password); 

      if (data && data.access_token) {
        localStorage.setItem('token', data.access_token);

        // *** Decodifica el token para obtener la información del usuario ***
        try {
          const decoded: DecodedToken = jwtDecode(data.access_token);
          
          // Crea un objeto 'user' para guardar en localStorage.
          // Es crucial que 'rol' se mapee correctamente a 'role' del token
          // y que 'id' se mapee a 'sub' del token.
          const user = {
            id: String(decoded.sub), // Asegúrate de que el ID sea string si así lo esperas
            rol: decoded.role,      // Obtenemos el rol directamente del token
            email: email,           // El email no está en el token que me mostraste, lo tomamos del input
            // Puedes añadir 'name' o 'username' si el token los contiene o si los obtienes de otra forma
          };
          localStorage.setItem('user', JSON.stringify(user));

          navigate('/dashboard');

        } catch (decodeError) {
          console.error("Error al decodificar el token:", decodeError);
          setError('Error al procesar el token de autenticación. Inténtalo de nuevo.');
          localStorage.removeItem('token'); // Limpia el token si no se pudo decodificar
          localStorage.removeItem('user'); // Limpia el user también
          setLoading(false);
          return; // Detiene la ejecución si hay error en la decodificación
        }

      } else {
        // Este error se mostrará si 'data' es nulo o si no tiene 'access_token'
        setError('Respuesta de login inválida: no se recibió un token de acceso.');
      }
    } catch (err: any) { // Captura cualquier error lanzado por la función 'login'
      console.error("Error en el inicio de sesión:", err);
      // Muestra un mensaje de error más específico
      setError(err.message || "Error al iniciar sesión. Por favor, verifica tus credenciales.");
    } finally {
      setLoading(false); // Desactiva el indicador de carga
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