import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// La app valida la sesión al arrancar (GET /auth/me). Lo mockeamos para que el test sea
// hermético (sin red): sin sesión → la landing pública se renderiza igualmente.
vi.mock("../services/authApi", () => ({
  login: vi.fn(),
  register: vi.fn(),
  fetchMe: vi.fn().mockRejectedValue(new Error("no session")),
  logout: vi.fn(),
}));

import App from "../App.jsx";
import { useAuthStore } from "../store";

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, status: "loading" });
});

describe("App", () => {
  it("renderiza la landing con su titular principal", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /haz planes y disfruta con tus peques/i,
      }),
    ).toBeInTheDocument();
  });

  it("muestra la navegación principal de la landing", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    // La NavbarResponsive renderiza varias <nav> (barra inferior móvil y
    // navbar superior de escritorio): basta con que exista al menos una.
    expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "PLANES" }).length,
    ).toBeGreaterThan(0);
  });
});
