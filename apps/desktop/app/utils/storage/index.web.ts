type StorageValue = string

class WebStorage {
  private memory = new Map<string, StorageValue>()

  private get localStorage(): Storage | undefined {
    try {
      return typeof window !== "undefined" ? window.localStorage : undefined
    } catch {
      return undefined
    }
  }

  getString(key: string): string | undefined {
    const localStorage = this.localStorage
    if (localStorage) {
      const value = localStorage.getItem(key)
      return value ?? undefined
    }
    return this.memory.get(key)
  }

  set(key: string, value: StorageValue): void {
    const localStorage = this.localStorage
    if (localStorage) {
      localStorage.setItem(key, value)
      return
    }
    this.memory.set(key, value)
  }

  delete(key: string): void {
    const localStorage = this.localStorage
    if (localStorage) {
      localStorage.removeItem(key)
      return
    }
    this.memory.delete(key)
  }

  clearAll(): void {
    const localStorage = this.localStorage
    if (localStorage) {
      localStorage.clear()
      return
    }
    this.memory.clear()
  }
}

export const storage = new WebStorage()

export const storageKeys = {
  hasSeenWelcome: "app.hasSeenWelcome",
  homeRegion: "app.homeRegion",
  backendApiBaseUrl: "app.backendApiBaseUrl",
  pendingSharePayload: "app.pendingSharePayload",
} as const

export function loadString(key: string): string | null {
  try {
    return storage.getString(key) ?? null
  } catch {
    return null
  }
}

export function saveString(key: string, value: string): boolean {
  try {
    storage.set(key, value)
    return true
  } catch {
    return false
  }
}

export function load<T>(key: string): T | null {
  let almostThere: string | null = null
  try {
    almostThere = loadString(key)
    return JSON.parse(almostThere ?? "") as T
  } catch {
    return (almostThere as T) ?? null
  }
}

export function save(key: string, value: unknown): boolean {
  try {
    saveString(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function remove(key: string): void {
  try {
    storage.delete(key)
  } catch {}
}

export function clear(): void {
  try {
    storage.clearAll()
  } catch {}
}
