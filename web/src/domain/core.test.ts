import { describe, expect, it } from "vitest";
import { estimateServiceCost, estimatedTravelMinutes, escapeHTML, haversineKm, requestQuantityFieldsForPriceUnit } from "./core";

describe("reglas portadas de la app actual", () => {
  it("calcula precios y conserva fijo", () => { expect(estimateServiceCost({ priceUnit: "hectarea", unitPrice: 120, quantity: 15, modifiers: { urgency: 300 } }).estimatedValue).toBe(2100); expect(estimateServiceCost({ priceUnit: "fijo", unitPrice: 50000, quantity: 0 }).estimatedValue).toBe(50000); });
  it("expone los campos mínimos por unidad", () => { expect(requestQuantityFieldsForPriceUnit("tonelada_kilometro")).toMatchObject({ tons: true, km: true }); });
  it("mantiene utilidades de ubicación y escape", () => { expect(haversineKm({ latitude: -32.9587, longitude: -60.693 }, { latitude: -32.9157, longitude: -60.8099 })).toBeGreaterThan(10); expect(estimatedTravelMinutes(5)).toBe(10); expect(escapeHTML("<script>")).toBe("&lt;script&gt;"); });
});
