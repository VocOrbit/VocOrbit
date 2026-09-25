import Config from "@/config"
import { loadString, saveString, storageKeys } from "@/utils/storage"

export type HomeRegionCode = "na" | "eu" | "apac"

export type HomeRegionOption = {
  code: HomeRegionCode
  title: string
  subtitle: string
  emoji: string
  baseUrl: string
}

const HOME_REGION_OPTIONS: ReadonlyArray<HomeRegionOption> = [
  {
    code: "na",
    title: "North America",
    subtitle: "Best if you are in the United States, Canada, or nearby countries",
    emoji: "🇺🇸",
    baseUrl: "https://us.vocorbit.com",
  },
  {
    code: "eu",
    title: "Europe",
    subtitle: "Best if you are in Europe or nearby countries",
    emoji: "🇪🇺",
    baseUrl: "https://eu.vocorbit.com",
  },
  {
    code: "apac",
    title: "Asia-Pacific",
    subtitle: "Best if you are in Singapore, Japan, or nearby Asia-Pacific countries",
    emoji: "🌏",
    baseUrl: "https://apac.vocorbit.com",
  },
]

function isHomeRegionCode(value: string): value is HomeRegionCode {
  return value === "na" || value === "eu" || value === "apac"
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "")
}

export function listHomeRegionOptions(): ReadonlyArray<HomeRegionOption> {
  return HOME_REGION_OPTIONS
}

export function readHomeRegionCode(): HomeRegionCode | undefined {
  const rawValue = loadString(storageKeys.homeRegion)
  if (!rawValue) return undefined

  const normalized = rawValue.trim().toLowerCase()
  if (!isHomeRegionCode(normalized)) return undefined
  return normalized
}

export function hasSelectedHomeRegion(): boolean {
  return readHomeRegionCode() !== undefined
}

export function getHomeRegionOption(code: HomeRegionCode): HomeRegionOption {
  const option = HOME_REGION_OPTIONS.find((item) => item.code === code)
  if (!option) {
    throw new Error(`Unknown home region code: ${code}`)
  }
  return option
}

export function readSelectedHomeRegion(): HomeRegionOption | undefined {
  const code = readHomeRegionCode()
  if (!code) return undefined
  return getHomeRegionOption(code)
}

export function persistHomeRegionSelection(code: HomeRegionCode): HomeRegionOption {
  const option = getHomeRegionOption(code)
  saveString(storageKeys.homeRegion, option.code)
  saveString(storageKeys.backendApiBaseUrl, option.baseUrl)
  return option
}

export function resolveBackendBaseUrl(): string {
  const persistedBaseUrl = loadString(storageKeys.backendApiBaseUrl)
  if (persistedBaseUrl?.trim()) {
    return normalizeBaseUrl(persistedBaseUrl)
  }

  const configuredBaseUrl = (Config.BACKEND_API_URL || "").trim()
  return normalizeBaseUrl(configuredBaseUrl)
}
