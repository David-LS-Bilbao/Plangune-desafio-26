import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store";

function Navigation() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const { t } = useTranslation();
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
    { to: "/admin", icon: "dashboard", label: t('nav.dashboard') },
    { to: "/admin/data", icon: "analytics", label: t('nav.data') },
  ];

  const businessLinks = [
    { to: "/negocio/dashboard", icon: "home", label: t('nav.home') },
    { to: "/negocio/ofertas", icon: "local_offer", label: t('nav.offers') },
    { to: "/negocio", icon: "add_circle", label: t('nav.activities') },
  ];

  const defaultLinks = [
    { to: "/", icon: "home", label: t('nav.home'), exact: true },
    { to: "/planes", icon: "event", label: t('nav.plans'), exact: false },
    { to: "/ofertas", icon: "local_offer", label: t('nav.offers'), exact: false },
    { to: "/buscar", icon: "search", label: t('nav.search'), exact: false },
    { to: "/perfil", icon: "account_circle", label: t('nav.profile') },
  ];

  if (user?.role === "admin") return renderNav(adminLinks);
  if (user?.role === "business") return renderNav(businessLinks);
  return renderNav(defaultLinks);
}

export default Navigation;
