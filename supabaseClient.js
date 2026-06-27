// ============================================================================
// AGRONEX — NexuDrive MVP
// Cliente de conexión a Supabase (sin bundler, vía CDN).
//
// Cargar ANTES de app.js en index.html:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.108.2/dist/umd/supabase.js"></script>
//   <script src="./js/supabaseClient.js"></script>
//   <script src="./js/app.js"></script>
//
// Esto expone window.supabaseClient y window.AgronexDB (helpers).
// app.js puede usarlos sin modificar nada más todavía — es un paso previo
// a migrar de localStorage a Supabase de verdad.
// ============================================================================

(function () {
  "use strict";

  const SUPABASE_URL = "https://cadmgykrljznmzgxolrr.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZG1neWtybGp6bm16Z3hvbHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTYyMzMsImV4cCI6MjA5ODEzMjIzM30.8abFKWDV-kQ_WqO5d5PGSxAkbD4UZYGkhFne5p3VnPU";

  if (typeof window.supabase === "undefined") {
    console.error(
      "[AgronexDB] No se encontró la librería supabase-js. " +
      "Verificá que el script de jsdelivr esté cargado ANTES de supabaseClient.js."
    );
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = client;

  // --------------------------------------------------------------------------
  // Helpers por tabla. Cada función devuelve { data, error } (igual que
  // supabase-js) para que el código que los use pueda chequear error sin
  // try/catch obligatorio.
  // --------------------------------------------------------------------------

  const AgronexDB = {
    client,

    // ---------- profiles ----------
    profiles: {
      async getCurrent() {
        const { data: userData, error: userError } = await client.auth.getUser();
        if (userError || !userData?.user) return { data: null, error: userError };
        return client.from("profiles").select("*").eq("id", userData.user.id).single();
      },
      async update(updates) {
        const { data: userData } = await client.auth.getUser();
        if (!userData?.user) return { data: null, error: new Error("No hay sesión activa.") };
        return client.from("profiles").update(updates).eq("id", userData.user.id).select().single();
      },
    },

    // ---------- machinery ----------
    machinery: {
      // Catálogo público (RLS ya filtra activos y no-eliminados).
      async listCatalog() {
        return client.from("machinery").select("*").order("created_at", { ascending: false });
      },
      // "Mis Ofertas": incluye pausadas/inactivas porque RLS permite ver las propias.
      async listMine() {
        const { data: userData } = await client.auth.getUser();
        if (!userData?.user) return { data: [], error: new Error("No hay sesión activa.") };
        return client
          .from("machinery")
          .select("*")
          .eq("owner_id", userData.user.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });
      },
      async create(machine) {
        const { data: userData } = await client.auth.getUser();
        if (!userData?.user) return { data: null, error: new Error("No hay sesión activa.") };
        return client
          .from("machinery")
          .insert({ ...machine, owner_id: userData.user.id })
          .select()
          .single();
      },
      async setOfferStatus(id, offer_status) {
        return client.from("machinery").update({ offer_status }).eq("id", id).select().single();
      },
      // Soft delete — nunca DELETE real (regla del contexto maestro).
      async softDelete(id) {
        return client
          .from("machinery")
          .update({ deleted_at: new Date().toISOString(), offer_status: "inactive" })
          .eq("id", id)
          .select()
          .single();
      },
    },

    // ---------- reservations ----------
    reservations: {
      // Reservas donde el usuario actual es quien solicitó (pantalla "Reservas").
      async listAsRequester() {
        const { data: userData } = await client.auth.getUser();
        if (!userData?.user) return { data: [], error: new Error("No hay sesión activa.") };
        return client
          .from("reservations")
          .select("*")
          .eq("requester_id", userData.user.id)
          .order("created_at", { ascending: false });
      },
      // Solicitudes recibidas sobre las máquinas del usuario actual ("Mis Ofertas" > Solicitudes).
      async listIncoming() {
        return client
          .from("reservations")
          .select("*, machinery!inner(owner_id)")
          .eq("machinery.owner_id", (await client.auth.getUser()).data?.user?.id ?? "")
          .order("created_at", { ascending: false });
      },
      async create(reservation) {
        const { data: userData } = await client.auth.getUser();
        if (!userData?.user) return { data: null, error: new Error("No hay sesión activa.") };
        return client
          .from("reservations")
          .insert({ ...reservation, requester_id: userData.user.id })
          .select()
          .single();
      },
      async setStatus(id, status) {
        return client
          .from("reservations")
          .update({ status, resolved_at: ["accepted", "rejected", "done"].includes(status) ? new Date().toISOString() : null })
          .eq("id", id)
          .select()
          .single();
      },
    },

    // ---------- auth ----------
    auth: {
      async signUp(email, password, name) {
        return client.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
      },
      async signIn(email, password) {
        return client.auth.signInWithPassword({ email, password });
      },
      async signOut() {
        return client.auth.signOut();
      },
      onAuthStateChange(callback) {
        return client.auth.onAuthStateChange(callback);
      },
    },
  };

  window.AgronexDB = AgronexDB;

  console.log("[AgronexDB] Cliente Supabase listo. Usar window.AgronexDB.* o window.supabaseClient directamente.");
})();
