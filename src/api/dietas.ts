import { getAuthHeaders } from "./utils"; // Asumo que esto vive en 'src/api/utils.ts' o similar
const API = process.env.REACT_APP_API_URL;

// Reutiliza tus interfaces, están bien.
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
  nombre?: string;
  descripcion?: string;
  fechaAsignacion?: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDietaPayload {
  paciente_id: string;
  plan_id?: string;
  semanas: SemanaDieta[];
  nombre: string;
  descripcion: string;
  fechaAsignacion: string;
}

// Función auxiliar para manejar errores de fetch
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Error desconocido del servidor o respuesta no JSON' }));
    // Si hay un status 401, lo indicamos explícitamente
    if (res.status === 401) {
      throw new Error(`401 Unauthorized: ${errorBody.message || 'Credenciales inválidas o token expirado.'}`);
    }
    throw new Error(errorBody.message || `Error en la solicitud: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Obtener todas las dietas
export async function getAllDietas(): Promise<Dieta[]> {
  const headers = getAuthHeaders(); // Obtener los encabezados de autenticación
  // Opcional: Debugging para ver si el token se está añadiendo
  // console.log("Headers para getAllDietas:", headers);

  const res = await fetch(`${API}/dietas`, {
    method: 'GET',
    headers: headers,
  });

  return handleResponse<Dieta[]>(res);
}

// Obtener las dietas de un usuario/paciente
export async function getMyDietas(userId: string): Promise<Dieta[]> {
  const headers = getAuthHeaders(); // Obtener los encabezados de autenticación
  const res = await fetch(`${API}/dietas?paciente_id=${userId}`, {
    method: 'GET',
    headers: headers,
  });

  return handleResponse<Dieta[]>(res);
}

// Crear dieta (POST)
export async function createDieta(dieta: CreateDietaPayload): Promise<Dieta> {
  const headers = getAuthHeaders(); // Obtener los encabezados de autenticación
  const res = await fetch(`${API}/dietas`, {
    method: 'POST',
    headers: {
      ...headers, // Incluye el Authorization header y 'Content-Type'
      // 'Content-Type': 'application/json', // <--- Eliminado: ya está en getAuthHeaders
    },
    body: JSON.stringify(dieta),
  });

  return handleResponse<Dieta>(res);
}

// Actualizar dieta (PUT /dietas/:id)
export async function updateDieta(id: string, dieta: Partial<CreateDietaPayload>): Promise<Dieta> {
  const headers = getAuthHeaders(); // Obtener los encabezados de autenticación
  const res = await fetch(`${API}/dietas/${id}`, {
    method: 'PUT',
    headers: {
      ...headers, // Incluye el Authorization header y 'Content-Type'
      // 'Content-Type': 'application/json', // <--- Eliminado: ya está en getAuthHeaders
    },
    body: JSON.stringify(dieta),
  });

  return handleResponse<Dieta>(res);
}

// Eliminar dieta (DELETE /dietas/:id)
export async function deleteDieta(id: string): Promise<{ message: string }> {
  const headers = getAuthHeaders(); // Obtener los encabezados de autenticación
  const res = await fetch(`${API}/dietas/${id}`, {
    method: 'DELETE',
    headers: headers,
  });

  return handleResponse<{ message: string }>(res);
}