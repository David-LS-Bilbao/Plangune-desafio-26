import React, { useState } from "react";

import { sendFamilyPlan } from "../../services/assistantApi";
import { recommendationsToCards } from "../../mappers/recommendationMapper";
import RecommendationCard from "../recommendations/RecommendationCard";
import GuniMascot from "../../features/family-chat-playground/components/GuniMascot";
import "./guni-panel.css";

/**
 * Panel "Pregunta a GUNI" para el flujo real de familia (no es el playground dev).
 *
 * Reutiliza:
 *  - el endpoint del asistente vía services/assistantApi (POST /api/assistant/family-plan),
 *  - el mapper de recomendaciones y la tarjeta RecommendationCard,
 *  - la mascota GuniMascot del playground (con tamaño propio).
 *
 * Distingue por `mode` (regla de contrato): en "ai" muestra `assistantMessageMarkdown`,
 * en "fallback" muestra `message`. NUNCA muestra `source`/`mode` en crudo.
 *
 * @param {object} [familyProfile] contexto familiar (childrenAges, municipality, ...) opcional.
 */

const EXAMPLES = [
  "Plan cubierto en Bilbao para bebé con carrito",
  "Algo gratis para niños de 3 años",
  "Plan tranquilo si llueve",
  "Plan con cambiador y accesible",
];

const ERROR_TEXT =
  "Ahora mismo no he podido ayudarte. Inténtalo de nuevo en un momento. 🙏";

function GuniPanel({ familyProfile = {} }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [reply, setReply] = useState("");
  const [isFallback, setIsFallback] = useState(false);
  const [cards, setCards] = useState([]);

  const handleSend = async (rawText) => {
    const message = String(rawText ?? input).trim();
    if (!message || status === "loading") return;

    setStatus("loading");
    setReply("");
    setIsFallback(false);
    setCards([]);

    try {
      const data = await sendFamilyPlan({ message, familyProfile });

      // En modo "ai" llega assistantMessageMarkdown; en "fallback" llega message.
      const replyText =
        data?.assistantMessageMarkdown ||
        data?.message ||
        "No he encontrado una propuesta clara. Prueba a afinar tu petición.";
      const recommendations = Array.isArray(data?.recommendations)
        ? recommendationsToCards(data.recommendations)
        : [];

      setReply(replyText);
      setIsFallback(data?.mode === "fallback"); // metadato técnico: solo para el texto amable
      setCards(recommendations);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSend();
  };

  return (
    <section className="guni-panel" aria-label="Pregunta a GUNI">
      <header className="guni-panel__header">
        <span className="guni-panel__mascot">
          <GuniMascot size="sm" state={status === "loading" ? "thinking" : "idle"} />
        </span>
        <div>
          <h2 className="guni-panel__title">Pregunta a GUNI</h2>
          <p className="guni-panel__subtitle">
            Cuéntale qué necesitáis y te propone un plan familiar cómodo.
          </p>
        </div>
      </header>

      <div className="guni-panel__chips">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="guni-chip"
            disabled={status === "loading"}
            onClick={() => {
              setInput(example);
              handleSend(example);
            }}
          >
            {example}
          </button>
        ))}
      </div>

      <form className="guni-panel__form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="guni-panel__input"
          placeholder="Ej: Plan cubierto en Bilbao para bebé con carrito"
          value={input}
          maxLength={500}
          disabled={status === "loading"}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Tu necesidad familiar"
        />
        <button
          type="submit"
          className="guni-panel__send"
          disabled={status === "loading" || !input.trim()}
        >
          {status === "loading" ? "Pensando..." : "Preguntar"}
        </button>
      </form>

      {status === "loading" && (
        <div className="planner-state planner-state--inline" aria-live="polite">
          <div className="planner-spinner" role="status" aria-label="GUNI está pensando" />
          <p className="planner-state__text">GUNI está pensando un plan...</p>
        </div>
      )}

      {status === "error" && (
        <div className="guni-panel__response" aria-live="polite">
          <p className="guni-panel__reply-text">{ERROR_TEXT}</p>
        </div>
      )}

      {status === "done" && (
        <div className="guni-panel__response" aria-live="polite">
          {isFallback && (
            <p className="guni-panel__hint">Orientación básica disponible ahora 👇</p>
          )}
          <p className="guni-panel__reply-text">{reply}</p>

          {cards.length > 0 && (
            <div className="rec-list guni-panel__recs">
              {cards.map((card, index) => (
                <RecommendationCard key={card.id ?? `guni-rec-${index}`} card={card} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default GuniPanel;
