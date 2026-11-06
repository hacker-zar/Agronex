"use client";
import { FormEvent, useState } from "react";
import { Button, Input, Toast } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { updateMyProfile } from "@/lib/db/profile-repository";
import type { Profile } from "@/lib/db/mappers";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [notice, setNotice] = useState(""); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); const form = new FormData(event.currentTarget); const radius = Number(form.get("radius")); if (!Number.isFinite(radius) || radius < 10 || radius > 500 || radius % 5 !== 0) { setError("El radio debe estar entre 10 y 500 km, en pasos de 5."); return; } const { error: updateError } = await updateMyProfile(createClient(), profile.id, { name: String(form.get("name")), zone: String(form.get("zone")), hectares: form.get("hectares") ? Number(form.get("hectares")) : null, bio: String(form.get("bio")), operationRadiusKm: radius, onboardingCompleted: true }); if (updateError) setError("No pudimos guardar el perfil."); else setNotice("Perfil guardado."); }
  return <form className="stack" onSubmit={submit}><Input id="name" name="name" label="Nombre" defaultValue={profile.name} required maxLength={60} /><Input id="zone" name="zone" label="Zona" defaultValue={profile.zone} maxLength={120} /><Input id="hectares" name="hectares" label="Hectáreas" defaultValue={profile.hectares ?? ""} type="number" min="0" /><Input id="radius" name="radius" label="Radio operativo (km)" defaultValue={profile.operationRadiusKm ?? 10} type="number" min="10" max="500" step="5" required /><label className="field" htmlFor="bio">Descripción<textarea id="bio" name="bio" defaultValue={profile.bio} maxLength={220} /></label><Toast message={notice || error} error={Boolean(error)} /><Button className="primary" type="submit">Guardar cambios</Button></form>;
}
