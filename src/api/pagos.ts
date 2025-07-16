const API = process.env.REACT_APP_API_URL;
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});
export async function getPagos() {
  return fetch(`${API}/pagos`, { headers: headers() }).then(res => res.json());
}
export async function createPago(pago: any) {
  return fetch(`${API}/pagos`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(pago)
  }).then(res => res.json());
}
