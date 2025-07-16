import { useEffect, useState } from 'react';
import { getSeguimiento, createSeguimiento } from '../api/seguimiento';

export default function Seguimiento() {
  const [seguimiento, setSeguimiento] = useState<any[]>([]);
  const [paciente_id, setPacienteId] = useState('');
  const [semana, setSemana] = useState(0);
  const [peso, setPeso] = useState(0);
  const [fecha, setFecha] = useState('');

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    getSeguimiento().then(setSeguimiento);
  }, []);

  async function handleCreate() {
    await createSeguimiento({
      paciente_id, semana, peso,
      medidas: { cintura: 80, cadera: 90 },
      fotos: [],
      fecha
    });
    getSeguimiento().then(setSeguimiento);
    setPacienteId(''); setSemana(0); setPeso(0); setFecha('');
  }

  if (!user || user.rol !== 'admin') return (
    <div className="mt-5">
      <h3>Mi Seguimiento</h3>
      <ul className="list-group">
        {seguimiento.filter(s => s.paciente_id === user?.id).map(s => (
          <li key={s._id} className="list-group-item">{JSON.stringify(s)}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="mt-5">
      <h3>Seguimiento</h3>
      <input className="form-control my-2" placeholder="Paciente ID" value={paciente_id} onChange={e => setPacienteId(e.target.value)} />
      <input className="form-control my-2" placeholder="Semana" type="number" value={semana} onChange={e => setSemana(+e.target.value)} />
      <input className="form-control my-2" placeholder="Peso" type="number" value={peso} onChange={e => setPeso(+e.target.value)} />
      <input className="form-control my-2" placeholder="Fecha" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      <button className="btn btn-success mb-3" onClick={handleCreate}>Crear Seguimiento</button>
      <ul className="list-group">
        {seguimiento.map(s => (
          <li key={s._id} className="list-group-item">{JSON.stringify(s)}</li>
        ))}
      </ul>
    </div>
  );
}
