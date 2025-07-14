import { useEffect, useState } from 'react';
import { getProtected } from './api';
import { useNavigate } from 'react-router-dom';

type Plan = {
  id: number;
  nombre: string;
  precio: number;
};

// Puedes usar cualquier imagen de Unsplash, Pexels, etc.
// Aquí te paso una de ejemplo sobre nutrición:
const backgroundUrl =
  "https://www.gob.mx/cms/uploads/article/main_image/116285/AlimentacionSaludable.jpg";

export default function Dashboard() {
  const [data, setData] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      getProtected()
        .then((res) => {
          setData(Array.isArray(res) ? res : res.items ?? []);
          setLoading(false);
        })
        .catch(() => {
          setError("No se pudo cargar los datos.");
          setLoading(false);
        });
    }
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundImage: `url('${backgroundUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Overlay blanco translúcido */}
      <div
        style={{
          width: '100%',
          minHeight: '100vh',
          background: 'rgba(255,255,255,0.82)', // Ajusta el alpha si quieres más/menos transparencia
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <div className="container py-5">
          <div className="row mb-4">
            <div className="col text-center">
              <h1 className="fw-bold">Dashboard Protegido</h1>
              <p className="text-secondary mb-0">Listado de planes disponibles</p>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">Planes</h5>
                </div>
                <ul className="list-group list-group-flush">
                  {loading && (
                    <li className="list-group-item text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </li>
                  )}
                  {error && (
                    <li className="list-group-item text-danger text-center">{error}</li>
                  )}
                  {!loading && !error && data.length === 0 && (
                    <li className="list-group-item text-center text-muted">
                      No hay planes disponibles.
                    </li>
                  )}
                  {!loading && !error && data.map((d) => (
                    <li key={d.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">{d.nombre}</span>
                      <span className="badge bg-success fs-6">${d.precio}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
