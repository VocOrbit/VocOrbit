type DesktopAuthProvider = "google" | "apple"

const DESKTOP_AUTH_PROVIDER_QUERY_KEY = "desktopAuthProvider"
const DESKTOP_FIREBASE_ID_TOKEN_QUERY_KEY = "desktopFirebaseIdToken"
const DESKTOP_DEEP_LINK_CALLBACK_URL = "vocorbit-desktop://auth"

function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

function hasDesktopShellGlobalFlag(): boolean {
  if (!isBrowserEnvironment()) return false
  const tauriWindow = window as Window & {
    __VOCORBIT_DESKTOP_SHELL__?: boolean
    isTauri?: boolean
    __TAURI_INTERNALS__?: unknown
  }

  return Boolean(
    tauriWindow.__VOCORBIT_DESKTOP_SHELL__ ||
      tauriWindow.isTauri ||
      tauriWindow.__TAURI_INTERNALS__,
  )
}

function getSearchParams(): URLSearchParams | undefined {
  if (!isBrowserEnvironment()) return undefined
  return new URLSearchParams(window.location.search)
}

function sanitizeDesktopAuthProvider(value: string | null): DesktopAuthProvider | null {
  if (value === "google" || value === "apple") return value
  return null
}

export function isDesktopShellRuntime(): boolean {
  return hasDesktopShellGlobalFlag()
}

export function persistDesktopShellRuntimeFromUrl(): void {
  // No-op. Tauri runtime is detected via injected globals only.
}

export function getDesktopExternalAuthProvider(): DesktopAuthProvider | null {
  return sanitizeDesktopAuthProvider(getSearchParams()?.get(DESKTOP_AUTH_PROVIDER_QUERY_KEY) ?? null)
}

export function isDesktopExternalAuthPage(): boolean {
  return !isDesktopShellRuntime() && getDesktopExternalAuthProvider() !== null
}

export function getDesktopFirebaseIdTokenFromUrl(): string | null {
  const value = getSearchParams()?.get(DESKTOP_FIREBASE_ID_TOKEN_QUERY_KEY)?.trim()
  return value ? value : null
}

export function openDesktopExternalAuth(provider: DesktopAuthProvider): void {
  if (!isBrowserEnvironment()) return

  const target = new URL("/desktop-auth", window.location.origin)
  target.searchParams.set(DESKTOP_AUTH_PROVIDER_QUERY_KEY, provider)

  window.open(target.toString(), "_blank", "noopener,noreferrer")
}

export function returnFirebaseTokenToDesktop(firebaseIdToken: string): boolean {
  if (!getDesktopExternalAuthProvider()) return false

  const callbackUrl = new URL(DESKTOP_DEEP_LINK_CALLBACK_URL)
  callbackUrl.searchParams.set(DESKTOP_FIREBASE_ID_TOKEN_QUERY_KEY, firebaseIdToken)
  window.location.replace(callbackUrl.toString())
  return true
}

export function clearDesktopAuthStateFromUrl(): void {
  if (!isBrowserEnvironment()) return

  const url = new URL(window.location.href)
  url.searchParams.delete(DESKTOP_AUTH_PROVIDER_QUERY_KEY)
  url.searchParams.delete(DESKTOP_FIREBASE_ID_TOKEN_QUERY_KEY)

  window.history.replaceState({}, document.title, url.toString())
}
