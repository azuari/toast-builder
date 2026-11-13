import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS_BY_TYPE } from "@/features/toast/constants";

import { getJsonExport, getTypeScriptExport, getUsageExport } from "./code-export";

describe("code-export", () => {
  it("exports JSON, TypeScript and usage snippets", () => {
    const options = {
      ...DEFAULT_OPTIONS_BY_TYPE.info,
      title: "Custom toast",
      message: "A toast with a message",
      duration: 4000,
      position: "bottom-right" as const,
    };

    expect(getJsonExport(options)).toContain('"title": "Custom toast"');
    expect(getTypeScriptExport(options)).toContain("const notify: ToastOptions = {");
    expect(getUsageExport(options)).toContain('toast.success("Custom toast"');
    expect(getUsageExport(options)).toContain("description");
  });

  it("omits default values from the usage snippet", () => {
    const options = {
      ...DEFAULT_OPTIONS_BY_TYPE.info,
      title: "Info",
      message: "",
      duration: 3000,
      position: "top-right" as const,
    };

    const usage = getUsageExport(options);
    expect(usage).not.toContain("duration");
    expect(usage).not.toContain("position");
    expect(usage).not.toContain("description");
  });
});
