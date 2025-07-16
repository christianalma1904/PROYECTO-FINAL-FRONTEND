import { useEffect, useState } from 'react';
import { getPacientes, createPaciente } from '../api/pacientes';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    getPacientes().then(setPacientes);
  }, []);

  async function handleCreate() {
    await createPaciente({ nombre, email, password });
    getPacientes().then(setPacientes);
    setNombre(''); setEmail(''); setPassword('');
  }

  if (!user || user.rol !== 'admin') return null;

  return (
    <div className="mt-5">
      <h3>Pacientes</h3>
      <input className="form-control my-2" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
      <input className="form-control my-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="form-control my-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="btn btn-success mb-3" onClick={handleCreate}>Crear Paciente</button>
      <ul className="list-group">
        {pacientes.map(p => (
          <li key={p.id} className="list-group-item">{p.nombre} ({p.email})</li>
        ))}
      </ul>
    </div>
  );
}
