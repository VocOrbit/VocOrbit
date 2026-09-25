/**
 * This file imports configuration objects from either the config.dev.js file
 * or the config.prod.js file depending on whether we are in __DEV__ or not.
 *
 * Note that we do not gitignore these files. Unlike on web servers, just because
 * these are not checked into your repo doesn't mean that they are secure.
 * In fact, you're shipping a JavaScript bundle with every
 * config variable in plain text. Anyone who downloads your app can easily
 * extract them.
 *
 * If you doubt this, just bundle your app, and then go look at the bundle and
 * search it for one of your config variable values. You'll find it there.
 *
 * Read more here: https://reactnative.dev/docs/security#storing-sensitive-info
 */
import Constants from "expo-constants"

import BaseConfig from "./config.base"
import DevConfig from "./config.dev"
import ProdConfig from "./config.prod"

type RuntimeConfigExtra = Partial<{
  BACKEND_API_URL: string
  BACKEND_AUTH_TEST_ID_TOKEN: string
  REFERRAL_SHARE_BASE_URL: string
  GOOGLE_WEB_CLIENT_ID: string
  GOOGLE_IOS_CLIENT_ID: string
  FIREBASE_WEB_API_KEY: string
}>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function pickRuntimeConfigValues(source: unknown): RuntimeConfigExtra {
  if (!isRecord(source)) return {}

  const config: RuntimeConfigExtra = {}
  const keys: Array<keyof RuntimeConfigExtra> = [
    "BACKEND_API_URL",
    "BACKEND_AUTH_TEST_ID_TOKEN",
    "REFERRAL_SHARE_BASE_URL",
    "GOOGLE_WEB_CLIENT_ID",
    "GOOGLE_IOS_CLIENT_ID",
    "FIREBASE_WEB_API_KEY",
  ]

  for (const key of keys) {
    const value = readNonEmptyString(source[key])
    if (value) config[key] = value
  }

  return config
}

function readRuntimeConfigFromExtra(extra: unknown): RuntimeConfigExtra {
  if (!isRecord(extra)) return {}

  const direct = pickRuntimeConfigValues(extra.vocorbit)
  if (Object.keys(direct).length > 0) return direct

  const expoClient = isRecord(extra.expoClient) ? extra.expoClient : undefined
  const expoClientExtra = expoClient && isRecord(expoClient.extra) ? expoClient.extra : undefined
  return pickRuntimeConfigValues(expoClientExtra?.vocorbit)
}

function readRuntimeConfig(): RuntimeConfigExtra {
  const constantsWithLegacyManifests = Constants as typeof Constants & {
    manifest?: { extra?: unknown }
    manifest2?: { extra?: unknown }
  }

  const candidates: unknown[] = [
    Constants.expoConfig?.extra,
    constantsWithLegacyManifests.manifest?.extra,
    constantsWithLegacyManifests.manifest2?.extra,
  ]

  for (const candidate of candidates) {
    const runtimeConfig = readRuntimeConfigFromExtra(candidate)
    if (Object.keys(runtimeConfig).length > 0) return runtimeConfig
  }

  return {}
}

let ExtraConfig = ProdConfig

if (__DEV__) {
  ExtraConfig = DevConfig
}

const RuntimeConfig = readRuntimeConfig()
const Config = { ...BaseConfig, ...ExtraConfig, ...RuntimeConfig }

export default Config
