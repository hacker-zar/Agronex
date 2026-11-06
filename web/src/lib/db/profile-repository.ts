import type { SupabaseClient } from "@supabase/supabase-js";
import { profileFromRow, profileToUpdate, type ProfilePatch } from "./mappers";

export async function getMyProfile(client: SupabaseClient, userId: string) {
  const result = await client.from("profiles").select("*").eq("id", userId).single();
  return result.error ? { data: null, error: result.error } : { data: profileFromRow(result.data), error: null };
}
export async function updateMyProfile(client: SupabaseClient, userId: string, patch: ProfilePatch) {
  const result = await client.from("profiles").update(profileToUpdate(patch)).eq("id", userId).select("*").single();
  return result.error ? { data: null, error: result.error } : { data: profileFromRow(result.data), error: null };
}
