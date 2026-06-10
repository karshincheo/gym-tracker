// Unit conversion helpers. Canonical storage: weight in kg. Pounds are derived
// for display so the two unit columns can never disagree.

const LBS_PER_KG = 2.2046226218;

export function kgToLbs(kg: number): number {
  return kg * LBS_PER_KG;
}
export function lbsToKg(lbs: number): number {
  return lbs / LBS_PER_KG;
}

// Round to a sensible number of decimals for display without float noise.
export function round(n: number, decimals = 1): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
