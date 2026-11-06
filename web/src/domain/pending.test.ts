import { describe, expect, it } from "vitest";
import { pendingActionForReservation, sortPendingItems } from "./pending";
import { calculateReputationScore, responseReputationScore } from "./reputation";

describe("pendientes y reputación", () => {
  it("asigna acciones según rol y estado", () => { expect(pendingActionForReservation({ status: "pending" }, { isOwner: true })).toBe("Responder solicitud"); expect(pendingActionForReservation({ status: "accepted" }, { isRequester: true })).toBeNull(); });
  it("ordena recibidos antes de iniciados", () => { expect(sortPendingItems([{ category: "initiated", updatedAt: "2026-01-01" }, { category: "received", updatedAt: "2025-01-01" }]).map((item) => item.category)).toEqual(["received", "initiated"]); });
  it("mantiene límites de reputación", () => { expect(responseReputationScore(90)).toBe(100); expect(calculateReputationScore([], { completedCount: 3 }, "contractor", 4.6, 95, {})).toBeGreaterThan(0); });
});
