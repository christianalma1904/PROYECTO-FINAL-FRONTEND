// src/api/planes.ts
const API = process.env.REACT_APP_API_URL;

// Esta función se encarga de obtener el token de localStorage.
// Si el token no está presente simplemente no incluye la cabecera
// Authorization para permitir llamadas públicas.
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Interfaz para el Plan (asegúrate de que sea consistente)
export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  // Agrega otras propiedades del plan si las tienes
}

export async function getPlanes(): Promise<Plan[]> {
  try {
    const res = await fetch(`${API}/planes`, {
      method: 'GET',
      headers: getAuthHeaders(), // Utiliza la función getAuthHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || 'Error al obtener los planes');
    }
    return res.json();
  } catch (error) {
    console.error("Error en la función getPlanes:", error);
    throw error;
  }
}

export async function createPlan(plan: any): Promise<any> {
  try {
    const res = await fetch(`${API}/planes`, {
      method: 'POST',
      headers: getAuthHeaders(), // Utiliza la función getAuthHeaders()
      body: JSON.stringify(plan)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || 'Error al crear el plan');
    }
    return res.json();
  } catch (error) {
    console.error("Error en la función createPlan:", error);
    throw error;
  }
}