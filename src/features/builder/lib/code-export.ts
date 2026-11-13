import type { ToastOptions } from "@/features/toast/types";

export function getJsonExport(options: ToastOptions) {
  return JSON.stringify(options, null, 2);
}

/**
 * The reference app's export shape: `const notify={` followed by the options as JSON.
 * `persistent` is left out because a persistent toast is already expressed as `duration: 0`.
 */
export function getNotifyExport(options: ToastOptions) {
  const { persistent, ...rest } = options;
  void persistent;
  return `const notify=${JSON.stringify(rest, null, 2)}`;
}

export function getTypeScriptExport(options: ToastOptions) {
  const lines = [
    "import type { ToastOptions } from \"@/features/toast/types\";",
    "",
    "const notify: ToastOptions = {",
    ...Object.entries(options).map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`),
    "};",
  ];

  return lines.join("\n");
}

export function getUsageExport(options: ToastOptions) {
  const extras: string[] = [];

  if (options.message) {
    extras.push(`description: ${JSON.stringify(options.message)}`);
  }

  if (options.duration !== 3000) {
    extras.push(`duration: ${options.duration}`);
  }

  if (options.position !== "top-right") {
    extras.push(`position: ${JSON.stringify(options.position)}`);
  }

  const body = extras.length > 0 ? `, {\n    ${extras.join(",\n    ")}\n  }` : "";

  return `toast.success(${JSON.stringify(options.title)}, {${body}});`;
}
