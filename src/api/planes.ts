const API = process.env.REACT_APP_API_URL;
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});
export async function getPlanes() {
  return fetch(`${API}/planes`, { headers: headers() }).then(res => res.json());
}
export async function createPlan(plan: any) {
  return fetch(`${API}/planes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(plan)
  }).then(res => res.json());
}
