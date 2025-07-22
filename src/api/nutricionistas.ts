import { getAuthHeaders } from "./utils";
const API = process.env.REACT_APP_API_URL;

export async function getNutricionistas() {
  const res = await fetch(`${API}/nutricionistas`, {
    headers: getAuthHeaders(),
  });

  return res.json();
}

export async function createNutricionista(nutri: any) {
  const res = await fetch(`${API}/nutricionistas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(nutri),
  });

  return res.json();
}