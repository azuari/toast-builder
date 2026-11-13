import { afterEach, describe, expect, it, vi } from "vitest";

import { copyText } from "./clipboard";

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
});

describe("copyText", () => {
  it("uses the async clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    await expect(copyText("hello")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to execCommand when navigator.clipboard is missing (insecure origin)", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });

    await expect(copyText("hello")).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("falls back when writeText rejects, and reports failure if the fallback fails too", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    Object.defineProperty(document, "execCommand", { configurable: true, value: vi.fn().mockReturnValue(false) });

    await expect(copyText("hello")).resolves.toBe(false);
  });
});
