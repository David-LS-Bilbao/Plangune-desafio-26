import React, { useState } from "react";
import { fetchRecommendations } from "../services/recommendations";

// Pantalla de demo (ventas): planificador rápido que consume GET /api/recommendations.
// Self-contained y fácil de retirar. Solo habla con Express /api (fachada única).

const EMPTY_FILTERS = {
  edad: "",
  municipio: "",
  carrito: false,
  cambiador: false,
  lluvia: false,
  budget: "",
};

function Feature({ label }) {
  return (
    <span
      style={{
        backgroundColor: "var(--surface-container, #eef0f7)",
        color: "var(--on-surface-variant, #44474f)",
        padding: "0.125rem 0.5rem",
        borderRadius: "0.25rem",
        fontSize: "12px",
      }}
    >
      {label}
    </span>
  );
}

function RecommendationCard({ item }) {
  // El evento es la clave principal; `activity` es alias legacy del mismo objeto.
  const event = item.event || item.activity || {};
  const reasons = Array.isArray(item.reasons) ? item.reasons : [];
  const aptoLluvia = event.es_lluvia ?? event.es_interior; // a cubierto = apto si llueve

  return (
    <article
      style={{
        backgroundColor: "var(--surface-container-lowest, #fff)",
        borderRadius: "0.75rem",
        border: "1px solid var(--outline-variant, #c4c6d0)",
        boxShadow: "0 4px 12px rgba(16,25,60,0.05)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
      // source es metadato técnico: oculto al usuario, solo accesible para debug.
      data-source={item.source || "unknown"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
        <h3 style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "18px", fontWeight: 600, margin: 0 }}>
          {event.title || "Plan recomendado"}
        </h3>
        {typeof item.score === "number" && (
          <span
            style={{
              flexShrink: 0,
              backgroundColor: "var(--primary, #3a5bd9)",
              color: "#fff",
              padding: "0.125rem 0.5rem",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            score {item.score}
          </span>
        )}
      </div>

      {event.municipio && (
        <div style={{ color: "var(--on-surface-variant, #44474f)", fontSize: "14px" }}>
          📍 {event.municipio}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
        {event.categoria && <Feature label={event.categoria} />}
        {event.price && <Feature label={event.price} />}
        {(event.edad_minima ?? null) !== null && <Feature label={`Desde ${event.edad_minima} años`} />}
        {event.es_carrito && <Feature label="Carrito" />}
        {event.es_cambiador && <Feature label="Cambiador" />}
        {aptoLluvia && <Feature label="A cubierto" />}
      </div>

      {reasons.length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 0.25rem" }}>
            Por qué te recomendamos este plan
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "13px", color: "var(--on-surface-variant, #44474f)" }}>
            {reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function PlanificadorRapido() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [results, setResults] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const update = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const data = await fetchRecommendations(filters);
      setResults(data.slice(0, 3));
      setStatus("done");
    } catch (err) {
      setErrorMsg("No se pudieron cargar las recomendaciones. Inténtalo de nuevo.");
      setStatus("error");
    }
  };

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "1.5rem 1rem 5rem" }}>
      <h1 style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "26px", fontWeight: 700, marginBottom: "0.25rem" }}>
        Planificador rápido
      </h1>
      <p style={{ color: "var(--on-surface-variant, #44474f)", marginTop: 0, fontSize: "14px" }}>
        Dinos cómo es tu plan y te proponemos hasta 3 ideas para hoy.
      </p>

      <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.25rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "14px", fontWeight: 500 }}>
          Edad del peque
          <input
            type="number"
            min="0"
            max="18"
            inputMode="numeric"
            placeholder="Ej. 2"
            value={filters.edad}
            onChange={update("edad")}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "14px", fontWeight: 500 }}>
          Municipio
          <input
            type="text"
            placeholder="Ej. Bilbao"
            value={filters.municipio}
            onChange={update("municipio")}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "14px", fontWeight: 500 }}>
          Presupuesto máximo (€)
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Ej. 20"
            value={filters.budget}
            onChange={update("budget")}
            style={inputStyle}
          />
        </label>

        <fieldset style={{ border: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <label style={checkboxLabelStyle}>
            <input type="checkbox" checked={filters.carrito} onChange={update("carrito")} /> Carrito
          </label>
          <label style={checkboxLabelStyle}>
            <input type="checkbox" checked={filters.cambiador} onChange={update("cambiador")} /> Cambiador
          </label>
          <label style={checkboxLabelStyle}>
            <input type="checkbox" checked={filters.lluvia} onChange={update("lluvia")} /> A cubierto (si llueve)
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            backgroundColor: "var(--primary, #3a5bd9)",
            color: "#fff",
            border: "none",
            borderRadius: "0.75rem",
            padding: "0.85rem 1rem",
            fontSize: "16px",
            fontWeight: 600,
            cursor: status === "loading" ? "default" : "pointer",
            opacity: status === "loading" ? 0.7 : 1,
          }}
        >
          {status === "loading" ? "Buscando…" : "Buscar planes"}
        </button>
      </form>

      <section style={{ marginTop: "2rem" }} aria-live="polite">
        {status === "loading" && (
          <p style={{ color: "var(--on-surface-variant, #44474f)" }}>Cargando recomendaciones…</p>
        )}

        {status === "error" && (
          <p role="alert" style={{ color: "#b3261e", fontWeight: 500 }}>{errorMsg}</p>
        )}

        {status === "done" && results.length === 0 && (
          <p style={{ color: "var(--on-surface-variant, #44474f)" }}>
            No encontramos planes con esos filtros. Prueba a relajarlos.
          </p>
        )}

        {status === "done" && results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "20px", fontWeight: 600, margin: 0 }}>
              {results.length} plan{results.length !== 1 ? "es" : ""} para vosotros
            </h2>
            {results.map((item, i) => (
              <RecommendationCard key={(item.event && item.event.id) || i} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const inputStyle = {
  padding: "0.7rem 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--outline-variant, #c4c6d0)",
  fontSize: "16px",
  fontFamily: "inherit",
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
};

export default PlanificadorRapido;
