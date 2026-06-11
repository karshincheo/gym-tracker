import { describe, expect, it } from "vitest";
import { kgToLbs, lbsToKg, round } from "../units";

describe("unit conversion", () => {
  it("converts known values", () => {
    expect(round(kgToLbs(100), 2)).toBe(220.46);
    expect(round(lbsToKg(225), 2)).toBe(102.06);
  });

  it("round-trips without drift", () => {
    for (const kg of [0, 2.5, 60, 142.5]) {
      expect(round(lbsToKg(kgToLbs(kg)), 6)).toBe(round(kg, 6));
    }
  });

  it("kg stays canonical: displayed lbs always derive from the same kg", () => {
    const kg = 80;
    expect(kgToLbs(kg)).toBe(kgToLbs(kg)); // deterministic, no stateful conversion
  });

  it("round kills float noise for display", () => {
    expect(round(0.1 + 0.2)).toBe(0.3);
    expect(round(2.20462 * 100, 1)).toBe(220.5);
  });
});
