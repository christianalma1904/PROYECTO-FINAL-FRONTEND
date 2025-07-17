import { useEffect, useState } from 'react';
import { getPlanes } from '../api/planes';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [planes, setPlanes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const navigate = useNavigate();

  useEffect(() => {
    getPlanes()
      .then(setPlanes)
      .catch((err) => {
        console.error('Error al obtener planes:', err);
        setError('No se pudieron cargar los planes');
      });
  }, []);

  function handleComprar(planId: number) {
    if (!token) navigate('/login');
    // Aquí puedes abrir el flujo de pagos
    alert(`Ir a pagar plan #${planId} (ejemplo)`);
  }

  return (
    <div className="container mt-5">
      <h1>Planes Nutricionales</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <ul className="list-group">
        {planes.map(plan => (
          <li key={plan.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{plan.nombre}</strong> - ${plan.precio}
            </div>
            {(!user || user.rol !== 'admin') &&
              <button className="btn btn-success" onClick={() => handleComprar(plan.id)}>Comprar</button>
            }
          </li>
        ))}
      </ul>
    </div>
  );
}
