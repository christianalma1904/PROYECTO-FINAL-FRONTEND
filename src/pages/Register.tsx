import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleRegister() {
    await register(nombre, email, password);
    navigate('/login');
  }

  return (
    <div className="container mt-5">
      <h1>Register</h1>
      <input className="form-control my-2" placeholder="Nombre" onChange={(e) => setNombre(e.target.value)} />
      <input className="form-control my-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="form-control my-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className="btn btn-success" onClick={handleRegister}>Registrarse</button>
    </div>
  );
}
