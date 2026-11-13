import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS_BY_TYPE } from "@/features/toast/constants";

import { builderReducer, getInitialBuilderState, toToastOptions } from "./builder-reducer";

describe("builderReducer", () => {
  it("starts with a duration in seconds, not milliseconds", () => {
    expect(getInitialBuilderState("success").duration).toBe(3);
  });

  it("updates the background colour when the type changes, but never the title or message", () => {
    let state = getInitialBuilderState("success");
    state = builderReducer(state, { type: "UPDATE_TITLE", value: "My custom title" });
    state = builderReducer(state, { type: "UPDATE_MESSAGE", value: "My message" });

    const colours = { error: "#ef4444", warning: "#f59e0b", info: "#3b82f6", success: "#22c55e" } as const;
    for (const [type, colour] of Object.entries(colours)) {
      state = builderReducer(state, { type: "SET_TYPE", value: type as keyof typeof colours });
      expect(state.type).toBe(type);
      expect(state.backgroundColor).toBe(colour);
      expect(state.title).toBe("My custom title");
      expect(state.message).toBe("My message");
    }
  });

  it("overrides a custom background colour when the type changes", () => {
    let state = getInitialBuilderState("success");
    state = builderReducer(state, { type: "UPDATE_BACKGROUND_COLOR", value: "#123456" });
    state = builderReducer(state, { type: "SET_TYPE", value: "error" });

    expect(state.backgroundColor).toBe("#ef4444");
  });

  it("exports duration 0 when persistent and restores the previous value when unchecked", () => {
    let state = getInitialBuilderState("success");
    state = builderReducer(state, { type: "UPDATE_DURATION", value: 7 });
    expect(toToastOptions(state).duration).toBe(7000);

    state = builderReducer(state, { type: "SET_PERSISTENT", value: true });
    expect(toToastOptions(state).duration).toBe(0);
    expect(state.duration).toBe(7);

    state = builderReducer(state, { type: "SET_PERSISTENT", value: false });
    expect(toToastOptions(state).duration).toBe(7000);
  });

  it("loads a preset, keeping the slider value when the preset is persistent (duration 0)", () => {
    let state = getInitialBuilderState("success");
    state = builderReducer(state, { type: "UPDATE_DURATION", value: 6 });

    state = builderReducer(state, {
      type: "LOAD",
      options: { ...DEFAULT_OPTIONS_BY_TYPE.warning, title: "Loaded", persistent: true, duration: 0 },
    });

    expect(state.type).toBe("warning");
    expect(state.title).toBe("Loaded");
    expect(state.persistent).toBe(true);
    expect(state.duration).toBe(6);
  });

  it("resets everything to the defaults", () => {
    let state = getInitialBuilderState("success");
    state = builderReducer(state, { type: "SET_TYPE", value: "error" });
    state = builderReducer(state, { type: "UPDATE_TITLE", value: "Changed" });
    state = builderReducer(state, { type: "RESET" });

    expect(state).toEqual(getInitialBuilderState("success"));
  });
});
