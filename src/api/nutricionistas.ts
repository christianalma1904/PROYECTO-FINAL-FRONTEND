// nutricionista.ts
import { getAuthHeaders } from "./utils";
const API = process.env.REACT_APP_API_URL;

// Define la interfaz para un Nutricionista
export interface Nutricionista {
  _id?: string; // Opcional para ObjectId de MongoDB
  id?: number; // O number, si tu backend usa IDs numéricos
  nombre: string;
  especialidad: string;
  email: string;
}

// Interfaz para crear un Nutricionista (excluyendo IDs generados)
export interface CreateNutricionistaPayload extends Omit<Nutricionista, '_id' | 'id'> {}


export async function getNutricionistas(): Promise<Nutricionista[]> {
  const res = await fetch(`${API}/nutricionistas`, {
    method: 'GET', // Indica explícitamente el método para mayor claridad
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    // Intenta parsear el mensaje de error del backend, o proporciona uno genérico
    const error = await res.json().catch(() => ({ message: 'Error desconocido al obtener nutricionistas.' }));
    throw new Error(error.message || 'Error al obtener todos los nutricionistas.');
  }

  return res.json();
}

export async function createNutricionista(nutri: CreateNutricionistaPayload): Promise<Nutricionista> {
  const res = await fetch(`${API}/nutricionistas`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json', // Especifica el tipo de contenido para las solicitudes POST
    },
    body: JSON.stringify(nutri),
  });

  if (!res.ok) {
    // Intenta parsear el mensaje de error del backend, o proporciona uno genérico
    const error = await res.json().catch(() => ({ message: 'Error desconocido al crear nutricionista.' }));
    throw new Error(error.message || 'Error al crear nutricionista.');
  }

  return res.json();
}