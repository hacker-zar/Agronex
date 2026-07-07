# Agronex - Arquitectura Tecnica

## Resumen

Agronex es una plataforma modular para el agro. El prototipo actual implementa el primer modulo operativo: `NexuDrive`.

El prototipo esta construido como frontend con Vite, HTML, CSS y JavaScript modular. La app actual funciona principalmente en el navegador, con persistencia local mediante `localStorage` y una integracion parcial/preparatoria con Supabase.

El MVP actual esta orientado a validar el flujo de contratacion agropecuaria, especialmente camiones, sin convertir el producto en chat, red social o ERP.

## Modelo modular

Agronex debe entenderse como marca madre y ecosistema.

`NexuDrive` es el modulo actual y contiene:

- Catalogo de servicios/equipos.
- Disponibilidad.
- Solicitudes.
- Reservas.
- Negociacion de horario.
- Seguimiento operativo.
- Estado de pago y reputacion.

Otros modulos futuros, como Calculadora, Diario digital, Campanias, `NexuTech`, `NexuService` o `NexuPlace`, deben mantenerse separados a nivel conceptual y tecnico hasta que tengan alcance propio.

Regla tecnica y de producto: no mezclar logicas de modulos futuros dentro de `NexuDrive` si no son necesarias para validar el MVP actual.

## Stack

- Vite como servidor de desarrollo y build.
- JavaScript ES Modules.
- HTML y CSS sin framework frontend.
- `localStorage` como almacenamiento principal del prototipo.
- Supabase Auth y helpers de base de datos en integracion parcial.
- Service Worker para notificaciones del navegador.
- Font Awesome para iconografia en la interfaz.

## Comandos

- `npm run dev`: levanta Vite en modo desarrollo.
- `npm run build`: genera build de produccion en `dist`.
- `npm run preview`: previsualiza el build.

## Estructura principal

- `index.html`: markup principal de la aplicacion, modales y pantallas.
- `styles.css`: estilos globales y responsive.
- `js/app.js`: orquestador principal de estado, eventos, renderizado y flujos del modulo actual.
- `js/modules/`: reglas y helpers separados por dominio.
- `js/services/`: servicios transversales del navegador.
- `auth.js`: autenticacion real con Supabase Auth, onboarding y sesion persistente.
- `supabaseClient.js`: cliente Supabase y helpers por tabla expuestos en `window.AgronexDB`.
- `public/sw.js`: service worker para notificaciones.
- `legal/`: documentos legales del producto.
- `assets/`: imagenes y marca.

## Modulos

- `js/modules/state.js`: claves de almacenamiento y filtros por defecto.
- `js/modules/requests.js`: campos requeridos segun unidad de precio.
- `js/modules/contracts.js`: visibilidad del seguimiento operativo segun estado.
- `js/modules/location.js`: distancia, kilometros y estimaciones de viaje.
- `js/modules/offers.js`: reglas sobre ofertas y solicitudes pendientes.
- `js/modules/notifications.js`: IDs y prioridad de notificaciones.
- `js/modules/pricing.js`: estimacion de costos.
- `js/modules/reputation.js`: calculo de reputacion.
- `js/modules/reservations.js`: reglas de negociacion y reservas.
- `js/modules/ui.js`: limpieza, escape HTML y formato de dinero.

## Estado y persistencia

El estado central vive en `js/app.js` dentro del objeto `state`.

Persistencia actual:

- Maquinas/ofertas.
- Reservas.
- Reprogramaciones.
- Demoras.
- Reviews.
- Ventanas de disponibilidad.
- Notificaciones.
- Perfil y autenticacion de prototipo.
- Tema visual.

Las claves actuales de `localStorage` todavia usan el prefijo historico `nexudrive_mvp_*`. Esto debe tratarse como deuda tecnica/de marca antes de una version publica estable.

## Supabase

Hay dos piezas relacionadas con Supabase:

- `supabaseClient.js` expone `window.supabaseClient` y `window.AgronexDB` con helpers para `profiles`, `machinery`, `reservations` y `auth`.
- `auth.js` crea otro cliente Supabase para login, registro, logout, sesion persistente y onboarding.

Riesgo actual: existen dos inicializaciones de cliente Supabase y parte de la app sigue dependiendo de `localStorage`. Antes de producir datos reales, conviene definir una unica fuente de verdad y migrar gradualmente los flujos criticos.

## Modelo funcional actual

La app contempla:

- Catalogo de servicios/equipos.
- Publicacion de ofertas.
- Solicitudes y reservas.
- Negociacion/reprogramacion de horario.
- Estados operativos del trabajo.
- Demoras e incidentes.
- Notificaciones.
- Reputacion.
- Perfil.
- Selector de usuarios de desarrollo.

## Flujo operativo modelado

El seguimiento del trabajo usa estados como:

1. Solicitud aceptada.
2. En camino al origen.
3. Llego al origen.
4. Cargando.
5. Carga finalizada.
6. En viaje al destino.
7. Llego al destino.
8. Descargando.
9. Descarga finalizada.
10. Trabajo finalizado.

Este flujo esta alineado con el objetivo del MVP porque reemplaza coordinacion manual por estados claros.

## Convenciones de producto para implementar

Antes de agregar una funcion, validar contra `PRODUCT_VISION.md`.

Priorizar cambios que:

- Reduzcan llamadas o mensajes.
- Reduzcan incertidumbre sobre disponibilidad, horario, estado o pago.
- Aumenten confianza sin sumar pasos innecesarios.
- Mejoren la demo del flujo de camion.
- Fortalezcan a `NexuDrive` como modulo completo y vendible.

Evitar cambios que:

- Agreguen chat como flujo principal.
- Hagan crecer perfiles, social features o administracion tipo ERP.
- Introduzcan pasos que no ayuden a contratar mas rapido.
- Incorporen modulos futuros sin una separacion clara.

## Deuda tecnica relevante

- Unificar marca interna: todavia aparecen referencias a `NexuDrive` en storage, comentarios y algunos textos tecnicos.
- Decidir convencion de nombres: Agronex como plataforma y `NexuDrive` como modulo puede justificar algunos nombres internos, pero los textos visibles deben ser coherentes.
- Unificar cliente Supabase y decidir que datos quedan en Supabase versus `localStorage`.
- Revisar encoding de textos con caracteres rotos en algunos archivos.
- Separar gradualmente `js/app.js`, que hoy concentra demasiada logica de dominio, render y eventos.
- Preparar datos demo realistas centrados en camiones para la venta ante la cooperativa.
- Verificar que el build y la demo funcionen en mobile antes de presentar.

## Regla para la semana de venta

Hasta la demo comercial, favorecer estabilidad y claridad por encima de features nuevas. Cada cambio debe ayudar a que una persona entienda rapido:

- Que Agronex es una plataforma modular.
- Que `NexuDrive` es el primer modulo concreto.
- Que camion o servicio necesita.
- Quien esta disponible.
- Que solicitud esta pendiente.
- Que estado tiene el trabajo.
- Que falta para cerrar o pagar.
