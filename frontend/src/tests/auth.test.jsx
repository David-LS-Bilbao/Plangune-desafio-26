/**
 * Tests de login y guards de rutas (frontend).
 *
 * Se mockea el servicio authApi (sin red). La sesión se valida al montar <App/> vía
 * checkSession() → fetchMe(); controlamos su resultado por test. El store es un singleton,
 * por lo que se reinicia su estado en beforeEach.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../services/authApi", () => ({
  login: vi.fn(),
  register: vi.fn(),
  fetchMe: vi.fn(),
  logout: vi.fn(),
}));

import { login as apiLogin, fetchMe as apiFetchMe } from "../services/authApi";
import App from "../App.jsx";
import LoginForm from "../components/auth/LoginForm";
import { useAuthStore } from "../store";

const familyUser = { id: 100, email: "familia@demo.com", role: "family" };
const businessUser = { id: 6, email: "negocio@demo.com", role: "business" };

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  // Estado inicial real: sin usuario y "validando sesión".
  useAuthStore.setState({ user: null, status: "loading" });
});

describe("Login (frontend)", () => {
  it("renderiza el formulario de login", async () => {
    apiFetchMe.mockRejectedValue(new Error("no session"));

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );

    // Los campos del formulario identifican el login de forma inequívoca
    // (la navbar también tiene un botón "Iniciar sesión", de ahí que no lo usemos aquí).
    expect(await screen.findByPlaceholderText("tu@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("submit correcto guarda la sesión y redirige según el rol (family → /buscar)", async () => {
    apiLogin.mockResolvedValue(familyUser);

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/buscar" element={<div>PANTALLA_BUSCAR</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "familia@demo.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "Demo1234!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText("PANTALLA_BUSCAR")).toBeInTheDocument();
    expect(apiLogin).toHaveBeenCalledWith("familia@demo.com", "Demo1234!");
    expect(useAuthStore.getState().user).toMatchObject({ role: "family" });
  });

  it("muestra error amable si las credenciales son incorrectas (401)", async () => {
    apiLogin.mockRejectedValue({ response: { status: 401 } });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "familia@demo.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "malapass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/incorrect/i);
  });
});

describe("Guards de rutas", () => {
  it("sin sesión, /buscar redirige a /login", async () => {
    apiFetchMe.mockRejectedValue(new Error("no session"));

    render(
      <MemoryRouter initialEntries={["/buscar"]}>
        <App />
      </MemoryRouter>,
    );

    // Acaba en el login (formulario visible).
    expect(await screen.findByPlaceholderText("tu@email.com")).toBeInTheDocument();
  });

  it("sin sesión, /negocio/ofertas sigue siendo accesible (ruta pública)", async () => {
    apiFetchMe.mockRejectedValue(new Error("no session"));

    render(
      <MemoryRouter initialEntries={["/negocio/ofertas"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: /gestionar oferta/i })).toBeInTheDocument();
  });

  it("negocio logueado accede a /negocio", async () => {
    apiFetchMe.mockResolvedValue(businessUser);

    render(
      <MemoryRouter initialEntries={["/negocio"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: /gestionar actividad/i })).toBeInTheDocument();
  });

  it("familia logueada NO accede a /admin (pantalla de no autorizado)", async () => {
    apiFetchMe.mockResolvedValue(familyUser);

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: /no tienes acceso/i })).toBeInTheDocument();
  });
});
