import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { ProfileForm } from "@/components/profile-form";
import { createClient } from "@/lib/supabase/server";
import { getMyProfile } from "@/lib/db/profile-repository";

export const dynamic = "force-dynamic";
export default async function ProfilePage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/ingresar?next=%2Fapp%2Fperfil"); const { data: profile, error } = await getMyProfile(supabase, user.id); return <main className="shell page"><div style={{ maxWidth: "44rem", margin: "auto" }}><Card><p className="eyebrow">Mi cuenta</p><h1>Perfil</h1>{error || !profile ? <p className="error">No pudimos cargar tu perfil. Intentá recargar la página.</p> : <ProfileForm profile={profile} />}</Card></div></main>; }
