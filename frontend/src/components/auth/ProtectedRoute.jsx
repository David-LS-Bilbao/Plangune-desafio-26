import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store";

/**
 * Guard de rutas. Se usa como ruta envolvente (renderiza <Outlet/> si pasa).
 *
 *   <Route element={<ProtectedRoute allow={['family']} />}> ... </Route>
 *
 * Comportamiento:
 *   - status 'loading'  → spinner (se está validando la cookie de sesión).
 *   - sin usuario        → redirige a /login (recordando el destino en location.state.from).
 *   - rol no permitido   → redirige a /no-autorizado (pantalla amable).
 *   - autorizado         → renderiza las rutas hijas.
 *
 * @param {{ allow?: string[] }} props lista de roles permitidos; si se omite, basta con login.
 */
function ProtectedRoute({ allow }) {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--on-surface-variant, #666)",
        }}
      >
        Cargando…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
