"use strict";

export function clean(value) {
  return String(value || "").trim();
}

export function escapeHTML(value) {
  return clean(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character]));
}

export function money(value) {
  return Number(value || 0).toLocaleString("es-AR");
}
