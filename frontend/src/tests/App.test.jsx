import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "../i18n";

import App from "../App.jsx";

describe("App", () => {
  it("renderiza el título principal de la landing page", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Haz planes y disfruta con tus peques" }),
    ).toBeInTheDocument();
  });

  it("muestra el botón para buscar planes", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByText("Buscar planes")[0],
    ).toBeInTheDocument();
  });
});
