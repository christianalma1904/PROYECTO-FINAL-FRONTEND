import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated]);

  return (
    <div className="bg-light min-vh-100">
      <header className="container py-5 d-flex flex-column flex-lg-row align-items-center justify-content-between">
        <div className="mb-4 mb-lg-0">
          <h1 className="display-5 fw-bold">Bienvenido a <span className="text-success">Nutri Plans</span></h1>
          <p className="lead">
            Tu sistema personalizado para el seguimiento de planes nutricionales, registro de hábitos y gestión de progreso.
          </p>
          {!isAuthenticated && (
            <button className="btn btn-success mt-3" onClick={() => navigate('/login')}>
              Empieza ahora
            </button>
          )}
        </div>
        <img src="https://libera.pe/wp-content/uploads/2019/12/nutrici%C3%B3n.jpg" alt="Nutrición" className="img-fluid rounded shadow" style={{ maxWidth: 500 }} />
      </header>

      <section className="container py-5">
        <h2 className="text-center mb-4">¿Qué puedes hacer con Nutri Plans?</h2>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Gestiona tus hábitos</h5>
                <p className="card-text">
                  Registra tu progreso diario en peso, alimentación y rutinas saludables.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Planes nutricionales</h5>
                <p className="card-text">
                  Accede a planes alimenticios personalizados creados por nutricionistas expertos.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Estadísticas visuales</h5>
                <p className="card-text">
                  Visualiza tu progreso con gráficas, logros y cumplimiento semanal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
