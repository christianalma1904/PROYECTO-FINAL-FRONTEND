// src/api/dietas.ts

const API = process.env.REACT_APP_API_URL;

// Define la interfaz para una semana dentro de una dieta
export interface SemanaDieta {
  semana: number;
  menu: string[]; // Un array de strings para los elementos del menú de la semana
}

// Interfaz completa para Dieta
export interface Dieta {
  _id?: string; // ID de MongoDB
  id?: string;  // Si tu backend también usa 'id' además de '_id'
  nombre: string;
  descripcion: string;
  paciente_id: string; // ID del usuario al que se le asignó la dieta
  plan_id?: string; // ID del plan asociado (puede ser opcional si no todas las dietas tienen un plan directamente)
  fechaAsignacion: string; // Formato string para la fecha
  semanas: SemanaDieta[]; // Array de objetos SemanaDieta
}

// Interfaz para el payload de creación de una dieta
// Usamos Omit para excluir _id e id, ya que no se envían al crear
export interface CreateDietaPayload extends Omit<Dieta, '_id' | 'id'> {}


const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("No hay token de autenticación disponible. Por favor, inicia sesión.");
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Función para obtener TODAS las dietas (necesaria para filtrar en el frontend)
export async function getAllDietas(): Promise<Dieta[]> {
  try {
    const res = await fetch(`${API}/dietas`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || 'Error al obtener todas las dietas');
    }

    return res.json();
  } catch (error) {
    console.error("Error en la función getAllDietas:", error);
    throw error;
  }
}

// Función para obtener dietas del usuario logueado (filtrando en el frontend)
export async function getMyDietas(userId: string): Promise<Dieta[]> {
  try {
    // Llama a la función que obtiene TODAS las dietas
    const allDietas: Dieta[] = await getAllDietas(); // Reutilizamos getAllDietas
    // Filtra las dietas en el frontend por el paciente_id del usuario logueado
    const myDietas = allDietas.filter(dieta => dieta.paciente_id === userId);
    return myDietas;
  } catch (error) {
    console.error("Error en la función getMyDietas (filtrado en frontend):", error);
    throw error;
  }
}

// Función para crear una dieta
export async function createDieta(dieta: CreateDietaPayload): Promise<Dieta> {
  try {
    const res = await fetch(`${API}/dietas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dieta)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || 'Error al crear dieta');
    }
    return res.json();
  } catch (error) {
    console.error("Error en la función createDieta:", error);
    throw error;
  }
}

// Puedes añadir funciones para updateDieta y deleteDieta si las necesitas