import React, { useEffect, useState } from "react";
import FamilyChatPlayground from "../../features/family-chat-playground";
import "../../features/family-chat-playground/styles/family-chat-playground.css";

/**
 * FAB flotante de GUNI para /buscar.
 *
 * Renderiza un botón circular fijo en la esquina inferior derecha.
 * Al pulsarlo abre FamilyChatPlayground como overlay de pantalla completa.
 * El chat se cierra con el botón × interno y devuelve el foco a /buscar sin recargar.
 *
 * Bloquea el scroll del body mientras el overlay está abierto para evitar
 * que /buscar se desplace por detrás del chat.
 */
function GuniFabLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <FamilyChatPlayground onClose={() => setIsOpen(false)} />
      )}

      {!isOpen && (
        <button
          type="button"
          className="guni-fab"
          aria-label="Abrir chat con GUNI"
          onClick={() => setIsOpen(true)}
        >
          <img src="/images/guni/guni-original.png" alt="GUNI" className="guni-fab__img" />
        </button>
      )}
    </>
  );
}

export default GuniFabLauncher;
