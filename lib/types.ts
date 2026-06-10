export type WorkoutType = "upper" | "lower";

export const WORKOUT_TYPES: WorkoutType[] = ["upper", "lower"];

export const TYPE_META: Record<
  WorkoutType,
  { label: string; emoji: string; blurb: string }
> = {
  upper: {
    label: "Upper Body",
    emoji: "💪",
    blurb: "Push, pull, press. Build that strength.",
  },
  lower: {
    label: "Lower Body",
    emoji: "🦵",
    blurb: "Legs day! Squat, hinge, lunge.",
  },
};

// Stable id per workout type: exactly one persistent record each, so every
// device syncs to the same row instead of creating duplicates.
export const FIXED_ID: Record<WorkoutType, string> = {
  upper: "a0000000-0000-4000-8000-000000000001",
  lower: "a0000000-0000-4000-8000-000000000002",
};

export interface SetEntry {
  id: string;
  reps: number | null;
  weightKg: number | null; // canonical kg; lbs derived for display
}

export interface ExerciseEntry {
  id: string;
  name: string;
  sets: SetEntry[];
}

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD (last touched) — kept for the cloud row, not shown
  type: WorkoutType;
  exercises: ExerciseEntry[];
  updatedAt: number; // epoch ms, for newest-wins merge
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function emptySession(type: WorkoutType): Session {
  return {
    id: FIXED_ID[type],
    date: todayISO(),
    type,
    exercises: [
      { id: newId(), name: "", sets: [{ id: newId(), reps: null, weightKg: null }] },
    ],
    updatedAt: Date.now(),
  };
}
