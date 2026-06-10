"use client";

import { useRef, useState } from "react";
import { useStore } from "@/hooks/useStore";
import {
  emptySession,
  Session,
  TYPE_META,
  WORKOUT_TYPES,
  WorkoutType,
} from "@/lib/types";
import StrengthSheet from "@/components/StrengthSheet";
import SyncBadge from "@/components/SyncBadge";
import DogCheer from "@/components/DogCheer";

export default function HomePage() {
  const { sessions, ready, saveSession } = useStore();
  // Independent toggles: each section opens/closes on its own (both can be open).
  const [open, setOpen] = useState<Set<WorkoutType>>(() => new Set(["upper"]));

  function toggle(type: WorkoutType) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  // Stable fresh-session per type until the first save, so typing doesn't remount.
  const emptyCache = useRef<Record<string, Session>>({});

  function sessionFor(type: WorkoutType): Session {
    const matches = sessions.filter((s) => s.type === type);
    if (matches.length) {
      return matches.reduce((a, b) => (b.updatedAt >= a.updatedAt ? b : a));
    }
    if (!emptyCache.current[type]) emptyCache.current[type] = emptySession(type);
    return emptyCache.current[type];
  }

  return (
    <main>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-800">
            Pup Gains <span className="animate-wag inline-block">🐾</span>
          </h1>
          <p className="text-sm font-medium text-stone-500">Your workout buddy</p>
        </div>
        <SyncBadge />
      </header>

      <div className="space-y-4">
        {WORKOUT_TYPES.map((type) => {
          const meta = TYPE_META[type];
          const isOpen = open.has(type);
          const session = sessionFor(type);
          const exerciseCount = session.exercises.filter((e) => e.name.trim()).length;
          return (
            <section
              key={type}
              className="overflow-hidden rounded-xl2 border-2 border-peach-100 bg-white shadow-sm"
            >
              <button
                onClick={() => toggle(type)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-peach-50"
              >
                <span className="text-3xl">{meta.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-extrabold text-stone-800">
                    {meta.label}
                  </span>
                  <span className="block text-xs font-medium text-stone-400">
                    {exerciseCount > 0
                      ? `${exerciseCount} exercise${exerciseCount === 1 ? "" : "s"} · tap to ${isOpen ? "close" : "edit"}`
                      : meta.blurb}
                  </span>
                </span>
                <span
                  className={`text-xl text-peach-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                >
                  ⌄
                </span>
              </button>

              {isOpen && (
                <div className="border-t-2 border-peach-50 bg-cream/40 p-4">
                  <StrengthSheet session={session} onChange={saveSession} />
                </div>
              )}
            </section>
          );
        })}
      </div>

      <DogCheer seed={3} className="mt-6 justify-center" />

      {ready && (
        <p className="mt-3 text-center text-xs text-stone-400">
          Auto-saved as you go — nothing gets lost. 🐾
        </p>
      )}
    </main>
  );
}
