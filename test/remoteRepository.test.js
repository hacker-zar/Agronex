import test from "node:test";
import assert from "node:assert/strict";
import { createRemoteRepository } from "../js/services/remoteRepository.js";

// Cliente falso: registra cada llamada y devuelve un resultado fijo. Sin red.
function fakeClient({ userId = "u-1", result = { data: [], error: null }, rpcResult = { data: {}, error: null } } = {}) {
  const calls = [];
  const from = (table) => {
    const entry = { table, ops: [] };
    calls.push(entry);
    const builder = {};
    for (const name of ["select", "insert", "update", "eq", "is", "in", "order", "limit", "single", "maybeSingle"]) {
      builder[name] = (...args) => { entry.ops.push([name, ...args]); return builder; };
    }
    builder.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
    return builder;
  };
  return {
    calls,
    from,
    rpc: (name, args) => { calls.push({ rpc: name, args }); return Promise.resolve(rpcResult); },
    auth: {
      getSession: async () => ({ data: { session: userId ? { user: { id: userId } } : null } }),
      signUp: async (args) => { calls.push({ signUp: args }); return { data: { user: { id: "new" }, session: null }, error: null }; },
      signInWithPassword: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: {} } }),
    },
  };
}
const op = (call, name) => call.ops.find((o) => o[0] === name);

test("sin sesión: las operaciones que la requieren devuelven error y no llaman a la base", async () => {
  const client = fakeClient({ userId: null });
  const repo = createRemoteRepository(client);
  assert.match((await repo.machinery.create({ title: "x" })).error.message, /sesión/);
  assert.match((await repo.reservations.create({ machineId: "m" })).error.message, /sesión/);
  assert.match((await repo.incidents.report("r", { reason: "x" })).error.message, /sesión/);
  assert.equal(client.calls.length, 0);
});

test("catálogo: solo activas y no eliminadas", async () => {
  const client = fakeClient();
  await createRemoteRepository(client).machinery.listCatalog();
  const call = client.calls[0];
  assert.equal(call.table, "machinery");
  assert.deepEqual(op(call, "eq"), ["eq", "offer_status", "active"]);
  assert.deepEqual(op(call, "is"), ["is", "deleted_at", null]);
});

test("crear reserva: el solicitante sale de la sesión y no se mandan campos del servidor", async () => {
  const client = fakeClient();
  await createRemoteRepository(client).reservations.create({
    machineId: "m-1", date: "2026-12-01", priceUnit: "kilometro", estimatedKm: 84, job: "Distribucion", field: "Coop",
    status: "accepted", ownerId: "falso", requestedBy: "falso",
  });
  const payload = op(client.calls[0], "insert")[1];
  assert.equal(client.calls[0].table, "reservations");
  assert.equal(payload.requester_id, "u-1");
  assert.equal("status" in payload, false);
  assert.equal("owner_id" in payload, false);
});

test("crear oferta: owner_id sale de la sesión", async () => {
  const client = fakeClient();
  await createRemoteRepository(client).machinery.create({ title: "Scania", category: "Camion", price: 3500, priceUnit: "kilometro", location: "x", availability: "y", rating: 5 });
  const payload = op(client.calls[0], "insert")[1];
  assert.equal(payload.owner_id, "u-1");
  assert.equal("rating" in payload, false);
});

test("los cambios de estado usan las funciones SQL, nunca UPDATE", async () => {
  const client = fakeClient();
  const repo = createRemoteRepository(client);
  await repo.reservations.transition("r-1", "accepted", "ok");
  await repo.reservations.setOperationStage("r-1", "on_way_origin", "En camino");
  await repo.reservations.proposeSchedule({ reservationId: "r-1", kind: "counter", dateStart: "2026-12-12", startTime: "08:00" });
  await repo.reservations.respondSchedule("p-1", "keep_original");
  assert.deepEqual(client.calls.map((c) => c.rpc), ["transition_reservation", "set_operation_stage", "propose_schedule", "respond_schedule"]);
  assert.deepEqual(client.calls[0].args, { p_id: "r-1", p_status: "accepted", p_note: "ok" });
  assert.deepEqual(client.calls[1].args, { p_id: "r-1", p_stage: "on_way_origin", p_label: "En camino" });
  assert.equal(client.calls[2].args.p_reservation, "r-1");
  assert.equal(client.calls[2].args.p_date_end, null);
  assert.deepEqual(client.calls[3].args, { p_proposal: "p-1", p_action: "keep_original" });
  assert.equal(client.calls.some((c) => c.table === "reservations"), false);
});

test("baja lógica: marca deleted_at e inactiva, sin DELETE", async () => {
  const client = fakeClient({ result: { data: { id: "m-1", offer_status: "inactive" }, error: null } });
  const { data } = await createRemoteRepository(client).machinery.softDelete("m-1");
  const payload = op(client.calls[0], "update")[1];
  assert.equal(payload.offer_status, "inactive");
  assert.ok(payload.deleted_at);
  assert.equal(op(client.calls[0], "delete"), undefined);
  assert.equal(data.offerStatus, "inactive");
});

test("el error de la base se propaga sin mapear datos", async () => {
  const client = fakeClient({ result: { data: null, error: new Error("permission denied") } });
  const repo = createRemoteRepository(client);
  const list = await repo.reservations.listAll();
  assert.deepEqual(list.data, []);
  assert.match(list.error.message, /permission denied/);
  const one = await repo.machinery.create({ title: "x", category: "Camion", price: 1, location: "x", availability: "y" });
  assert.equal(one.data, null);
});

test("historial de reserva: consulta las 4 tablas", async () => {
  const client = fakeClient();
  const { data, error } = await createRemoteRepository(client).reservations.timeline("r-1");
  assert.equal(error, null);
  assert.deepEqual(client.calls.map((c) => c.table).sort(), ["incidents", "reservation_events", "reservation_operation_events", "reservation_schedule_proposals"]);
  assert.deepEqual(Object.keys(data), ["events", "operationEvents", "scheduleProposals", "incidents"]);
});

test("reseñas e incidentes: solo mandan columnas permitidas", async () => {
  const client = fakeClient();
  const repo = createRemoteRepository(client);
  await repo.reviews.create({
    reservationId: "r-1", overallRating: 5, categories: { punctuality: 5 },
    wouldWorkAgain: true, tags: ["Puntual"], comment: "Muy bien", reviewerId: "falso",
  });
  await repo.incidents.report("r-1", { reason: "Voy con demora", delayType: "execution", delayMinutes: 15 });
  assert.deepEqual(Object.keys(op(client.calls[0], "insert")[1]).sort(), [
    "category_ratings", "comment", "rating", "reservation_id", "tags", "would_work_again",
  ]);
  assert.equal(op(client.calls[0], "insert")[1].reviewer_id, undefined);
  assert.deepEqual(op(client.calls[1], "insert")[1], {
    reservation_id: "r-1", reason: "Voy con demora", delay_type: "execution", delay_minutes: 15, reported_by: "u-1",
  });
});

test("incidentes comunes no mandan campos de demora", async () => {
  const client = fakeClient();
  await createRemoteRepository(client).incidents.report("r-1", { reason: "Ruta cortada" });
  assert.deepEqual(op(client.calls[0], "insert")[1], {
    reservation_id: "r-1", reason: "Ruta cortada", delay_type: null, delay_minutes: null, reported_by: "u-1",
  });
});

test("ubicación: reportar usa RPC y consultar lee una fila de reservation_locations", async () => {
  const client = fakeClient({
    result: { data: { reservation_id: "r-1", latitude: -33.8, longitude: -60.5, accuracy_m: 10, updated_at: "now" }, error: null },
  });
  const repo = createRemoteRepository(client);
  await repo.reservations.reportLocation("r-1", { latitude: -33.8, longitude: -60.5, accuracy: 10 });
  assert.deepEqual(client.calls[0], {
    rpc: "report_location",
    args: { p_reservation: "r-1", p_latitude: -33.8, p_longitude: -60.5, p_accuracy: 10 },
  });

  const { data, error } = await repo.reservations.getLocation("r-1");
  assert.equal(error, null);
  assert.deepEqual(data, { latitude: -33.8, longitude: -60.5, accuracy: 10, createdAt: "now" });
  const query = client.calls[1];
  assert.equal(query.table, "reservation_locations");
  assert.deepEqual(op(query, "select"), ["select", "*"]);
  assert.deepEqual(op(query, "eq"), ["eq", "reservation_id", "r-1"]);
  assert.deepEqual(op(query, "maybeSingle"), ["maybeSingle"]);
});

test("registro: manda nombre y términos como metadatos para que el trigger cree el perfil", async () => {
  const client = fakeClient();
  await createRemoteRepository(client).auth.signUp({ email: "a@b.com", password: "secreta1", name: "Juan", termsVersion: "1.0" });
  const call = client.calls.find((c) => c.signUp);
  assert.deepEqual(call.signUp.options.data, { name: "Juan", terms_version: "1.0", role: undefined });
  assert.equal(client.calls.some((c) => c.table === "profiles"), false);
});
