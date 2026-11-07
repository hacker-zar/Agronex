# Agronex web

Nueva aplicación Next.js de Agronex/NexuDrive. Se desarrolla en paralelo a la demo Vite de la raíz.

## Desarrollo

1. Copiar `.env.example` como `.env.local`.
2. Completar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_TURNSTILE_SITE_KEY` con las credenciales públicas correspondientes. La secret de Turnstile se configura en Supabase Auth y nunca se coloca en Next.js.
3. Ejecutar `npm install` y `npm run dev` dentro de `web/`.

Comandos de verificación: `npm test`, `npm run lint` y `npm run build`.

## Estructura

- `src/app`: rutas App Router, incluido catálogo público, autenticación, callback, términos y perfil protegido.
- `src/lib/supabase`: clientes browser/server y actualización de sesión con `proxy.ts`.
- `src/lib/db`: mappers y repositorios que solo escriben columnas permitidas por el contrato SQL.
- `src/components`: componentes de interfaz reutilizables.

Para Vercel, crear un proyecto separado con *Root Directory* configurado en `web`.
