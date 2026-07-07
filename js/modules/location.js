"use strict";

export function haversineKm(origin, destination) {
  const toRad = (value) => Number(value) * Math.PI / 180;
  const radiusKm = 6371;
  const dLat = toRad(destination.latitude - origin.latitude);
  const dLon = toRad(destination.longitude - origin.longitude);
  const lat1 = toRad(origin.latitude);
  const lat2 = toRad(destination.latitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatKm(value) {
  return Number(value).toLocaleString("es-AR", { maximumFractionDigits: value < 20 ? 1 : 0 });
}

export function estimatedTravelMinutes(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return null;
  return Math.max(10, Math.round((distanceKm / 55) * 60));
}
