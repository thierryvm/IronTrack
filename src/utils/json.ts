/**
 * Safe JSON utilities to avoid invalid Unicode in request bodies
 * - Replaces unpaired surrogate code units with U+FFFD
 * - Works recursively across arrays and plain objects
 */

// Regex to find lone high or low surrogates
const LONE_SURROGATE_REGEX = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g

export function sanitizeStringUnicode(input: string): string {
  // Replace lone surrogates with replacement char
  return input.replace(LONE_SURROGATE_REGEX, '\uFFFD')
}

export function sanitizeForJSON<T = unknown>(value: T): T {
  if (value == null) return value

  if (typeof value === 'string') {
    return sanitizeStringUnicode(value) as unknown as T
  }

  if (Array.isArray(value)) {
    return (value.map((v) => sanitizeForJSON(v)) as unknown) as T
  }

  if (typeof value === 'object') {
    // Avoid Date/Blob/File special objects by shallow copying only plain objects
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Keys are inherently safe in JS, but sanitize anyway
      const safeKey = sanitizeStringUnicode(k)
      out[safeKey] = sanitizeForJSON(v)
    }
    return out as T
  }

  return value
}

export function safeJSONStringify(value: unknown, space?: number): string {
  const sanitized = sanitizeForJSON(value)
  return JSON.stringify(sanitized, undefined, space)
}
