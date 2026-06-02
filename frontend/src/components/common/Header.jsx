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
            onClick={() => goTo("/perfil")}
          >
            <span
              className="material-symbols-outlined"
              data-icon="family_restroom"
            >
              family_restroom
            </span>
          </button>

          {user && (
            <button
              aria-label="Logout"
              className="icon-button icon-danger"
              onClick={handleLogout}
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="header-menu-overlay" onClick={toggleMenu}>
          <div className="header-menu" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="menu-item"
              onClick={() => goTo("/")}
            >
              Landing
            </button>
            <button
              type="button"
              className="menu-item"
              onClick={() => goTo("/planes")}
            >
              Explorar planes
            </button>
            <button
              type="button"
              className="menu-item"
              onClick={() => goTo("/favoritos")}
            >
              Favoritos
            </button>
            <button
              type="button"
              className="menu-item"
              onClick={() => goTo("/perfil")}
            >
              Perfil
            </button>
            <button
              type="button"
              className="menu-item"
              onClick={() => goTo("/crear-familia")}
            >
              Crear familia
            </button>
            <button
              type="button"
              className="menu-item"
              onClick={() => goTo("/crear-negocio")}
            >
              Crear negocio
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
