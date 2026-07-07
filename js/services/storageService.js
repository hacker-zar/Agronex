"use strict";

export const storageService = {
  getString(key, fallback = "") {
    try {
      const value = localStorage.getItem(key);
      return value ?? fallback;
    } catch {
      return fallback;
    }
  },

  setString(key, value) {
    localStorage.setItem(key, String(value ?? ""));
  },

  getArray(key, fallback = []) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : fallback;
    } catch {
      return fallback;
    }
  },

  getObject(key, fallback = null) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
      return fallback && typeof fallback === "object" && !Array.isArray(fallback)
        ? { ...fallback, ...value }
        : value;
    } catch {
      return fallback;
    }
  },

  setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(key);
  },
};
