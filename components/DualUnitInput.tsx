"use client";

import { useEffect, useRef, useState } from "react";
import { round } from "@/lib/units";

interface Props {
  canonical: number | null; // stored value (e.g. kg)
  onChange: (canonical: number | null) => void;
  toSecondary: (c: number) => number; // e.g. kgToLbs
  fromSecondary: (s: number) => number; // e.g. lbsToKg
  primaryLabel: string; // "kg"
  secondaryLabel: string; // "lbs"
  primaryDecimals?: number;
  secondaryDecimals?: number;
  placeholder?: string;
}

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

export default function DualUnitInput({
  canonical,
  onChange,
  toSecondary,
  fromSecondary,
  primaryLabel,
  secondaryLabel,
  primaryDecimals = 1,
  secondaryDecimals = 1,
  placeholder = "0",
}: Props) {
  const [primaryText, setPrimaryText] = useState(() => fmt(canonical, primaryDecimals));
  const [secondaryText, setSecondaryText] = useState(() =>
    canonical == null ? "" : fmt(toSecondary(canonical), secondaryDecimals)
  );

  // Track the canonical value we ourselves last emitted. When the incoming
  // `canonical` matches it, the change is just our own echo coming back through
  // props — ignore it so we never clobber what the user is typing. Only a
  // genuinely external change (e.g. cloud merge) re-syncs the visible fields.
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
    <div className="flex gap-2">
      <UnitField
        value={primaryText}
        label={primaryLabel}
        placeholder={placeholder}
        onChange={onPrimary}
      />
      <UnitField
        value={secondaryText}
        label={secondaryLabel}
        placeholder={placeholder}
        onChange={onSecondary}
      />
    </div>
  );
}

function UnitField({
  value,
  label,
  placeholder,
  onChange,
}: {
  value: string;
  label: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-2 border-peach-100 bg-white px-3 py-3 pr-10 text-base font-semibold text-stone-700 outline-none transition focus:border-peach-400 focus:ring-2 focus:ring-peach-200"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wide text-peach-400">
        {label}
      </span>
    </div>
  );
}
