"use strict";

export function normalizeNotificationPriority(priority) {
  const value = String(priority || "").trim().toUpperCase();
  return ["HIGH", "MEDIUM", "LOW"].includes(value) ? value : "LOW";
}

export function notificationId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `nt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
