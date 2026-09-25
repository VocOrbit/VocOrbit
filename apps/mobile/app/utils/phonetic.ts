function readNonEmptyString(value?: string | null): string | undefined {
  const text = value?.trim()
  return text ? text : undefined
}

export function isUsablePhonetic(value?: string | null): value is string {
  const text = readNonEmptyString(value)
  if (!text || text === "-" || text === "/" || text === "//") return false

  return text.replace(/[\/\s.·-]/g, "").length > 0
}

export function resolveDisplayPhonetic(
  phonetic?: string | null,
  fallbackWord?: string | null,
): string {
  const text = readNonEmptyString(phonetic)
  if (isUsablePhonetic(text)) return text

  const word = readNonEmptyString(fallbackWord)
  return word ? `/${word}/` : "-"
}
