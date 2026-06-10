import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "./types";

// Cloud sync is OPTIONAL. If config is missing the app still runs fully from
// localStorage (local-first). Configure via env vars (.env.local for dev,
// project settings on the host for deploys) — this app has no login and a
// shared dataset, so the URL + key must never be committed to the repo.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
if (url && anonKey) {
  client = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

export function cloudEnabled(): boolean {
  return client !== null;
}

// Each session is stored as one row with the full payload in a jsonb column.
// Simple, durable, and queryable by date/type. No login: a single shared dataset.
interface Row {
  id: string;
  date: string;
  type: string;
  data: Session;
  updated_at: string;
}

export async function fetchSessions(): Promise<Session[] | null> {
  if (!client) return null;
  const { data, error } = await client
    .from("sessions")
    .select("id,date,type,data,updated_at")
    .order("date", { ascending: false });
  if (error) {
    console.warn("[supabase] fetch failed:", error.message);
    return null;
  }
  return (data as Row[]).map((r) => r.data);
}

export async function upsertSession(s: Session): Promise<boolean> {
  if (!client) return false;
  const { error } = await client.from("sessions").upsert(
    {
      id: s.id,
      date: s.date,
      type: s.type,
      data: s,
      updated_at: new Date(s.updatedAt).toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) {
    console.warn("[supabase] upsert failed:", error.message);
    return false;
  }
  return true;
}

export async function deleteSession(id: string): Promise<boolean> {
  if (!client) return false;
  const { error } = await client.from("sessions").delete().eq("id", id);
  if (error) {
    console.warn("[supabase] delete failed:", error.message);
    return false;
  }
  return true;
}
