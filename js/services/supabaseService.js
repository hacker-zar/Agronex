// ============================================================================
// Punto único de conexión a Supabase para la app (Vite + npm).
//
// La configuración sale de variables de entorno (ver .env.example). Si faltan, la app
// sigue funcionando en modo prototipo (localStorage): `remote` es null.
// La anon key es pública por diseño; la seguridad real la dan las políticas RLS.
// ============================================================================
import { createClient } from "@supabase/supabase-js";
import { createRemoteRepository } from "./remoteRepository.js";

const url = import.meta.env?.VITE_SUPABASE_URL;
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

// null si no hay configuración: el código que lo use debe caer al modo prototipo.
export const remote = supabase ? createRemoteRepository(supabase) : null;
