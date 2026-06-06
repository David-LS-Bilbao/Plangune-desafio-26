import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../App.jsx";

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
