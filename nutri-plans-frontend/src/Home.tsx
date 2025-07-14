import { useEffect, useState } from 'react';
import { getPlanes } from './api';

export default function Home() {
  const [planes, setPlanes] = useState<any[]>([]);

  useEffect(() => {
    getPlanes().then(data => setPlanes(data));
  }, []);

  return (
    <div className="container mt-5">
      <h1>Planes Nutricionales</h1>
      <ul className="list-group">
        {planes.map(plan => (
          <li key={plan.id} className="list-group-item">
            <strong>{plan.nombre}</strong> - ${plan.precio}
          </li>
        ))}
      </ul>
    </div>
  );
}