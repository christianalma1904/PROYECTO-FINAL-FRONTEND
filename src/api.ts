// src/api.ts
const API = process.env.REACT_APP_API_URL;
const BASE_URL = API || 'http://localhost:3000'; // Fallback for development

export async function getPlanes() {
  const res = await fetch(`${BASE_URL}/planes`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`HTTP error! status: ${res.status}, message: ${errorData.message || res.statusText}`);
  }

  return res.json();
}

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Login failed! status: ${res.status}, message: ${errorData.message || res.statusText}`);
  }

  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  return data;
}

export async function getProtected() {
  const token = localStorage.getItem('token');
  if (!token) {
      throw new Error('Token no encontrado. Por favor, inicia sesión.');
  }

  const res = await fetch(`${BASE_URL}/planes`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        throw new Error('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
    }
    throw new Error(`No autorizado! status: ${res.status}, message: ${errorData.message || res.statusText}`);
  }

  return res.json();
}