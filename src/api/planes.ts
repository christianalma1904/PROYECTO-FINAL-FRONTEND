const API = process.env.REACT_APP_API_URL;

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

export async function getPlanes(): Promise<Plan[]> {
  try {
    const res = await fetch(`${API}/planes`, {
      method: 'GET',
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
