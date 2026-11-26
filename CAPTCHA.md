# CAPTCHA de registro

El registro usa Cloudflare Turnstile y valida el token en el servidor antes de completar el alta de demostración.

- En `npm run dev`, si no se configuran claves, se usan las claves de prueba públicas de Cloudflare.
- Para producción, configurar `VITE_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` con el par de claves reales del widget. La primera se publica en el navegador; la segunda debe quedar como variable privada del servidor.
- El endpoint `/api/verify-turnstile` falla de forma segura si falta la clave privada o la validación no responde correctamente.

La validación de Turnstile requiere el widget del lado del navegador y la verificación de servidor de Cloudflare Siteverify. La app continúa siendo la versión Vite con registro de demostración local.
