import React from "react";
import GuniMascot from "./GuniMascot";

/**
 * Burbuja de chat tipo viñeta.
 *
 *  - Usuario: fondo navy, alineada a la derecha.
 *  - GUNI: fondo blanco con borde suave, alineada a la izquierda,
 *    con avatar pequeño de GUNI junto a la respuesta.
 *
 * Renderiza texto plano respetando saltos de línea SIN usar
 * dangerouslySetInnerHTML (se parte el texto por "\n").
 *
 * @param {Object} props
 * @param {"user"|"guni"} props.role - Autor del mensaje.
 * @param {string} props.text - Contenido del mensaje.
 * @param {boolean} [props.isFallback=false] - Marca respuesta en modo orientación básica.
 * @param {React.ReactNode} [props.children] - Extra (p. ej. tarjetas de recomendación).
 */
function ChatBubble({ role, text, isFallback = false, children }) {
  const isGuni = role === "guni";
  const lines = String(text ?? "").split("\n");

  return (
    <div className={`fcp-msg fcp-msg--${isGuni ? "guni" : "user"}`}>
      {isGuni && (
        <span className="fcp-msg__avatar" aria-hidden="true">
          <GuniMascot size="sm" state="idle" />
        </span>
      )}

      <div className="fcp-bubble">
        {isFallback && (
          <span className="fcp-bubble__tag">Modo orientación básica</span>
        )}

        <p className="fcp-bubble__text">
          {lines.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>

        {children}
      </div>
    </div>
  );
}

export default ChatBubble;
