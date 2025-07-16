import { useEffect, useState } from 'react';
import { getNutricionistas, createNutricionista } from '../api/nutricionistas';

export default function Nutricionistas() {
  const [nutris, setNutris] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [email, setEmail] = useState('');

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    getNutricionistas().then(setNutris);
  }, []);

  async function handleCreate() {
    await createNutricionista({ nombre, especialidad, email });
    getNutricionistas().then(setNutris);
    setNombre(''); setEspecialidad(''); setEmail('');
  }

  if (!user || user.rol !== 'admin') return null;

  return (
    <div className="mt-5">
      <h3>Nutricionistas</h3>
      <input className="form-control my-2" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
      <input className="form-control my-2" placeholder="Especialidad" value={especialidad} onChange={e => setEspecialidad(e.target.value)} />
      <input className="form-control my-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <button className="btn btn-success mb-3" onClick={handleCreate}>Crear Nutricionista</button>
      <ul className="list-group">
        {nutris.map(n => (
          <li key={n.id} className="list-group-item">{n.nombre} - {n.especialidad} ({n.email})</li>
        ))}
      </ul>
    </div>
  );
}
