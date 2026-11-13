import { afterEach, describe, expect, it, vi } from "vitest";

import { createId } from "./id";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createId", () => {
  it("returns unique ids", () => {
    expect(createId()).not.toBe(createId());
  });

  it("still works when crypto.randomUUID is unavailable (insecure origin)", () => {
    vi.stubGlobal("crypto", { getRandomValues: globalThis.crypto.getRandomValues.bind(globalThis.crypto) });

    const id = createId();
    expect(id).toMatch(UUID_V4);
    expect(createId()).not.toBe(id);
  });

  it("falls back to a plain id when crypto is missing entirely", () => {
    vi.stubGlobal("crypto", undefined);

    expect(createId()).toMatch(/^id-/);
  });
});
