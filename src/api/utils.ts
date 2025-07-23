// src/api/utils.ts

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn("Advertencia: No se encontró un token de autenticación. Las solicitudes a la API podrían fallar con 401.");
    return {
      'Content-Type': 'application/json',
    };
  }

  // APLICA .trim() AL TOKEN AQUÍ PARA ELIMINAR CUALQUIER ESPACIO EN BLANCO ACCIDENTAL
  const cleanedToken = token.trim(); // <-- ¡Añade esta línea!

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cleanedToken}`, // <-- Usa cleanedToken aquí
  };
}