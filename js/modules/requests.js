"use strict";

export function requestQuantityFieldsForPriceUnit(unit) {
  return {
    hectares: unit === "hectarea",
    tons: unit === "tonelada" || unit === "tonelada_kilometro",
    bags: unit === "bolsa",
    trips: unit === "viaje",
    km: unit === "kilometro" || unit === "tonelada_kilometro",
    hours: unit === "hora",
    days: unit === "dia",
  };
}
