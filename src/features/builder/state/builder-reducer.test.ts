import { describe, expect, it } from "vitest";

import { builderReducer, getInitialBuilderState } from "./builder-reducer";

describe("builderReducer", () => {
  it("updates type defaults when the field has not been customized", () => {
    let state = getInitialBuilderState("success");
    state = builderReducer(state, { type: "SET_TYPE", value: "error" });

    expect(state.type).toBe("error");
    expect(state.title).toBe("Error");
    expect(state.backgroundColor).toBe("#ef4444");
  });

  it("preserves a custom title when the type changes", () => {
    let state = getInitialBuilderState("success");
    state = builderReducer(state, { type: "UPDATE_TITLE", value: "My custom message" });
    state = builderReducer(state, { type: "SET_TYPE", value: "warning" });

    expect(state.title).toBe("My custom message");
    expect(state.type).toBe("warning");
  });
});
