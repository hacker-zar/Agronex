# Supabase

`schema.sql` es el **único** script de base de datos. Se corre una vez, completo, en el SQL Editor de un
proyecto de Supabase vacío. Crea tablas, trigger de perfil, funciones de estado, RLS y permisos por columna.
Si ya existen tablas de Agronex, se detiene sin tocar nada (el bloque RESET del final explica cómo reiniciar).

## Reglas del modelo (el código cliente debe respetarlas)

- El cliente **no escribe**: estados, datos copiados de la oferta en la reserva, `owner_name`, `rating`,
  `reviews_count`, `payments` ni `notifications` (salvo marcar `read`).
- Los cambios de estado pasan por funciones SQL: `transition_reservation`, `set_operation_stage`,
  `propose_schedule`, `respond_schedule` (ver `js/services/remoteRepository.js`).
- Baja de ofertas: lógica (`deleted_at`), nunca `DELETE`.
- Las listas blancas de columnas de `js/modules/dbMappers.js` deben coincidir con los `GRANT` por columna de `schema.sql`.
- El perfil lo crea un trigger al registrarse, con los metadatos del `signUp` (`name`, `role`, `terms_version`).

## Configuración de la app

Copiar `.env.example` a `.env.local` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
En Vercel: mismas variables en *Project Settings → Environment Variables*.
Sin variables, `js/services/supabaseService.js` exporta `remote = null` y la app sigue en modo prototipo.
