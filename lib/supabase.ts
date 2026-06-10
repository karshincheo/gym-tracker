import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "./types";

// Cloud sync is OPTIONAL. If config is missing the app still runs fully from
// localStorage (local-first). This lets us develop/test before the cloud exists.
//
// The Supabase URL + publishable key are PUBLIC by design — they ship in the
// browser bundle for any Supabase client app. Row-level security (not the key)
// is what protects data. We keep them as fallbacks so the deployed build always
// has cloud sync even if env vars aren't configured on the host; env vars still
// win when present.
const FALLBACK_URL = "https://jzahdldnrcrusubmvxnh.supabase.co";
const FALLBACK_ANON_KEY = "sb_publishable_EVDIDwULTOOmde5FV-1ZuQ_TlXVyyDr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

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
