import { useState } from 'react';
import { login } from './api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // State para manejar errores
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => { // Cambiado a handleSubmit y acepta React.FormEvent
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    setError(null); // Limpiar errores anteriores

    try {
      const data = await login(email, password);
      // El almacenamiento del token ya se realiza dentro de la función `login` en api.ts
      console.log('Login exitoso:', data);
      navigate('/dashboard');
    } catch (err: any) {
      // Capturar y mostrar errores del login
      setError(`Error al iniciar sesión: ${err.message || 'Error desconocido'}`);
      console.error('Error de login:', err);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Mostrar error si existe */}
      <form onSubmit={handleSubmit}> {/* Usar un formulario con onSubmit */}
        <div className="mb-3">
          <label htmlFor="emailInput" className="form-label">Email:</label>
          <input
            type="email"
            className="form-control"
            id="emailInput"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="passwordInput" className="form-label">Contraseña:</label>
          <input
            type="password"
            className="form-control"
            id="passwordInput"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Ingresar</button> {/* Cambiado a type="submit" */}
      </form>
    </div>
  );
}