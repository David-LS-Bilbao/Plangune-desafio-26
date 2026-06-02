import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store";

function Navigation() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const hideRoutes = ["/", "/login", "/crear-familia", "/crear-negocio"];

  if (hideRoutes.includes(location.pathname)) {
    return null;
  }

  const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

  if (user?.role === "admin") {
    return (
      <nav className="bottom-nav">
        <NavLink to="/admin" className={linkClass} end>
          <span
            className={`material-symbols-outlined ${location.pathname === "/admin" ? "fill" : ""}`}
          >
            dashboard
          </span>
          <span className="nav-label">Panel</span>
        </NavLink>
        <NavLink to="/admin/data" className={linkClass} end>
          <span
            className={`material-symbols-outlined ${location.pathname === "/admin/data" ? "fill" : ""}`}
          >
            analytics
          </span>
          <span className="nav-label">Datos</span>
        </NavLink>
      </nav>
    );
  }

  if (user?.role === "business") {
    return (
      <nav className="bottom-nav">
        <NavLink to="/negocio/dashboard" className={linkClass} end>
          <span
            className={`material-symbols-outlined ${location.pathname === "/negocio/dashboard" ? "fill" : ""}`}
          >
            home
          </span>
          <span className="nav-label">Inicio</span>
        </NavLink>
        <NavLink to="/negocio/ofertas" className={linkClass} end>
          <span
            className={`material-symbols-outlined ${location.pathname === "/negocio/ofertas" ? "fill" : ""}`}
          >
            local_offer
          </span>
          <span className="nav-label">Ofertas</span>
        </NavLink>
        <NavLink to="/negocio" className={linkClass} end>
          <span
            className={`material-symbols-outlined ${location.pathname === "/negocio" ? "fill" : ""}`}
          >
            add_circle
          </span>
          <span className="nav-label">Actividad</span>
        </NavLink>
      </nav>
    );
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/planes" className={linkClass} end={false}>
        <span
          className={`material-symbols-outlined ${location.pathname.startsWith("/planes") ? "fill" : ""}`}
        >
          search
        </span>
        <span className="nav-label">Explorar</span>
      </NavLink>
      <NavLink to="/favoritos" className={linkClass} end>
        <span
          className={`material-symbols-outlined ${location.pathname === "/favoritos" ? "fill" : ""}`}
        >
          favorite
        </span>
        <span className="nav-label">Guardados</span>
      </NavLink>
      <NavLink to="/perfil" className={linkClass} end>
        <span
          className={`material-symbols-outlined ${location.pathname === "/perfil" ? "fill" : ""}`}
        >
          account_circle
        </span>
        <span className="nav-label">Perfil</span>
      </NavLink>
    </nav>
  );
}

export default Navigation;
