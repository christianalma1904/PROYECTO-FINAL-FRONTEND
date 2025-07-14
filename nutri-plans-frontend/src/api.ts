const API = process.env.REACT_APP_API_URL;

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getPlanes() {
  const res = await fetch(`${API}/planes`);
  return res.json();
}
