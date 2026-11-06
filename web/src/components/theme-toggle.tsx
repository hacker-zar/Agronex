"use client";
import { useState } from "react";

type Theme = "normal" | "dark" | "field";
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => typeof document === "undefined" ? "normal" : (document.documentElement.dataset.theme as Theme) || "normal");
  function change(next: Theme) { document.documentElement.dataset.theme = next; localStorage.setItem("agronex_theme", next); setTheme(next); }
  return <label className="muted">Tema <select aria-label="Tema" value={theme} onChange={(event) => change(event.target.value as Theme)}><option value="normal">Normal</option><option value="dark">Oscuro</option><option value="field">Campo</option></select></label>;
}
