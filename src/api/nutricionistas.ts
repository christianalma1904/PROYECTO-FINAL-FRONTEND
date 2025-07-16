const API = process.env.REACT_APP_API_URL;
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});
export async function getNutricionistas() {
  return fetch(`${API}/nutricionistas`, { headers: headers() }).then(res => res.json());
}
export async function createNutricionista(nutri: any) {
  return fetch(`${API}/nutricionistas`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(nutri)
  }).then(res => res.json());
}
