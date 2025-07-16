// src/pages/Planes.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlanes, createPlan } from '../api/planes';

interface Plan {
  id: string; // Asumiendo que el ID es un string, ajústalo si es number
  nombre: string;
  descripcion: string;
  precio: number;
}

export default function Planes({ admin = false }: { admin?: boolean }) {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getPlanes()
      .then((data: Plan[]) => setPlanes(data))
      .catch(error => console.error("Error al obtener planes:", error));
  }, []);

  async function handleCreate() {
    try {
      await createPlan({ nombre, descripcion, precio });
      getPlanes().then(setPlanes);
      setNombre('');
      setDescripcion('');
      setPrecio(0);
    } catch (error) {
      console.error("Error al crear plan:", error);
    }
  }

  // Función para manejar el clic en "Comprar" y redirigir a la página de Pagos
  function handleComprarClick(planId: string) {
    navigate(`/pagar/${planId}`); // ¡RUTA CORREGIDA: Ahora es '/pagar/' o '/pagos/'!
  }

  return (
    <div className="mt-5">
      <h3>Planes</h3>
      {admin && (
        <>
          <input className="form-control my-2" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input className="form-control my-2" placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          <input type="number" className="form-control my-2" placeholder="Precio" value={precio} onChange={(e) => setPrecio(+e.target.value)} />
          <button className="btn btn-success mb-3" onClick={handleCreate}>Crear Plan</button>
        </>
      )}
      <ul className="list-group">
        {planes.map(plan => (
          <li key={plan.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{plan.nombre}</strong> - {plan.descripcion} - ${plan.precio}
            </div>
            {!admin && (
              <button
                className="btn btn-success"
                onClick={() => handleComprarClick(plan.id)}
              >
                Comprar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}