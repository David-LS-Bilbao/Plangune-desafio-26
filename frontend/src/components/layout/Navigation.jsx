import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store";

function Navigation() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const hideRoutes = ["/", "/login", "/crear-familia", "/crear-negocio"];

  if (hideRoutes.includes(location.pathname)) return null;

  const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

  const getIconClass = (path, exact = true) => {
    const isActive = exact
      ? location.pathname === path
      : location.pathname.startsWith(path);
    return `material-symbols-outlined ${isActive ? "fill" : ""}`;
  };

  const renderNav = (links) => (
    <nav className="bottom-nav">
      {links.map(({ to, icon, label, exact = true }) => (
        <NavLink key={to} to={to} className={linkClass} end={exact}>
          <span className={getIconClass(to, exact)}>{icon}</span>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  const adminLinks = [
    { to: "/admin", icon: "dashboard", label: "Panel" },
    { to: "/admin/data", icon: "analytics", label: "Datos" },
  ];

  const businessLinks = [
    { to: "/negocio/dashboard", icon: "home", label: "Inicio" },
    { to: "/negocio/ofertas", icon: "local_offer", label: "Ofertas" },
    { to: "/negocio", icon: "add_circle", label: "Actividad" },
  ];

  const defaultLinks = [
    { to: "/planes", icon: "search", label: "Explorar", exact: false },
    { to: "/favoritos", icon: "favorite", label: "Guardados" },
    { to: "/perfil", icon: "account_circle", label: "Perfil" },
  ];

  if (user?.role === "admin") return renderNav(adminLinks);
  if (user?.role === "business") return renderNav(businessLinks);
  return renderNav(defaultLinks);
}

export default Navigation;
