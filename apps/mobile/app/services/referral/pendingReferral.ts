import * as ExpoLinking from "expo-linking"

import { loadString, remove, saveString } from "@/utils/storage"

const PENDING_REFERRAL_STORAGE_KEY = "app.referral.pendingCode"

function normalizeQueryParamValue(value: unknown): string | undefined {
  if (typeof value === "string") return value
  if (Array.isArray(value) && typeof value[0] === "string") return value[0]
  return undefined
}

export function normalizeReferralCode(value: string | undefined | null): string | undefined {
  if (typeof value !== "string") return undefined
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
  if (!normalized) return undefined
  return normalized
}

export function savePendingReferralCode(code: string): void {
  const normalized = normalizeReferralCode(code)
  if (!normalized) return
  saveString(PENDING_REFERRAL_STORAGE_KEY, normalized)
}

export function getPendingReferralCode(): string | undefined {
  const raw = loadString(PENDING_REFERRAL_STORAGE_KEY)
  return normalizeReferralCode(raw)
}

export function clearPendingReferralCode(): void {
  remove(PENDING_REFERRAL_STORAGE_KEY)
}

export function capturePendingReferralCodeFromUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined

  const parsed = ExpoLinking.parse(url)
  const queryParams = parsed.queryParams ?? {}
  const candidate =
    normalizeQueryParamValue(queryParams.ref) ??
    normalizeQueryParamValue(queryParams.referral) ??
    normalizeQueryParamValue(queryParams.referralCode)

  const normalized = normalizeReferralCode(candidate)
  if (!normalized) return undefined

  savePendingReferralCode(normalized)
  return normalized
}
