"use client";

import {
  Check,
  CircleCheck,
  CircleX,
  Copy,
  Download,
  Eye,
  Info,
  Save,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorField } from "@/components/ui/color-field";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Slider } from "@/components/ui/slider";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toToastOptions } from "@/features/builder/state/builder-reducer";
import { useBuilderState } from "@/features/builder/hooks/use-builder-state";
import { addOrReplacePreset, savePresets, usePresets } from "@/features/builder/hooks/use-presets";
import { getContrastRatio } from "@/features/builder/lib/contrast";
import { getJsonExport, getTypeScriptExport, getUsageExport } from "@/features/builder/lib/code-export";
import { TYPE_COLORS } from "@/features/toast/constants";
import { presetsSchema } from "@/features/toast/schemas";
import { toast } from "@/features/toast/toast";
import { Toast } from "@/features/toast/toast-item";
import type { ToastAnimation, ToastItem, ToastPosition, ToastType } from "@/features/toast/types";
import { cn } from "@/lib/cn";

const positionKeys: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const exportTabs = ["JSON", "TypeScript", "Usage"] as const;

const typeOrder: ToastType[] = ["success", "error", "warning", "info"];
const animationOptions: ToastAnimation[] = ["fade", "slide", "bounce"];

export function BuilderPage() {
  const [state, dispatch] = useBuilderState();
  const presets = usePresets();
  const [presetName, setPresetName] = useState("");
  const [exportTab, setExportTab] = useState<(typeof exportTabs)[number]>("JSON");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const contrastRatio = useMemo(
    () => getContrastRatio(state.textColor, state.backgroundColor),
    [state.textColor, state.backgroundColor],
  );

  const backgroundValid = /^#[0-9A-Fa-f]{6}$/.test(state.backgroundColor);
  const textColorValid = /^#[0-9A-Fa-f]{6}$/.test(state.textColor);
  const exportContent = useMemo(() => {
    const options = toToastOptions(state);
    if (exportTab === "JSON") return getJsonExport(options);
    if (exportTab === "TypeScript") return getTypeScriptExport(options);
    return getUsageExport(options);
  }, [state, exportTab]);

  const previewToast: ToastItem = useMemo(
    () => ({
      ...toToastOptions(state),
      id: "preview",
      createdAt: 0,
      remaining: state.persistent ? 0 : state.duration * 1000,
      paused: false,
      status: "visible",
      lastUpdatedAt: 0,
    }),
    [state],
  );

  const handleTypeChange = (type: ToastType) => {
    dispatch({ type: "SET_TYPE", value: type });
  };

  const handleShowNotification = () => {
    const options = toToastOptions(state);
    toast({ ...options, title: state.title || "Notification", message: state.message || "" });
  };

  const handleSavePreset = () => {
    const trimmed = presetName.trim();
    if (!trimmed) {
      toast.info("Preset name is required.");
      return;
    }

    if (trimmed.length > 40) {
      toast.info("Preset names must be 1–40 characters long.");
      return;
    }

    const duplicate = presets.find((preset) => preset.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      const shouldOverwrite = window.confirm(`A preset named "${trimmed}" already exists. Overwrite it?`);
      if (!shouldOverwrite) {
        return;
      }
    }

    const result = addOrReplacePreset(presets, { name: trimmed, options: toToastOptions(state) });
    savePresets(result.presets);
    setPresetName("");
    toast.success(result.didOverwrite ? "Preset updated." : "Preset saved.");
  };

  const handleDeletePreset = (id: string) => {
    savePresets(presets.filter((preset) => preset.id !== id));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportContent);
      setCopied(true);
      toast.success("Copied to clipboard.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info("Copy failed. Please try again.");
    }
  };

  const handleImportPreset = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as unknown;
      const result = presetsSchema.safeParse(parsed);
      if (!result.success) {
        throw new Error("Invalid preset data");
      }
      savePresets(result.data);
      toast.success("Presets imported.");
    } catch {
      toast.info("The selected file could not be imported.");
    } finally {
      event.target.value = "";
    }
  };

  const handleExportPresets = () => {
    const blob = new Blob([JSON.stringify(presets, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "toast-presets.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const contrastLabel = contrastRatio >= 4.5 ? "Passes WCAG AA" : "Contrast warning";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-600 dark:text-violet-400">Toast Builder</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Build a notification</h1>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_1.45fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-5">
              <div>
                <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Type</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-4">
                  {typeOrder.map((type) => {
                    const selected = state.type === type;
                    const palette = TYPE_COLORS[type];
                    const Icon =
                      type === "success" ? CircleCheck : type === "error" ? CircleX : type === "warning" ? TriangleAlert : Info;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTypeChange(type)}
                        className={cn(
                          "flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          selected
                            ? "border-transparent text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200",
                        )}
                        style={selected ? { backgroundColor: palette.backgroundColor, color: palette.textColor } : undefined}
                      >
                        <Icon className="h-5 w-5" />
                        {palette.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field label="Title" className="space-y-2">
                <Input
                  value={state.title}
                  maxLength={60}
                  onChange={(event) => dispatch({ type: "UPDATE_TITLE", value: event.target.value })}
                />
                <div className="text-right text-xs text-slate-500 dark:text-slate-400">{state.title.length}/60</div>
              </Field>

              <Field label="Message" className="space-y-2">
                <Textarea
                  value={state.message}
                  maxLength={200}
                  onChange={(event) => dispatch({ type: "UPDATE_MESSAGE", value: event.target.value })}
                  className="resize-y"
                />
                <div className="text-right text-xs text-slate-500 dark:text-slate-400">{state.message.length}/200</div>
              </Field>

              <Field label="Duration" className="space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Auto-dismiss</span>
                  <span className="font-medium text-violet-700 dark:text-violet-300">{state.duration}s</span>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={0.5}
                  value={state.duration}
                  onChange={(event) => dispatch({ type: "UPDATE_DURATION", value: Number(event.target.value) })}
                  disabled={state.persistent}
                  className={cn(state.persistent && "cursor-not-allowed opacity-50")}
                />
              </Field>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-950">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Persistent (no auto-dismiss)</span>
                <Checkbox
                  checked={state.persistent}
                  onChange={(event) => dispatch({ type: "SET_PERSISTENT", value: event.target.checked })}
                />
              </label>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Position</p>
                <div className="grid grid-cols-3 gap-2">
                  {positionKeys.map((position) => {
                    const selected = state.position === position;
                    return (
                      <button
                        key={position}
                        type="button"
                        aria-label={position.replace("-", " ")}
                        onClick={() => dispatch({ type: "SET_POSITION", value: position })}
                        className={cn(
                          "h-10 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          selected
                            ? "border-violet-500 bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200"
                            : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200",
                        )}
                      >
                        {position
                          .split("-")
                          .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1, 2))
                          .join("")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Style</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{contrastLabel}</span>
                </div>

                <ColorField
                  id="background-color"
                  label="Background"
                  value={state.backgroundColor}
                  invalid={!backgroundValid}
                  onChange={(value) => dispatch({ type: "UPDATE_BACKGROUND_COLOR", value })}
                  hint={backgroundValid ? "" : "Use a valid #RRGGBB value."}
                />

                <ColorField
                  id="text-color"
                  label="Text color"
                  value={state.textColor}
                  invalid={!textColorValid}
                  onChange={(value) => dispatch({ type: "UPDATE_TEXT_COLOR", value })}
                  hint={textColorValid ? "" : "Use a valid #RRGGBB value."}
                />

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Contrast ratio: <strong>{contrastRatio.toFixed(2)}:1</strong>
                  {!Number.isFinite(contrastRatio) || contrastRatio < 4.5 ? (
                    <span className="ml-2 text-red-600 dark:text-red-400">WCAG AA requirement not met.</span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Options</p>
                <div className="space-y-2">
                  <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-950">
                    <span className="text-sm text-slate-700 dark:text-slate-200">Show Icon</span>
                    <Checkbox
                      checked={state.showIcon}
                      onChange={(event) => dispatch({ type: "SET_SHOW_ICON", value: event.target.checked })}
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-950">
                    <span className="text-sm text-slate-700 dark:text-slate-200">Show Close Button</span>
                    <Checkbox
                      checked={state.showCloseButton}
                      onChange={(event) => dispatch({ type: "SET_SHOW_CLOSE_BUTTON", value: event.target.checked })}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Animation</p>
                <SegmentedControl
                  value={state.animation}
                  onChange={(value) => dispatch({ type: "SET_ANIMATION", value: value as ToastAnimation })}
                  options={animationOptions}
                />
              </div>

              <Button variant="outline" className="w-full" onClick={() => dispatch({ type: "RESET" })}>
                Reset to defaults
              </Button>
            </div>
          </aside>

          <main className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <Eye className="h-4 w-4" />
                  Preview
                </div>
              </div>

              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex min-h-52 items-center justify-center">
                  <div className="w-full max-w-sm">
                    <Toast toast={previewToast} isPreview />
                  </div>
                </div>
              </div>

              <Button className="mt-4 w-full" onClick={handleShowNotification}>
                Show Notification
              </Button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Saved Presets</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportPresets}>
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>

              <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportPreset} />

              {presets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No saved presets yet. Save the current design to keep it handy.
                </div>
              ) : (
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({ type: "RESET" });
                          dispatch({ type: "SET_TYPE", value: preset.options.type });
                          dispatch({ type: "UPDATE_TITLE", value: preset.options.title });
                          dispatch({ type: "UPDATE_MESSAGE", value: preset.options.message });
                          dispatch({ type: "UPDATE_DURATION", value: preset.options.duration / 1000 });
                          dispatch({ type: "SET_PERSISTENT", value: preset.options.persistent });
                          dispatch({ type: "SET_POSITION", value: preset.options.position });
                          dispatch({ type: "UPDATE_BACKGROUND_COLOR", value: preset.options.backgroundColor });
                          dispatch({ type: "UPDATE_TEXT_COLOR", value: preset.options.textColor });
                          dispatch({ type: "SET_SHOW_ICON", value: preset.options.showIcon });
                          dispatch({ type: "SET_SHOW_CLOSE_BUTTON", value: preset.options.showCloseButton });
                          dispatch({ type: "SET_ANIMATION", value: preset.options.animation });
                        }}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: TYPE_COLORS[preset.options.type].backgroundColor }}
                        />
                        <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{preset.name}</span>
                      </button>

                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${preset.name}`}
                        onClick={() => handleDeletePreset(preset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Input
                  value={presetName}
                  onChange={(event) => setPresetName(event.target.value)}
                  placeholder="Preset name…"
                  maxLength={40}
                />
                <Button onClick={handleSavePreset}>
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Code Export</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="bg-slate-900 text-slate-50 hover:bg-slate-800">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <Tabs tabs={[...exportTabs]} value={exportTab} onChange={(tab) => setExportTab(tab as (typeof exportTabs)[number])} />

              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
                <code>{exportContent}</code>
              </pre>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
