import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../services/apiClient", () => ({
  default: { post: vi.fn() },
}));

import apiClient from "../services/apiClient";
import { sendFamilyPlan } from "../services/assistantApi";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("assistantApi.sendFamilyPlan", () => {
  it("hace POST /assistant/family-plan con message y familyProfile y devuelve data", async () => {
    apiClient.post.mockResolvedValue({
      data: { mode: "fallback", message: "x", recommendations: [] },
    });

    const res = await sendFamilyPlan({
      message: "Plan cubierto en Bilbao",
      familyProfile: { municipality: "Bilbao", childrenAges: [1] },
    });

    expect(apiClient.post).toHaveBeenCalledWith("/assistant/family-plan", {
      message: "Plan cubierto en Bilbao",
      familyProfile: { municipality: "Bilbao", childrenAges: [1] },
    });
    expect(res.mode).toBe("fallback");
  });

  it("usa familyProfile {} por defecto", async () => {
    apiClient.post.mockResolvedValue({ data: {} });

    await sendFamilyPlan({ message: "hola" });

    expect(apiClient.post).toHaveBeenCalledWith("/assistant/family-plan", {
      message: "hola",
      familyProfile: {},
    });
  });
});
