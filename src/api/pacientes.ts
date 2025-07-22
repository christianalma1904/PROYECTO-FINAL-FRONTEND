import { getAuthHeaders } from "./utils";

const API = process.env.REACT_APP_API_URL;

export async function getPacientes() {
  const res = await fetch(`${API}/pacientes`, {
    headers: getAuthHeaders(),
  });

  return res.json();
}

export async function createPaciente(paciente: any) {
  const res = await fetch(`${API}/pacientes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(paciente),
  });

  return res.json();
}
