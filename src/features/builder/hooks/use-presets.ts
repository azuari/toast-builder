"use client";

import { useSyncExternalStore } from "react";

import { readStorage, writeStorage } from "@/lib/storage";
import { presetsSchema } from "@/features/toast/schemas";
import type { Preset, ToastOptions } from "@/features/toast/types";

const STORAGE_KEY = "toast-builder:presets:v1";
const presetListeners = new Set<() => void>();
let presetCache: Preset[] | null = null;
let presetCacheRaw: string | null | undefined;

function getStoredPresetsRaw() {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getPresetsSnapshot(): Preset[] {
  const raw = getStoredPresetsRaw();
  if (presetCache === null || raw !== presetCacheRaw) {
    presetCacheRaw = raw;
    presetCache = readStorage(STORAGE_KEY, presetsSchema) ?? [];
  }

  return presetCache;
}

export function savePresets(presets: Preset[]) {
  presetCache = presets;
  writeStorage(STORAGE_KEY, presets);
  presetCacheRaw = getStoredPresetsRaw();

  for (const listener of [...presetListeners]) {
    listener();
  }
}

export function addOrReplacePreset(
  presets: Preset[],
  input: { name: string; options: ToastOptions },
) {
  const trimmed = input.name.trim();
  const lower = trimmed.toLowerCase();

  const existingIndex = presets.findIndex((preset) => preset.name.toLowerCase() === lower);
  const existingPreset = presets[existingIndex];

  if (existingPreset) {
    const next = [...presets];
    next[existingIndex] = {
      ...existingPreset,
      name: trimmed,
      options: input.options,
      createdAt: new Date().toISOString(),
    };
    return { presets: next, didOverwrite: true };
  }

  return {
    presets: [...presets, { id: crypto.randomUUID(), name: trimmed, options: input.options, createdAt: new Date().toISOString() }],
    didOverwrite: false,
  };
}

export function usePresets() {
  return useSyncExternalStore(
    (listener) => {
      presetListeners.add(listener);

      const handleStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY || event.key === null) {
          presetCache = null;
          getPresetsSnapshot();
          listener();
        }
      };

      window.addEventListener("storage", handleStorage);
      return () => {
        presetListeners.delete(listener);
        window.removeEventListener("storage", handleStorage);
      };
    },
    getPresetsSnapshot,
    getPresetsSnapshot,
  );
}
