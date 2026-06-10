"use client";

import { useEffect, useRef, useState } from "react";
import { round } from "@/lib/units";

interface Props {
  canonical: number | null; // stored value (e.g. kg)
  onChange: (canonical: number | null) => void;
  toSecondary: (c: number) => number; // e.g. kgToLbs
  fromSecondary: (s: number) => number; // e.g. lbsToKg
  primaryDecimals?: number;
  secondaryDecimals?: number;
}

const INPUT_CLASS =
  "w-full min-w-0 rounded-lg border-2 border-peach-100 bg-white px-1.5 py-1.5 text-center text-sm font-semibold text-stone-700 outline-none transition focus:border-peach-400 focus:ring-1 focus:ring-peach-200";

function fmt(n: number | null, decimals: number): string {
  if (n == null) return "";
  return String(round(n, decimals));
}

function parse(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = parseFloat(t);
  if (isNaN(n) || n < 0) return null;
  return n;
}

// Renders the kg and lbs fields as two bare inputs (via display:contents) so the
// parent grid can place them in aligned columns. Unit labels live in the column
// header, not inside the fields, so decimal values have the full width to show.
export default function DualUnitInput({
  canonical,
  onChange,
  toSecondary,
  fromSecondary,
  primaryDecimals = 1,
  secondaryDecimals = 1,
}: Props) {
  const [primaryText, setPrimaryText] = useState(() => fmt(canonical, primaryDecimals));
  const [secondaryText, setSecondaryText] = useState(() =>
    canonical == null ? "" : fmt(toSecondary(canonical), secondaryDecimals)
  );

  // Ignore prop changes that are just our own echo; only re-sync on external changes.
  const lastEmitted = useRef<number | null>(canonical);

  useEffect(() => {
    if (canonical === lastEmitted.current) return;
    lastEmitted.current = canonical;
    setPrimaryText(fmt(canonical, primaryDecimals));
    setSecondaryText(canonical == null ? "" : fmt(toSecondary(canonical), secondaryDecimals));
  }, [canonical, primaryDecimals, secondaryDecimals, toSecondary]);

  function onPrimary(raw: string) {
    setPrimaryText(raw);
    const c = parse(raw);
    lastEmitted.current = c;
    onChange(c);
    setSecondaryText(c == null ? "" : fmt(toSecondary(c), secondaryDecimals));
  }

  function onSecondary(raw: string) {
    setSecondaryText(raw);
    const s = parse(raw);
    const c = s == null ? null : fromSecondary(s);
    lastEmitted.current = c;
    onChange(c);
    setPrimaryText(c == null ? "" : fmt(c, primaryDecimals));
  }

  return (
    <div className="contents">
      <input
        type="text"
        inputMode="decimal"
        value={primaryText}
        placeholder="0"
        onChange={(e) => onPrimary(e.target.value)}
        className={INPUT_CLASS}
      />
      <input
        type="text"
        inputMode="decimal"
        value={secondaryText}
        placeholder="0"
        onChange={(e) => onSecondary(e.target.value)}
        className={INPUT_CLASS}
      />
    </div>
  );
}
