export type ProfilePatch = { name?: string; zone?: string; hectares?: number | null; bio?: string; operationRadiusKm?: number | null; onboardingCompleted?: boolean };
export type Profile = { id: string; name: string; zone: string; hectares: number | null; bio: string; operationRadiusKm: number | null; onboardingCompleted: boolean };

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

export function profileFromRow(row: Record<string, unknown>): Profile {
  return { id: String(row.id), name: String(row.name ?? ""), zone: String(row.zone ?? ""), hectares: typeof row.hectares === "number" ? row.hectares : null, bio: String(row.bio ?? ""), operationRadiusKm: typeof row.operation_radius_km === "number" ? row.operation_radius_km : null, onboardingCompleted: Boolean(row.onboarding_completed) };
}
