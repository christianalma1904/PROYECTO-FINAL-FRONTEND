// src/api/seguimiento.ts

const API = process.env.REACT_APP_API_URL;

export interface SeguimientoEntry {
  _id?: string; // ID de MongoDB
  id?: string; // Si tu backend también usa 'id' además de '_id'
  paciente_id: string; // ID del usuario paciente
  fecha: string; // Fecha del registro (ej: "YYYY-MM-DD")
  peso: number;
  observaciones?: string; // Opcional
  // Puedes añadir más campos como altura, IMC, etc.
}

export interface CreateSeguimientoPayload extends Omit<SeguimientoEntry, '_id' | 'id'> {}

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

// Función para obtener TODOS los registros de seguimiento
export async function getAllSeguimiento(): Promise<SeguimientoEntry[]> {
  try {
    const res = await fetch(`${API}/seguimiento`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || 'Error al obtener todos los seguimientos');
    }

    return res.json();
  } catch (error) {
    console.error("Error en la función getAllSeguimiento:", error);
    throw error;
  }
}

// Función para obtener registros de seguimiento del usuario logueado (filtrando en el frontend)
export async function getMySeguimiento(userId: string): Promise<SeguimientoEntry[]> {
  try {
    const allSeguimiento: SeguimientoEntry[] = await getAllSeguimiento(); // Reutilizamos getAllSeguimiento
    const mySeguimiento = allSeguimiento.filter(entry => entry.paciente_id === userId);
    return mySeguimiento;
  } catch (error) {
    console.error("Error en la función getMySeguimiento (filtrado en frontend):", error);
    throw error;
  }
}


// Función para crear un registro de seguimiento
export async function createSeguimiento(entry: CreateSeguimientoPayload): Promise<SeguimientoEntry> {
  try {
    const res = await fetch(`${API}/seguimiento`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entry)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || 'Error al crear seguimiento');
    }
    return res.json();
  } catch (error) {
    console.error("Error en la función createSeguimiento:", error);
    throw error;
  }
}

// Puedes añadir funciones para updateSeguimiento y deleteSeguimiento si las necesitas