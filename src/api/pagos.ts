import { getAuthHeaders } from "./utils";
const API = process.env.REACT_APP_API_URL;

export async function getPagos() {
  const res = await fetch(`${API}/pagos`, {
    headers: getAuthHeaders(),
  });

  return res.json();
}

export async function createPago(pago: any) {
  const res = await fetch(`${API}/pagos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(pago),
  });

  return res.json();
}
