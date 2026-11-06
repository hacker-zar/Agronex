import test from "node:test";
import assert from "node:assert/strict";
import {
  MACHINERY_CATEGORIES, MACHINERY_INSERT_COLUMNS, MACHINERY_UPDATE_COLUMNS, RESERVATION_INSERT_COLUMNS,
  REVIEW_INSERT_COLUMNS, availabilityToUpdate, locationFromRow, machineryFromRow, machineryToInsert,
  machineryToUpdate, profileFromRow, profileToUpdate, quantityForUnit, reservationFromRow,
  reservationToInsert, reviewToInsert,
} from "../js/modules/dbMappers.js";

// Campos que decide el servidor: el cliente jamás debe mandarlos.
const SERVER_ONLY = ["status", "owner_id", "machine_title", "owner_name", "category", "price_unit", "unit_price",
  "requester_name", "resolved_at", "operation_stage", "operation_updated_at", "id", "created_at"];

const truck = {
  id: "r-1", machineId: "m-1", machineTitle: "Scania R450", owner: "Contratista", ownerId: "x@y", category: "Camion",
  status: "pending", date: "2026-12-01", startTime: "08:00", endTime: "", jobType: "Distribucion", job: "Distribucion",
  notes: "Llamar antes de llegar", accessConditions: "Barrera en el ingreso", requestMode: "truck", unitPrice: 3500,
  priceUnit: "kilometro", origin: "Lote La Esperanza", destination: "Cooperativa Bouquet",
  originLocation: { address: "Lote", latitude: -33.88, longitude: -60.57 },
  destinationLocation: { address: "Coop", latitude: -32.94, longitude: -60.65 },
  location: { address: "Coop", latitude: -32.94, longitude: -60.65 }, field: "Coop", cargoType: "Maiz",
  estimatedTons: 30, estimatedKm: 84, estimateQuantity: 84, estimatedCost: 294000,
};

test("quantityForUnit replica la regla de cobro de app.js", () => {
  assert.equal(quantityForUnit({ hectares: 120 }, "hectarea"), 120);
  assert.equal(quantityForUnit({ estimatedKm: 84 }, "kilometro"), 84);
  assert.equal(quantityForUnit({ estimatedTons: 20, estimatedKm: 50 }, "tonelada_kilometro"), 1000);
  assert.equal(quantityForUnit({}, "fijo"), 1);
  assert.ok(Number.isNaN(quantityForUnit({}, "inexistente")));
});

test("reserva de camión: sin hectáreas, con km, coordenadas y detalles", () => {
  const row = reservationToInsert(truck, { requesterId: "u-1" });
  assert.equal(row.requester_id, "u-1");
  assert.equal(row.machinery_id, "m-1");
  assert.equal(row.quantity, 84);
  assert.equal(row.estimated_km, 84);
  assert.equal(row.estimated_value, 294000);
  assert.equal(row.hectares, undefined);
  assert.equal(row.job_type, "Distribucion");
  assert.equal(row.cargo_type, "Maiz");
  assert.equal(row.destination_latitude, -32.94);
  assert.equal(row.origin_longitude, -60.57);
  assert.equal(row.field_location, "Coop");
  assert.equal(row.end_time, undefined);
  assert.deepEqual(row.details, { accessConditions: "Barrera en el ingreso", notes: "Llamar antes de llegar", estimatedTons: 30 });
});

test("reserva: solo viajan columnas permitidas y nunca campos del servidor", () => {
  const row = reservationToInsert(truck, { requesterId: "u-1" });
  for (const key of Object.keys(row)) assert.ok(RESERVATION_INSERT_COLUMNS.includes(key), `columna no permitida: ${key}`);
  for (const key of SERVER_ONLY) assert.equal(key in row, false, `no debe mandar ${key}`);
});

test("reserva de cosecha por hectárea: guarda hectáreas, cantidad y extras", () => {
  const row = reservationToInsert({
    machineId: "m-2", date: "2026-11-20", priceUnit: "hectarea", hectares: 120, crop: "Soja", estimatedTons: 300,
    dateEnd: "", dateFlexible: true, job: "Cosecha", field: "Partido de Pergamino",
    location: { address: "Partido de Pergamino", latitude: -33.8895, longitude: -60.5736 }, urgency: "media",
  }, { requesterId: "u-2" });
  assert.equal(row.hectares, 120);
  assert.equal(row.quantity, 120);
  assert.equal(row.date_end, undefined);
  assert.equal(row.date_flexible, true);
  assert.equal(row.field_latitude, -33.8895);
  assert.deepEqual(row.details, { crop: "Soja", estimatedTons: 300 });
});

test("reserva: coordenadas inválidas o incompletas se descartan (el CHECK exige pares)", () => {
  const row = reservationToInsert({ ...truck, location: { address: "x", latitude: 95, longitude: -60 }, originLocation: { latitude: -33 } }, { requesterId: "u" });
  assert.equal("field_latitude" in row, false);
  assert.equal("field_longitude" in row, false);
  assert.equal("origin_latitude" in row, false);
});

test("reserva por tonelada-kilómetro calcula la cantidad si la app no la trae", () => {
  const row = reservationToInsert({ machineId: "m", date: "2026-12-02", priceUnit: "tonelada_kilometro", estimatedTons: 20, estimatedKm: 50, job: "T", field: "x" }, { requesterId: "u" });
  assert.equal(row.quantity, 1000);
});

test("reservationFromRow reconstruye el modelo de la app", () => {
  const app = reservationFromRow({
    id: "r-1", machinery_id: "m-1", machine_title: "Scania", owner_name: "Contratista", owner_id: "o-1", category: "Camion",
    status: "accepted", date_start: "2026-12-01", date_end: null, date_flexible: false, start_time: "08:00:00", end_time: null,
    job_type: "Distribucion", requester_id: "u-1", requester_name: "Productor", price_unit: "kilometro", unit_price: 3500,
    hectares: null, estimated_km: 84, estimated_value: 294000, cargo_type: "Maiz", origin: "Lote", destination: "Coop",
    field_location: "Coop", field_latitude: -32.94, field_longitude: -60.65, origin_latitude: null, origin_longitude: null,
    destination_latitude: -32.94, destination_longitude: -60.65, details: { estimatedTons: 30, notes: "Llamar" },
    created_at: "2026-11-01T10:00:00Z", resolved_at: null, operation_stage: null,
  });
  assert.equal(app.startTime, "08:00");
  assert.equal(app.endTime, "");
  assert.equal(app.estimatedTons, 30);
  assert.equal(app.notes, "Llamar");
  assert.deepEqual(app.location, { address: "Coop", latitude: -32.94, longitude: -60.65 });
  assert.equal(app.originLocation, undefined);
  assert.equal(app.hectares, undefined);
  assert.equal(app.requestedBy, "u-1");
  assert.equal("dateEnd" in app, false);
});

const machine = {
  id: "m-1", title: "Scania R450", category: "Camion", price: "3500", precio: "3500", priceUnit: "kilometro",
  location: "Pergamino", availability: "Lun a Vie", plate: "", minHectares: "", dailyCapacity: 50,
  latitude: -33.8, longitude: -60.5, rating: 5, reviews: 10, offerStatus: "paused", owner: "Yo", ownerId: "o-1",
};

test("oferta: el insert no manda rating, reviews, estado ni nombre del dueño", () => {
  const row = machineryToInsert(machine, { ownerId: "o-1" });
  for (const key of Object.keys(row)) assert.ok(MACHINERY_INSERT_COLUMNS.includes(key), `columna no permitida: ${key}`);
  for (const key of ["rating", "reviews_count", "badge", "highlight", "owner_name", "offer_status", "deleted_at"]) {
    assert.equal(key in row, false, `no debe mandar ${key}`);
  }
  assert.equal(row.owner_id, "o-1");
  assert.equal(row.price, 3500);
  assert.equal(row.price_unit, "kilometro");
  assert.equal(row.daily_capacity, 50);
  assert.equal("plate" in row, false);
});

test("oferta: la edición permite vaciar campos pero no pisa lo que no se mandó", () => {
  const full = machineryToUpdate(machine);
  for (const key of Object.keys(full)) assert.ok(MACHINERY_UPDATE_COLUMNS.includes(key), `columna no permitida: ${key}`);
  assert.equal(full.plate, null);
  assert.equal(full.min_hectares, null);
  assert.equal(full.offer_status, "paused");
  assert.equal("owner_id" in full, false);

  const partial = machineryToUpdate({ title: "Nuevo nombre" });
  assert.deepEqual(partial, { title: "Nuevo nombre" });
});

test("machineryFromRow devuelve el modelo de la app", () => {
  const app = machineryFromRow({
    id: "m-1", owner_id: "o-1", owner_name: "Contratista", category: "Camion", title: "Scania", price: 3500, price_unit: "kilometro",
    location: "Pergamino", availability: "Lun", plate: null, rating: null, reviews_count: 0, offer_status: "active",
    has_operator: true, brand: null, model_year: 2020, latitude: -33.8, longitude: -60.5, min_hectares: null, daily_capacity: 50,
  });
  assert.equal(app.owner, "Contratista");
  assert.equal(app.reviews, 0);
  assert.equal(app.offerStatus, "active");
  assert.equal(app.year, 2020);
  assert.equal(app.rating, null);
  assert.equal("plate" in app, false);
  assert.equal(app.dailyCapacity, 50);
});

test("disponibilidad y perfil: edición parcial sin pisar campos obligatorios", () => {
  assert.deepEqual(availabilityToUpdate({ status: "partially_booked" }), { status: "partially_booked" });
  assert.deepEqual(profileToUpdate({ onboardingCompleted: true, zone: " Pergamino " }), { onboarding_completed: true, zone: "Pergamino" });
  assert.deepEqual(profileToUpdate({ bio: "" }), { bio: "" });
  assert.deepEqual(profileToUpdate({ email: "hack@x.com", role: "contratista" }), { role: "contratista" });
});

test("perfil: base, radio y términos viajan con las columnas correctas", () => {
  const row = profileToUpdate({
    name: "Juan", baseLocation: "Rosario, Santa Fe", baseLatitude: -32.94, baseLongitude: -60.63,
    operationRadiusKm: 90, termsVersion: "1.0", termsAcceptedAt: "2026-11-04T10:00:00Z",
  });
  assert.deepEqual(row, {
    name: "Juan", base_location: "Rosario, Santa Fe", base_latitude: -32.94, base_longitude: -60.63,
    operation_radius_km: 90, terms_version: "1.0", terms_accepted_at: "2026-11-04T10:00:00Z",
  });
});

test("perfil: coordenadas incompletas o inválidas se vacían las dos (el CHECK exige pares)", () => {
  assert.deepEqual(profileToUpdate({ baseLatitude: -32.94 }), { base_latitude: null, base_longitude: null });
  assert.deepEqual(profileToUpdate({ baseLatitude: 95, baseLongitude: -60 }), { base_latitude: null, base_longitude: null });
  assert.deepEqual(profileToUpdate({ name: "Solo nombre" }), { name: "Solo nombre" });
});

test("profileFromRow devuelve el perfil como lo usa la app", () => {
  const app = profileFromRow({
    id: "u-1", email: "a@b.com", name: "Juan", role: "ambos", zone: "Rosario", hectares: 180, base_location: "Rosario",
    base_latitude: -32.94, base_longitude: -60.63, operation_radius_km: 90, bio: "", onboarding_completed: false,
    terms_version: null, terms_accepted_at: null,
  });
  assert.equal(app.hectares, "180");
  assert.equal(app.baseLatitude, -32.94);
  assert.equal(app.operationRadiusKm, 90);
  assert.equal(app.onboardingCompleted, false);
  assert.equal("termsVersion" in app, false);
  assert.equal(profileFromRow({ id: "x", hectares: null }).hectares, "");
});

test("reviewToInsert solo manda las seis columnas permitidas por el GRANT", () => {
  const payload = reviewToInsert({
    reservationId: "falso", reviewerId: "falso", overallRating: 5,
    categories: { punctuality: 4, communication: 5 }, wouldWorkAgain: true,
    tags: ["Puntual"], comment: "Buen trabajo", status: "done", createdAt: "falso",
  }, { reservationId: "r-1" });
  assert.deepEqual(Object.keys(payload).sort(), [...REVIEW_INSERT_COLUMNS].sort());
  assert.deepEqual(payload, {
    reservation_id: "r-1", rating: 5, category_ratings: { punctuality: 4, communication: 5 },
    would_work_again: true, tags: ["Puntual"], comment: "Buen trabajo",
  });
});

test("locationFromRow convierte la última ubicación al formato de la app", () => {
  assert.deepEqual(locationFromRow({
    latitude: -33.8, longitude: -60.5, accuracy_m: "12.4", updated_at: "2026-11-06T12:00:00Z",
  }), { latitude: -33.8, longitude: -60.5, accuracy: 12.4, createdAt: "2026-11-06T12:00:00Z" });
  assert.equal(locationFromRow(null), null);
});

test("machineryFromRow incluye el porcentaje de volver a trabajar", () => {
  assert.equal(machineryFromRow({ id: "m-1", would_work_again_pct: 88 }).wouldWorkAgainPct, 88);
});

test("MACHINERY_CATEGORIES contiene las doce categorías del contrato v2", () => {
  assert.equal(MACHINERY_CATEGORIES.length, 12);
  assert.ok(MACHINERY_CATEGORIES.includes("Tolva"));
  assert.ok(MACHINERY_CATEGORIES.includes("Fertilizadora"));
});
