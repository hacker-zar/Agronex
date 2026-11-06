import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createRemoteRepository } from "./remote-repository";

type Call = { name: string; args: Record<string, unknown> };
function fakeClient() {
  const calls: Call[] = [];
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: "u-1" } }, error: null }) },
    rpc: (name: string, args: Record<string, unknown>) => { calls.push({ name, args }); return Promise.resolve({ data: null, error: null }); },
    from: () => ({ insert: () => ({ select: () => ({ single: async () => ({ data: {}, error: null }) }) }), select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
  };
  return { client: client as unknown as SupabaseClient, calls };
}
describe("repositorio remoto", () => {
  it("reporta ubicación solamente mediante la RPC autorizada", async () => {
    const { client, calls } = fakeClient();
    await createRemoteRepository(client).reservations.reportLocation("r-1", { latitude: -33.8, longitude: -60.5, accuracy: 12 });
    expect(calls).toEqual([{ name: "report_location", args: { p_reservation: "r-1", p_latitude: -33.8, p_longitude: -60.5, p_accuracy: 12 } }]);
  });
});
