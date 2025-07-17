import { useEffect, useState } from 'react';
import { getPlanes } from '../api/planes';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [planes, setPlanes] = useState<any[]>([]);
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const navigate = useNavigate();

  useEffect(() => {
    getPlanes()
      .then(setPlanes)
      .catch((error) => {
        console.error("Error al obtener los planes:", error);
        alert("No se pudo cargar los planes. Inicia sesión si es necesario.");
      });
  }, []);

  function handleComprar(planId: number) {
    if (!token) navigate('/login');
    alert(`Ir a pagar plan #${planId} (ejemplo)`);
  }

  return (
    <div className="container mt-5">
      <h1>Planes Nutricionales</h1>
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
