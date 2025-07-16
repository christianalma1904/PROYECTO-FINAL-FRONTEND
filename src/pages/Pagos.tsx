// src/pages/Pagos.tsx (Opción B: NO RECOMENDADO, pero para que veas cómo sería)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Necesitas useNavigate también

import { getPagos, createPago } from '../api/pagos';
// Posiblemente también necesites getPlanById si vas a cargar detalles de planes
// import { getPlanById } from '../api/planes'; 

interface Plan {
    id: string; 
    nombre: string;
    descripcion: string;
    precio: number;
}

export default function Pagos() {
    const { id } = useParams<{ id: string }>(); // Captura el ID si existe en la URL
    const navigate = useNavigate(); // Para posibles redirecciones

    // Estado para la administración de pagos (admin)
    const [pagos, setPagos] = useState<any[]>([]);
    const [pacienteId, setPacienteId] = useState(0); // Renombrado para evitar conflicto con 'id' del plan
    const [planIdAdmin, setPlanIdAdmin] = useState(0); // Renombrado
    const [montoAdmin, setMontoAdmin] = useState(0); // Renombrado
    const [fechaAdmin, setFechaAdmin] = useState(''); // Renombrado

    // Estado para la compra de un plan (usuario)
    const [planDetails, setPlanDetails] = useState<Plan | null>(null);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [errorPlan, setErrorPlan] = useState<string | null>(null);

    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    const isAdmin = user && user.rol === 'admin';

    useEffect(() => {
        // Lógica para cargar planes específicos si hay un ID y el usuario no es admin
        if (id && !isAdmin) {
            setLoadingPlan(true);
            setErrorPlan(null);
            // Simulación o llamada a la API para obtener detalles del plan
            setTimeout(() => {
                setPlanDetails({
                    id: id,
                    nombre: `Plan de Compra ID: ${id}`,
                    descripcion: 'Descripción para compra.',
                    precio: 55.00
                });
                setLoadingPlan(false);
            }, 500);
        } else if (isAdmin) {
            // Lógica para cargar todos los pagos si es admin
            getPagos().then(setPagos).catch(console.error);
        }
    }, [id, isAdmin]); // Dependencias para re-ejecutar

    async function handleCreatePagoAdmin() { // Renombrada para evitar conflicto
        await createPago({ paciente: pacienteId, plan: planIdAdmin, monto: montoAdmin, fecha: fechaAdmin });
        getPagos().then(setPagos);
        setPacienteId(0); setPlanIdAdmin(0); setMontoAdmin(0); setFechaAdmin('');
    }

    // Renderizado condicional basado en el rol y la presencia de ID
    if (isAdmin) {
        // Modo ADMINISTRADOR
        return (
            <div className="mt-5">
                <h3>Gestión de Pagos (Admin)</h3>
                <input className="form-control my-2" placeholder="ID Paciente" type="number" value={pacienteId} onChange={e => setPacienteId(+e.target.value)} />
                <input className="form-control my-2" placeholder="ID Plan" type="number" value={planIdAdmin} onChange={e => setPlanIdAdmin(+e.target.value)} />
                <input className="form-control my-2" placeholder="Monto" type="number" value={montoAdmin} onChange={e => setMontoAdmin(+e.target.value)} />
                <input className="form-control my-2" placeholder="Fecha" type="date" value={fechaAdmin} onChange={e => setFechaAdmin(e.target.value)} />
                <button className="btn btn-success mb-3" onClick={handleCreatePagoAdmin}>Crear Pago</button>
                <ul className="list-group">
                    {pagos.map(pg => (
                        <li key={pg.id} className="list-group-item">${pg.monto} - {pg.fecha}</li>
                    ))}
                </ul>
            </div>
        );
    } else if (id && !isAdmin) {
        // Modo COMPRA DE PLAN (Usuario no admin con ID en URL)
        if (loadingPlan) {
            return <div className="container mt-5"><p>Cargando detalles del plan para compra...</p></div>;
        }
        if (errorPlan) {
            return <div className="container mt-5" style={{color: 'red'}}><p>{errorPlan}</p></div>;
        }
        if (!planDetails) {
            return <div className="container mt-5"><p>No se encontraron detalles para este plan.</p></div>;
        }
        return (
            <div className="container mt-5">
                <h2>Comprar Plan: {planDetails.nombre}</h2>
                <p><strong>Descripción:</strong> {planDetails.descripcion}</p>
                <p><strong>Precio:</strong> ${planDetails.precio.toFixed(2)}</p>
                <hr />
                <h4>Información de Pago</h4>
                <form>
                    <div className="mb-3">
                        <label htmlFor="card-number" className="form-label">Número de Tarjeta</label>
                        <input type="text" id="card-number" className="form-control" placeholder="**** **** **** ****" required />
                    </div>
                    {/* ... Resto del formulario de pago ... */}
                    <button type="submit" className="btn btn-primary mt-3">Proceder al Pago</button>
                </form>
            </div>
        );
    } else {
        // Usuario no admin y sin ID en la URL (o alguna otra condición no manejada)
        return <div className="container mt-5">Acceso no autorizado o página no encontrada.</div>;
    }
}