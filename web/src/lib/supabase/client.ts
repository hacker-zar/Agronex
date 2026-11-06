import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnvironment } from "@/lib/env";

export function createClient() {
  const { url, key } = supabaseEnvironment();
  return createBrowserClient(url, key);
}
