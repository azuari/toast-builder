export function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "").trim();
  const safeHex = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;

  if (!/^([A-Fa-f0-9]{6})$/.test(safeHex)) {
    return { r: 0, g: 0, b: 0 };
  }

  const value = Number.parseInt(safeHex, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  const rLinear = channels[0] ?? 0;
  const gLinear = channels[1] ?? 0;
  const bLinear = channels[2] ?? 0;

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

export function getContrastRatio(foreground: string, background: string) {
  const lum1 = relativeLuminance(foreground);
  const lum2 = relativeLuminance(background);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isContrastAcceptable(foreground: string, background: string) {
  return getContrastRatio(foreground, background) >= 4.5;
}
