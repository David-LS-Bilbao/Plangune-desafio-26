import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store";

/**
 * Pantalla amable para usuarios autenticados que intentan entrar en una zona sin permiso
 * (p. ej. una familia accediendo a /admin). No expone detalles técnicos.
 */
function Unauthorized() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  // Destino "a casa" según el rol, para reconducir sin fricción.
  const homeByRole = { family: "/buscar", business: "/negocio", admin: "/admin" };
  const home = (user && homeByRole[user.role]) || "/";

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "1rem",
        padding: "2rem 1.25rem",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "var(--accent-color, #e76f51)" }}>
        lock
      </span>
      <h1 style={{ margin: 0 }}>{t('auth.unauthorized_title')}</h1>
      <p style={{ maxWidth: "32rem", color: "var(--on-surface-variant, #666)" }}>
        {t('auth.unauthorized_desc')}
      </p>
      <Link to={home} className="btn-primary" style={{ textDecoration: "none" }}>
        {t('auth.unauthorized_back')}
      </Link>
    </main>
  );
}

export default Unauthorized;
