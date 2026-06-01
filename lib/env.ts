export function sanitizeEnvValue(value: string | undefined) {
  if (!value) return "";
  const trimmed = value.trim();
  const hasDoubleQuotes = trimmed.startsWith('"') && trimmed.endsWith('"');
  const hasSingleQuotes = trimmed.startsWith("'") && trimmed.endsWith("'");
  if (hasDoubleQuotes || hasSingleQuotes) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function requireEnvValue(name: string, value: string | undefined) {
  const sanitized = sanitizeEnvValue(value);
  if (!sanitized) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return sanitized;
}

export function optionalEnvValue(value: string | undefined) {
  const sanitized = sanitizeEnvValue(value);
  return sanitized || undefined;
}
