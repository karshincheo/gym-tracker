"use client";

import DualUnitInput from "./DualUnitInput";
import { kgToLbs, lbsToKg } from "@/lib/units";
import {
  ExerciseEntry,
  newId,
  Session,
  SetEntry,
} from "@/lib/types";

export default function StrengthSheet({
  session,
  onChange,
}: {
  session: Session;
  onChange: (s: Session) => void;
}) {
  const exercises = session.exercises ?? [];

  function commit(next: ExerciseEntry[]) {
    onChange({ ...session, exercises: next });
  }

  function updateExercise(exId: string, patch: Partial<ExerciseEntry>) {
    commit(exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)));
  }

  function updateSet(exId: string, setId: string, patch: Partial<SetEntry>) {
    commit(
      exercises.map((e) =>
        e.id === exId
          ? {
              ...e,
              sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
            }
          : e
      )
    );
  }

  function addSet(exId: string) {
    commit(
      exercises.map((e) =>
        e.id === exId
          ? { ...e, sets: [...e.sets, { id: newId(), reps: null, weightKg: null }] }
          : e
      )
    );
  }

  function removeSet(exId: string, setId: string) {
    commit(
      exercises.map((e) =>
        e.id === exId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e
      )
    );
  }

  function addExercise() {
    commit([
      ...exercises,
      { id: newId(), name: "", sets: [{ id: newId(), reps: null, weightKg: null }] },
    ]);
  }

  function removeExercise(exId: string) {
    commit(exercises.filter((e) => e.id !== exId));
  }

  return (
    <div className="space-y-4">
      {exercises.map((ex, exIdx) => (
        <div
          key={ex.id}
          className="rounded-xl2 border-2 border-peach-100 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">🏋️</span>
            <input
              type="text"
              value={ex.name}
              placeholder={`Exercise ${exIdx + 1} (e.g. Bench Press)`}
              onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
              className="min-w-0 flex-1 rounded-lg border-2 border-transparent bg-peach-50 px-3 py-2 text-base font-bold text-stone-700 outline-none focus:border-peach-300"
            />
            {exercises.length > 1 && (
              <button
                onClick={() => removeExercise(ex.id)}
                aria-label="Remove exercise"
                className="shrink-0 rounded-lg px-2 py-1 text-lg text-stone-400 hover:bg-red-50 hover:text-red-500"
              >
                ✕
              </button>
            )}
          </div>

          <div className="mb-1 hidden grid-cols-[2.5rem_4.5rem_1fr] gap-2 px-1 text-xs font-bold uppercase tracking-wide text-stone-400 sm:grid">
            <span>Set</span>
            <span>Reps</span>
            <span>Weight</span>
          </div>

          <div className="space-y-2">
            {ex.sets.map((set, setIdx) => (
              <div
                key={set.id}
                className="grid grid-cols-[2.5rem_4.5rem_1fr_auto] items-center gap-2"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-peach-100 text-sm font-bold text-peach-600">
                  {setIdx + 1}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={set.reps ?? ""}
                  placeholder="reps"
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    const n = v === "" ? null : Math.max(0, Math.floor(Number(v)));
                    updateSet(ex.id, set.id, {
                      reps: v === "" || isNaN(Number(v)) ? null : n,
                    });
                  }}
                  className="w-full rounded-xl border-2 border-peach-100 bg-white px-2 py-3 text-center text-base font-semibold text-stone-700 outline-none focus:border-peach-400 focus:ring-2 focus:ring-peach-200"
                />
                <DualUnitInput
                  canonical={set.weightKg}
                  onChange={(kg) => updateSet(ex.id, set.id, { weightKg: kg })}
                  toSecondary={kgToLbs}
                  fromSecondary={lbsToKg}
                  primaryLabel="kg"
                  secondaryLabel="lbs"
                />
                {ex.sets.length > 1 ? (
                  <button
                    onClick={() => removeSet(ex.id, set.id)}
                    aria-label="Remove set"
                    className="grid h-9 w-7 place-items-center rounded-lg text-stone-300 hover:bg-red-50 hover:text-red-500"
                  >
                    ✕
                  </button>
                ) : (
                  <span className="w-7" />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => addSet(ex.id)}
            className="mt-3 w-full rounded-xl border-2 border-dashed border-peach-200 py-2 text-sm font-bold text-peach-500 transition hover:bg-peach-50"
          >
            + Add set
          </button>
        </div>
      ))}

      <button
        onClick={addExercise}
        className="w-full rounded-xl2 bg-peach-500 py-4 text-base font-extrabold text-white shadow-md transition hover:bg-peach-600 active:scale-[0.99]"
      >
        + Add exercise 🐾
      </button>
    </div>
  );
}
