import assert from "node:assert/strict";
import test from "node:test";

import { estimatedTravelMinutes, formatKm, haversineKm } from "../js/modules/location.js";
import { offerHasPendingRequests } from "../js/modules/offers.js";
import { estimateServiceCost } from "../js/modules/pricing.js";
import { requestQuantityFieldsForPriceUnit } from "../js/modules/requests.js";
import {
  calculateReputationScore,
  responseReputationScore,
  weightedReviewCategoryAverage,
} from "../js/modules/reputation.js";
import { isContractorNegotiationStatus } from "../js/modules/reservations.js";
import { pendingActionForReservation, sortPendingItems } from "../js/modules/pending.js";
import { clean, escapeHTML, money } from "../js/modules/ui.js";

test("estimateServiceCost calculates totals and rejects incomplete quantities", () => {
  assert.deepEqual(
    estimateServiceCost({
      serviceType: "Cosecha",
      priceUnit: "hectarea",
      unitPrice: 120,
      quantity: 15,
      modifiers: { urgency: 300 },
    }),
    {
      serviceType: "Cosecha",
      priceUnit: "hectarea",
      unitPrice: 120,
      quantity: 15,
      estimatedValue: 2100,
    }
  );

  assert.equal(
    estimateServiceCost({ priceUnit: "hectarea", unitPrice: 120, quantity: 0 }).estimatedValue,
    null
  );
  assert.equal(
    estimateServiceCost({ priceUnit: "fijo", unitPrice: 50000, quantity: 0 }).estimatedValue,
    50000
  );
});

test("requestQuantityFieldsForPriceUnit exposes the minimum fields per pricing unit", () => {
  assert.equal(requestQuantityFieldsForPriceUnit("hectarea").hectares, true);
  assert.equal(requestQuantityFieldsForPriceUnit("tonelada_kilometro").tons, true);
  assert.equal(requestQuantityFieldsForPriceUnit("tonelada_kilometro").km, true);
  assert.equal(requestQuantityFieldsForPriceUnit("viaje").trips, true);
  assert.equal(requestQuantityFieldsForPriceUnit("fijo").hectares, false);
});

test("reservation negotiation status keeps contractor work visible while action is needed", () => {
  assert.equal(isContractorNegotiationStatus({ status: "pending" }), true);
  assert.equal(isContractorNegotiationStatus({ status: "accepted" }), true);
  assert.equal(isContractorNegotiationStatus({ status: "done" }, true), true);
  assert.equal(isContractorNegotiationStatus({ status: "done" }), false);
});

test("actionable pending rules assign each reservation transition to the right participant", () => {
  assert.equal(pendingActionForReservation({ status: "pending" }, { isRequester: true }), null);
  assert.equal(pendingActionForReservation({ status: "pending" }, { isOwner: true }), "Responder solicitud");
  assert.equal(pendingActionForReservation({ status: "schedule_counter" }, { isRequester: true }), "Responder propuesta de horario");
  assert.equal(pendingActionForReservation({ status: "accepted" }, { isRequester: true }), null);
  assert.equal(pendingActionForReservation({ status: "accepted" }, { isOwner: true }), "Iniciar trabajo");
  assert.equal(pendingActionForReservation({ status: "working" }, { isOwner: true }), "Actualizar operación");
  assert.equal(pendingActionForReservation({ status: "done" }, { isRequester: true }), null);
  assert.equal(pendingActionForReservation({ status: "cancelled" }, { isOwner: true }), null);
});

test("pending reschedule waits for the other participant and ordering is stable by category and update time", () => {
  const request = { status: "accepted" };
  const pendingReschedule = { status: "pending" };
  assert.equal(pendingActionForReservation(request, { isRequester: true, pendingReschedule, rescheduleRequestedByCurrentUser: true }), null);
  assert.equal(pendingActionForReservation(request, { isRequester: true, pendingReschedule }), "Revisar cambio de fecha");
  assert.equal(pendingActionForReservation(request, { isOwner: true, pendingReschedule, rescheduleRequestedByCurrentUser: true }), null);
  const sorted = sortPendingItems([
    { id: "old-received", category: "received", updatedAt: "2026-01-01" },
    { id: "recent-sent", category: "initiated", updatedAt: "2026-10-01" },
    { id: "new-received", category: "received", updatedAt: "2026-10-02" },
  ]);
  assert.deepEqual(sorted.map((item) => item.id), ["new-received", "old-received", "recent-sent"]);
});

test("reputation score combines reviews, operations and response time", () => {
  const weights = {
    contractor: { workCompliance: 0.4, punctuality: 0.25, communication: 0.25, vehicleCondition: 0.1 },
  };
  const reviews = [
    { categories: { workCompliance: 5, punctuality: 4, communication: 5, vehicleCondition: 4 } },
    { categories: { workCompliance: 4, punctuality: 4, communication: 4, vehicleCondition: 5 } },
  ];

  assert.equal(Math.round(weightedReviewCategoryAverage(reviews, "contractor", weights) * 10) / 10, 4.4);
  assert.equal(responseReputationScore(90), 100);
  assert.equal(responseReputationScore(3000), 30);

  const score = calculateReputationScore(
    reviews,
    { completedCount: 3, acceptanceRate: 90, cancellationRate: 5, averageResponseMinutes: 90 },
    "contractor",
    4.6,
    95,
    weights
  );
  assert.equal(score >= 80, true);
});

test("location helpers keep field estimates simple and predictable", () => {
  const rosario = { latitude: -32.9587, longitude: -60.693 };
  const funes = { latitude: -32.9157, longitude: -60.8099 };
  const distance = haversineKm(rosario, funes);

  assert.equal(distance > 10 && distance < 13, true);
  assert.equal(estimatedTravelMinutes(5), 10);
  assert.equal(estimatedTravelMinutes(55), 60);
  assert.equal(formatKm(12.34), "12,3");
});

test("small domain utilities guard unsafe or noisy display values", () => {
  assert.equal(offerHasPendingRequests(1), true);
  assert.equal(offerHasPendingRequests(0), false);
  assert.equal(clean("  lote norte  "), "lote norte");
  assert.equal(escapeHTML("<script>alert('x')</script>"), "&lt;script&gt;alert(&#039;x&#039;)&lt;/script&gt;");
  assert.equal(money(12500), "12.500");
});
