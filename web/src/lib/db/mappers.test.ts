import { describe, expect, it } from "vitest";
import { incidentFromRow, incidentToInsert, profileFromRow, profileToUpdate, reviewToInsert } from "./mappers";

describe("mappers de perfil", () => {
  it("envía solo columnas editables", () => {
    expect(profileToUpdate({ name: " Ana ", operationRadiusKm: 50, onboardingCompleted: true })).toEqual({ name: "Ana", operation_radius_km: 50, onboarding_completed: true });
  });
  it("reconstruye el perfil", () => {
    expect(profileFromRow({ id: "u", name: "Ana", zone: "Rosario", hectares: 10, bio: null, operation_radius_km: 50, onboarding_completed: true })).toMatchObject({ id: "u", operationRadiusKm: 50, onboardingCompleted: true });
  });
  it("filtra reseñas e incidentes según el contrato", () => {
    expect(reviewToInsert({ reservationId: "r", overallRating: 5, categories: { puntualidad: 5 }, wouldWorkAgain: true, tags: [], comment: "Bien" })).toMatchObject({ reservation_id: "r", would_work_again: true });
    expect(incidentToInsert({ delayType: "execution", delayMinutes: 20 }, { reservationId: "r", reportedBy: "u" })).toEqual({ reservation_id: "r", reason: "", delay_type: "execution", delay_minutes: 20, reported_by: "u" });
    expect(incidentFromRow({ reason: "", delay_type: "execution", delay_minutes: 20, reported_by: "u", created_at: "now" })).toMatchObject({ minutesDelayed: 20 });
  });
});
