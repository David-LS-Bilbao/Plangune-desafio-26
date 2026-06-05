import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FamilyChatPlayground from "../components/FamilyChatPlayground";
import { sendFamilyPlanMessage } from "../services/familyChatApi";

// El playground nunca debe tocar el backend real en tests: mockeamos el service.
vi.mock("../services/familyChatApi", () => ({
  sendFamilyPlanMessage: vi.fn(),
}));

describe("FamilyChatPlayground", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el hero de GUNI y el mensaje de bienvenida inicial", () => {
    render(<FamilyChatPlayground />);

    expect(
      screen.getByRole("heading", { name: "GUNI" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Tu guía familiar para encontrar planes cómodos/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Soy GUNI/i)).toBeInTheDocument();
  });

  it("envía un prompt rápido y pinta la respuesta de GUNI con recomendaciones", async () => {
    sendFamilyPlanMessage.mockResolvedValueOnce({
      message: "Te propongo un parque tranquilo.",
      recommendations: [{ id: 1, title: "Parque de Doña Casilda", price: 0 }],
    });

    const user = userEvent.setup();
    render(<FamilyChatPlayground />);

    await user.click(screen.getByRole("button", { name: "Plan gratis" }));

    expect(sendFamilyPlanMessage).toHaveBeenCalledWith({
      message: "Plan gratis",
      familyProfile: expect.objectContaining({ budget: null }),
    });

    await waitFor(() => {
      expect(
        screen.getByText("Te propongo un parque tranquilo."),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Parque de Doña Casilda")).toBeInTheDocument();
  });

  it("muestra la etiqueta de modo orientación básica en fallback", async () => {
    sendFamilyPlanMessage.mockResolvedValueOnce({
      message: "Respuesta orientativa general.",
      mode: "fallback",
    });

    const user = userEvent.setup();
    render(<FamilyChatPlayground />);

    await user.click(screen.getByRole("button", { name: "Sorpréndeme" }));

    await waitFor(() => {
      expect(screen.getByText("Modo orientación básica")).toBeInTheDocument();
    });
  });

  it("muestra un mensaje amable si el backend falla", async () => {
    sendFamilyPlanMessage.mockRejectedValueOnce(new Error("network"));

    const user = userEvent.setup();
    render(<FamilyChatPlayground />);

    await user.click(screen.getByRole("button", { name: "Algo tranquilo" }));

    await waitFor(() => {
      expect(
        screen.getByText(/no he podido conectar/i),
      ).toBeInTheDocument();
    });
  });

  it("abre el drawer de preferencias familiares desde el header", async () => {
    const user = userEvent.setup();
    render(<FamilyChatPlayground />);

    await user.click(
      screen.getByRole("button", { name: "Abrir preferencias familiares" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Preferencias familiares" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Aplicar preferencias" }),
    ).toBeInTheDocument();
  });
});
