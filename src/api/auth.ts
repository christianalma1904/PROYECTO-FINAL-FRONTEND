// src/api/auth.ts
// import axios from 'axios'; // No necesitas axios si estás usando fetch

const API = process.env.REACT_APP_API_URL; // Asegúrate de que esta variable de entorno esté configurada

// Interfaz para la respuesta exitosa del login
interface LoginSuccessResponse {
  access_token: string;
  user: {
    id: string;
    rol: string;
    name?: string;
    email: string;
    // ... otras propiedades del usuario
  };
}

// Interfaz para la respuesta exitosa del registro
interface RegisterSuccessResponse {
  message: string; // O lo que sea que tu API devuelva al registrar
  // ... otras propiedades
}

// Interfaz para una respuesta de error (si tu API tiene un formato consistente)
interface ApiErrorResponse {
  message: string;
  statusCode: number;
  // ... otras propiedades de error
}

export async function login(email: string, password: string): Promise<LoginSuccessResponse> {
  try {
    const res = await fetch(`${API}/auth/login`, { // Asegúrate de que esta URL sea la correcta
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) { // Verifica si la respuesta HTTP fue exitosa (código 2xx)
      const errorData: ApiErrorResponse = await res.json();
      // Lanza un error para que pueda ser capturado por el .catch() en Login.tsx
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    return res.json(); // Parsea el JSON si la respuesta fue exitosa
  } catch (error) {
    console.error("Error en la función login:", error);
    throw error; // Propaga el error para que sea manejado en el componente Login.tsx
  }
}

export async function register(nombre: string, email: string, password: string): Promise<RegisterSuccessResponse> {
  try {
    const res = await fetch(`${API}/auth/register`, { // Asegúrate de que esta URL sea la correcta
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password }),
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res.json();
      throw new Error(errorData.message || 'Error al registrar usuario');
    }

    return res.json();
  } catch (error) {
    console.error("Error en la función register:", error);
    throw error;
  }
}

// *** AÑADIDA LA FUNCIÓN getProtected A ESTE ARCHIVO ***
// Esto resolverá el error: "export 'getProtected' ... was not found in '../api/auth'"
export async function getProtected(): Promise<any> { // Considera tipar 'any' con una interfaz específica
  const token = localStorage.getItem('token');
  if (!token) {
    // Lanza un error si no hay token, lo cual debería ser capturado por el componente
    throw new Error('No se encontró un token. Acceso no autorizado.');
  }

  try {
    // ¡IMPORTANTE! AJUSTA LA URL DE ESTE ENDPOINT A TU RUTA REAL DE DATOS PROTEGIDOS
    const res = await fetch(`${API}/dashboard-data`, { // <-- ¡AJUSTA ESTE ENDPOINT!
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Envía el token de autorización
      },
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res.json();
      throw new Error(errorData.message || 'Error al obtener datos protegidos');
    }

    return res.json();
  } catch (error) {
    console.error("Error al obtener datos protegidos:", error);
    throw error; // Propaga el error
  }
}