import { useEffect, useState } from 'react';
import { getDietas, createDieta } from '../api/dietas';

export default function Dietas() {
  const [dietas, setDietas] = useState<any[]>([]);
  const [paciente_id, setPacienteId] = useState('');
  const [plan_id, setPlanId] = useState('');
  const [menu, setMenu] = useState('');

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    getDietas().then(setDietas);
  }, []);

  async function handleCreate() {
    await createDieta({
      paciente_id,
      plan_id,
      semanas: [{ semana: 1, menu: menu.split(',') }]
    });
    getDietas().then(setDietas);
    setPacienteId(''); setPlanId(''); setMenu('');
  }

  if (!user || user.rol !== 'admin') return (
    <div className="mt-5">
      <h3>Mis Dietas</h3>
      <ul className="list-group">
        {dietas.filter(d => d.paciente_id === user?.id).map(d => (
          <li key={d._id} className="list-group-item">{JSON.stringify(d)}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="mt-5">
      <h3>Dietas</h3>
      <input className="form-control my-2" placeholder="Paciente ID" value={paciente_id} onChange={e => setPacienteId(e.target.value)} />
      <input className="form-control my-2" placeholder="Plan ID" value={plan_id} onChange={e => setPlanId(e.target.value)} />
      <input className="form-control my-2" placeholder="Menú separado por coma" value={menu} onChange={e => setMenu(e.target.value)} />
      <button className="btn btn-success mb-3" onClick={handleCreate}>Crear Dieta</button>
      <ul className="list-group">
        {dietas.map(d => (
          <li key={d._id} className="list-group-item">{JSON.stringify(d)}</li>
        ))}
      </ul>
    </div>
  );
}
