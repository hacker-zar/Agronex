// ============================================================================
// Traducción entre el modelo de la app (camelCase, prototipo) y la base de datos
// (snake_case, Supabase). Son funciones PURAS: sin red, sin DOM, fáciles de testear.
//
// Regla de oro: lo que se manda a la base se filtra por una lista blanca de columnas
// (las mismas que habilitan los GRANT por columna de supabase/migrations). Así el
// cliente nunca intenta escribir campos que decide el servidor (status, owner_id,
// snapshots, rating...), que fallarían con "permission denied".
// ============================================================================

// ---- Listas blancas: deben coincidir con los GRANT de las migraciones ----
export const MACHINERY_INSERT_COLUMNS = [
  "owner_id", "category", "title", "price", "price_unit", "location", "availability", "plate",
  "description", "has_operator", "brand", "model_year", "latitude", "longitude",
  "min_hectares", "daily_capacity",
];
export const MACHINERY_UPDATE_COLUMNS = [
  "category", "title", "price", "price_unit", "location", "availability", "plate", "description",
  "has_operator", "brand", "model_year", "offer_status", "deleted_at", "latitude", "longitude",
  "min_hectares", "daily_capacity",
];
export const MACHINERY_CATEGORIES = [
  "Camion", "Tractor", "Sembradora", "Pulverizadora", "Cosechadora", "Embolsadora",
  "Dron", "Otros", "Fertilizadora", "Extractora", "Acoplado", "Tolva",
];
export const PRICE_UNITS = [
  "hectarea", "tonelada", "bolsa", "viaje", "kilometro", "tonelada_kilometro", "hora", "dia", "fijo",
];
export const RESERVATION_STATUSES = [
  "pending", "schedule_counter", "original_kept", "accepted", "working", "done", "rejected", "cancelled",
];
export const OPERATION_STAGES = [
  "accepted", "on_way_origin", "arrived_origin", "loading", "loaded", "in_transit_destination",
  "arrived_destination", "unloading", "unloaded", "done", "on_way_field", "arrived_field",
  "working_field", "setup", "planting", "spraying", "mixing", "harvesting", "wrapping_up",
];
export const RESERVATION_INSERT_COLUMNS = [
  "machinery_id", "requester_id", "date_start", "date_end", "date_flexible", "hectares", "job_type",
  "job_other", "field_location", "urgency", "start_time", "end_time", "origin", "destination",
  "cargo_type", "quantity", "estimated_km", "estimated_value", "field_latitude", "field_longitude",
  "origin_latitude", "origin_longitude", "destination_latitude", "destination_longitude", "details",
];
export const AVAILABILITY_INSERT_COLUMNS = ["machinery_id", "date_start", "date_end", "estimated_hours"];
export const AVAILABILITY_UPDATE_COLUMNS = ["date_start", "date_end", "estimated_hours", "status"];
export const PROFILE_UPDATE_COLUMNS = [
  "name", "zone", "hectares", "base_location", "base_latitude", "base_longitude", "operation_radius_km",
  "bio", "role", "onboarding_completed", "terms_version", "terms_accepted_at",
];
export const REVIEW_INSERT_COLUMNS = [
  "reservation_id", "rating", "category_ratings", "would_work_again", "tags", "comment",
];

// ---- Utilidades ----
const isBlank = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const finite = (v) => (isBlank(v) ? null : Number.isFinite(Number(v)) ? Number(v) : null);
const positive = (v) => { const n = finite(v); return n !== null && n > 0 ? n : null; };
const nonNegative = (v) => { const n = finite(v); return n !== null && n >= 0 ? n : null; };
const text = (v) => (isBlank(v) ? null : String(v).trim());
const str = (v) => (isBlank(v) ? "" : String(v).trim());

// "undefined = no tocar, null/'' = vaciar". opt() devuelve undefined si la app no trae ninguna de
// las claves, así una edición parcial no pisa con null lo que no se mandó.
const has = (obj, keys) => keys.find((k) => Object.prototype.hasOwnProperty.call(obj, k));
const opt = (obj, keys, fn) => { const k = has(obj, keys); return k === undefined ? undefined : fn(obj[k]); };

// Deja solo las columnas permitidas. Por defecto descarta null/undefined/NaN (para que apliquen
// los defaults de la base); con keepNull conserva los null explícitos (sirve para EDITAR y vaciar).
export function pickColumns(record, allowed, { keepNull = false } = {}) {
  const out = {};
  for (const key of allowed) {
    const value = record[key];
    if (value === undefined) continue;
    if (value === null || (typeof value === "number" && !Number.isFinite(value))) {
      if (keepNull) out[key] = null;
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function hhmm(value) {
  if (isBlank(value)) return "";
  return String(value).slice(0, 5);
}

function validPoint(point) {
  const lat = finite(point?.latitude);
  const lng = finite(point?.longitude);
  if (lat === null || lng === null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { latitude: lat, longitude: lng };
}

// Punto con dirección, como lo espera la app. Con requirePoint (origen/destino) solo se devuelve si hay
// coordenadas válidas: un objeto sin coordenadas taparía al otro punto en el "cómo llegar".
function pointToObject(address, lat, lng, { requirePoint = false } = {}) {
  const point = validPoint({ latitude: lat, longitude: lng });
  if (requirePoint && !point) return undefined;
  if (!point && isBlank(address)) return undefined;
  return { address: address || "", ...(point || {}) };
}

// ---- Cantidad que se cobra, según la unidad de precio (misma regla que app.js) ----
export function quantityForUnit(app, priceUnit) {
  const n = (v) => Number(v);
  switch (priceUnit) {
    case "hectarea": return n(app.hectares);
    case "tonelada": return n(app.estimatedTons);
    case "bolsa": return n(app.estimatedBags);
    case "viaje": return n(app.estimatedTrips);
    case "kilometro": return n(app.estimatedKm);
    case "hora": return n(app.estimatedServiceHours);
    case "dia": return n(app.estimatedDays);
    case "tonelada_kilometro": return n(app.estimatedTons) * n(app.estimatedKm);
    case "fijo": return 1;
    default: return NaN;
  }
}

// Campos propios de cada tipo de trabajo: viajan en la columna jsonb `details`.
const DETAIL_TEXT_KEYS = ["crop", "grainType", "accessConditions", "notes"];
const DETAIL_NUMBER_KEYS = ["estimatedTons", "estimatedBags", "estimatedTrips", "estimatedServiceHours", "estimatedDays"];

export function detailsFromApp(app) {
  const details = {};
  for (const key of DETAIL_TEXT_KEYS) {
    const value = text(app[key]);
    if (value !== null) details[key] = value;
  }
  for (const key of DETAIL_NUMBER_KEYS) {
    const value = positive(app[key]);
    if (value !== null) details[key] = value;
  }
  return details;
}

// ============================ RESERVAS ============================

export function reservationToInsert(app, { requesterId } = {}) {
  const priceUnit = app.priceUnit || app.unidad_precio;
  const field = validPoint(app.location);
  const origin = validPoint(app.originLocation);
  const destination = validPoint(app.destinationLocation);
  const quantity = positive(app.estimateQuantity) ?? positive(quantityForUnit(app, priceUnit));
  const details = detailsFromApp(app);

  return pickColumns({
    machinery_id: app.machineId,
    requester_id: requesterId,
    date_start: text(app.date),
    date_end: text(app.dateEnd),
    date_flexible: typeof app.dateFlexible === "boolean" ? app.dateFlexible : undefined,
    hectares: positive(app.hectares),
    job_type: text(app.jobType) || text(app.job) || text(app.serviceType),
    job_other: text(app.jobOther),
    field_location: text(app.field) || text(app.location?.address) || "",
    urgency: text(app.urgency),
    start_time: text(app.startTime),
    end_time: text(app.endTime),
    origin: text(app.origin),
    destination: text(app.destination),
    cargo_type: text(app.cargoType),
    quantity,
    estimated_km: positive(app.estimatedKm),
    estimated_value: nonNegative(app.estimatedCost),
    field_latitude: field?.latitude,
    field_longitude: field?.longitude,
    origin_latitude: origin?.latitude,
    origin_longitude: origin?.longitude,
    destination_latitude: destination?.latitude,
    destination_longitude: destination?.longitude,
    details: Object.keys(details).length ? details : undefined,
  }, RESERVATION_INSERT_COLUMNS);
}

export function reservationFromRow(row) {
  if (!row) return null;
  const app = {
    ...(row.details || {}), // primero los extras; las columnas reales pisan si coinciden
    id: row.id,
    machineId: row.machinery_id,
    machineTitle: row.machine_title,
    owner: row.owner_name,
    ownerId: row.owner_id,
    category: row.category,
    status: row.status,
    date: row.date_start,
    dateEnd: row.date_end || undefined,
    dateFlexible: row.date_flexible,
    startTime: hhmm(row.start_time),
    endTime: hhmm(row.end_time),
    jobType: row.job_type,
    job: row.job_type,
    jobOther: row.job_other || undefined,
    requestedBy: row.requester_id,
    requestedByName: row.requester_name || undefined,
    priceUnit: row.price_unit || undefined,
    unidad_precio: row.price_unit || undefined,
    unitPrice: finite(row.unit_price) ?? undefined,
    hectares: finite(row.hectares) ?? undefined,
    estimatedKm: finite(row.estimated_km) ?? undefined,
    estimatedCost: finite(row.estimated_value) ?? undefined,
    cargoType: row.cargo_type || undefined,
    origin: row.origin || undefined,
    destination: row.destination || undefined,
    field: row.field_location,
    location: pointToObject(row.field_location, row.field_latitude, row.field_longitude),
    originLocation: pointToObject(row.origin, row.origin_latitude, row.origin_longitude, { requirePoint: true }),
    destinationLocation: pointToObject(row.destination, row.destination_latitude, row.destination_longitude, { requirePoint: true }),
    urgency: row.urgency || undefined,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at || undefined,
    operationStage: row.operation_stage || undefined,
    operationUpdatedAt: row.operation_updated_at || undefined,
  };
  return Object.fromEntries(Object.entries(app).filter(([, v]) => v !== undefined));
}

export function reviewToInsert(app, { reservationId } = {}) {
  return pickColumns({
    reservation_id: reservationId,
    rating: finite(app.overallRating),
    category_ratings: app.categories,
    would_work_again: typeof app.wouldWorkAgain === "boolean" ? app.wouldWorkAgain : undefined,
    tags: Array.isArray(app.tags) ? app.tags : undefined,
    comment: opt(app, ["comment"], text),
  }, REVIEW_INSERT_COLUMNS);
}

export function locationFromRow(row) {
  if (!row) return null;
  const location = {
    latitude: finite(row.latitude),
    longitude: finite(row.longitude),
    accuracy: finite(row.accuracy_m) ?? undefined,
    createdAt: row.updated_at,
  };
  return Object.fromEntries(Object.entries(location).filter(([, value]) => value !== undefined));
}

// ============================ OFERTAS ============================

function machineryRecord(app) {
  const point = validPoint(app);
  return {
    category: opt(app, ["category"], text),
    title: opt(app, ["title"], text),
    price: opt(app, ["price", "precio"], finite),
    price_unit: opt(app, ["priceUnit", "unidad_precio"], text),
    location: opt(app, ["location"], (v) => (typeof v === "object" && v ? text(v.address) : text(v))),
    availability: opt(app, ["availability"], text),
    plate: opt(app, ["plate"], text),
    description: opt(app, ["description"], text),
    has_operator: opt(app, ["hasOperator"], (v) => (typeof v === "boolean" ? v : undefined)),
    brand: opt(app, ["brand"], text),
    model_year: opt(app, ["year", "modelYear"], finite),
    latitude: point ? point.latitude : undefined,
    longitude: point ? point.longitude : undefined,
    min_hectares: opt(app, ["minHectares"], nonNegative),
    daily_capacity: opt(app, ["dailyCapacity"], positive),
  };
}

export function machineryToInsert(app, { ownerId } = {}) {
  return pickColumns({ ...machineryRecord(app), owner_id: ownerId }, MACHINERY_INSERT_COLUMNS);
}

// En edición se conservan los null: así el dueño puede vaciar patente, capacidad o ubicación.
export function machineryToUpdate(app) {
  const record = { ...machineryRecord(app), offer_status: opt(app, ["offerStatus"], text) };
  return pickColumns(record, MACHINERY_UPDATE_COLUMNS, { keepNull: true });
}

export function machineryFromRow(row) {
  if (!row) return null;
  const app = {
    id: row.id,
    title: row.title,
    category: row.category,
    price: finite(row.price),
    precio: finite(row.price),
    priceUnit: row.price_unit,
    unidad_precio: row.price_unit,
    minHectares: finite(row.min_hectares) ?? undefined,
    dailyCapacity: finite(row.daily_capacity) ?? undefined,
    location: row.location,
    latitude: finite(row.latitude) ?? undefined,
    longitude: finite(row.longitude) ?? undefined,
    availability: row.availability,
    plate: row.plate || undefined,
    owner: row.owner_name,
    ownerId: row.owner_id,
    description: row.description,
    rating: finite(row.rating),
    reviews: row.reviews_count ?? 0,
    wouldWorkAgainPct: finite(row.would_work_again_pct) ?? undefined,
    offerStatus: row.offer_status,
    hasOperator: row.has_operator,
    brand: row.brand || undefined,
    year: row.model_year ?? undefined,
    badge: row.badge || undefined,
    highlight: row.highlight || undefined,
    createdAt: row.created_at,
  };
  return Object.fromEntries(Object.entries(app).filter(([, v]) => v !== undefined));
}

// ====================== VENTANAS DE DISPONIBILIDAD ======================

export function availabilityToInsert(app, { machineryId } = {}) {
  return pickColumns({
    machinery_id: machineryId || app.machineId,
    date_start: text(app.startDate),
    date_end: text(app.endDate),
    estimated_hours: positive(app.estimatedHours),
  }, AVAILABILITY_INSERT_COLUMNS);
}

export function availabilityToUpdate(app) {
  return pickColumns({
    date_start: opt(app, ["startDate"], text),
    date_end: opt(app, ["endDate"], text),
    estimated_hours: opt(app, ["estimatedHours"], positive),
    status: opt(app, ["status"], text),
  }, AVAILABILITY_UPDATE_COLUMNS, { keepNull: true });
}

export function availabilityFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    machineId: row.machinery_id,
    startDate: row.date_start,
    endDate: row.date_end,
    estimatedHours: finite(row.estimated_hours) ?? undefined,
    status: row.status,
  };
}

// ============================== PERFIL ==============================

export function profileToUpdate(patch) {
  const base = validPoint({ latitude: patch.baseLatitude, longitude: patch.baseLongitude });
  const hasBase = has(patch, ["baseLatitude", "baseLongitude"]) !== undefined;
  return pickColumns({
    name: opt(patch, ["name"], str),
    zone: opt(patch, ["zone"], str),
    hectares: opt(patch, ["hectares"], finite),
    base_location: opt(patch, ["baseLocation"], str),
    // las coordenadas viajan siempre de a par; si no son válidas se vacían las dos
    base_latitude: hasBase ? (base ? base.latitude : null) : undefined,
    base_longitude: hasBase ? (base ? base.longitude : null) : undefined,
    operation_radius_km: opt(patch, ["operationRadiusKm"], positive),
    bio: opt(patch, ["bio"], str),
    role: opt(patch, ["role"], text),
    onboarding_completed: opt(patch, ["onboardingCompleted"], (v) => (typeof v === "boolean" ? v : undefined)),
    terms_version: opt(patch, ["termsVersion"], text),
    terms_accepted_at: opt(patch, ["termsAcceptedAt"], text),
  }, PROFILE_UPDATE_COLUMNS, { keepNull: true });
}

// Perfil tal como lo usa la app (hectares es string en el formulario).
export function profileFromRow(row) {
  if (!row) return null;
  const app = {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    zone: row.zone,
    hectares: row.hectares === null || row.hectares === undefined ? "" : String(row.hectares),
    baseLocation: row.base_location,
    baseLatitude: finite(row.base_latitude) ?? undefined,
    baseLongitude: finite(row.base_longitude) ?? undefined,
    operationRadiusKm: finite(row.operation_radius_km) ?? undefined,
    bio: row.bio,
    onboardingCompleted: Boolean(row.onboarding_completed),
    termsVersion: row.terms_version || undefined,
    termsAcceptedAt: row.terms_accepted_at || undefined,
  };
  return Object.fromEntries(Object.entries(app).filter(([, v]) => v !== undefined));
}
