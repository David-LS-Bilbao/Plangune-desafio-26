import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock del cliente HTTP: los tests no hacen llamadas reales.
vi.mock("../services/apiClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

import apiClient from "../services/apiClient";
import { fetchEvents, fetchEventById } from "../services/eventsApi";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("eventsApi.fetchEvents", () => {
  it("llama a GET /events sin params y devuelve el array", async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

    const res = await fetchEvents();

    expect(apiClient.get).toHaveBeenCalledWith("/events", { params: {} });
    expect(res).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("omite filtros vacíos/indefinidos y envía solo los definidos", async () => {
    apiClient.get.mockResolvedValue({ data: [] });

    await fetchEvents({
      municipio: "Bilbao",
      territorio: "",
      es_carrito: true,
      es_silla_ruedas: true,
      edad: undefined,
    });

    expect(apiClient.get).toHaveBeenCalledWith("/events", {
      params: { municipio: "Bilbao", es_carrito: true, es_silla_ruedas: true },
    });
  });

  it("devuelve [] si la respuesta no es un array", async () => {
    apiClient.get.mockResolvedValue({ data: null });
    expect(await fetchEvents()).toEqual([]);
  });
});

describe("eventsApi.fetchEventById", () => {
  it("llama a GET /events/:id y devuelve el objeto", async () => {
    apiClient.get.mockResolvedValue({ data: { id: 7, title: "X" } });

    const res = await fetchEventById(7);

    expect(apiClient.get).toHaveBeenCalledWith("/events/7");
    expect(res).toEqual({ id: 7, title: "X" });
  });
});
