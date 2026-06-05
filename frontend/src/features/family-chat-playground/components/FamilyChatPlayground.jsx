import React, { useEffect, useRef, useState } from "react";

import GuniMascot from "./GuniMascot";
import ChatBubble from "./ChatBubble";
import QuickPromptChips from "./QuickPromptChips";
import FamilyPreferencesDrawer from "./FamilyPreferencesDrawer";
import RecommendationCard from "./RecommendationCard";
import { sendFamilyPlanMessage } from "../services/familyChatApi";
import "../styles/family-chat-playground.css";

const QUICK_PROMPTS = [
  "Plan gratis",
  "Algo tranquilo",
  "Cubierto si llueve",
  "Con carrito",
  "Bebé 1 año",
];

const SURPRISE_PROMPT = "Sorpréndeme con un plan familiar cómodo para hoy.";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "guni",
  text: "¡Hola! Soy GUNI 👋\nCuéntame qué necesitáis hoy y te propongo un plan familiar cómodo. Puedes ajustar vuestras preferencias con el menú.",
  isFallback: false,
  recommendations: [],
};

const DEFAULT_PREFS = {
  childrenAges: [],
  municipality: "",
  strollerFriendly: false,
  changingTable: false,
  rainSuitable: false,
  maxDuration: "",
  freeOrLowCost: false,
};

const BOTTOM_NAV = [
  { key: "chat", label: "Chat", icon: "💬" },
  { key: "actividades", label: "Actividades", icon: "🗺️" },
  { key: "guardados", label: "Guardados", icon: "🔖" },
];

/**
 * Mapea las preferencias del drawer al perfil familiar que espera el backend.
 *  - "Gratis o bajo coste" -> budget bajo (0).
 */
function prefsToFamilyProfile(prefs) {
  return {
    childrenAges: prefs.childrenAges,
    municipality: prefs.municipality,
    strollerFriendly: prefs.strollerFriendly,
    rainSuitable: prefs.rainSuitable,
    budget: prefs.freeOrLowCost ? 0 : null,
  };
}

/**
 * Playground visual aislado del chat familiar con GUNI.
 * Ruta: /dev/family-chat
 */
function FamilyChatPlayground() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  const idRef = useRef(0);
  const threadRef = useRef(null);

  const nextId = () => {
    idRef.current += 1;
    return `m-${idRef.current}`;
  };

  // Autoscroll al final del hilo cuando cambian los mensajes o el loading.
  useEffect(() => {
    const node = threadRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (rawText) => {
    const text = String(rawText ?? "").trim();
    if (!text || loading) return;

    setError(false);
    setInputValue("");
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text, isFallback: false, recommendations: [] },
    ]);
    setLoading(true);

    try {
      const data = await sendFamilyPlanMessage({
        message: text,
        familyProfile: prefsToFamilyProfile(prefs),
      });

      const replyText =
        data?.assistantMessageMarkdown ||
        data?.message ||
        "No he encontrado una propuesta clara, pero podéis afinar las preferencias y volver a intentarlo.";

      const recommendations = Array.isArray(data?.recommendations)
        ? data.recommendations
        : [];

      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "guni",
          text: replyText,
          isFallback: data?.mode === "fallback",
          recommendations,
        },
      ]);
    } catch (err) {
      setError(true);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "guni",
          text: "Uy, ahora mismo no he podido conectar para buscar planes. Inténtalo de nuevo en un momento. 🙏",
          isFallback: false,
          recommendations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSend(inputValue);
  };

  const handleApplyPrefs = (newPrefs) => {
    setPrefs(newPrefs);
    setDrawerOpen(false);
  };

  return (
    <div className="fcp">
      {/* 1. Header interno (no toca la navegación global) */}
      <header className="fcp-header">
        <button
          type="button"
          className="fcp-iconbtn"
          aria-label="Abrir preferencias familiares"
          onClick={() => setDrawerOpen(true)}
        >
          ☰
        </button>
        <span className="fcp-header__brand">Plangune</span>
        <button
          type="button"
          className="fcp-iconbtn"
          aria-label="Ajustes"
          onClick={() => setDrawerOpen(true)}
        >
          ⚙️
        </button>
      </header>

      <main className="fcp-main">
        {/* 2. Hero con GUNI protagonista */}
        <section className="fcp-hero">
          <GuniMascot state={loading ? "thinking" : "idle"} size="lg" />
          <h1 className="fcp-hero__title">GUNI</h1>
          <p className="fcp-hero__subtitle">
            Tu guía familiar para encontrar planes cómodos
          </p>
          <p className="fcp-hero__note">Beta · Respuestas orientativas</p>
          <button
            type="button"
            className="fcp-btn fcp-btn--accent"
            disabled={loading}
            onClick={() => handleSend(SURPRISE_PROMPT)}
          >
            Sorpréndeme
          </button>
        </section>

        {/* 3. Chips de prompts rápidos */}
        <QuickPromptChips
          prompts={QUICK_PROMPTS}
          onSelect={handleSend}
          disabled={loading}
        />

        {/* 4 + 8. Chat y estados */}
        <section className="fcp-thread" ref={threadRef} aria-live="polite">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              text={msg.text}
              isFallback={msg.isFallback}
            >
              {msg.recommendations.length > 0 && (
                <div className="fcp-recs">
                  {msg.recommendations.map((rec, index) => (
                    <RecommendationCard
                      key={rec.id ?? rec.title ?? index}
                      recommendation={rec}
                    />
                  ))}
                </div>
              )}
            </ChatBubble>
          ))}

          {loading && (
            <div className="fcp-msg fcp-msg--guni">
              <span className="fcp-msg__avatar" aria-hidden="true">
                <GuniMascot size="sm" state="thinking" />
              </span>
              <div className="fcp-bubble fcp-bubble--thinking">
                <span className="fcp-typing">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="fcp-bubble__text">GUNI está pensando...</span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 6. Input fijo inferior */}
      <form className="fcp-inputbar" onSubmit={handleSubmit}>
        <input
          type="text"
          className="fcp-inputbar__field"
          placeholder="Cuéntale a GUNI qué necesitas..."
          value={inputValue}
          disabled={loading}
          onChange={(event) => setInputValue(event.target.value)}
          aria-label="Mensaje para GUNI"
        />
        <button
          type="submit"
          className="fcp-inputbar__send"
          disabled={loading || !inputValue.trim()}
          aria-label="Enviar mensaje"
        >
          ➤
        </button>
      </form>

      {/* 7. Bottom nav solo visual de esta pantalla */}
      <nav className="fcp-bottomnav" aria-label="Navegación de la pantalla">
        {BOTTOM_NAV.map((item, index) => (
          <span
            key={item.key}
            className={`fcp-bottomnav__item ${index === 0 ? "is-active" : ""}`}
          >
            <span className="fcp-bottomnav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="fcp-bottomnav__label">{item.label}</span>
          </span>
        ))}
      </nav>

      {/* 5. Drawer lateral de preferencias */}
      <FamilyPreferencesDrawer
        open={drawerOpen}
        value={prefs}
        onApply={handleApplyPrefs}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

export default FamilyChatPlayground;
