"use client";

import { useEffect, useRef, useState } from "react";
import { round } from "@/lib/units";

const identity = (x: number) => x;

interface Props {
  // Canonical stored value (e.g. reps, or weight in kg).
  canonical: number | null;
  onChange: (c: number | null) => void;
  // Display conversion: the stepper shows/steps in display units (e.g. lbs)
  // while storing canonical (kg). Defaults to identity.
  toDisplay?: (c: number) => number;
  fromDisplay?: (d: number) => number;
  step?: number; // amount to +/- in display units
  decimals?: number; // display precision
  min?: number;
  integer?: boolean; // round display to whole numbers (reps)
}

export default function Stepper({
  canonical,
  onChange,
  toDisplay = identity,
  fromDisplay = identity,
  step = 1,
  decimals = 0,
  min = 0,
  integer = false,
}: Props) {
  function fmt(c: number | null): string {
    if (c == null) return "";
    return String(round(toDisplay(c), decimals));
  }

  const [text, setText] = useState(() => fmt(canonical));

  // Ignore prop changes that are just our own echo; re-sync only on external ones.
  const lastEmitted = useRef<number | null>(canonical);

  useEffect(() => {
    if (canonical === lastEmitted.current) return;
    lastEmitted.current = canonical;
    setText(fmt(canonical));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canonical, decimals, toDisplay]);

  function emit(c: number | null) {
    lastEmitted.current = c;
    onChange(c);
    setText(fmt(c));
  }

  function bump(dir: 1 | -1) {
    const cur = canonical == null ? 0 : toDisplay(canonical);
    let d = cur + dir * step;
    if (d < min) d = min;
    if (integer) d = Math.round(d);
    emit(fromDisplay(d));
  }

  function onType(raw: string) {
    setText(raw);
    const t = raw.trim();
    if (t === "") {
      lastEmitted.current = null;
      onChange(null);
      return;
    }
    const n = parseFloat(t);
    if (isNaN(n) || n < 0) return; // keep what they typed, don't emit junk
    const c = fromDisplay(integer ? Math.floor(n) : n);
    lastEmitted.current = c;
    onChange(c);
  }

  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border-2 border-peach-100 bg-white">
      <button
        type="button"
        aria-label="decrease"
        onClick={() => bump(-1)}
        className="shrink-0 bg-peach-50 px-1 text-sm font-bold leading-none text-peach-500 active:bg-peach-200"
      >
        −
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        placeholder="0"
        onChange={(e) => onType(e.target.value)}
        className="w-full min-w-0 px-0.5 py-1.5 text-center text-xs font-semibold text-stone-700 outline-none"
      />
      <button
        type="button"
        aria-label="increase"
        onClick={() => bump(1)}
        className="shrink-0 bg-peach-50 px-1 text-sm font-bold leading-none text-peach-500 active:bg-peach-200"
      >
        +
      </button>
    </div>
  );
}
