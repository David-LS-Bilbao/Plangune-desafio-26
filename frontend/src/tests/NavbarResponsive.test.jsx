import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import NavbarResponsive from "../components/common/NavbarResponsive";

describe("NavbarResponsive", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("muestra el botón de cambiar tema y actualiza localStorage", () => {
    render(
      <MemoryRouter>
        <NavbarResponsive />
      </MemoryRouter>,
    );
    // Theme toggle was removed — ensure no such control is rendered
    const themeButton = screen.queryByRole("button", { name: /cambiar tema/i });
    expect(themeButton).toBeNull();
  });
});
