export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("Token no disponible");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}
