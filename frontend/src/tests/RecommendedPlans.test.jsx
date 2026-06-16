import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock del servicio de recomendaciones (sin llamadas reales).
vi.mock("../services/recommendationsApi", () => ({
  fetchRecommendations: vi.fn(),
}));

import { fetchRecommendations } from "../services/recommendationsApi";
import RecommendedPlans from "../components/recommendations/RecommendedPlans";

beforeEach(() => {
  vi.clearAllMocks();
});

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("RecommendedPlans", () => {
  it("muestra recomendaciones con razones, CTA y sin exponer 'source' crudo", async () => {
    fetchRecommendations.mockResolvedValue([
      {
        event: { id: 7, title: "Visita al acuario", municipio: "Donostia", territorio: "Gipuzkoa" },
        score: 92,
        reasons: ["Apto para la edad de tus peques", "Accesible con carrito"],
        source: "local-fallback",
      },
    ]);

    renderWithRouter(<RecommendedPlans context={{}} />);

    expect(await screen.findByText("Visita al acuario")).toBeInTheDocument();
    expect(screen.getByText("Apto para la edad de tus peques")).toBeInTheDocument();
    expect(screen.getByText("Ver plan")).toBeInTheDocument();
    // El metadato técnico `source` no debe mostrarse en crudo.
    expect(screen.queryByText(/local-fallback/)).not.toBeInTheDocument();
  });

  it("si /api/recommendations falla, no rompe: muestra aviso discreto", async () => {
    fetchRecommendations.mockRejectedValue(new Error("network"));

    renderWithRouter(<RecommendedPlans context={{}} />);

    expect(
      await screen.findByText(/No hemos podido cargar recomendaciones/i),
    ).toBeInTheDocument();
  });
});
