export type ProfilePatch = { name?: string; zone?: string; hectares?: number | null; bio?: string; operationRadiusKm?: number | null; onboardingCompleted?: boolean };
export type Profile = { id: string; name: string; zone: string; hectares: number | null; bio: string; operationRadiusKm: number | null; onboardingCompleted: boolean };
type Row = Record<string, unknown>;

function finite(value: unknown) { const number = Number(value); return Number.isFinite(number) ? number : null; }
function trimmed(value: unknown) { return typeof value === "string" ? value.trim() : ""; }

export function profileToUpdate(patch: ProfilePatch) {
  const output: Record<string, string | number | boolean | null> = {};
  if (patch.name !== undefined) output.name = patch.name.trim();
  if (patch.zone !== undefined) output.zone = patch.zone.trim();
  if (patch.hectares !== undefined) output.hectares = patch.hectares;
  if (patch.bio !== undefined) output.bio = patch.bio.trim();
  if (patch.operationRadiusKm !== undefined) output.operation_radius_km = patch.operationRadiusKm;
  if (patch.onboardingCompleted !== undefined) output.onboarding_completed = patch.onboardingCompleted;
  return output;
}

export function profileFromRow(row: Row): Profile {
  return { id: String(row.id), name: String(row.name ?? ""), zone: String(row.zone ?? ""), hectares: typeof row.hectares === "number" ? row.hectares : null, bio: String(row.bio ?? ""), operationRadiusKm: typeof row.operation_radius_km === "number" ? row.operation_radius_km : null, onboardingCompleted: Boolean(row.onboarding_completed) };
}

export type ReviewInput = { reservationId: string; overallRating: number; categories: Record<string, number>; wouldWorkAgain: boolean; tags: string[]; comment?: string };
export function reviewToInsert(input: ReviewInput) { return { reservation_id: input.reservationId, rating: input.overallRating, category_ratings: input.categories, would_work_again: input.wouldWorkAgain, tags: input.tags, comment: input.comment?.trim() || null }; }

export type IncidentInput = { reason?: string; delayType?: "start" | "execution" | "end"; delayMinutes?: number };
export function incidentToInsert(input: IncidentInput, context: { reservationId: string; reportedBy: string }) { const delayed = input.delayType !== undefined || input.delayMinutes !== undefined; return { reservation_id: context.reservationId, reason: trimmed(input.reason), delay_type: delayed ? input.delayType ?? null : null, delay_minutes: delayed ? finite(input.delayMinutes) : null, reported_by: context.reportedBy }; }
export function incidentFromRow(row: Row) { const base = { reason: trimmed(row.reason), reportedBy: String(row.reported_by ?? ""), createdAt: String(row.created_at ?? "") }; const delayMinutes = finite(row.delay_minutes); return delayMinutes === null ? base : { ...base, delayType: row.delay_type, minutesDelayed: delayMinutes }; }
export function locationFromRow(row: Row | null) { if (!row) return null; const latitude = finite(row.latitude); const longitude = finite(row.longitude); if (latitude === null || longitude === null) return null; return { latitude, longitude, accuracy: finite(row.accuracy_m), createdAt: String(row.updated_at ?? "") }; }
