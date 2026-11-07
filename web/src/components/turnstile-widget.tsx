"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: {
    sitekey: string;
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
    theme: "auto";
  }) => string;
  remove: (widgetId: string) => void;
};

declare global { interface Window { turnstile?: TurnstileApi } }

export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!scriptReady || !siteKey || !container.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      theme: "auto",
      callback: onToken,
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
    });
  }, [onToken, scriptReady, siteKey]);

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [renderWidget]);

  if (!siteKey) return <p className="error" role="alert">Falta configurar NEXT_PUBLIC_TURNSTILE_SITE_KEY.</p>;
  return <div className="stack"><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => setScriptReady(true)} onError={() => onToken("")} /><div ref={container} aria-label="Verificación de seguridad" />{!scriptReady && <p className="muted" role="status">Cargando verificación de seguridad…</p>}</div>;
}
