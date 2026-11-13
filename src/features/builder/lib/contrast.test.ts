import { describe, expect, it } from "vitest";

import { getContrastRatio, isContrastAcceptable } from "./contrast";

describe("contrast", () => {
  it("detects strong contrast pairs", () => {
    expect(getContrastRatio("#ffffff", "#000000")).toBeGreaterThan(20);
    expect(getContrastRatio("#000000", "#ffffff")).toBeGreaterThan(20);
  });

  it("flags weak contrast pairs", () => {
    expect(isContrastAcceptable("#777777", "#ffffff")).toBe(false);
    expect(isContrastAcceptable("#ffffff", "#777777")).toBe(false);
  });
});
