import type { SupabaseClient } from "@supabase/supabase-js";
import { incidentFromRow, incidentToInsert, locationFromRow, reviewToInsert, type IncidentInput, type ReviewInput } from "./mappers";

type Result<T> = { data: T | null; error: Error | null };
type Row = Record<string, unknown>;
export function createRemoteRepository(client: SupabaseClient) {
  return {
    reviews: { async create(input: ReviewInput) { const result = await client.from("reviews").insert(reviewToInsert(input)).select("*").single(); return result as Result<Row>; } },
    incidents: { async report(reservationId: string, input: IncidentInput) { const { data: authData, error: authError } = await client.auth.getUser(); if (authError || !authData.user) return { data: null, error: new Error("No hay sesión activa.") }; const result = await client.from("incidents").insert(incidentToInsert(input, { reservationId, reportedBy: authData.user.id })).select("*").single(); if (result.error) return { data: null, error: result.error }; return { data: incidentFromRow(result.data as Row), error: null }; } },
    reservations: {
      reportLocation(id: string, point: { latitude: number; longitude: number; accuracy?: number | null }) { return client.rpc("report_location", { p_reservation: id, p_latitude: point.latitude, p_longitude: point.longitude, p_accuracy: point.accuracy ?? null }); },
      async getLocation(id: string) { const result = await client.from("reservation_locations").select("*").eq("reservation_id", id).maybeSingle(); if (result.error) return { data: null, error: result.error }; return { data: locationFromRow(result.data as Row | null), error: null }; },
    },
  };
}
