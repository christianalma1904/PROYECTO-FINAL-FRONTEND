// src/api/planes.ts
const API = process.env.REACT_APP_API_URL;

// Esta función se encarga de obtener el token de localStorage
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}` // Obtiene el token aquí
});

// Interfaz para el Plan (asegúrate de que sea consistente)
interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  // Agrega otras propiedades del plan si las tienes
}

// CORREGIDO: getPlanes NO ACEPTA ARGUMENTOS
export async function getPlanes(): Promise<Plan[]> { // <--- SIN ARGUMENTOS AQUÍ
  return fetch(`${API}/planes`, { headers: headers() })
    .then(res => {
      if (!res.ok) {
        // Manejo de errores similar al de auth.ts para consistencia
        return res.json().then(errorData => {
          throw new Error(errorData.message || 'Error al obtener los planes');
        });
      }
      return res.json();
    })
    .catch(error => {
      console.error("Error en la función getPlanes:", error);
      throw error;
    });
}

// CORREGIDO: createPlan NO ACEPTA EL TOKEN COMO ARGUMENTO
export async function createPlan(plan: any): Promise<any> { // <--- SIN ARGUMENTO 'token' AQUÍ
  return fetch(`${API}/planes`, {
    method: 'POST',
    headers: headers(), // Utiliza la función headers() que ya incluye el token
    body: JSON.stringify(plan)
  })
  .then(res => {
    if (!res.ok) {
      // Manejo de errores
      return res.json().then(errorData => {
        throw new Error(errorData.message || 'Error al crear el plan');
      });
    }
    return res.json();
  })
  .catch(error => {
    console.error("Error en la función createPlan:", error);
    throw error;
  });
}