// src/Register.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:3100/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "No se pudo registrar");
      }

      setSuccess(true);
      setTimeout(() => navigate("/login"), 3100); // Redirige después de mostrar éxito
    } catch (err: any) {
      setError(err.message || "Error al registrar");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255,255,255,0.7)"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          minWidth: 320
        }}
      >
        <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Registro</h2>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 16, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 16, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            border: "none",
            background: "#26b96b",
            color: "white",
            fontWeight: 700,
            borderRadius: 6
          }}
        >
          Registrarse
        </button>
        {success && (
          <div style={{ color: "green", marginTop: 12 }}>
            Registro exitoso, redirigiendo...
          </div>
        )}
        {error && (
          <div style={{ color: "red", marginTop: 12 }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
