import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  const toggleFlip = (index: number) => {
    setFlippedIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated]);

  const plans = [
    {
      name: 'Plan Equilibrado',
      img: 'https://www.dietistasnutricionistas.es/wp-content/uploads/2021/02/products-in-textile-bags-glassware-eco-friendly-sh-8TVJRBG-1024x683.jpg',
      short: 'Alimentación sana y variada.',
      detail: 'Este plan ofrece una combinación equilibrada de nutrientes esenciales, ideal para mantener una salud estable sin restricciones extremas.',
    },
    {
      name: 'Plan Adelgazante',
      img: 'https://estaticos-cdn.prensaiberica.es/clip/2657dda0-9916-46e4-bf53-1f290545ccf6_16-9-discover-aspect-ratio_default_0.jpg',
      short: 'Reduce peso con energía.',
      detail: 'Diseñado para personas que desean bajar de peso de forma saludable, sin comprometer su vitalidad ni masa muscular.',
    },
    {
      name: 'Plan Deportivo',
      img: 'https://basquetlg.com/imgd/cinco-ideas-sobre-basquet-y-marketing-deportivo-1.jpg',
      short: 'Máximo rendimiento físico.',
      detail: 'Ideal para deportistas y personas activas, incluye comidas ricas en proteínas, carbohidratos complejos y control de tiempos de ingesta.',
    },
  ];

  return (
    <div style={{ background: "#f6fff8", minHeight: "100vh" }}>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(90deg, #27ae60 0%, #4CAF50 100%)',
          color: 'white',
          borderRadius: '0 0 2rem 2rem',
          boxShadow: '0 2px 24px 0 rgba(39,174,96,0.09)'
        }}
        className="py-5 mb-4"
      >
        <div className="container d-flex flex-column-reverse flex-lg-row align-items-center justify-content-between gap-4">
          <div className="text-center text-lg-start">
            <h1 className="display-4 fw-bold mb-3">
              Transforma tu bienestar con <span style={{ color: '#d9f99d' }}>Nutri Plans</span>
            </h1>
            <p className="lead text-white-50 mb-4">
              Organiza tus hábitos, mejora tu alimentación y lleva un control visual de tu progreso. Diseñado para acompañarte paso a paso.
            </p>
            {!isAuthenticated && (
              <button
                className="btn btn-success btn-lg px-4 py-2 rounded-pill shadow"
                style={{ background: 'linear-gradient(90deg, #4CAF50 60%, #27ae60 100%)', border: 'none' }}
                onClick={() => navigate('/register')}
              >
                Empieza ahora
              </button>
            )}
          </div>
          <img
            src="https://revistavive.com/wp-content/uploads/2020/12/PLAN-NUTRICIONAL-3.png"
            alt="Nutrición saludable"
            className="img-fluid rounded-4 shadow-lg"
            style={{ maxWidth: 420, border: '4px solid #fff' }}
          />
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="container py-5">
        <h2 className="text-center display-6 fw-semibold mb-5" style={{ color: '#38b000' }}>¿Qué puedes hacer con Nutri Plans?</h2>
        <div className="row text-center">
          {[
            {
              title: 'Gestiona tus hábitos',
              text: 'Registra tus actividades diarias como agua, peso, comida o ejercicio.',
            },
            {
              title: 'Planes nutricionales',
              text: 'Accede a dietas personalizadas creadas por nutricionistas certificados.',
            },
            {
              title: 'Estadísticas visuales',
              text: 'Revisa tu progreso con gráficas y logros semanales o mensuales.',
            },
          ].map((item, i) => (
            <div className="col-md-4 mb-4" key={i}>
              <div className="card border-0 shadow-sm h-100 rounded-4" style={{ borderColor: '#27ae60' }}>
                <div className="card-body">
                  <h5 className="card-title text-success fw-bold mb-2">{item.title}</h5>
                  <p className="card-text text-muted">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Planes populares con flip cards */}
      <section className="py-5" style={{ background: "#e6fff2" }}>
        <div className="container text-center">
          <h2 className="display-6 fw-bold mb-4" style={{ color: '#27ae60' }}>Planes populares</h2>
          <p className="text-secondary mb-5">Conoce los planes que más éxito han tenido entre nuestros usuarios.</p>

          <div className="row">
            {plans.map((plan, i) => (
              <div className="col-md-4 mb-4" key={i}>
                <div
                  className="flip-container"
                  style={{ perspective: 1000, cursor: "pointer", height: "340px" }}
                  onClick={() => toggleFlip(i)}
                >
                  <div
                    className={`flip-card h-100 ${flippedIndex === i ? 'flip-rotate' : ''}`}
                    style={{
                      transition: 'transform 0.6s',
                      transformStyle: 'preserve-3d',
                      position: 'relative',
                      height: '100%',
                      borderRadius: '1rem',
                      background: '#fff',
                      boxShadow: '0 0.25rem 0.75rem rgba(52,199,89,0.09)'
                    }}
                  >
                    {/* Frente */}
                    <div
                      className="flip-front"
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: '1rem',
                        padding: '1rem',
                        background: '#fff',
                        boxShadow: '0 0.25rem 0.75rem rgba(39,174,96,0.07)'
                      }}
                    >
                      <img
                        src={plan.img}
                        alt={plan.name}
                        className="w-100 mb-3 rounded"
                        style={{ height: 140, objectFit: 'cover', border: '2px solid #e6fff2' }}
                      />
                      <h5 className="text-success fw-bold">{plan.name}</h5>
                      <p className="text-muted">{plan.short}</p>
                    </div>
                    {/* Reverso */}
                    <div
                      className="flip-back"
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        borderRadius: '1rem',
                        padding: '1rem',
                        background: '#fff',
                        boxShadow: '0 0.25rem 0.75rem rgba(39,174,96,0.07)'
                      }}
                    >
                      <h5 className="text-success fw-bold">{plan.name}</h5>
                      <p className="text-muted mt-3">{plan.detail}</p>
                      <button
                        className="btn btn-outline-success btn-sm mt-3"
                        onClick={e => { e.stopPropagation(); toggleFlip(i); }}
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-white py-5 border-top">
        <div className="container text-center">
          <h2 className="display-6 fw-bold mb-3" style={{ color: "#38b000" }}>
            Empieza hoy tu camino hacia una vida más saludable
          </h2>
          <p className="text-muted mb-4">
            Únete a cientos de usuarios que ya mejoran su bienestar con Nutri Plans.
          </p>
          <button
            className="btn btn-success btn-lg px-4 py-2 rounded-pill shadow"
            style={{ background: 'linear-gradient(90deg, #4CAF50 60%, #27ae60 100%)', border: 'none' }}
            onClick={() => navigate('/register')}
          >
            Registrarme ahora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 mt-5" style={{ background: "#38b000", color: "#fff", borderRadius: "2rem 2rem 0 0" }}>
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="mb-2 mb-md-0">&copy; 2025 Nutri Plans. Todos los derechos reservados.</p>
          <div className="d-flex gap-3">
            <a href="#" className="text-white text-decoration-underline">Política de privacidad</a>
            <a href="#" className="text-white text-decoration-underline">Términos de uso</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
