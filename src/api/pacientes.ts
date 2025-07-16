const API = process.env.REACT_APP_API_URL;
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});
export async function getPacientes() {
  return fetch(`${API}/pacientes`, { headers: headers() }).then(res => res.json());
}
export async function createPaciente(paciente: any) {
  return fetch(`${API}/pacientes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(paciente)
  }).then(res => res.json());
}
