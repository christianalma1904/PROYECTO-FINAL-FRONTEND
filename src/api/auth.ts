import { getAuthHeaders } from './utils';

const API = process.env.REACT_APP_API_URL;

export interface LoginSuccessResponse {
  access_token: string;
}

export interface RegisterSuccessResponse {
  message: string;
}

interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

export async function login(email: string, password: string): Promise<LoginSuccessResponse> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData: ApiErrorResponse = await res.json();
    throw new Error(errorData.message || 'Error al iniciar sesión');
  }

  return res.json();
}

export async function register(nombre: string, email: string, password: string): Promise<RegisterSuccessResponse> {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password }),
  });

  if (!res.ok) {
    const errorData: ApiErrorResponse = await res.json();
    throw new Error(errorData.message || 'Error al registrar usuario');
  }

  return res.json();
}

export async function getProtected(): Promise<any> {
  const res = await fetch(`${API}/dashboard-data`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData: ApiErrorResponse = await res.json();
    throw new Error(errorData.message || 'Error al obtener datos protegidos');
  }

  return res.json();
}
