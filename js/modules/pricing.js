"use strict";

export function estimateServiceCost({ serviceType, priceUnit, unitPrice, quantity, modifiers = {} }) {
  const price = Number(unitPrice);
  const qty = Number(quantity);
  const adjustment = Object.values(modifiers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  if (!Number.isFinite(price) || price <= 0) {
    return { estimatedValue: null, quantity: null, priceUnit, unitPrice: price };
  }
  const effectiveQuantity = priceUnit === "fijo" ? 1 : qty;
  if (!Number.isFinite(effectiveQuantity) || effectiveQuantity <= 0) {
    return { estimatedValue: null, quantity: null, priceUnit, unitPrice: price };
  }
  return {
    serviceType,
    priceUnit,
    unitPrice: price,
    quantity: effectiveQuantity,
    estimatedValue: Math.max(0, Math.round((price * effectiveQuantity) + adjustment)),
  };
}
