import React from "react";

/**
 * Mascota GUNI.
 *
 * Personaje protagonista del playground. Se dibuja con SVG inline
 * (sin librerías de animación) y soporta dos estados:
 *  - "idle"     -> respiración/flotación suave (animación CSS).
 *  - "thinking" -> rebote pequeño + estrellitas sutiles.
 *
 * @param {Object} props
 * @param {"idle"|"thinking"} [props.state="idle"] - Estado de la mascota.
 * @param {"sm"|"md"|"lg"} [props.size="lg"] - Tamaño visual.
 * @param {string} [props.title="GUNI"] - Texto accesible.
 */
function GuniMascot({ state = "idle", size = "lg", title = "GUNI" }) {
  const isThinking = state === "thinking";

  return (
    <div
      className={`fcp-guni fcp-guni--${size} fcp-guni--${state}`}
      role="img"
      aria-label={title}
    >
      {isThinking && (
        <span className="fcp-guni__sparkles" aria-hidden="true">
          <span className="fcp-guni__sparkle" />
          <span className="fcp-guni__sparkle" />
          <span className="fcp-guni__sparkle" />
        </span>
      )}

      <svg
        className="fcp-guni__svg"
        viewBox="0 0 120 130"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        {/* Sombra de apoyo */}
        <ellipse
          className="fcp-guni__shadow"
          cx="60"
          cy="122"
          rx="30"
          ry="6"
        />

        {/* Cuerpo en forma de gota/burbuja */}
        <path
          className="fcp-guni__body"
          d="M60 12
             C30 12 16 34 16 60
             C16 90 36 112 60 112
             C84 112 104 90 104 60
             C104 34 90 12 60 12 Z"
        />

        {/* Antena con bolita */}
        <line
          className="fcp-guni__antenna"
          x1="60"
          y1="14"
          x2="60"
          y2="2"
        />
        <circle className="fcp-guni__antenna-tip" cx="60" cy="3" r="4" />

        {/* Pantalla/cara */}
        <rect
          className="fcp-guni__face"
          x="34"
          y="40"
          width="52"
          height="40"
          rx="16"
        />

        {/* Ojos */}
        <circle className="fcp-guni__eye" cx="50" cy="58" r="5" />
        <circle className="fcp-guni__eye" cx="70" cy="58" r="5" />
        <circle className="fcp-guni__eye-shine" cx="48.5" cy="56.5" r="1.6" />
        <circle className="fcp-guni__eye-shine" cx="68.5" cy="56.5" r="1.6" />

        {/* Sonrisa */}
        <path
          className="fcp-guni__smile"
          d="M48 70 Q60 78 72 70"
          fill="none"
        />

        {/* Mejillas */}
        <circle className="fcp-guni__cheek" cx="40" cy="68" r="4" />
        <circle className="fcp-guni__cheek" cx="80" cy="68" r="4" />
      </svg>
    </div>
  );
}

export default GuniMascot;
