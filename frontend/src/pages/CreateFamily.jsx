import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import NavbarResponsive from "../components/common/NavbarResponsive";

function CreateFamily() {
  const navigate = useNavigate();
  const registerAccount = useAuthStore((state) => state.register);
  const [form, setForm] = useState({
    familyName: "",
    location: "",
    members: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Registro real (rol family). Los datos extra (nombre familia, miembros) aún no se
  // persisten en backend en esta fase: solo se crea la cuenta de usuario.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await registerAccount({ email: form.email, password: form.password, role: "family" });
      navigate("/buscar", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 409
          ? "Ya existe una cuenta con ese correo. Prueba a iniciar sesión."
          : status === 422
            ? "Revisa el correo y que la contraseña tenga al menos 8 caracteres."
            : "No se ha podido crear la familia. Inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <NavbarResponsive />
    <main className="create-family-main">
      <div className="create-family-card">

        <div className="create-family-header">
          <h1 className="create-family-title">Crea tu familia</h1>
          <p className="create-family-subtitle">
            Configura tu perfil para recibir planes y recomendaciones personalizadas.
          </p>
        </div>

        <form className="create-family-form" onSubmit={handleSubmit}>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="familyName">Nombre de la familia</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">family_restroom</span>
              <input id="familyName" name="familyName" type="text" value={form.familyName} onChange={handleChange} placeholder="Familia Bilbao" required />
            </div>
          </div>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="location">Ubicación</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">location_on</span>
              <input id="location" name="location" type="text" value={form.location} onChange={handleChange} placeholder="Bilbao" required />
            </div>
          </div>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="members">Miembros en el hogar</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">group</span>
              <input id="members" name="members" type="number" value={form.members} onChange={handleChange} placeholder="4" min="1" required />
            </div>
          </div>

<div className="create-family-form__group">
            <label className="section-label" htmlFor="email">Correo electrónico</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">mail</span>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" required />
            </div>
          </div>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="password">Contraseña</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">lock</span>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" minLength={8} required />
            </div>
          </div>

          {error && (
            <p role="alert" style={{ color: "var(--error-color, #d62828)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              {error}
            </p>
          )}

          <div className="create-family-form__actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              <span className="material-symbols-outlined">{loading ? "hourglass_top" : "family_restroom"}</span>
              {loading ? "Creando…" : "Crear familia"}
            </button>
            <button type="button" className="btn-text-danger" onClick={() => navigate("/login")}>
              Volver al inicio
            </button>
          </div>

        </form>
      </div>
    </main>
    </>
  );
}

export default CreateFamily;
