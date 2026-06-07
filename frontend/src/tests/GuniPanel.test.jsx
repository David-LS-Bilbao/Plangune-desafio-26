import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../services/assistantApi", () => ({
  sendFamilyPlan: vi.fn(),
}));

import { sendFamilyPlan } from "../services/assistantApi";
import GuniPanel from "../components/assistant/GuniPanel";

beforeEach(() => {
  vi.clearAllMocks();
});

function renderPanel() {
  return render(
    <MemoryRouter>
      <GuniPanel />
    </MemoryRouter>,
  );
}

function ask(text) {
  fireEvent.change(screen.getByLabelText("Tu necesidad familiar"), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: "Preguntar" }));
}

describe("GuniPanel", () => {
  it("estado idle: muestra input y botón", () => {
    renderPanel();
    expect(screen.getByLabelText("Tu necesidad familiar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preguntar" })).toBeInTheDocument();
  });

  it("modo ai con recomendación: muestra respuesta, tarjeta y CTA; sin source/mode crudos", async () => {
    sendFamilyPlan.mockResolvedValue({
      mode: "ai",
      source: "data-chatbot",
      assistantMessageMarkdown: "## Plan recomendado\nUn museo cubierto en Bilbao.",
      recommendations: [
        {
          event: { id: 1, title: "Museo", municipio: "Bilbao", territorio: "Bizkaia" },
          score: 90,
          reasons: ["Apto para la edad"],
          source: "local-fallback",
        },
      ],
    });

    renderPanel();
    ask("Plan cubierto en Bilbao");

    expect(await screen.findByText(/Un museo cubierto en Bilbao/)).toBeInTheDocument();
    expect(screen.getByText("Museo")).toBeInTheDocument();
    expect(screen.getByText("Ver plan")).toBeInTheDocument();
    // Metadatos técnicos NO visibles en crudo.
    expect(screen.queryByText(/data-chatbot/)).not.toBeInTheDocument();
  });

  it("fallback: muestra texto amable de orientación (no la palabra cruda)", async () => {
    sendFamilyPlan.mockResolvedValue({
      mode: "fallback",
      message: "El asistente IA aún no está disponible. Te mostramos opciones.",
      recommendations: [],
    });

    renderPanel();
    ask("algo gratis");

    expect(await screen.findByText(/Orientación básica disponible ahora/)).toBeInTheDocument();
    expect(
      screen.getByText(/El asistente IA aún no está disponible/),
    ).toBeInTheDocument();
  });

  it("recomendación sin id (Data): no muestra 'Ver plan'", async () => {
    sendFamilyPlan.mockResolvedValue({
      mode: "fallback",
      message: "Opciones:",
      recommendations: [
        { event: { nombre: "Aizian", municipio: "Bilbao" }, score: 1, reasons: ["Recomendado"], source: "data-api" },
      ],
    });

    renderPanel();
    ask("restaurante");

    expect(await screen.findByText("Aizian")).toBeInTheDocument();
    expect(screen.queryByText("Ver plan")).not.toBeInTheDocument();
  });

  it("error: muestra mensaje amable sin romper", async () => {
    sendFamilyPlan.mockRejectedValue(new Error("network"));

    renderPanel();
    ask("plan");

    expect(await screen.findByText(/Inténtalo de nuevo/i)).toBeInTheDocument();
  });
});
