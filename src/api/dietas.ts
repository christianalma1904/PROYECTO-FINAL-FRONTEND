const API = process.env.REACT_APP_API_URL;
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});
export async function getDietas() {
  return fetch(`${API}/dietas`, { headers: headers() }).then(res => res.json());
}
export async function createDieta(dieta: any) {
  return fetch(`${API}/dietas`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(dieta)
  }).then(res => res.json());
}
