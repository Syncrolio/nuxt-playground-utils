function escapeRegexLiteral(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractObjectLiteral(source: string, callName: string) {
  const escapedCallName = escapeRegexLiteral(callName);
  const match = source.match(
    new RegExp(`${escapedCallName}\\s*\\(\\s*({[\\s\\S]*?})\\s*\\)`),
  );
  return match?.[1] || null;
}

export function extractStringProperty(source: string, key: string) {
  const escapedKey = escapeRegexLiteral(key);
  const match = source.match(
    new RegExp(`${escapedKey}\\s*:\\s*(['"\\x60])([\\s\\S]*?)\\1`),
  );
  return match?.[2]?.trim();
}

export function extractNumberProperty(source: string, key: string) {
  const escapedKey = escapeRegexLiteral(key);
  const match = source.match(new RegExp(`${escapedKey}\\s*:\\s*(-?\\d+)`));

  if (!match?.[1]) {
    return undefined;
  }

  return Number.parseInt(match[1], 10);
}
