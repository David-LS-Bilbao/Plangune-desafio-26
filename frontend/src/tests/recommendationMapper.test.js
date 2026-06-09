import { describe, it, expect } from "vitest";

import {
  recommendationToCard,
  recommendationsToCards,
  toScoreLabel,
} from "../mappers/recommendationMapper";

const event = {
  id: 1,
  title: "Exposición interactiva en el museo",
  municipio: "Bilbao",
  territorio: "Bizkaia",
  categoria: "museo",
  price: "Gratis",
  edad_minima: 0,
  es_carrito: true,
  imagen_url: null,
};

describe("recommendationToCard", () => {
  it("usa rec.event y mapea score, reasons y source", () => {
    const card = recommendationToCard({
      event,
      score: 90,
      reasons: ["Apto para la edad de tus peques", "Accesible con carrito"],
      source: "local-fallback",
    });
    expect(card.id).toBe(1);
    expect(card.title).toBe(event.title);
    expect(card.location).toBe("Bilbao, Bizkaia");
    expect(card.score).toBe(90);
    expect(card.scoreLabel).toBe("Ideal para tu familia");
    expect(card.reasons).toEqual([
      "Apto para la edad de tus peques",
      "Accesible con carrito",
    ]);
    expect(card.recSource).toBe("local-fallback");
  });

  it("acepta rec.activity como alias legacy cuando no hay event", () => {
    const card = recommendationToCard({ activity: event, score: 70, reasons: [], source: "data-api" });
    expect(card.id).toBe(1);
    expect(card.scoreLabel).toBe("Muy buen plan");
    expect(card.recSource).toBe("data-api");
  });

  it("sin score → etiqueta neutra y score null", () => {
    const card = recommendationToCard({ event });
    expect(card.score).toBeNull();
    expect(card.scoreLabel).toBe("Plan recomendado");
    expect(card.reasons).toEqual([]);
  });

  it("devuelve null si no hay event ni activity", () => {
    expect(recommendationToCard({ score: 5 })).toBeNull();
    expect(recommendationToCard(null)).toBeNull();
  });

  it("normaliza el shape de Data (nombre/es_lluvia, booleanos string, edad string, sin id)", () => {
    const dataEvent = {
      nombre: "Aizian",
      descripcion: "Restaurante acogedor",
      precio: null,
      direccion: "Lehendakari Leizaola, 29",
      municipio: "Bilbao",
      territorio: "bizkaia",
      es_carrito: true,
      es_lluvia: true, // equivalente a es_interior
      es_mascotas: "False",
      es_silla_ruedas: "True",
      edad_minima: "0",
    };
    const card = recommendationToCard({
      event: dataEvent,
      score: 1,
      reasons: ["Recomendado por el servicio Data"],
      source: "data-api",
    });
    expect(card.title).toBe("Aizian");
    expect(card.es_interior).toBe(true); // mapeado desde es_lluvia
    expect(card.es_silla_ruedas).toBe(true); // "True" -> true
    expect(card.es_mascotas).toBe(false); // "False" -> false (no truthy por ser string)
    expect(card.es_carrito).toBe(true);
    expect(card.ageRange).toBe("Todas las edades"); // edad_minima "0" -> 0
    expect(card.id).toBeNull();
    expect(card.hasDetail).toBe(false); // sin id: la UI oculta detalle/favorito
  });
});

describe("toScoreLabel", () => {
  it("aplica los umbrales esperados", () => {
    expect(toScoreLabel(90)).toBe("Ideal para tu familia");
    expect(toScoreLabel(70)).toBe("Muy buen plan");
    expect(toScoreLabel(50)).toBe("Buen plan");
    expect(toScoreLabel(null)).toBe("Plan recomendado");
    expect(toScoreLabel(undefined)).toBe("Plan recomendado");
  });
});

describe("recommendationsToCards", () => {
  it("mapea la lista y descarta items inválidos", () => {
    const cards = recommendationsToCards([
      { event, score: 80, reasons: [] },
      { score: 1 }, // sin event/activity → descartado
      null,
    ]);
    expect(cards).toHaveLength(1);
    expect(cards[0].id).toBe(1);
  });

  it("devuelve [] si la entrada no es un array", () => {
    expect(recommendationsToCards(null)).toEqual([]);
    expect(recommendationsToCards(undefined)).toEqual([]);
  });
});
