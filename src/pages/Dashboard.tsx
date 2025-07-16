// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Importaciones de tus componentes que están en la misma carpeta 'pages'
import Planes from './Planes';
import Pacientes from './Pacientes';
import Nutricionistas from './Nutricionistas';
import Pagos from './Pagos';
import Dietas from './Dietas';
import Seguimiento from './Seguimiento';

// ¡IMPORTACIÓN DE LA API CORREGIDA!
// HE CAMBIADO 'data' A 'auth'.
// SI TU FUNCIÓN 'getProtected' ESTÁ EN UN ARCHIVO DIFERENTE DENTRO DE 'src/api',
// POR FAVOR, CAMBIA 'auth' POR EL NOMBRE DE ESE ARCHIVO (ej. 'planes', 'nutricionistas', etc.).
import { getProtected } from '../api/auth'; // <--- ¡RUTA CORREGIDA!

// Define los tipos de datos. Mantenemos los que ya definimos.
interface User {
  rol: string;
  // Añade otras propiedades que tu objeto 'user' tenga, e.g.: id: string; name: string;
}

type Plan = {
  id: string; // O el tipo de ID real, e.g., number
  name: string;
  description?: string;
  price?: number;
  // ... otras propiedades de tus planes
};

interface ApiDataResponse {
  items: Plan[]; // Ajusta si la respuesta tiene otra estructura
}


export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- MANEJO SEGURO DEL USUARIO DESDE localStorage ---
    const userString = localStorage.getItem('user');
    let user: User | null = null; 

    if (userString) {
      try {
        user = JSON.parse(userString);
      } catch (e) {
        console.error("Error al analizar los datos de usuario desde localStorage:", e);
        localStorage.removeItem('user');
      }
    }
    
    // CORRECCIÓN para TS2345: Asegura que el valor sea estrictamente boolean
    setIsAdmin(!!(user && user.rol === 'admin')); 


    // --- LLAMADA A LA API ---
    const token = localStorage.getItem('token');
    // Si Dashboard hace una llamada a una API protegida y requiere ser admin y tener token
    // Ajusta la lógica 'user && user.rol === 'admin' && token' según tus necesidades
    if (user && user.rol === 'admin' && token) {
      getProtected()
        .then((res: ApiDataResponse | Plan[]) => { 
          setData(Array.isArray(res) ? res : res.items ?? []);
          setLoading(false);
        })
        .catch((error: any) => { // CORRECCIÓN para TS7006: Tipado explícito de 'error'
          console.error("Error al cargar datos protegidos:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
      setData([]); 
    }

  }, []); // Dependencias vacías para que se ejecute solo al montar el componente


  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>
      {loading ? (
        <p>Cargando información...</p>
      ) : isAdmin ? (
        <>
          <Planes admin={true}/>
          <Pacientes />
          <Nutricionistas />
          <Pagos />
          <Dietas />
          <Seguimiento />
        </>
      ) : (
        <>
          <Planes admin={false}/>
          <Dietas />
          <Seguimiento />
        </>
      )}
    </div>
  );
}