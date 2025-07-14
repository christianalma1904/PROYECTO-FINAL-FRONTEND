import { useEffect, useState } from 'react';
import { getProtected } from './api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      getProtected().then(setData);
    }
  }, [navigate]);

  return (
    <div className="container mt-5">
      <h1>Dashboard Protegido</h1>
      <ul className="list-group">
        {data.map(d => (
          <li key={d.id} className="list-group-item">
            {d.nombre} - ${d.precio}
          </li>
        ))}
      </ul>
    </div>
  );
}