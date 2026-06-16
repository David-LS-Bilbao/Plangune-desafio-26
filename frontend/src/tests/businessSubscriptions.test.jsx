/**
 * Tests de la pantalla de planes de pago del área negocio (copy de Marketing).
 *
 * Verifica que se muestran Landa/Mendi/Gailur (no Base/Pro/Premium), las CTAs correctas,
 * los precios y que la selección de plan actualiza el "Plan actual". Sin red ni pagos reales.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import BusinessSubscriptions from "../pages/BusinessSubscriptions";
import { useBusinessStore } from "../store";

beforeEach(() => {
  // Estado base: tier gratuito ("Free" en store = "Landa" en pantalla).
  useBusinessStore.setState({ subscription: "Free" });
});

function renderPage() {
  return render(
    <MemoryRouter>
      <BusinessSubscriptions />
    </MemoryRouter>,
  );
}

describe("BusinessSubscriptions · copy Marketing", () => {
  it("muestra Landa/Mendi/Gailur y ya no Base/Pro/Premium ni 'Seleccionar plan'", () => {
    renderPage();

    expect(screen.getByText("Mendi", { selector: ".subscription-name" })).toBeInTheDocument();
    expect(screen.getByText("Gailur", { selector: ".subscription-name" })).toBeInTheDocument();
    expect(screen.getByText("Landa", { selector: ".subscription-name" })).toBeInTheDocument();

    expect(screen.queryByText("Base")).toBeNull();
    expect(screen.queryByText("Pro")).toBeNull();
    expect(screen.queryByText("Premium")).toBeNull();
    expect(screen.queryByText(/seleccionar plan/i)).toBeNull();
  });

  it("muestra precios mensuales y notas de precio anual", () => {
    renderPage();

    expect(screen.getByText("0€")).toBeInTheDocument();
    expect(screen.getByText("39€")).toBeInTheDocument();
    expect(screen.getByText("119€")).toBeInTheDocument();
    expect(screen.getByText(/374€\/año \(20% descuento\)/)).toBeInTheDocument();
    expect(screen.getByText(/1\.071€\/año \(25% descuento\)/)).toBeInTheDocument();
  });

  it("marca Mendi como recomendado y Landa como plan actual por defecto", () => {
    renderPage();

    expect(screen.getByText("Recomendado")).toBeInTheDocument();
    // Banner: "Plan actual: <strong>Landa</strong>"
    expect(screen.getByText("Landa", { selector: "strong" })).toBeInTheDocument();
  });

  it("al pulsar 'Obtener Mendi' pasa a ser el plan actual (sin pago real)", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /obtener mendi/i }));

    // El banner refleja el nuevo plan y Landa vuelve a ofrecer su CTA gratuita.
    expect(screen.getByText("Mendi", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /obtener gratis/i })).toBeInTheDocument();
    // El store guarda "Mendi" (tier de pago), no rompe el gate Free de BusinessStrategy.
    expect(useBusinessStore.getState().subscription).toBe("Mendi");
  });
});
