// src/api/planes.ts
const API_URL = process.env.REACT_APP_API_URL;

interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  // ... otras propiedades
}

export async function getPlanes(token: string): Promise<Plan[]> {
  try {
    const res = await fetch(`${API_URL}/planes`, { // Asume que el endpoint es /planes
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al obtener los planes');
    }

    return res.json();
  } catch (error) {
    console.error("Error en la función getPlanes:", error);
    throw error;
  }
}

// Asegúrate de que NO HAYA NINGUNA FUNCIÓN RELACIONADA CON LA COMPRA DE PLANES AQUÍ.