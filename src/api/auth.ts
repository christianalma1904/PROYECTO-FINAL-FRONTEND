// src/api/auth.ts
const API = process.env.REACT_APP_API_URL;

// CORRECTED: Interfaz para la respuesta exitosa del login
export interface LoginSuccessResponse {
  access_token: string;
}

// Interfaz para la respuesta exitosa del registro
export interface RegisterSuccessResponse {
  message: string; // O lo que sea que tu API devuelva al registrar
  // ... otras propiedades
}

// Interfaz para una respuesta de error
interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

export async function login(email: string, password: string): Promise<LoginSuccessResponse> {
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res.json();
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    const data = await res.json();
    return { access_token: data.access_token };
  } catch (error) {
    console.error("Error en la función login:", error);
    throw error;
  }
}

// CORREGIDO: La función register ahora tiene su lógica completa y retorna un valor
export async function register(nombre: string, email: string, password: string): Promise<RegisterSuccessResponse> {
  try {
    const res = await fetch(`${API}/auth/register`, { // Asegúrate de que esta URL sea la correcta para el registro
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password }),
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res.json();
      throw new Error(errorData.message || 'Error al registrar usuario');
    }

    return res.json(); // Retorna la respuesta JSON del backend, que debe coincidir con RegisterSuccessResponse
  } catch (error) {
    console.error("Error en la función register:", error);
    throw error;
  }
}

// La función getProtected se mantiene igual
export async function getProtected(): Promise<any> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No se encontró un token. Acceso no autorizado.');
  }

  try {
    const res = await fetch(`${API}/dashboard-data`, { // <-- ¡AJUSTA ESTE ENDPOINT SI ES NECESARIO!
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res.json();
      throw new Error(errorData.message || 'Error al obtener datos protegidos');
    }

    return res.json();
  } catch (error) {
    console.error("Error al obtener datos protegidos:", error);
    throw error;
  }
}