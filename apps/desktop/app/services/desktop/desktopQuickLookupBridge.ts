type VocOrbitDesktopWindow = Window & {
  __VOCORBIT_DESKTOP_SHELL__?: boolean
  __VOCORBIT_DESKTOP_BRIDGE__?: boolean
  __VOCORBIT_INVOKE__?: (command: string, args?: unknown) => Promise<unknown>
  __TAURI_INTERNALS__?: {
    invoke?: (command: string, args?: unknown) => Promise<unknown>
  }
  __TAURI__?: {
    core?: {
      invoke?: (command: string, args?: unknown) => Promise<unknown>
    }
  }
  isTauri?: boolean
}

const DESKTOP_QUICK_LOOKUP_TEXT_QUERY_KEY = "desktopQuickLookupText"
const DESKTOP_SHELL_QUERY_KEY = "desktopShell"
const DESKTOP_SHELL_QUERY_VALUE = "tauri"
const DESKTOP_RUNTIME_SESSION_KEY = "vocorbit.desktopShellRuntime"

function getWindowRef(): VocOrbitDesktopWindow | undefined {
  if (typeof window === "undefined") return undefined
  return window as VocOrbitDesktopWindow
}

function normalizePathname(pathname?: string | null): string {
  const normalized = (pathname ?? "").trim().replace(/^\/+|\/+$/g, "")
  return normalized.toLocaleLowerCase("en-US")
}

function hasDesktopRuntimeSessionFlag(currentWindow: VocOrbitDesktopWindow | undefined): boolean {
  try {
    return currentWindow?.sessionStorage?.getItem(DESKTOP_RUNTIME_SESSION_KEY) === DESKTOP_SHELL_QUERY_VALUE
  } catch {
    return false
  }
}

function hasDesktopRuntimeQueryFlag(currentWindow: VocOrbitDesktopWindow | undefined): boolean {
  try {
    const value = new URLSearchParams(currentWindow?.location.search ?? "").get(DESKTOP_SHELL_QUERY_KEY)
    return value === DESKTOP_SHELL_QUERY_VALUE
  } catch {
    return false
  }
}

export function isDesktopShellRuntime(): boolean {
  const currentWindow = getWindowRef()

  return Boolean(
    currentWindow?.__VOCORBIT_DESKTOP_SHELL__ ||
      currentWindow?.__VOCORBIT_DESKTOP_BRIDGE__ ||
      currentWindow?.isTauri ||
      currentWindow?.__TAURI_INTERNALS__ ||
      currentWindow?.__TAURI__?.core?.invoke ||
      hasDesktopRuntimeSessionFlag(currentWindow) ||
      hasDesktopRuntimeQueryFlag(currentWindow),
  )
}

export function isDesktopQuickLookupPage(): boolean {
  return normalizePathname(getWindowRef()?.location.pathname) === "quick-lookup"
}

export function getQuickLookupInitialText(): string {
  const currentWindow = getWindowRef()
  if (!currentWindow) return ""

  const value = new URLSearchParams(currentWindow.location.search).get(
    DESKTOP_QUICK_LOOKUP_TEXT_QUERY_KEY,
  )
  return (value ?? "").replace(/\s+/g, " ").trim()
}

export async function invokeDesktopCommand<T = unknown>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T | undefined> {
  const currentWindow = getWindowRef()
  const invoke =
    currentWindow?.__VOCORBIT_INVOKE__ ??
    currentWindow?.__TAURI__?.core?.invoke ??
    currentWindow?.__TAURI_INTERNALS__?.invoke

  if (typeof invoke !== "function") return undefined

  return (await invoke(command, args)) as T
}

export async function focusMainVocOrbit(path?: string): Promise<void> {
  const normalizedPath = path?.trim()
  await invokeDesktopCommand("focus_main_window", {
    path: normalizedPath && normalizedPath.length > 0 ? normalizedPath : null,
  })
}

export async function closeQuickLookupWindow(): Promise<void> {
  const closed = await invokeDesktopCommand("close_quick_lookup_window")
  if (closed !== undefined) return

  if (typeof window !== "undefined") {
    window.close()
  }
}
