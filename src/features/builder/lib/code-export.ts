import type { ToastOptions } from "@/features/toast/types";

export function getJsonExport(options: ToastOptions) {
  return JSON.stringify(options, null, 2);
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
