import React, { useId } from "react";

/**
 * Mascota GUNI — v3.
 *
 * Basada en GuniAvatar (design system Harmonious Kinship): cuerpo orgánico tipo
 * peluche/fantasmita, 4 orejitas superiores, ojo izquierdo grande con aro verde,
 * ojo derecho pequeño, boca naranja expresiva.
 *
 * Los `id` de `<filter>` y `<clipPath>` se generan únicos por instancia con
 * `useId()` para evitar colisiones cuando hay varios avatares en pantalla.
 *
 * @param {"idle"|"thinking"} [state="idle"]
 * @param {"sm"|"md"|"lg"}   [size="lg"]
 * @param {string}            [title="GUNI"]
 */
function GuniMascot({ state = "idle", size = "lg", title = "GUNI" }) {
  const isThinking = state === "thinking";
  const uid      = useId().replace(/:/g, "");
  const shadowId = `guni-shadow-${uid}`;
  const mouthId  = `guni-mouth-${uid}`;

  const navy   = "var(--avatar-navy,   #163A4A)";
  const cream  = "var(--avatar-cream,  #FFF7E6)";
  const green  = "var(--avatar-green,  #77D7C8)";
  const yellow = "var(--avatar-yellow, #EFE54F)";
  const orange = "var(--avatar-orange, #D35230)";
  const coral  = "var(--avatar-coral,  #FF7551)";

  // Cuerpo orgánico (sin líneas rectas): curvas bezier a ambos lados con
  // 3 patitas redondeadas en la base. Basado en GuniAvatar reference.
  const bodyPath =
    "M256 103" +
    "C197 103 153 130 134 174" +
    "C118 211 126 246 111 279" +
    "C101 302 91 319 91 345" +
    "C91 374 113 386 136 368" +
    "C147 400 181 421 207 393" +
    "C217 382 219 365 234 363" +
    "C248 361 264 363 278 363" +
    "C293 365 295 382 305 393" +
    "C331 421 365 400 376 368" +
    "C399 386 421 374 421 345" +
    "C421 319 411 302 401 279" +
    "C386 246 394 211 378 174" +
    "C359 130 315 103 256 103Z";

  // Boca: sonrisa ancha y profunda con clip de lengua coral.
  const mouthPath =
    "M208 303C221 340 279 349 300 307C309 288 300 275 283 280C265 285 243 285 225 280C208 276 203 287 208 303Z";

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
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow
              dx="0" dy="14" stdDeviation="13"
              floodColor="#163A4A" floodOpacity="0.16"
            />
          </filter>
          <clipPath id={mouthId}>
            <path d={mouthPath} />
          </clipPath>
        </defs>

        <g filter={`url(#${shadowId})`}>

          {/* ── Orejitas ── dibujadas antes del cuerpo para quedar semisolapadas */}

          {/* Exterior izquierda: amarilla */}
          <ellipse cx="130" cy="134" rx="42" ry="34"
            transform="rotate(-28 130 134)"
            fill={yellow} stroke={navy} strokeWidth="28"
            strokeLinecap="round" strokeLinejoin="round"
          />
          {/* Interior izquierda: verde */}
          <ellipse cx="176" cy="100" rx="34" ry="39"
            transform="rotate(-25 176 100)"
            fill={green} stroke={navy} strokeWidth="28"
            strokeLinecap="round" strokeLinejoin="round"
          />
          {/* Interior derecha: amarilla */}
          <ellipse cx="336" cy="100" rx="34" ry="39"
            transform="rotate(25 336 100)"
            fill={yellow} stroke={navy} strokeWidth="28"
            strokeLinecap="round" strokeLinejoin="round"
          />
          {/* Exterior derecha: verde */}
          <ellipse cx="382" cy="134" rx="42" ry="34"
            transform="rotate(28 382 134)"
            fill={green} stroke={navy} strokeWidth="28"
            strokeLinecap="round" strokeLinejoin="round"
          />

          {/* ── Cuerpo principal orgánico (sin líneas rectas) ── */}
          <path
            d={bodyPath}
            fill={cream}
            stroke={navy}
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Luz 3D suave centrada (efecto peluche) */}
          <ellipse cx="256" cy="232" rx="112" ry="124"
            fill="#FFFFFF" opacity="0.22"
          />

          {/* ── Ojo izquierdo grande ── */}
          <g className="fcp-guni__eye fcp-guni__eye--left">
            <circle cx="198" cy="232" r="53"
              fill={cream} stroke={navy} strokeWidth="18" />
            <circle cx="198" cy="232" r="36"
              fill="none" stroke={green} strokeWidth="8" />
            <circle cx="198" cy="232" r="23" fill={navy} />
            <circle cx="214" cy="216" r="8"  fill="#FFFFFF" />
          </g>

          {/* ── Ojo derecho pequeño ── */}
          <g className="fcp-guni__eye fcp-guni__eye--right">
            <circle cx="316" cy="232" r="31" fill={navy} />
            <circle cx="328" cy="219" r="8"  fill="#FFFFFF" />
          </g>

          {/* ── Boca naranja + lengua coral recortada ── */}
          <path d={mouthPath} fill={orange} />
          <g clipPath={`url(#${mouthId})`}>
            <ellipse cx="257" cy="327" rx="44" ry="22" fill={coral} />
          </g>

        </g>
      </svg>
    </div>
  );
}

export default GuniMascot;
