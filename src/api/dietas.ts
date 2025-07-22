import { getAuthHeaders } from "./utils";
const API = process.env.REACT_APP_API_URL;

export interface SemanaDieta {
  semana: number;
  menu: string[];
}

export interface Dieta {
  _id?: string;
  id?: string;
  paciente_id: string;
  plan_id?: string;
  semanas: SemanaDieta[];
  // Estos campos ahora son parte de la Dieta completa
  nombre?: string;
  descripcion?: string;
  fechaAsignacion?: string; // Fecha en formato ISO string
  __v?: number; // Versión del documento de Mongoose
  createdAt?: string; // Si usas timestamps en Mongoose
  updatedAt?: string; // Si usas timestamps en Mongoose
}

// ¡ESTA INTERFAZ ES LA QUE DEBEMOS ACTUALIZAR!
// Interfaz para el payload que SE ENVÍA al hacer POST a /dietas.
// Ahora DEBE contener nombre, descripcion, fechaAsignacion porque tu backend los espera.
export interface CreateDietaPayload {
  paciente_id: string;
  plan_id?: string; // Ajusta si es opcional u obligatorio en tu API para el POST
  semanas: SemanaDieta[];
  // ¡AHORA SÍ INCLUIR 'nombre', 'descripcion', 'fechaAsignacion' aquí!
  nombre: string; // Si es requerido en el backend
  descripcion: string; // Si es requerido en el backend
  fechaAsignacion: string; // Como string en formato ISO para enviar la fecha
}

export async function getAllDietas(): Promise<Dieta[]> {
  const res = await fetch(`${API}/dietas`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || 'Error al obtener todas las dietas');
  }

  return res.json();
}

export async function getMyDietas(userId: string): Promise<Dieta[]> {
  // Asegúrate de que tu backend tiene un endpoint para esto o usa un filtro
  // Si tu backend tiene /dietas?paciente_id=<userId>, úsalo para eficiencia
  const res = await fetch(`${API}/dietas?paciente_id=${userId}`, { // Ejemplo de endpoint con query param
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error al obtener dietas para el paciente ${userId}`);
  }

  return res.json();
  // return allDietas.filter(d => d.paciente_id === userId); // Esta línea sería solo si getAllDietas no soporta el filtro.
}

// Esta función 'createDieta' es para el POST a /dietas
export async function createDieta(dieta: CreateDietaPayload): Promise<Dieta> {
  const payloadToSend = { ...dieta }; 

  console.log("Enviando dieta a la API:", JSON.stringify(payloadToSend)); // Para depuración

  const res = await fetch(`${API}/dietas`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payloadToSend),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Error desconocido del servidor o respuesta no JSON' }));
    console.error("Error al crear dieta:", errorBody);
    throw new Error(errorBody.message || 'Error al crear dieta');
  }

  return res.json();
}