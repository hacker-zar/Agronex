# Inventario de migración Agronex / NexuDrive

**Fase:** 0 — inventario y plan. Este documento describe la aplicación actual y una propuesta; no implementa la reescritura.
**Rama de trabajo:** `next-rewrite`.
**Fecha:** 2026-11-04.

## 1. Alcance, fuentes y bloqueos

Se inspeccionaron `index.html`, `js/app.js` (7.426 líneas), `styles.css`, `js/modules/*`, `js/services/*`, `auth.js`, `supabaseClient.js`, `public/sw.js`, `test/domain.test.js`, `PRODUCT_VISION.md` y `ARCHITECTURE.md`.

**Bloqueo del contrato Supabase:** no existen `supabase/README.md`, `supabase/schema.sql` ni archivos dentro de `supabase/` en esta rama. Por lo tanto, no se pueden confirmar columnas, tipos, CHECK, GRANT, RLS, triggers ni firmas de funciones. La tabla de mapeo más abajo separa lo observado en el cliente de cualquier propuesta tentativa. No inferir ni desplegar cambios de esquema hasta obtener el contrato que administra el usuario.

**Desfase respecto del contexto de migración:** la aplicación operativa de la raíz inicia `js/app.js` desde `index.html` y persiste el dominio funcional en `localStorage`. `auth.js` y `supabaseClient.js` contienen integración real/prototipo con Supabase, pero no están referenciados por `index.html` ni importados por `js/app.js`; tampoco se hallaron referencias a `AgronexDB` desde la aplicación. La app que se usa como especificación funcional no opera hoy contra Supabase.

**Comandos existentes:** `npm test` (script `node --test`) y `npm run build` están definidos. No hay script `lint`, ni framework Next/Vitest ni directorio `web/` previo a este inventario en el repositorio inspeccionado.

## 2. Pantallas y rutas propuestas

La app actual es una SPA: la navegación principal cambia la pantalla activa con estado en memoria y sin URL específica. Las rutas propuestas son una organización futura; no se modifican las rutas actuales en Fase 0.

| Superficie actual | Contenido y acciones principales | Ruta propuesta | Tamaño |
|---|---|---|---|
| Catálogo (`#screen-catalogo`) | Buscar maquinaria/servicios; categorías, orden y filtros por disponibilidad, servicio, reputación, ubicación/distancia, precios, marca y potencia; estados vacío y resultados | `/app` | L |
| Detalle de maquinaria (`#machine-detail-modal`) | Ficha pública de oferta, datos de equipo/contratista, disponibilidad, reputación, acciones de solicitud/denuncia | `/oferta/[id]` para detalle compartible; sheet/modal desde `/app` | M |
| Solicitud (`#request-modal`) | Flujo de reserva en cuatro pasos, ubicación y datos del trabajo, cantidades por unidad, resumen económico y revisión | `/app/solicitudes/nueva/[ofertaId]` (pasos como estado local) | L |
| Operaciones / reservas (`#screen-reservas`) | Solicitudes enviadas o recibidas; filtros en curso/finalizadas/canceladas; detalle, acciones, seguimiento y cronología | `/app/operaciones`; detalle por panel o `/app/operaciones/[id]` si se confirma que hace falta URL | L |
| Mis ofertas (`#screen-mis-ofertas`) | Ofertas propias por estado activa/pausada/baja, solicitudes recibidas y acciones de edición/pausa/baja | `/app/ofertas` | L |
| Publicar/editar (`#screen-publicar`) | Asistente de tres pasos, categoría/equipo, contratista, precio y vista previa | `/app/ofertas/nueva` y `/app/ofertas/[id]/editar` | L |
| Perfil (`#screen-perfil`) | Datos, zona, cobertura/radio, descripción y temas visuales; acceso requiere sesión | `/app/perfil` | M |
| Acceso (`#screen-acceso`) | Registro/login en UI actual; aceptación de términos, recuperación/onboarding según flujos existentes | `/ingresar`, `/registrarse`, callback `/auth/callback`; conservar textos y reglas indicadas | M |
| Errores (`#screen-error`) | 401, 403, 404, 500, 503 y sin conexión, con volver/inicio/login/reintentar | `not-found.tsx`, límites de error, middleware y estado offline en layout | M |
| Landing institucional (actualmente `/landing/`) | Marca Agronex, propuesta AgTech, NexuDrive y ecosistema | `/` institucional/SEO; confirmar si el catálogo autenticado queda en `/app` | M |
| Términos (iframe y enlace a `legal/terminos-agronex.html`) | Lectura/aceptación de versión 1.0 | `/legal/terminos` (documento público) | S |

### 2.1 Modales, sheets y overlays

No todos ameritan una ruta propia. Mantenerlos como Client Components accionados desde las rutas anteriores, con navegación accesible y estado de URL solo si se requiere compartir o soportar atrás/adelante.

| ID / vista actual | Función | Ruta/contexto propuesto | Tamaño |
|---|---|---|---|
| `publish-preview-modal` | Vista previa al publicar | `/app/ofertas/nueva` | S |
| `notification-center` | Bandeja, leer/abrir notificación | Layout `/app` | M |
| `public-profile-modal` | Reputación, comentarios, distintivos, especialidades y publicaciones | `/perfil/[id]` si el perfil público es enlazable; en otro caso sheet | M |
| `terms-modal` | Términos en iframe y aceptación | `/legal/terminos` y confirmación desde registro | S |
| `catalog-filters-modal` | Filtros móviles/completos del catálogo | `/app` | S |
| `machine-detail-modal` | Detalle de oferta | `/oferta/[id]` / sheet desde catálogo | M |
| `request-modal` | Crear solicitud (4 pasos) | `/app/solicitudes/nueva/[ofertaId]` | L |
| `payment-demo-modal` | Confirmación visual de pago demo | No aparece un flujo de pagos real; inventariar para paridad y confirmar alcance | S |
| `location-picker-modal` | Búsqueda, mapa, selección manual y geolocalización | Contexto de oferta, solicitud o perfil | M |
| `delay-modal` | Reportar minutos/tipo/motivo de retraso | Detalle de operación | S |
| `reschedule-modal` | Proponer nuevo intervalo horario/fecha | Detalle de operación | M |
| `schedule-counter-modal` | Contraproponer horario y aceptar/rechazar propuesta | Detalle de operación | M |
| `review-modal` | Calificar contraparte con categorías, tags, comentario y volvería a trabajar | Detalle finalizado/perfil | M |
| `report-modal` | Denunciar equipo/publicación | Detalle de oferta | S |
| `operation-sheet-modal` | Avanzar etapa o reportar incidencia | Detalle de operación | M |
| `reservation-detail-modal` | Datos, negociación, cambios y seguimiento de reserva | `/app/operaciones/[id]` o sheet | L |
| `pending-center-modal` | Cola de acciones pendientes | Layout `/app` y destino según acción | M |
| `offer-detail-modal` | Detalle contextual de oferta propia | `/app/ofertas/[id]` o sheet | M |
| `confirm-modal` | Confirmar acciones destructivas/estado | Componente común | S |
| `contact-modal` | Contacto soporte por WhatsApp/correo | Componente común o `/contacto` si luego se requiere página pública | S |
| Toasts | Confirmación, error y notificaciones breves | Componente común | S |

## 3. Reglas de negocio identificadas

### 3.1 Catálogo, publicaciones y disponibilidad

- Categorías: Tractor, Sembradora, Pulverizadora, Fertilizadora, Cosechadora, Camión, Embolsadora, Extractora, Dron, Acoplado, Tolva y Otros.
- Una oferta tiene estados `active`, `paused` e `inactive`; la baja actual se modela como estado. El helper Supabase contempla `deleted_at` como baja lógica, pero no se verifica que el esquema lo incluya.
- Disponibilidad por ventana (`startDate`, `endDate`, horas estimadas) con estados `available`, `partially_booked`, `unavailable`; la app muestra etiquetas de disponibilidad derivadas.
- Categorías restringen unidades de precio válidas. Unidades: hectárea, tonelada, bolsa, viaje, kilómetro, tonelada-kilómetro, hora, día y fijo. Valores predeterminados por categoría y una normalización para compatibilidad de datos antiguos.
- Edición permite volver a publicar/pausar/dar de baja; hay borrado lógico en helper Supabase, no confirmado en el DDL.
- Catálogo filtra, busca y ordena por relevancia, precio asc/desc, disponibilidad y reputación. Filtros observados: categoría, disponibilidad, tipo de servicio, reputación mínima, ubicación, radio, precio mínimo/máximo, marca y potencia.
- La publicación tiene tres pasos y validaciones de campos condicionales por categoría/unidad. La vista previa replica el anuncio.
- Existe migración local de precio para dos equipos semilla antiguos (`seedPricingCorrections`); es corrección de demo/local, no regla general que deba llevarse a producción.

### 3.2 Precio y solicitud

- `estimateServiceCost`: si precio no es finito/positivo o cantidad no es finita/positiva, total estimado nulo; unidad `fijo` fuerza cantidad efectiva 1; suma ajustes y redondea el total a entero sin permitir total negativo.
- Campos mínimos de cantidad: ha, toneladas, bolsas, viajes, km y horas/días según unidad; tonelada-kilómetro pide toneladas y km.
- Solicitud en cuatro pasos; muestra resumen económico antes de revisar/enviar. El importe estimado es informativo según el código actual; verificar cualquier imposición/validación de servidor en el contrato ausente.
- Solicitud conserva fecha/intervalo, horas, ubicación de trabajo y coordenadas, tipo de servicio/carga y datos necesarios para transporte. No cambiar el significado ni reglas de los campos al mapearlos.

### 3.3 Estados, negociación y seguimiento

- Estados de reserva visibles: `pending`, `schedule_counter`, `original_kept`, `accepted`, `working`, `done`, `rejected`, `cancelled`. Etiquetas en español definidas en `statusLabels`.
- La oferta con solicitudes pendientes muestra actividad; operaciones se filtran por dirección (enviadas/recibidas) y grupo (en curso/finalizadas/canceladas-rechazadas).
- Acciones pendientes dependen del rol y estado: contratista responde solicitud; productor responde contrapropuesta; contratista confirma si se mantiene el horario original; contratista inicia trabajo o actualiza etapas.
- Si hay reprogramación pendiente, la contraparte debe revisarla. Solo una reprogramación pendiente por reserva. La fecha no cambia hasta aceptación; aceptar actualiza intervalo y marcas temporales; rechazar conserva la fecha original.
- Seguimiento tiene flujos separados: transporte, cosecha, siembra, pulverización y genérico. Incluyen etapas con orden y textos/acciones de avance; `done` es final. El flujo de transporte es el principal configurado como `operationFlow`.
- Incidentes: demora, ruta cortada, problema mecánico, clima adverso u otro. Registrar minutos > 0, tipo, motivo y autor; reportar demora no modifica por sí mismo etapa/fecha.
- Compartir ubicación durante operación: permiso del navegador, control de intervalo mínimo (15 s), polling (25 s), desplazamiento mínimo (40 m) y umbral de precisión débil (120 m). Guardar/actualizar ubicaciones requiere contrato de datos confirmado.
- Reglas de mutación en la reescritura: transiciones y cambios de etapa/reprogramación deben invocar exclusivamente las funciones SQL `transition_reservation`, `set_operation_stage`, `propose_schedule`, `respond_schedule`, según la instrucción de producto. Sus firmas, argumentos, retornos y autorización no se pudieron verificar sin `schema.sql`; no implementar llamadas hasta recibirlo.

### 3.4 Reputación

- Reseña solo después de reserva finalizada (`done`); una reseña por reserva y rol de evaluador, no editable una vez enviada.
- Calificación general y categorías de 1 a 5, respuesta a “volvería a trabajar”, tags por rol y comentario máximo 300 caracteres.
- Categorías del productor sobre contratista: puntualidad, comunicación, estado del vehículo, cumplimiento del trabajo. Pesos: 0,25 / 0,25 / 0,10 / 0,40 según `reviewCategoryWeightsByReviewedRole`.
- Categorías del contratista sobre productor: claridad del pedido, puntualidad carga/descarga, coordinación y cumplimiento del pago; pesos 0,10 / 0,25 / 0,25 / 0,40.
- Puntaje global pondera promedio (24%), categorías (18%), volvería a contratar (16%), trabajos finalizados (12%), cantidad de reseñas (8%), tasa de aceptación (9%), tasa inversa de cancelación (8%) y rapidez de respuesta (5%). Se renormaliza sobre componentes disponibles y se redondea.
- Rapidez: <=120 min = 100; <=720 = 85; <=1440 = 70; <=2880 = 50; mayor = 30. Badges se calculan con umbrales de puntualidad, respuesta, aceptación, finalización, cancelación y recomendación.

### 3.5 Notificaciones

- Notificaciones in-app con prioridad normalizada `HIGH`, `MEDIUM`, `LOW`; no válida cae en `LOW`.
- Se crean por solicitud, aceptación/rechazo, cambios de estado, reprogramaciones, finalización y reseñas; centro permite leer/abrir y tiene contador, cola/toast agrupado y sonido para prioridad alta.
- Polling/refresh local de pendientes y escucha de evento `storage` entre pestañas no es un backend de notificaciones. La fase futura requiere consulta periódica a la base, como define el plan; no añadir Realtime.
- Notificaciones del navegador requieren permiso concedido y usan Service Worker; mantener diferencia entre notificación interna y notificación del sistema.

### 3.6 Auth, perfiles y validaciones

- UI de registro solicita nombre, apellido, email, rango de hectáreas, tipo y contraseña; contraseña mínima 8. Términos versión `1.0`; la instrucción de migración pide registrar versión en metadata del signUp.
- Login email/contraseña; confirmación de correo condiciona que haya sesión; logout. Errores de autenticación se traducen a mensajes en español.
- `auth.js` hace Supabase signUp/signIn/signOut y lectura/actualización de `profiles`; datos personales incluyen nombre, apellido, hectáreas y tipo. Referencias a columnas legacy (`nombre`, `apellido`, `ha`, `tipo`, `onboarding_completado`) no equivalen a contrato confirmado.
- Identidad productiva debe ser UUID de `auth.users`; no email ni nombre visible. IDs `dev-*`, perfiles/usuarios de prueba y seeds son solo fixtures de desarrollo y no migran a producción.
- Perfil operativo: nombre, zona, ubicación base y coordenadas, cobertura/hectáreas, radio (10–500 km en pasos de 5), biografía (hasta 220) y tema.
- Validaciones adicionales: título/categoría/equipo, unidad válida por categoría, cantidades positivas, fecha/horarios ordenados, calificaciones 1–5, un reporte/reprogramación según estado. Consultar el código completo de cada submit al implementar cada fase.

## 4. Módulos de reglas y pruebas existentes

| Archivo actual | Regla exportada | Prueba asociada |
|---|---|---|
| `js/modules/pricing.js` | Cálculo de estimación por unidad, cantidades inválidas, unidad fija y ajustes | `estimateServiceCost calculates totals and rejects incomplete quantities` |
| `js/modules/requests.js` | Campos de cantidad mínimos por unidad | `requestQuantityFieldsForPriceUnit exposes the minimum fields per pricing unit` |
| `js/modules/reservations.js` | Visibilidad de negociación activa para contratista | `reservation negotiation status keeps contractor work visible while action is needed` |
| `js/modules/pending.js` | Acción que corresponde por rol/estado, prioridad y orden temporal | Dos tests de acciones y reprogramación pendiente |
| `js/modules/reputation.js` | Medias categóricas y puntaje ponderado | `reputation score combines reviews, operations and response time` |
| `js/modules/location.js` | Haversine, formato es-AR y minutos estimados a 55 km/h, mínimo 10 min | `location helpers keep field estimates simple and predictable` |
| `js/modules/offers.js` | Indicador de solicitudes pendientes | incluido en test de utilidades |
| `js/modules/contracts.js` | Operación visible en accepted/working/done | No test directo en el archivo actual |
| `js/modules/notifications.js` | Prioridad, ID UUID aleatorio con fallback | No test directo en el archivo actual |
| `js/modules/ui.js` | Limpieza, escape HTML y formato monetario es-AR | `small domain utilities guard unsafe or noisy display values` |

`test/domain.test.js` es la especificación inicial y contiene 8 pruebas. La equivalencia debe sostener valores, límites, redondeos y mensajes relevantes; cualquier desviación se explicará antes de cambiar expectativas. El código embebido en `js/app.js` no queda cubierto exhaustivamente por estas pruebas.

## 5. Integraciones del navegador y servicios externos

| Integración | Uso actual | Implicación para `web/` |
|---|---|---|
| Leaflet 1.9.4 + OpenStreetMap tiles | El HTML carga CSS/JS de Leaflet globalmente; mapa para seleccionar ubicación, centro/radio, marcadores y seguimiento | No cargarlo en rutas que no usan mapas. Import dinámico solo en cliente, como indica el brief. Atribución/licencia y condiciones del proveedor deben respetarse. |
| Nominatim de OpenStreetMap | Geocodificación directa `/search` y reversa `/reverse` desde navegador | Confirmar política de uso, límites, identificador/referer y manejo para mala conectividad; proveedor no está configurado como servicio en el repo. No asumir SLA ni API key. |
| Geolocation API | Ubicación actual con permiso del usuario para centrar mapa/selección | Pedir permiso en contexto, contemplar denegación, error y entrada manual. |
| Service Worker `/sw.js` | `showNotification`, evento `push`, click abre/focaliza app y comunica ID | Migrar solo si se mantiene la funcionalidad; revisar alcance/ruta y caché existentes al cambiar app/hosting. |
| Notification API | Solicita permiso explícito, fallback in-app/toast/sonido | No asumir permisos concedidos; probar desktop y móvil. El plan indica polling, no Supabase Realtime. |
| Temas | Tokens CSS en `styles.css`: `normal`, `dark`, `field`; boot temprano con `js/services/themeBoot.js` y persistencia local | Portar tokens, bootstrap evitando flash y preferencia local; única excepción autorizada a no persistir datos de negocio en cliente. |
| Vercel Analytics / Speed Insights | Importados en `js/app.js` para producción | Decidir si se trasladan a Next y justificar dependencias nuevas en `web/DECISIONS.md` cuando exista. |
| Supabase Auth | Cliente conectado en `auth.js`, pero archivo no incluido desde `index.html` | Nueva app debe ser la primera integración operativa. Usar `@supabase/ssr`, cookies, middleware y sesiones server/browser según brief; nunca exponer service role. |

## 6. Mapa de datos: estado/localStorage → contrato de `supabase/schema.sql`

`STORAGE_KEYS` está en `js/modules/state.js`; las lecturas y escrituras están en `js/app.js`. La tabla refleja el contrato confirmado por `supabase/README.md`, `schema.sql` y los nuevos mappers. Un equivalente “cubierto” significa que existe columna o función; la UI Next todavía no está implementada.

| Dato / clave actual | Equivalente exacto | Observación de mapeo y autorización |
|---|---|---|
| `nexudrive_mvp_machines` (`state.machines`) | `machinery`: `id`, `owner_id`, `category`, `title`, `price`, `price_unit`, `location`, `latitude`, `longitude`, `availability`, `plate`, `owner_name`, `description`, `min_hectares`, `daily_capacity`, `rating`, `reviews_count`, `would_work_again_pct`, `has_operator`, `brand`, `model_year`, `badge`, `highlight`, `offer_status`, timestamps y `deleted_at` | `owner_name`, rating, conteo, `would_work_again_pct`, badge y highlight son server-side. Baja lógica con `deleted_at` e `inactive`; nunca DELETE. La CHECK incluye las 12 categorías de la app (resuelto en v2). |
| `nexudrive_mvp_availability_slots` (`state.availabilitySlots`) | `availability_windows`: `id`, `machinery_id`, `date_start`, `date_end`, `estimated_hours`, `status`, `created_at` | CHECK: fin >= inicio, horas > 0 si se informan; estado `available`, `partially_booked` o `unavailable`. Solo dueño inserta/actualiza; no hay DELETE. |
| `nexudrive_mvp_reservations` (`state.reservations`) | `reservations`: `id`, `machinery_id`, `requester_id`, `owner_id`, `status`, snapshots `machine_title`/`owner_name`/`requester_name`/`category`, `price_unit`, `unit_price`, fechas/horas/flexibilidad, `job_type`, `job_other`, `urgency`, `hectares`, `quantity`, `estimated_km`, `estimated_value`, `cargo_type`, ubicación de campo/origen/destino y sus coordenadas, `details`, `operation_stage`, `operation_updated_at`, `resolved_at`, timestamps | Inserción limitada por GRANT; servidor completa dueño, snapshots, estado inicial e historial. RLS limita lectura a las partes. `details` guarda extras tipados de cultivo, grano, notas, condiciones y cantidades auxiliares. No hay GRANT UPDATE de reservas. |
| Estado/etapas/historial dentro de reserva | `reservations.operation_stage`/`operation_updated_at`; `reservation_events(status,note,created_at)`; `reservation_operation_events(stage,label,created_at)` | Actualizaciones por `transition_reservation` y `set_operation_stage`; estas escriben historia y notificaciones. La RPC de etapa no valida el orden (ver brecha). |
| `nexudrive_mvp_reschedules` (`state.rescheduleRequests`) | `reservation_schedule_proposals`: `id`, `reservation_id`, `kind`, `proposed_by`, `date_start`, `date_end`, `start_time`, `end_time`, `reason`, `status`, timestamps | `kind=counter` es contrapropuesta; `reschedule` es reprogramación. `propose_schedule` y `respond_schedule` verifican actor/estado, fecha y que no exista otra propuesta pendiente; la aceptación aplica fechas a la reserva. |
| `nexudrive_mvp_delays` (`state.delayRecords`) | Parcial: `incidents(id,reservation_id,reason,reported_by,created_at)` | La app guarda `delayType`, `minutesDelayed` y `reason` en [js/app.js:4920](/Users/juaco/Developer/Agronex/js/app.js:4920); el formulario valida minutos positivos en [js/app.js:4915](/Users/juaco/Developer/Agronex/js/app.js:4915). El schema aún no tiene columnas para tipo estructurado ni minutos (brecha abierta). |
| `nexudrive_mvp_reviews` (`state.reviews`) | `reviews(id,reservation_id,reviewer_id,reviewee_id,reviewer_role,rating,category_ratings,would_work_again,tags,comment,created_at)`; `machinery.would_work_again_pct` | Trigger fija contraparte y rol, limita reseña a reserva `done`; UNIQUE `(reservation_id, reviewer_id)` limita a una por parte. Trigger recalcula rating, conteo y porcentaje de recomendación. Categorías y recomendación cubiertas en v2. SQL permite 500 caracteres; interfaz puede seguir limitando a 300. |
| Puntajes, estadísticas y badges de perfiles | Derivados de `reviews`, `reservations`, `reservation_events`, `reservation_operation_events` | No almacenar datos calculados desde cliente. Ratings categóricos y recomendación de volver a trabajar se guardan en `reviews`; porcentaje agregado lo calcula el servidor en `machinery.would_work_again_pct`. |
| `nexudrive_mvp_notifications` (`state.notifications`) | `notifications(id,user_id,type,title,body,priority,read,related_id,created_at)` | Triggers/RPCs crean notificaciones; el cliente solo lee las propias y actualiza `read`. No insertar ni editar contenido/prioridad desde la app. |
| `nexudrive_mvp_auth` (`state.auth`) y sesión | `auth.users.id` UUID; sesión vía cookies/Supabase SSR | No crear tabla de sesión. UUID es identidad; email/nombre no son claves de relación. |
| `nexudrive_mvp_profile` / `state.profile` | `profiles(id,name,email,role,zone,hectares,base_location,base_latitude,base_longitude,operation_radius_km,bio,onboarding_completed,terms_version,terms_accepted_at,created_at,updated_at,deleted_at)` | Trigger crea perfil desde metadata `name`, `role`, `terms_version`; el servidor establece email/fecha de aceptación. CHECK role `productor`/`contratista`/`ambos`; coordenadas en par válido. El registro legado pide nombre y apellido, schema conserva solo `name` (ver brecha). |
| Cambios de reserva | RPC `transition_reservation`, `set_operation_stage`, `propose_schedule`, `respond_schedule` | Execute concedido a `authenticated`; función interna `_apply_reservation_status` revocada. Funciones verifican sesión, parte y estado permitido. |
| `payment-demo-modal` | `payments(id,reservation_id,producer_id,contractor_id,amount,platform_fee,contractor_amount,currency,status,paid_at,released_at,payment_method,notes,created_at,updated_at)` | Pagos solo lectura de las partes. El modal actual es demo, sin estado persistido ni mutación de pago en cliente; no es paridad transaccional. |
| `state.theme` / `nexudrive_mvp_theme` | Sin tabla | Preferencia de UI local permitida. |
| `desktopFiltersCollapsed` / sessionStorage | Sin tabla | Estado visual temporal. |
| Búsqueda, filtros, tabs, orden, wizard, pantalla y modales | Sin tabla | Estado efímero de UI. |
| `nexudrive_mvp_dev_active_user`, `dev_recent_users`, `dev_profiles`, `dev_fixtures`, `seedMachines` | Sin equivalente productivo | Fixtures/demo, no migrar a usuarios reales. |
| Descarte temporal del centro de pendientes | Sin tabla | Preferencia de sesión UI. |
| `reservation.workTracking`, `lastLocationPoint`, `locationSharingActive`, `workTrackingSession` | `reservation_locations(reservation_id,latitude,longitude,accuracy_m,updated_at)`; RPC `report_location(p_reservation,p_latitude,p_longitude,p_accuracy)` | Una ubicación vigente por reserva. Cliente contratista reporta mediante RPC; lectura solo por las partes. Se elimina al salir de `working`. Cubierto en v2. |

### 6.1 Brechas del schema

**Resueltas en v2:** categorías de maquinaria (12 valores), reseñas (ratings categóricos y `would_work_again`, con porcentaje agregado calculado por servidor) y GPS en vivo (`reservation_locations` más RPC `report_location`).

| Prioridad / estado | Brecha confirmada | Propuesta mínima |
|---|---|---|
| Alta | `incidents` persiste `reason`, pero no el tipo estructurado (`delayType`) ni los minutos (`minutesDelayed`) que registra la app. Evidencia: [js/app.js:4920](/Users/juaco/Developer/Agronex/js/app.js:4920) guarda ambos; [js/app.js:4915](/Users/juaco/Developer/Agronex/js/app.js:4915) valida minutos positivos. | Añadir `incident_type` y `delay_minutes` con CHECK de minutos positivos e incluirlos en el GRANT de inserción; conservar `reason`. |
| Decisión: diferido | `set_operation_stage` valida rol, estado y valores permitidos, pero no la secuencia de etapas. El contratista avanza etapas de su propio trabajo; el riesgo es bajo para el MVP. | Diferir validación secuencial. Retomar si aparece abuso. |
| Decisión de producto pendiente | `payment-demo-modal` sigue siendo una demo sin persistencia; `payments` existe, pero el cliente solo tiene lectura. | Definir el flujo de pago y cuándo persistirlo antes de habilitar escrituras; no hace falta agregar tabla ahora. |
| Media | El registro legado separa nombre/apellido, pero `profiles` solo tiene `name`; el nuevo signUp manda `name`. | Definir si se combinan en `name`; si hay que conservarlos separados, agregar columnas y extender trigger/GRANT antes de implementar onboarding. |

No son brechas: tablas de perfiles, ofertas, ventanas de disponibilidad, reservas, eventos, propuestas, incidentes, reseñas, notificaciones, pagos y ubicación; estados, categorías, unidades de precio, coordenadas con checks de pares/rangos, baja lógica, RPC requeridas, políticas RLS y GRANT por columna ya existen. No añadir UPDATE directo a reservas ni escrituras cliente de valores que decide el servidor.

## 7. Checklist de paridad manual (dos cuentas)

Preparación: usar una cuenta Productor (P) y una Contratista (C) con UUIDs distintos; la misma persona también puede ejercer ambos roles. Preparar al menos dos ofertas, dos categorías y fechas futuras. Registrar resultados esperados, datos visibles y notificaciones. Repetir con viewport móvil y conexión lenta.

### Productor (P)

- [ ] Registro con nombre/apellido/email, hectáreas/tipo, contraseña de 8+ caracteres y aceptación de términos 1.0; ver email de confirmación y entrar luego de confirmar.
- [ ] Login/logout, sesión tras recarga, acceso no autenticado a ruta protegida y retorno con mensaje español.
- [ ] Completar perfil, zona/cobertura/radio/biografía; probar valores límite 10/500 km y persistencia del tema.
- [ ] Buscar por texto y categoría; aplicar/limpiar filtros de disponibilidad, servicio, reputación, ubicación/radio, rango de precio, marca y potencia; ordenar por precio/disponibilidad/reputación; observar estado vacío.
- [ ] Abrir detalle, revisar datos/ubicación/reputación/estado y reportar oferta; comprobar cierre de modal o navegación atrás.
- [ ] Iniciar solicitud para cada unidad aplicable: hectárea, tonelada, bolsa, viaje, kilómetro, tn-km, hora, día y fijo. Verificar campos mínimos, cantidad inválida, estimación redondeada, ajuste y precio fijo.
- [ ] Completar los cuatro pasos, fechas, ubicación, cantidades y revisión; cancelar antes del envío y comprobar datos/estado; enviar y comprobar que aparece en “Mis solicitudes”.
- [ ] Recibir cambios de estado/notificaciones; abrir detalle y comprobar cronología y datos de operación.
- [ ] Proponer reprogramación con fechas/horas válidas e inválidas; una pendiente bloquea otra; confirmar que la fecha no cambia antes de respuesta.
- [ ] Responder a contrapropuesta/horario original; aceptar actualiza fechas, rechazar mantiene original.
- [ ] Seguir transporte y demás tipos de trabajo; verificar orden de etapas y que no se pueda saltar/cerrar indebidamente.
- [ ] Recibir reportes de demora/incidentes y ver autor, minutos, motivo e historial; el reporte no cambia etapa/fecha.
- [ ] Finalizada una operación, puntuar una vez al contratista: ratings 1–5 obligatorios, categorías de productor, tags, recomendación y comentario hasta 300; duplicado/edición rechazada.

### Contratista (C)

- [ ] Registro/login, perfil y sesión igual que P; publicar una oferta de cada categoría relevante, con unidades permitidas, datos opcionales/obligatorios y disponibilidad.
- [ ] Confirmar vista previa, errores de validación y valores por unidad; editar, pausar, reactivar y dar de baja; oferta inactiva no aparece en catálogo público.
- [ ] Ver solicitudes recibidas y distinguirlas de las iniciadas; responder solicitud aceptando o rechazando según las acciones existentes.
- [ ] Proponer horario alternativo y esperar respuesta del productor; mantener fecha actual hasta aceptación; una segunda propuesta pendiente debe impedirse.
- [ ] Confirmar horario original cuando corresponda; revisar que solo aparezca la acción asignada al rol/estado.
- [ ] Iniciar trabajo, avanzar etapa por etapa según transporte/servicio y verificar restricciones de estado, notificaciones e historial.
- [ ] Reportar demora, ruta cortada, problema mecánico, clima y otro; minutos <=0 se rechazan y no cambia estado/fecha.
- [ ] Usar mapa y geocodificación: buscar lugar, seleccionar resultado, click en mapa, invertir coordenadas, ubicarse con permiso y probar permiso denegado/fallo de proveedor/entrada manual.
- [ ] Activar/desactivar seguimiento GPS, respetar intervalos/distancia/precisión mínima, observar offline y término de trabajo; no compartir ubicación sin acción/permisos previstos.
- [ ] Al finalizar, calificar al productor con categorías específicas de contratista y mismas reglas de unicidad/calificación/comentario.
- [ ] Abrir/leer notificaciones in-app y del navegador, negar permiso del navegador, probar toast/contador y click que vuelve al detalle pertinente.

### Pruebas de interacción P ↔ C y ambos roles

- [ ] Ejecutar flujo completo con P crea solicitud → C acepta → C inicia y actualiza → P observa → C finaliza → ambos reseñan.
- [ ] Rechazo/cancelación y cada estado terminal se reflejan en ambas cuentas sin permitir acciones incompatibles.
- [ ] Aceptar y rechazar reprogramación desde la contraparte; revisar historial/orden y notificaciones en las dos sesiones.
- [ ] Acceso directo por URL a oferta pública vs. operación/perfil privado; autorización siempre basada en UUID y reglas del servidor, no en email o controles de UI.
- [ ] Dos usuarios hacen cambios concurrentes en la misma oferta/reserva; prevalece el resultado del servidor y se comunica el conflicto sin sobreescribirlo localmente.
- [ ] Perfiles de roles mixtos: un usuario publica como contratista y solicita como productor; las etiquetas/acciones y reputaciones conservan el rol correcto.
- [ ] Recarga, dos pestañas, baja conectividad y error de base: estados loading/empty/error en español; ningún error queda oculto ni se confirma una mutación que el servidor rechazó.

## 8. Propuesta de estructura Next.js (`web/`)

App Router, Server Components por defecto y Client Components solo donde hay interacción de acuerdo con el brief. Esquema ilustrativo para aprobación, no creado todavía:

```text
web/
  app/
    (public)/page.tsx                 # landing estática / institucional
    (public)/oferta/[id]/page.tsx     # detalle público con metadata OG
    (public)/perfil/[id]/page.tsx     # perfil público si se autoriza
    (auth)/ingresar/page.tsx
    (auth)/registrarse/page.tsx
    auth/callback/route.ts
    (protected)/app/layout.tsx
    (protected)/app/page.tsx          # catálogo autenticado, si se conserva privado
    (protected)/app/operaciones/...
    (protected)/app/ofertas/...
    (protected)/app/perfil/page.tsx
    legal/terminos/page.tsx
    error.tsx / not-found.tsx
  src/
    components/                        # Button, Input, Card, Sheet, Toast, Skeleton, EmptyState
    domain/                            # reglas puras portadas desde js/modules
    lib/supabase/                      # browser, server, middleware/session helpers
    lib/db/                            # repositorios y mappers validados contra schema
    lib/validation/                    # validación/form schemas si se justifica
  public/                              # marca, iconos y assets mínimos
  middleware.ts
  README.md
  DECISIONS.md
  .env.example
  MIGRATION_INVENTORY.md
  scripts/seed-demo.mjs                 # futura fase; ejecución manual explícita
```

**Rutas propuestas:** catálogo autenticado `/app`; landing institucional `/`; oferta compartible `/oferta/[id]`; operaciones `/app/operaciones`; publicación `/app/ofertas/nueva`; gestión `/app/ofertas`; perfil `/app/perfil`; ingreso/registro `/ingresar` y `/registrarse`; callback `/auth/callback`; legal `/legal/terminos`. Confirmar cuál catálogo es público y si perfiles públicos deben tener URL antes de congelar el mapa.

## 9. Orden de migración y tamaño relativo

Estimaciones relativas de pieza (S/M/L), no duración calendario:

| Orden | Pieza | Tamaño | Dependencias y salida |
|---:|---|:---:|---|
| 0 | Obtener/leer `supabase/README.md` y `supabase/schema.sql`; aclarar ambiente de preview | S (bloqueante) | Confirmar tablas, columnas, GRANT/RLS y cuatro RPCs; sin esto, no se implementan datos ni transiciones |
| 1 | Fundación Next App Router, TypeScript strict, ESLint, Tailwind v4, Vitest, variables/fuentes/temas y componentes base | M | `web/` aislado; dependencias registradas en `web/DECISIONS.md` |
| 2 | Supabase `@supabase/ssr`, cookies, auth callback, middleware y helpers Server/Browser | M | UUID Auth y pruebas de rutas protegidas; sin service role en app |
| 3 | Portar funciones puras `src/domain/*` y los tests existentes sin cambiar expectativas | M | Precio, solicitudes, estados/pendientes, reputación, ubicación, UI |
| 4 | Tipos DB, mappers y repositorios de lectura/escritura permitidos por schema | L | Contrato de base confirmado; no portar helpers inseguros legacy |
| 5 | Shell móvil, auth, perfil y términos | M | Loading/error/empty, callbacks de confirmación y sesión persistente |
| 6 | Catálogo y detalle, búsqueda/filtros y metadata pública de oferta | L | Consultas Server Components; autorización de datos públicos definida |
| 7 | Publicación/edición/ventanas de disponibilidad | L | Columnas y restricciones de oferta confirmadas |
| 8 | Solicitudes económicas de cuatro pasos | L | Oferta, precios, disponibilidad, función/GRANT de inserción y servidor como fuente de verdad |
| 9 | Bandejas de operaciones, aceptación/rechazo/contrapropuesta/reprogramación | L | RPCs de transición y autorización confirmadas por SQL |
| 10 | Etapas, incidentes, historial, ubicación/mapas | L | Tablas y RPCs confirmados; Leaflet solo importado dinámicamente en cliente |
| 11 | Notificaciones por consulta periódica, reseñas y reputación | L | Tablas, RLS, unicidad y reglas de cálculo verificadas |
| 12 | Landing/SEO, sitemap, robots, canónicas, JSON-LD, rendimiento y accesibilidad | M | Contenido público con Server Components/generación estática; datos corporativos verificados |
| 13 | Pruebas de paridad, revisión de dos cuentas y preview Vercel independiente (Root Directory `web`) | L | Solo se considera deployable al aprobar build/lint/tests y flujo principal |

## 10. Decisiones/datos que requieren confirmación

1. **Bloqueante:** adjuntar o habilitar `supabase/README.md` y `supabase/schema.sql` administrados por el usuario, incluida la definición de RPCs y grants. No modificar el esquema desde esta migración.
2. Confirmar si el catálogo es público o requiere login; el brief futuro nombra el catálogo público y detalle `/oferta/[id]`, mientras la app actual muestra el catálogo en raíz sin una ruta de acceso separada.
3. Confirmar política de perfiles públicos (visibilidad, UUID/slug y qué campos publicar).
4. Aclarar si las reglas/estados legacy `schedule_counter`, `original_kept` y los cinco flujos de etapas ya coinciden con el contrato SQL que debe ser autoridad.
5. Confirmar el alcance de “pago confirmado”: el repositorio presenta un modal de demo, no se encontró integración real de pagos.
6. Para ubicación: confirmar proveedor de geocoding permitido y política de datos/retención de ubicaciones GPS.
7. Confirmar acceso a cuentas/entorno Supabase de preview cuando se llegue a las fases de implementación; no se requiere para este inventario.

## 11. Resultado de Fase 0

- Único entregable de esta fase: este inventario y plan.
- No se modificó la app actual ni `supabase/schema.sql`.
- No se implementaron rutas, dependencias, UI ni consultas.
- Validación del checkout actual: `npm test` pasó (8/8); `npm run build` terminó correctamente con una advertencia existente por un chunk de más de 500 kB; `npm run lint` no se pudo ejecutar porque no existe ese script. Estas comprobaciones son del proyecto Vite actual, no de una app Next (que todavía no se creó).
- **Detenerse aquí y esperar revisión antes de Fase 1.**
