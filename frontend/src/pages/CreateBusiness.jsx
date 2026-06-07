import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import NavbarResponsive from "../components/common/NavbarResponsive";

function CreateBusiness() {
  const navigate = useNavigate();
  const registerAccount = useAuthStore((state) => state.register);
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    address: "",
    nif: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Registro real (rol business). Los datos del negocio (nombre, NIF, dirección) aún no se
  // persisten en backend en esta fase: solo se crea la cuenta de usuario.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await registerAccount({ email: form.email, password: form.password, role: "business" });
      navigate("/negocio", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 409
          ? "Ya existe una cuenta con ese correo. Prueba a iniciar sesión."
          : status === 422
            ? "Revisa el correo y que la contraseña tenga al menos 8 caracteres."
            : "No se ha podido crear el negocio. Inténtalo de nuevo.",
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
            <h1 className="create-family-title">Crea tu negocio</h1>
            <p className="create-family-subtitle">
              Configura tu perfil comercial y comienza a publicar tus ofertas.
            </p>
          </div>

          <form className="create-family-form" onSubmit={handleSubmit}>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="businessName">Nombre del negocio</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">storefront</span>
                <input id="businessName" name="businessName" type="text" value={form.businessName} onChange={handleChange} placeholder="TxikiNegocio" required />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="category">Categoría</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">category</span>
                <input id="category" name="category" type="text" value={form.category} onChange={handleChange} placeholder="Turismo, Alimentación, Ocio" />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="address">Dirección</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">location_on</span>
                <input id="address" name="address" type="text" value={form.address} onChange={handleChange} placeholder="Calle Mayor 12" />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="nif">NIF</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">badge</span>
                <input id="nif" name="nif" type="text" value={form.nif} onChange={handleChange} placeholder="A12345678" required />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="phone">Teléfono</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">phone</span>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+34 600 123 456" />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="email">Correo electrónico</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">mail</span>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="negocio@plangune.com" required />
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
                <span className="material-symbols-outlined">{loading ? "hourglass_top" : "add_business"}</span>
                {loading ? "Creando…" : "Crear negocio"}
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

export default CreateBusiness;
