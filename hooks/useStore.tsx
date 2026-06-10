"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Session } from "@/lib/types";
import {
  cloudEnabled,
  deleteSession as cloudDelete,
  fetchSessions,
  upsertSession as cloudUpsert,
} from "@/lib/supabase";

const DATA_KEY = "gym-tracker-v1";
const QUEUE_KEY = "gym-tracker-queue-v1";

export type SyncStatus = "idle" | "saving" | "saved" | "offline" | "error";

interface Queue {
  upserts: Record<string, Session>; // id -> session payload
  deletes: string[];
}

interface StoreShape {
  sessions: Session[];
  ready: boolean;
  online: boolean;
  syncStatus: SyncStatus;
  cloud: boolean;
  getSession: (id: string) => Session | undefined;
  saveSession: (s: Session) => void;
  removeSession: (id: string) => void;
}

const StoreContext = createContext<StoreShape | null>(null);

function readLocal(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DATA_KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(sessions: Session[]) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn("[store] localStorage write failed", e);
  }
}

function readQueue(): Queue {
  if (typeof window === "undefined") return { upserts: {}, deletes: [] };
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as Queue) : { upserts: {}, deletes: [] };
  } catch {
    return { upserts: {}, deletes: [] };
  }
}

function writeQueue(q: Queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* ignore */
  }
}

function mergeNewestWins(a: Session[], b: Session[]): Session[] {
  const byId = new Map<string, Session>();
  for (const s of a) byId.set(s.id, s);
  for (const s of b) {
    const existing = byId.get(s.id);
    if (!existing || s.updatedAt >= existing.updatedAt) byId.set(s.id, s);
  }
  return [...byId.values()].sort((x, y) => y.date.localeCompare(x.date));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  const queueRef = useRef<Queue>({ upserts: {}, deletes: [] });
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloud = cloudEnabled();

  // ---- Cloud flush ----
  const flush = useCallback(async () => {
    if (!cloud) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSyncStatus("offline");
      return;
    }
    const q = queueRef.current;
    const upsertIds = Object.keys(q.upserts);
    if (upsertIds.length === 0 && q.deletes.length === 0) return;

    setSyncStatus("saving");
    let allOk = true;

    for (const id of upsertIds) {
      const ok = await cloudUpsert(q.upserts[id]);
      if (ok) {
        delete q.upserts[id];
      } else {
        allOk = false;
      }
    }
    for (const id of [...q.deletes]) {
      const ok = await cloudDelete(id);
      if (ok) {
        q.deletes = q.deletes.filter((d) => d !== id);
      } else {
        allOk = false;
      }
    }
    writeQueue(q);
    setSyncStatus(allOk ? "saved" : "error");
  }, [cloud]);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => {
      void flush();
    }, 800);
  }, [flush]);

  // ---- Initial load: local first, then cloud merge ----
  useEffect(() => {
    const local = readLocal();
    setSessions(local);
    queueRef.current = readQueue();
    setReady(true);
    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);

    let cancelled = false;
    (async () => {
      if (!cloud) return;
      const remote = await fetchSessions();
      if (cancelled || !remote) return;
      setSessions((prev) => {
        const merged = mergeNewestWins(remote, prev);
        writeLocal(merged);
        return merged;
      });
      // push anything that was queued offline
      void flush();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Online / offline awareness ----
  useEffect(() => {
    function goOnline() {
      setOnline(true);
      void flush();
    }
    function goOffline() {
      setOnline(false);
      setSyncStatus("offline");
    }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [flush]);

  const getSession = useCallback(
    (id: string) => sessions.find((s) => s.id === id),
    [sessions]
  );

  const saveSession = useCallback(
    (s: Session) => {
      const stamped: Session = { ...s, updatedAt: Date.now() };
      setSessions((prev) => {
        const others = prev.filter((p) => p.id !== stamped.id);
        const next = mergeNewestWins(others, [stamped]);
        writeLocal(next);
        return next;
      });
      queueRef.current.upserts[stamped.id] = stamped;
      writeQueue(queueRef.current);
      if (cloud) scheduleFlush();
    },
    [cloud, scheduleFlush]
  );

  const removeSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((p) => p.id !== id);
        writeLocal(next);
        return next;
      });
      delete queueRef.current.upserts[id];
      if (cloud && !queueRef.current.deletes.includes(id)) {
        queueRef.current.deletes.push(id);
      }
      writeQueue(queueRef.current);
      if (cloud) scheduleFlush();
    },
    [cloud, scheduleFlush]
  );

  const value: StoreShape = {
    sessions,
    ready,
    online,
    syncStatus,
    cloud,
    getSession,
    saveSession,
    removeSession,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreShape {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
