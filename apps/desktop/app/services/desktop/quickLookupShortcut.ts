import { invokeDesktopCommand, isDesktopShellRuntime } from "@/services/desktop/desktopQuickLookupBridge"

export const DEFAULT_QUICK_LOOKUP_SHORTCUT = "CommandOrControl+Shift+L"

const MODIFIER_KEYS = new Set(["Meta", "Control", "Shift", "Alt"])

function normalizeBaseKeyFromCode(code: string): string | undefined {
  if (/^Key[A-Z]$/i.test(code)) return code.slice(3).toUpperCase()
  if (/^Digit[0-9]$/.test(code)) return code.slice(5)
  if (/^F([1-9]|1[0-2])$/.test(code)) return code.toUpperCase()

  switch (code) {
    case "Space":
      return "Space"
    case "Enter":
      return "Enter"
    case "Tab":
      return "Tab"
    case "Backspace":
      return "Backspace"
    case "Delete":
      return "Delete"
    case "Escape":
      return "Escape"
    case "ArrowUp":
      return "Up"
    case "ArrowDown":
      return "Down"
    case "ArrowLeft":
      return "Left"
    case "ArrowRight":
      return "Right"
    default:
      return undefined
  }
}

export function formatQuickLookupShortcut(shortcut: string | undefined): string {
  const normalized = shortcut?.trim() || DEFAULT_QUICK_LOOKUP_SHORTCUT

  return normalized
    .split("+")
    .filter(Boolean)
    .map((part) => {
      switch (part) {
        case "CommandOrControl":
          return "Cmd/Ctrl"
        case "Command":
          return "Cmd"
        case "Control":
          return "Ctrl"
        case "Alt":
          return "Alt"
        case "Shift":
          return "Shift"
        case "Space":
          return "Space"
        case "Escape":
          return "Esc"
        default:
          return part
      }
    })
    .join(" + ")
}

export function buildQuickLookupShortcutFromKeyboardEvent(
  event: KeyboardEvent,
): string | undefined {
  if (MODIFIER_KEYS.has(event.key)) return undefined

  const baseKey =
    normalizeBaseKeyFromCode(event.code) ??
    (event.key.length === 1 ? event.key.toUpperCase() : undefined)

  if (!baseKey) return undefined

  const parts: string[] = []

  if (event.metaKey || event.ctrlKey) {
    parts.push("CommandOrControl")
  }

  if (event.altKey) {
    parts.push("Alt")
  }

  if (event.shiftKey) {
    parts.push("Shift")
  }

  if (parts.length === 0) return undefined

  parts.push(baseKey)
  return parts.join("+")
}

export async function getQuickLookupShortcut(): Promise<string> {
  if (!isDesktopShellRuntime()) return DEFAULT_QUICK_LOOKUP_SHORTCUT

  const value = await invokeDesktopCommand<string>("get_quick_lookup_shortcut")
  return value?.trim() || DEFAULT_QUICK_LOOKUP_SHORTCUT
}

export async function setQuickLookupShortcut(shortcut: string): Promise<string> {
  const normalized = shortcut.trim()
  if (!normalized) {
    return DEFAULT_QUICK_LOOKUP_SHORTCUT
  }

  if (!isDesktopShellRuntime()) {
    return normalized
  }

  const saved = await invokeDesktopCommand<string>("set_quick_lookup_shortcut", {
    shortcut: normalized,
  })

  return saved?.trim() || normalized
}
