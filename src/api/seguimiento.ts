const API = process.env.REACT_APP_API_URL;
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});
export async function getSeguimiento() {
  return fetch(`${API}/seguimiento`, { headers: headers() }).then(res => res.json());
}
export async function createSeguimiento(seg: any) {
  return fetch(`${API}/seguimiento`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(seg)
  }).then(res => res.json());
}
