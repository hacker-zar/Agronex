"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Toast } from "@/components/ui";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { createClient } from "@/lib/supabase/client";

function message(error: { message: string }) {
  const value = error.message.toLowerCase();
  if (value.includes("invalid login")) return "Email o contraseña incorrectos.";
  if (value.includes("already registered")) return "Este email ya está registrado.";
  if (value.includes("email not confirmed")) return "Tenés que confirmar tu email antes de ingresar.";
  return "No pudimos completar la operación. Intentá nuevamente.";
}

export function SignInForm() {
  const router = useRouter(); const [notice, setNotice] = useState(""); const [error, setError] = useState(""); const [captchaToken, setCaptchaToken] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); if (!captchaToken) { setError("Completá la verificación de seguridad."); return; } const form = new FormData(event.currentTarget); try { const { error: authError } = await createClient().auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")), options: { captchaToken } }); if (authError) { setError(message(authError)); setCaptchaToken(""); return; } const next = new URLSearchParams(window.location.search).get("next"); router.replace(next?.startsWith("/") ? next : "/app/perfil"); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo conectar."); setCaptchaToken(""); } }
  return <form className="stack" onSubmit={submit}><Input id="email" label="Email" name="email" type="email" required autoComplete="email" /><Input id="password" label="Contraseña" name="password" type="password" required autoComplete="current-password" /><TurnstileWidget onToken={setCaptchaToken} /><Toast message={notice || error} error={Boolean(error)} /><Button className="primary" type="submit">Ingresar</Button></form>;
}

export function SignUpForm() {
  const [notice, setNotice] = useState(""); const [error, setError] = useState(""); const [captchaToken, setCaptchaToken] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); if (!captchaToken) { setError("Completá la verificación de seguridad."); return; } const form = new FormData(event.currentTarget); const password = String(form.get("password")); if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; } if (!form.get("terms")) { setError("Tenés que aceptar los Términos y Condiciones."); return; } try { const { error: authError } = await createClient().auth.signUp({ email: String(form.get("email")), password, options: { captchaToken, emailRedirectTo: `${window.location.origin}/auth/callback`, data: { name: String(form.get("name")), terms_version: "1.0" } } }); if (authError) { setError(message(authError)); setCaptchaToken(""); return; } setNotice("Te enviamos un email para confirmar tu cuenta."); } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo conectar."); setCaptchaToken(""); } }
  return <form className="stack" onSubmit={submit}><Input id="name" label="Nombre" name="name" required maxLength={60} autoComplete="name" /><Input id="email" label="Email" name="email" type="email" required autoComplete="email" /><Input id="password" label="Contraseña" name="password" type="password" required minLength={8} autoComplete="new-password" /><label><input name="terms" type="checkbox" required /> Acepto los <a href="/legal/terminos" target="_blank">Términos y Condiciones</a>.</label><TurnstileWidget onToken={setCaptchaToken} /><Toast message={notice || error} error={Boolean(error)} /><Button className="primary" type="submit">Crear cuenta</Button></form>;
}
