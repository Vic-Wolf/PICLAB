/** Shared escaping helpers for rendering user-controlled text in HTML template strings. */
export function escapeHtml(value = "") {
  return String(value).replace(/[&<>\"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[ch]);
}

export function clampNumber(value, fallback, min, max, integer = false) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const bounded = Math.min(max, Math.max(min, n));
  return integer ? Math.round(bounded) : bounded;
}
