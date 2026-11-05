// ============================================================================
// Repositorio remoto (Supabase) — todo el acceso a datos de la app en un solo lugar.
//
//  - Recibe el cliente por parámetro (createRemoteRepository(client)): se puede testear
//    con un cliente falso, sin red.
//  - Habla en el modelo de la app (camelCase). Los mapeos viven en js/modules/dbMappers.js.
//  - Los cambios de estado NO son UPDATE: pasan por funciones SQL (rpc) que validan el rol
//    y la transición. Ver supabase/migrations.
//  - Todas las funciones devuelven { data, error } igual que supabase-js.
// ============================================================================
import {
  availabilityFromRow, availabilityToInsert, availabilityToUpdate,
  machineryFromRow, machineryToInsert, machineryToUpdate,
  profileFromRow, profileToUpdate, reservationFromRow, reservationToInsert,
} from "../modules/dbMappers.js";

const NO_SESSION = "No hay sesión activa.";

export function createRemoteRepository(client) {
  const fail = (message) => ({ data: null, error: new Error(message) });

  async function currentUserId() {
    const { data } = await client.auth.getSession();
    return data?.session?.user?.id ?? null;
  }

  // Aplica un mapper al resultado sin perder el error.
  const mapOne = (result, mapper) =>
    result.error ? { data: null, error: result.error } : { data: result.data ? mapper(result.data) : null, error: null };
  const mapMany = (result, mapper) =>
    result.error ? { data: [], error: result.error } : { data: (result.data || []).map(mapper), error: null };

  // ------------------------------ auth ------------------------------
  const auth = {
    // El perfil lo crea la base (trigger) a partir de estos datos; no hace falta insertarlo desde el cliente.
    // Con confirmación de email activada, data.session viene null hasta que el usuario confirma.
    signUp({ email, password, name, termsVersion, role }) {
      return client.auth.signUp({
        email, password,
        options: { data: { name, terms_version: termsVersion, role } },
      });
    },
    signIn: ({ email, password }) => client.auth.signInWithPassword({ email, password }),
    signOut: () => client.auth.signOut(),
    getSession: () => client.auth.getSession(),
    onAuthStateChange: (callback) => client.auth.onAuthStateChange(callback),
  };

  // ----------------------------- profiles -----------------------------
  const profiles = {
    async getCurrent() {
      const uid = await currentUserId();
      if (!uid) return fail(NO_SESSION);
      const result = await client.from("profiles").select("*").eq("id", uid).single();
      return mapOne(result, profileFromRow);
    },
    async update(patch) {
      const uid = await currentUserId();
      if (!uid) return fail(NO_SESSION);
      const result = await client.from("profiles").update(profileToUpdate(patch)).eq("id", uid).select().single();
      return mapOne(result, profileFromRow);
    },
  };

  // ----------------------------- machinery -----------------------------
  const machinery = {
    // Catálogo: solo ofertas activas y no eliminadas (aunque RLS deja ver también las propias).
    async listCatalog() {
      const result = await client.from("machinery").select("*")
        .eq("offer_status", "active").is("deleted_at", null)
        .order("created_at", { ascending: false });
      return mapMany(result, machineryFromRow);
    },
    async listMine() {
      const uid = await currentUserId();
      if (!uid) return { data: [], error: new Error(NO_SESSION) };
      const result = await client.from("machinery").select("*")
        .eq("owner_id", uid).is("deleted_at", null)
        .order("created_at", { ascending: false });
      return mapMany(result, machineryFromRow);
    },
    async create(app) {
      const uid = await currentUserId();
      if (!uid) return fail(NO_SESSION);
      const result = await client.from("machinery").insert(machineryToInsert(app, { ownerId: uid })).select().single();
      return mapOne(result, machineryFromRow);
    },
    async update(id, app) {
      const result = await client.from("machinery").update(machineryToUpdate(app)).eq("id", id).select().single();
      return mapOne(result, machineryFromRow);
    },
    async setOfferStatus(id, offerStatus) {
      const result = await client.from("machinery").update({ offer_status: offerStatus }).eq("id", id).select().single();
      return mapOne(result, machineryFromRow);
    },
    // Baja lógica: nunca DELETE real.
    async softDelete(id) {
      const result = await client.from("machinery")
        .update({ deleted_at: new Date().toISOString(), offer_status: "inactive" })
        .eq("id", id).select().single();
      return mapOne(result, machineryFromRow);
    },
  };

  // --------------------------- availability ---------------------------
  const availability = {
    async listForMachinery(machineryId) {
      const result = await client.from("availability_windows").select("*")
        .eq("machinery_id", machineryId).order("date_start", { ascending: true });
      return mapMany(result, availabilityFromRow);
    },
    async listForMachineries(machineryIds) {
      if (!machineryIds?.length) return { data: [], error: null };
      const result = await client.from("availability_windows").select("*")
        .in("machinery_id", machineryIds).order("date_start", { ascending: true });
      return mapMany(result, availabilityFromRow);
    },
    async create(machineryId, app) {
      const result = await client.from("availability_windows")
        .insert(availabilityToInsert(app, { machineryId })).select().single();
      return mapOne(result, availabilityFromRow);
    },
    async update(id, app) {
      const result = await client.from("availability_windows")
        .update(availabilityToUpdate(app)).eq("id", id).select().single();
      return mapOne(result, availabilityFromRow);
    },
  };

  // ---------------------------- reservations ----------------------------
  const reservations = {
    // RLS ya limita a las reservas donde el usuario es parte (solicitante o dueño).
    async listAll() {
      const result = await client.from("reservations").select("*").order("created_at", { ascending: false });
      return mapMany(result, reservationFromRow);
    },
    async listAsRequester() {
      const uid = await currentUserId();
      if (!uid) return { data: [], error: new Error(NO_SESSION) };
      const result = await client.from("reservations").select("*")
        .eq("requester_id", uid).order("created_at", { ascending: false });
      return mapMany(result, reservationFromRow);
    },
    async listIncoming() {
      const uid = await currentUserId();
      if (!uid) return { data: [], error: new Error(NO_SESSION) };
      const result = await client.from("reservations").select("*")
        .eq("owner_id", uid).order("created_at", { ascending: false });
      return mapMany(result, reservationFromRow);
    },
    async create(app) {
      const uid = await currentUserId();
      if (!uid) return fail(NO_SESSION);
      const result = await client.from("reservations")
        .insert(reservationToInsert(app, { requesterId: uid })).select().single();
      return mapOne(result, reservationFromRow);
    },
    // Contratista: pending/original_kept -> accepted | rejected. Productor: pending -> cancelled.
    async transition(id, status, note = null) {
      const result = await client.rpc("transition_reservation", { p_id: id, p_status: status, p_note: note });
      return mapOne(result, reservationFromRow);
    },
    // Solo el contratista. Ej.: "on_way_origin", "loading", "done".
    async setOperationStage(id, stage, label = null) {
      const result = await client.rpc("set_operation_stage", { p_id: id, p_stage: stage, p_label: label });
      return mapOne(result, reservationFromRow);
    },
    // kind: "counter" (contratista contrapropone) | "reschedule" (cualquiera pide cambiar la fecha)
    async proposeSchedule({ reservationId, kind, dateStart, dateEnd = null, startTime = null, endTime = null, reason = null }) {
      return client.rpc("propose_schedule", {
        p_reservation: reservationId, p_kind: kind, p_date_start: dateStart, p_date_end: dateEnd,
        p_start_time: startTime, p_end_time: endTime, p_reason: reason,
      });
    },
    // counter: "accept" | "keep_original" | "cancel"  —  reschedule: "accept" | "reject"
    async respondSchedule(proposalId, action) {
      return client.rpc("respond_schedule", { p_proposal: proposalId, p_action: action });
    },
    // Historial completo de una reserva.
    async timeline(id) {
      const [events, operation, proposals, incidents] = await Promise.all([
        client.from("reservation_events").select("*").eq("reservation_id", id).order("created_at", { ascending: true }),
        client.from("reservation_operation_events").select("*").eq("reservation_id", id).order("created_at", { ascending: true }),
        client.from("reservation_schedule_proposals").select("*").eq("reservation_id", id).order("created_at", { ascending: true }),
        client.from("incidents").select("*").eq("reservation_id", id).order("created_at", { ascending: true }),
      ]);
      const error = events.error || operation.error || proposals.error || incidents.error || null;
      return {
        data: error ? null : {
          events: events.data, operationEvents: operation.data,
          scheduleProposals: proposals.data, incidents: incidents.data,
        },
        error,
      };
    },
  };

  // ------------------------------ incidents ------------------------------
  const incidents = {
    async report(reservationId, reason) {
      const uid = await currentUserId();
      if (!uid) return fail(NO_SESSION);
      return client.from("incidents")
        .insert({ reservation_id: reservationId, reason, reported_by: uid }).select().single();
    },
  };

  // ---------------------------- notifications ----------------------------
  const notifications = {
    async listMine(limit = 50) {
      return client.from("notifications").select("*").order("created_at", { ascending: false }).limit(limit);
    },
    async markRead(ids) {
      if (!ids?.length) return { data: [], error: null };
      return client.from("notifications").update({ read: true }).in("id", ids);
    },
  };

  // ------------------------------- reviews -------------------------------
  // Solo sobre reservas finalizadas ("done"). reviewer/reviewee/rol los fija el servidor.
  const reviews = {
    async create({ reservationId, rating, tags = [], comment = null }) {
      return client.from("reviews")
        .insert({ reservation_id: reservationId, rating, tags, comment }).select().single();
    },
    async listForReservation(reservationId) {
      return client.from("reviews").select("*").eq("reservation_id", reservationId);
    },
  };

  return { auth, profiles, machinery, availability, reservations, incidents, notifications, reviews };
}
