import { beforeEach, describe, expect, it } from "vitest";

import { addOrReplacePreset, getPresetsSnapshot, savePresets } from "./use-presets";
import { DEFAULT_OPTIONS_BY_TYPE } from "@/features/toast/constants";

describe("preset storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads valid preset data", () => {
    const preset = {
      id: "preset-1",
      name: "Starter",
      options: { ...DEFAULT_OPTIONS_BY_TYPE.success, title: "Unique" },
      createdAt: new Date().toISOString(),
    };

    savePresets([preset]);
    expect(getPresetsSnapshot()).toEqual([preset]);
  });

  it("ignores corrupt localStorage data", () => {
    localStorage.setItem("toast-builder:presets:v1", "{not-valid-json");
    expect(getPresetsSnapshot()).toEqual([]);
  });

  it("replaces duplicate preset names case-insensitively", () => {
    const result = addOrReplacePreset(
      [
        {
          id: "preset-1",
          name: "Starter",
          options: { ...DEFAULT_OPTIONS_BY_TYPE.info, title: "Earlier" },
          createdAt: new Date().toISOString(),
        },
      ],
      { name: " starter ", options: { ...DEFAULT_OPTIONS_BY_TYPE.warning, title: "Updated" } },
    );

    expect(result.didOverwrite).toBe(true);
    expect(result.presets).toHaveLength(1);
    expect(result.presets[0]?.name).toBe("starter");
    expect(result.presets[0]?.options.title).toBe("Updated");
  });
});
