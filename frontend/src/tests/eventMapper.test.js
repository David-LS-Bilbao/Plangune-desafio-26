import { describe, it, expect } from "vitest";

import {
  eventToPlan,
  eventsToPlans,
  PLACEHOLDER_IMAGE,
} from "../mappers/eventMapper";

const baseEvent = {
  id: 1,
  title: "Exposición interactiva en el museo",
  description: "Sala sensorial para peques.",
  municipio: "Bilbao",
  territorio: "Bizkaia",
  categoria: "museo",
  price: "Gratis",
  edad_minima: 0,
  es_carrito: true,
  es_cambiador: true,
  es_interior: true,
  es_silla_ruedas: true,
  es_mascotas: false,
  imagen_url: null,
  lat: 43.2645,
  lng: -2.9342,
  fecha_inicio: "2026-06-10T10:00:00",
  fecha_fin: "2026-06-10T13:00:00",
  tipo_evento: "exposicion",
};

describe("eventToPlan", () => {
  it("mapea el shape snake_case del backend al shape de la UI", () => {
    const plan = eventToPlan(baseEvent);
    expect(plan.id).toBe(1);
    expect(plan.title).toBe(baseEvent.title);
    expect(plan.description).toBe(baseEvent.description);
    expect(plan.location).toBe("Bilbao, Bizkaia");
    expect(plan.municipio).toBe("Bilbao");
    expect(plan.territorio).toBe("Bizkaia");
    expect(plan.category).toBe("museo");
    expect(plan.price).toBe("Gratis");
    expect(plan.fecha).toBe("2026-06-10T10:00:00");
    expect(plan.latitud).toBe(43.2645);
    expect(plan.longitud).toBe(-2.9342);
  });

  it("ageRange: edad_minima 0 → 'Todas las edades'", () => {
    expect(eventToPlan({ ...baseEvent, edad_minima: 0 }).ageRange).toBe("Todas las edades");
  });

  it("ageRange: edad_minima 4 → '4+ años'", () => {
    expect(eventToPlan({ ...baseEvent, edad_minima: 4 }).ageRange).toBe("4+ años");
  });

  it("ageRange: con edad_maxima → rango 'min-max años'", () => {
    expect(eventToPlan({ ...baseEvent, edad_minima: 3, edad_maxima: 8 }).ageRange).toBe(
      "3-8 años",
    );
  });

  it("deriva tags legibles desde los flags booleanos", () => {
    const { tags } = eventToPlan(baseEvent);
    expect(tags).toContain("Apto Carrito");
    expect(tags).toContain("Cambiador");
    expect(tags).toContain("Interior");
    expect(tags).toContain("Silla de ruedas");
    expect(tags).not.toContain("Mascotas");
  });

  it("expone los flags crudos de accesibilidad", () => {
    const plan = eventToPlan(baseEvent);
    expect(plan.es_carrito).toBe(true);
    expect(plan.es_silla_ruedas).toBe(true);
    expect(plan.es_mascotas).toBe(false);
  });

  it("usa imagen placeholder cuando imagen_url es null", () => {
    expect(eventToPlan(baseEvent).image).toBe(PLACEHOLDER_IMAGE);
  });

  it("respeta imagen_url cuando existe", () => {
    expect(eventToPlan({ ...baseEvent, imagen_url: "https://x/y.jpg" }).image).toBe(
      "https://x/y.jpg",
    );
  });

  it("acepta alias en español (titulo/descripcion/precio)", () => {
    const plan = eventToPlan({ id: 2, titulo: "T", descripcion: "D", precio: "5 €" });
    expect(plan.title).toBe("T");
    expect(plan.description).toBe("D");
    expect(plan.price).toBe("5 €");
  });

  it("devuelve null para entradas no válidas", () => {
    expect(eventToPlan(null)).toBeNull();
    expect(eventToPlan(undefined)).toBeNull();
    expect(eventToPlan(42)).toBeNull();
  });
});

describe("eventsToPlans", () => {
  it("mapea un array de eventos y descarta inválidos", () => {
    const plans = eventsToPlans([baseEvent, null, { id: 3, title: "Otro" }]);
    expect(plans).toHaveLength(2);
    expect(plans[0].id).toBe(1);
  });

  it("devuelve [] si la entrada no es un array", () => {
    expect(eventsToPlans(null)).toEqual([]);
    expect(eventsToPlans(undefined)).toEqual([]);
  });
});
