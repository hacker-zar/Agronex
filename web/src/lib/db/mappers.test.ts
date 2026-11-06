import { describe, expect, it } from "vitest";
import { profileFromRow, profileToUpdate } from "./mappers";

describe("mappers de perfil", () => {
  it("envía solo columnas editables", () => {
    expect(profileToUpdate({ name: " Ana ", operationRadiusKm: 50, onboardingCompleted: true })).toEqual({ name: "Ana", operation_radius_km: 50, onboarding_completed: true });
  });
  it("reconstruye el perfil", () => {
    expect(profileFromRow({ id: "u", name: "Ana", zone: "Rosario", hectares: 10, bio: null, operation_radius_km: 50, onboarding_completed: true })).toMatchObject({ id: "u", operationRadiusKm: 50, onboardingCompleted: true });
  });
});
