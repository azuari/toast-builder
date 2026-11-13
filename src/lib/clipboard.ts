/**
 * Copies text to the clipboard. `navigator.clipboard` only exists in secure contexts (HTTPS or localhost),
 * so on plain http://192.168.x.x it is undefined; fall back to a hidden textarea and `execCommand("copy")`.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or document not focused: try the fallback below.
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";

  const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  document.body.appendChild(textarea);

  try {
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return typeof document.execCommand === "function" && document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
    previouslyFocused?.focus();
  }
}
