import React, { useEffect, useState } from "react";
import { checkHealth } from "../../services/health";

// Indicador pequeño de estado del backend (GET /api/health). Demo de ventas.
function HealthBadge() {
  const [ok, setOk] = useState(null); // null = comprobando

  useEffect(() => {
    let active = true;
    checkHealth()
      .then((v) => active && setOk(v))
      .catch(() => active && setOk(false));
    return () => {
      active = false;
    };
  }, []);

  const label = ok === null ? "Comprobando API…" : ok ? "API conectada" : "API no disponible";
  const color = ok === null ? "#9aa0a6" : ok ? "#1e7e34" : "#b3261e";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "12px",
        fontWeight: 600,
        color,
        margin: "0 0 0.75rem",
      }}
      title="Estado de GET /api/health"
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: color,
          display: "inline-block",
        }}
      />
      {label}
    </div>
  );
}

export default HealthBadge;
