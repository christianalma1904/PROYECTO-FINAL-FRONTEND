import { useState } from 'react';
import { login } from './api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const data = await login(email, password);
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      navigate('/dashboard');
    } else {
      alert('Login fallido');
    }
  };

  return (
    <div className="container mt-5">
      <h1>Login</h1>
      <input className="form-control my-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="form-control my-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className="btn btn-primary" onClick={handleLogin}>Ingresar</button>
    </div>
  );
}