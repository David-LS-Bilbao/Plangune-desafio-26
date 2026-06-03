import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../App.jsx";

describe("App", () => {
  it("renderiza el título técnico DESAFIO-26", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "DESAFIO-26" }),
    ).toBeInTheDocument();
  });

  it("muestra el texto provisional del proyecto", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("App provisional para planes familiares en Euskadi"),
    ).toBeInTheDocument();
  });
});
