import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock del cliente HTTP: sin llamadas reales.
vi.mock("../services/apiClient", () => ({
  default: { get: vi.fn() },
}));

import apiClient from "../services/apiClient";
import { fetchRecommendations } from "../services/recommendationsApi";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("recommendationsApi.fetchRecommendations", () => {
  it("llama a GET /recommendations sin params y devuelve el array", async () => {
    apiClient.get.mockResolvedValue({ data: [{ event: { id: 1 } }] });

    const res = await fetchRecommendations();

    expect(apiClient.get).toHaveBeenCalledWith("/recommendations", { params: {} });
    expect(res).toEqual([{ event: { id: 1 } }]);
  });

  it("serializa childrenAges a CSV, omite vacíos y conserva budget 0", async () => {
    apiClient.get.mockResolvedValue({ data: [] });

    await fetchRecommendations({
      municipality: "Bilbao",
      childrenAges: [2, 5],
      strollerFriendly: true,
      wheelchairAccessible: true,
      budget: 0,
      limit: 3,
      vacio: "",
      nulo: null,
    });

    expect(apiClient.get).toHaveBeenCalledWith("/recommendations", {
      params: {
        municipality: "Bilbao",
        childrenAges: "2,5",
        strollerFriendly: true,
        wheelchairAccessible: true,
        budget: 0,
        limit: 3,
      },
    });
  });

  it("devuelve [] si la respuesta no es un array", async () => {
    apiClient.get.mockResolvedValue({ data: null });
    expect(await fetchRecommendations()).toEqual([]);
  });
});
