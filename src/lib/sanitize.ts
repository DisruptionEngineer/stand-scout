// ---- Primitive sanitizers ----

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

function collapseWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

export function sanitizeText(raw: string, maxLength: number): string {
  return collapseWhitespace(stripHtml(raw)).slice(0, maxLength);
}

// ---- URL validation ----

const ALLOWED_URL_SCHEMES = ['https:', 'http:'];

export function sanitizeUrl(raw: string): string | null {
  if (!raw.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (!ALLOWED_URL_SCHEMES.includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}
