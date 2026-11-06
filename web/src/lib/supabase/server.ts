import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnvironment } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = supabaseEnvironment();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (entries) => {
        try { entries.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components no pueden escribir cookies. proxy.ts las actualiza. */ }
      },
    },
  });
}
