"use client";

import DualUnitInput from "./DualUnitInput";
import { kgToLbs, lbsToKg } from "@/lib/units";
import {
  ExerciseEntry,
  newId,
  Session,
  SetEntry,
} from "@/lib/types";

// Shared 5-column grid: set# | reps | kg | lbs | remove. Used for both the
// header labels and each set row so columns line up.
const ROW = "grid grid-cols-[1.6rem_1fr_1fr_1fr_1.1rem] items-center gap-1.5";

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
    <div className="space-y-3">
      {exercises.map((ex, exIdx) => (
        <div
          key={ex.id}
          className="rounded-xl2 border-2 border-peach-100 bg-white p-3 shadow-sm"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base">🏋️</span>
            <input
              type="text"
              value={ex.name}
              placeholder={`Exercise ${exIdx + 1} (e.g. Bench Press)`}
              onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
              className="min-w-0 flex-1 rounded-lg border-2 border-transparent bg-peach-50 px-2.5 py-1.5 text-sm font-bold text-stone-700 outline-none focus:border-peach-300"
            />
            {exercises.length > 1 && (
              <button
                onClick={() => removeExercise(ex.id)}
                aria-label="Remove exercise"
                className="shrink-0 rounded-lg px-1.5 text-base text-stone-400 hover:bg-red-50 hover:text-red-500"
              >
                ✕
              </button>
            )}
          </div>

          <div className={`${ROW} mb-1 px-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-400`}>
            <span />
            <span className="text-center">Reps</span>
            <span className="text-center">kg</span>
            <span className="text-center">lbs</span>
            <span />
          </div>

          <div className="space-y-1.5">
            {ex.sets.map((set, setIdx) => (
              <div key={set.id} className={ROW}>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-peach-100 text-xs font-bold text-peach-600">
                  {setIdx + 1}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={set.reps ?? ""}
                  placeholder="0"
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    const n = v === "" ? null : Math.max(0, Math.floor(Number(v)));
                    updateSet(ex.id, set.id, {
                      reps: v === "" || isNaN(Number(v)) ? null : n,
                    });
                  }}
                  className="w-full min-w-0 rounded-lg border-2 border-peach-100 bg-white px-1.5 py-1.5 text-center text-sm font-semibold text-stone-700 outline-none focus:border-peach-400 focus:ring-1 focus:ring-peach-200"
                />
                <DualUnitInput
                  canonical={set.weightKg}
                  onChange={(kg) => updateSet(ex.id, set.id, { weightKg: kg })}
                  toSecondary={kgToLbs}
                  fromSecondary={lbsToKg}
                />
                {ex.sets.length > 1 ? (
                  <button
                    onClick={() => removeSet(ex.id, set.id)}
                    aria-label="Remove set"
                    className="text-stone-300 hover:text-red-500"
                  >
                    ✕
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => addSet(ex.id)}
            className="mt-2 w-full rounded-lg border-2 border-dashed border-peach-200 py-1.5 text-xs font-bold text-peach-500 transition hover:bg-peach-50"
          >
            + Add set
          </button>
        </div>
      ))}

      <button
        onClick={addExercise}
        className="w-full rounded-xl2 bg-peach-500 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-peach-600 active:scale-[0.99]"
      >
        + Add exercise 🐾
      </button>
    </div>
  );
}
