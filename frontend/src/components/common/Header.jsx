import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store";

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  // Nav items according to role
  const navItems = (() => {
    if (!user) return [
      { label: "Inicio", path: "/", icon: "home" },
      { label: "Explorar planes", path: "/planes", icon: "explore" },
      { label: "Iniciar sesión", path: "/login", icon: "login" },
    ];
    if (user.role === "family") return [
      { label: "Inicio", path: "/", icon: "home" },
      { label: "Explorar planes", path: "/planes", icon: "explore" },
      { label: "Favoritos", path: "/favoritos", icon: "favorite" },
      { label: "Mi perfil", path: "/perfil", icon: "person" },
      { label: "Ofertas", path: "/ofertas", icon: "local_offer" },
    ];
    if (user.role === "business") return [
      { label: "Dashboard", path: "/negocio/dashboard", icon: "dashboard" },
      { label: "Mis ofertas", path: "/negocio/ofertas", icon: "local_offer" },
      { label: "Rendimiento", path: "/negocio/rendimiento", icon: "bar_chart" },
      { label: "Estrategia", path: "/negocio/estrategia", icon: "rocket_launch" },
      { label: "Suscripción", path: "/negocio/suscripcion", icon: "workspace_premium" },
    ];
    if (user.role === "admin") return [
      { label: "Panel admin", path: "/admin", icon: "admin_panel_settings" },
      { label: "Datos", path: "/admin/datos", icon: "database" },
    ];
    return [];
  })();

  return (
    <header className="app-header-bar">
      <div className="header-content">
        <button aria-label="Menu" className="icon-button" onClick={toggleMenu}>
          <span className="material-symbols-outlined fill" data-icon="menu">
            menu
          </span>
        </button>

        <div className="title title-clickable" onClick={() => goTo("/")}>
          TxikiPlan
        </div>

        <div className="header-actions">
          <button
            aria-label="Account"
            className="icon-button"
            onClick={() => goTo(user?.role === "business" ? "/negocio/dashboard" : user?.role === "admin" ? "/admin" : "/perfil")}
          >
            <span
              className="material-symbols-outlined"
              data-icon="family_restroom"
            >
              {user?.role === "business" ? "store" : user?.role === "admin" ? "admin_panel_settings" : "family_restroom"}
            </span>
          </button>

          {user && (
            <button
              className="icon-button icon-danger"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="header-menu-overlay" onClick={toggleMenu}>
          <div className="header-menu" onClick={(e) => e.stopPropagation()}>
            {/* User info header */}
            {user && (
              <div className="menu-user-info">
                <div className="menu-user-avatar">{user.avatar}</div>
                <div>
                  <p className="menu-user-name">{user.name}</p>
                  <p className="menu-user-role">
                    {user.role === "family" ? "Familia" : user.role === "business" ? "Negocio" : "Administrador"}
                  </p>
                </div>
              </div>
            )}

            {navItems.map((item) => (
              <button
                key={item.path}
                type="button"
                className="menu-item"
                onClick={() => goTo(item.path)}
              >
                <span className="material-symbols-outlined menu-item-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}

            {user && (
              <button
                type="button"
                className="menu-item menu-item-danger"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
