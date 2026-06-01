/** Fill a converted HTML template with a user's data. */
import type { ResumeData } from "./types";

const PLACEHOLDER_RE = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Replace every `{{KEY}}` placeholder in the template with the (HTML-escaped) value
 * from `data`. Unknown / missing keys are replaced with an empty string so the
 * resume never shows raw `{{...}}` tokens.
 */
export function fillTemplate(html: string, data: ResumeData): string {
  return html.replace(PLACEHOLDER_RE, (_match, key: string) => {
    const value = data[key];
    return value == null ? "" : escapeHtml(String(value));
  });
}
