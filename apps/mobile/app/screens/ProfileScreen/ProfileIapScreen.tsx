import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import {
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  latestTransactionIOS,
  getTransactionJwsIOS,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  validateReceiptIOS,
} from "expo-iap"
import { useFocusEffect } from "@react-navigation/native"
import { decodeJwt } from "jose"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import {
  billingApi,
  type BillingSkuPlan,
  type BillingStore,
  type BillingSubscriptionState,
} from "@/services/api/billingApi"
import { authApi } from "@/services/api/authApi"
import {
  wordInsightApi,
  type WordInsightCreditBalances,
} from "@/services/api/wordInsightApi"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { openLinkInBrowser } from "@/utils/openLinkInBrowser"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type ProfileIapScreenProps = AppStackScreenProps<"ProfileIap">
type StoreProductType = "in-app" | "subs"

type StoreProduct = {
  sku: string
  title?: string
  description?: string
  displayPrice?: string
  type: StoreProductType
}

type ListenerCleanup = (() => void) | { remove: () => void } | undefined
type RestorePurchasesResult = "none" | "applied" | "not-applicable"
const APPLE_VERIFY_RETRY_COOLDOWN_MS = 15_000
const RECEIPT_VERIFY_UNAUTHORIZED_COOLDOWN_MS = 120_000
const IAP_PRODUCT_UNAVAILABLE_MESSAGE =
  "This store product is not currently available. Check the App Store Connect product setup and try again."
const IAP_PRODUCTS_UNAVAILABLE_MESSAGE =
  "Some store products could not be loaded on this device. Check the App Store Connect SKU setup."
const APPLE_TERMS_OF_USE_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
const PRIVACY_POLICY_URL = "https://www.vocorbit.com/privacy-policy"
const GOOGLE_SUBSCRIPTIONS_BASE_URL = "https://play.google.com/store/account/subscriptions"

function buildGoogleManageSubscriptionUrl(productId?: string): string {
  const normalizedProductId = readString(productId)
  if (!normalizedProductId) {
    return GOOGLE_SUBSCRIPTIONS_BASE_URL
  }

  return `${GOOGLE_SUBSCRIPTIONS_BASE_URL}?sku=${encodeURIComponent(normalizedProductId)}&package=com.vocorbit`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function parseCompactJws(value: string): [string, string, string] | undefined {
  const normalized = value.trim()
  const parts = normalized.split(".")
  if (parts.length !== 3) return undefined
  const [header, payload, signature] = parts
  if (!header || !payload || !signature) return undefined
  if (
    !/^[A-Za-z0-9_-]+$/.test(header) ||
    !/^[A-Za-z0-9_-]+$/.test(payload) ||
    !/^[A-Za-z0-9_-]+$/.test(signature)
  ) {
    return undefined
  }
  return [header, payload, signature]
}

function looksLikeCompactJws(value: string): boolean {
  return Boolean(parseCompactJws(value))
}

function isAppleSignedTransactionJws(value: string): boolean {
  const parsed = parseCompactJws(value)
  if (!parsed) return false
  const [header, payload] = parsed
  return header.startsWith("eyJ") && payload.startsWith("eyJ") && header.length > 12 && payload.length > 24
}

function parseTimestampFromClaim(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 10_000_000_000 ? value : value * 1_000
  }
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^\d+$/.test(trimmed)) {
    const numeric = Number(trimmed)
    if (Number.isFinite(numeric)) {
      return numeric > 10_000_000_000 ? numeric : numeric * 1_000
    }
  }
  const parsed = Date.parse(trimmed)
  return Number.isNaN(parsed) ? undefined : parsed
}

type AppleSignedTransactionMeta = {
  hasTransactionId: boolean
  hasProductId: boolean
  productId?: string
  purchaseMs?: number
  expiresMs?: number
}

function toIsoFromMs(ms?: number): string | undefined {
  if (!ms || !Number.isFinite(ms)) return undefined
  return new Date(ms).toISOString()
}

function parseAppleSignedTransactionMeta(value: string): AppleSignedTransactionMeta | undefined {
  try {
    const claims = decodeJwt(value) as Record<string, unknown>
    const transactionId = readString(claims.transactionId)
    const productId = readString(claims.productId)
    return {
      hasTransactionId: Boolean(transactionId),
      hasProductId: Boolean(productId),
      productId,
      purchaseMs: parseTimestampFromClaim(claims.purchaseDate),
      expiresMs: parseTimestampFromClaim(claims.expiresDate),
    }
  } catch {
    return undefined
  }
}

function isAppleSignedTransactionExpired(
  meta: AppleSignedTransactionMeta | undefined,
  nowMs: number,
): boolean | undefined {
  if (!meta?.expiresMs || !Number.isFinite(meta.expiresMs)) return undefined
  return meta.expiresMs <= nowMs
}

function resolveAppleSignedTransactionFreshness(meta: AppleSignedTransactionMeta | undefined): number {
  return Math.max(meta?.purchaseMs ?? -1, meta?.expiresMs ?? -1)
}

function resolveAppleSignedTransactionCandidate(input: {
  purchaseSignedInfo?: string
  fallbackSignedInfo?: string
  expectedSku?: string
}): { signedTransactionInfo?: string; source?: "purchase-event" | "fallback-native-query" } {
  const purchaseSignedInfo = readString(input.purchaseSignedInfo)
  const fallbackSignedInfo = readString(input.fallbackSignedInfo)
  const expectedSku = readString(input.expectedSku)

  if (purchaseSignedInfo && !fallbackSignedInfo) {
    return { signedTransactionInfo: purchaseSignedInfo, source: "purchase-event" }
  }
  if (fallbackSignedInfo && !purchaseSignedInfo) {
    return { signedTransactionInfo: fallbackSignedInfo, source: "fallback-native-query" }
  }
  if (!purchaseSignedInfo || !fallbackSignedInfo) {
    return {}
  }

  const purchaseMeta = parseAppleSignedTransactionMeta(purchaseSignedInfo)
  const fallbackMeta = parseAppleSignedTransactionMeta(fallbackSignedInfo)
  if (expectedSku) {
    const purchaseMatchesExpected = purchaseMeta?.productId === expectedSku
    const fallbackMatchesExpected = fallbackMeta?.productId === expectedSku
    if (purchaseMatchesExpected && !fallbackMatchesExpected) {
      return { signedTransactionInfo: purchaseSignedInfo, source: "purchase-event" }
    }
    if (fallbackMatchesExpected && !purchaseMatchesExpected) {
      return { signedTransactionInfo: fallbackSignedInfo, source: "fallback-native-query" }
    }
    const purchaseKnownMismatch = Boolean(purchaseMeta?.productId && purchaseMeta.productId !== expectedSku)
    const fallbackKnownMismatch = Boolean(fallbackMeta?.productId && fallbackMeta.productId !== expectedSku)
    if (purchaseKnownMismatch && !fallbackKnownMismatch) {
      return { signedTransactionInfo: fallbackSignedInfo, source: "fallback-native-query" }
    }
    if (fallbackKnownMismatch && !purchaseKnownMismatch) {
      return { signedTransactionInfo: purchaseSignedInfo, source: "purchase-event" }
    }
  }
  const purchaseLooksLikeTransaction = Boolean(
    purchaseMeta?.hasTransactionId && purchaseMeta?.hasProductId,
  )
  const fallbackLooksLikeTransaction = Boolean(
    fallbackMeta?.hasTransactionId && fallbackMeta?.hasProductId,
  )

  if (purchaseLooksLikeTransaction && !fallbackLooksLikeTransaction) {
    return { signedTransactionInfo: purchaseSignedInfo, source: "purchase-event" }
  }
  if (fallbackLooksLikeTransaction && !purchaseLooksLikeTransaction) {
    return { signedTransactionInfo: fallbackSignedInfo, source: "fallback-native-query" }
  }

  const nowMs = Date.now()
  const purchaseExpired = isAppleSignedTransactionExpired(purchaseMeta, nowMs)
  const fallbackExpired = isAppleSignedTransactionExpired(fallbackMeta, nowMs)
  if (purchaseExpired === false && fallbackExpired === true) {
    return { signedTransactionInfo: purchaseSignedInfo, source: "purchase-event" }
  }
  if (fallbackExpired === false && purchaseExpired === true) {
    return { signedTransactionInfo: fallbackSignedInfo, source: "fallback-native-query" }
  }

  const purchaseFreshness = resolveAppleSignedTransactionFreshness(purchaseMeta)
  const fallbackFreshness = resolveAppleSignedTransactionFreshness(fallbackMeta)
  if (fallbackFreshness > purchaseFreshness) {
    return { signedTransactionInfo: fallbackSignedInfo, source: "fallback-native-query" }
  }

  return { signedTransactionInfo: purchaseSignedInfo, source: "purchase-event" }
}

function extractSignedTransactionInfoFromJsonString(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed.startsWith("{")) return undefined

  try {
    const parsed = JSON.parse(trimmed)
    if (!isRecord(parsed)) return undefined

    const direct =
      readString(parsed.signedTransactionInfo) ??
      readString(parsed.signedPayload) ??
      readString(parsed.transactionJws)
    if (direct && isAppleSignedTransactionJws(direct)) {
      return direct
    }

    const nestedData = parsed.data
    if (!isRecord(nestedData)) return undefined
    const nested = readString(nestedData.signedTransactionInfo)
    if (nested && isAppleSignedTransactionJws(nested)) {
      return nested
    }
  } catch {
    return undefined
  }

  return undefined
}

function extractAppleSignedTransactionInfo(purchase: Record<string, unknown>): string | undefined {
  const candidates = [
    readString(purchase.signedTransactionInfo),
    readString(purchase.transactionJws),
    readString(purchase.purchaseToken),
    readString(purchase.signedPayload),
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    if (isAppleSignedTransactionJws(candidate)) {
      return candidate
    }

    const extracted = extractSignedTransactionInfoFromJsonString(candidate)
    if (extracted) {
      return extracted
    }
  }

  return undefined
}

function extractAppleSignedTransactionInfoFromVerifyResult(result: unknown): string | undefined {
  if (!isRecord(result)) return undefined

  const directCandidates = [
    readString(result.jwsRepresentation),
    readString(result.purchaseToken),
    readString(result.signedTransactionInfo),
    readString(result.transactionJws),
  ]

  for (const candidate of directCandidates) {
    if (candidate && isAppleSignedTransactionJws(candidate)) {
      return candidate
    }
  }

  const latestTransaction = result.latestTransaction
  if (isRecord(latestTransaction)) {
    const latestTransactionToken = extractAppleSignedTransactionInfo(latestTransaction)
    if (latestTransactionToken) {
      return latestTransactionToken
    }
  }

  return undefined
}

async function resolveAppleSignedTransactionInfo(
  purchase: Record<string, unknown>,
  sku?: string,
): Promise<string | undefined> {
  const fromPurchase = extractAppleSignedTransactionInfo(purchase)
  if (fromPurchase) {
    return fromPurchase
  }

  if (sku) {
    try {
      const verifyResult = await validateReceiptIOS({ apple: { sku } })
      const fromValidateReceipt = extractAppleSignedTransactionInfoFromVerifyResult(verifyResult)
      if (fromValidateReceipt) {
        return fromValidateReceipt
      }
    } catch (error) {
      if (__DEV__) {
        console.warn("validateReceiptIOS did not return Apple signed transaction info", error)
      }
    }

    try {
      const latestTransaction = await latestTransactionIOS(sku)
      if (latestTransaction && isRecord(latestTransaction)) {
        const fromLatest = extractAppleSignedTransactionInfo(latestTransaction)
        if (fromLatest) {
          return fromLatest
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.warn("latestTransactionIOS did not return Apple signed transaction info", error)
      }
    }

    try {
      const transactionJws = await getTransactionJwsIOS(sku)
      const candidate = readString(transactionJws)
      if (candidate && isAppleSignedTransactionJws(candidate)) {
        return candidate
      }
    } catch (error) {
      if (__DEV__) {
        console.warn("getTransactionJwsIOS did not return Apple signed transaction info", error)
      }
    }
  }

  return undefined
}

function parseStoreProduct(
  value: unknown,
  fallbackType: StoreProductType,
): StoreProduct | undefined {
  if (!isRecord(value)) return undefined

  const sku = readString(value.id) ?? readString(value.productId) ?? readString(value.sku)
  if (!sku) return undefined

  const type = readString(value.type)
  const normalizedType: StoreProductType =
    type === "in-app" || type === "subs" ? type : fallbackType

  return {
    sku,
    title: readString(value.title),
    description: readString(value.description),
    displayPrice: readString(value.displayPrice) ?? readString(value.price),
    type: normalizedType,
  }
}

function resolveProblemMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return problem.message || translate("vocabulary:iap.errors.unauthorized")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:iap.errors.cannotConnect")
  }
  if (problem.kind === "forbidden") return problem.message || translate("vocabulary:iap.errors.forbidden")
  if (problem.kind === "rejected") return problem.message || translate("vocabulary:iap.errors.generic")
  if (problem.kind === "not-found") return problem.message || translate("vocabulary:iap.errors.generic")
  if (problem.kind === "server") return problem.message || translate("vocabulary:iap.errors.generic")
  return translate("vocabulary:iap.errors.generic")
}

function resolveSubscriptionStatus(status: BillingSubscriptionState["status"]): string {
  if (status === "active") return translate("vocabulary:iap.status.active")
  if (status === "pending") return translate("vocabulary:iap.status.pending")
  if (status === "expired") return translate("vocabulary:iap.status.expired")
  if (status === "canceled") return translate("vocabulary:iap.status.canceled")
  if (status === "refunded") return translate("vocabulary:iap.status.refunded")
  return translate("vocabulary:iap.status.none")
}

function isActiveSubscriptionStatus(
  status: BillingSubscriptionState["status"] | undefined,
): boolean {
  return status === "active" || status === "pending"
}

function isPlanSwitchAttempt(input: {
  attemptedSku?: string
  currentPlanSku?: string
  subscriptionStatus?: BillingSubscriptionState["status"]
}): boolean {
  const attemptedSku = readString(input.attemptedSku)
  const currentPlanSku = readString(input.currentPlanSku)
  if (!attemptedSku || !currentPlanSku) return false
  if (attemptedSku === currentPlanSku) return false
  return isActiveSubscriptionStatus(input.subscriptionStatus)
}

function buildReceiptPayload(
  store: BillingStore,
  purchase: Record<string, unknown>,
  fallbackSku?: string,
  fallbackAppleSignedTransactionInfo?: string,
  expectedAppleSku?: string,
): string | undefined {
  const sku =
    readString(purchase.productId) ??
    readString(purchase.id) ??
    readString(purchase.transactionId) ??
    fallbackSku

  if (store === "apple") {
    const expectedSku = readString(expectedAppleSku ?? fallbackSku)
    const fallbackSignedInfo = readString(fallbackAppleSignedTransactionInfo)
    const purchaseSignedInfo = extractAppleSignedTransactionInfo(purchase)
    const selectedCandidate = resolveAppleSignedTransactionCandidate({
      purchaseSignedInfo,
      fallbackSignedInfo,
      expectedSku,
    })
    const signedTransactionInfo = selectedCandidate.signedTransactionInfo
    if (!signedTransactionInfo) {
      if (__DEV__) {
        const purchaseTokenValue = readString(purchase.purchaseToken)
        console.warn("Apple purchase payload missing signed transaction info", {
          keys: Object.keys(purchase),
          hasPurchaseToken: Boolean(purchaseTokenValue),
          purchaseTokenLooksLikeJws: Boolean(
            purchaseTokenValue && looksLikeCompactJws(purchaseTokenValue),
          ),
          purchaseTokenLooksLikeAppleTransactionJws: Boolean(
            purchaseTokenValue && isAppleSignedTransactionJws(purchaseTokenValue),
          ),
          environmentIOS: readString(purchase.environmentIOS),
          transactionReasonIOS: readString(purchase.transactionReasonIOS),
          hasFallbackSignedInfo: Boolean(fallbackSignedInfo),
        })
      }
      return undefined
    }

    const selectedMeta = parseAppleSignedTransactionMeta(signedTransactionInfo)
    if (expectedSku && selectedMeta?.productId && selectedMeta.productId !== expectedSku) {
      if (__DEV__) {
        console.warn("Apple signed transaction SKU mismatch for expected purchase", {
          expectedSku,
          selectedSku: selectedMeta.productId,
          source: selectedCandidate.source ?? "unknown",
          hasFallbackSignedInfo: Boolean(fallbackSignedInfo),
          hasPurchaseSignedInfo: Boolean(purchaseSignedInfo),
        })
      }
      return undefined
    }

    if (__DEV__) {
      console.warn("Apple signed transaction source selected", {
        source: selectedCandidate.source ?? "unknown",
        expectedSku,
        selectedSku: selectedMeta?.productId,
        hasFallbackSignedInfo: Boolean(fallbackSignedInfo),
        hasPurchaseSignedInfo: Boolean(purchaseSignedInfo),
        selectedPurchaseDate: toIsoFromMs(selectedMeta?.purchaseMs),
        selectedExpiresDate: toIsoFromMs(selectedMeta?.expiresMs),
        selectedIsExpired: Boolean(
          selectedMeta?.expiresMs && Number.isFinite(selectedMeta.expiresMs) && selectedMeta.expiresMs <= Date.now(),
        ),
      })
    }
    return JSON.stringify(
      sku
        ? {
            signedTransactionInfo,
            productId: sku,
          }
        : {
            signedTransactionInfo,
          },
    )
  }

  const purchaseToken =
    readString(purchase.purchaseToken) ?? readString(purchase.token) ?? readString(purchase.id)
  if (!purchaseToken || !sku) return undefined

  return JSON.stringify({
    sku,
    productId: sku,
    purchaseToken,
    signature: readString(purchase.signatureAndroid) ?? readString(purchase.signature),
    signedData:
      readString(purchase.dataAndroid) ??
      readString(purchase.transactionReceipt) ??
      readString(purchase.originalJson),
    packageName: readString(purchase.packageNameAndroid) ?? readString(purchase.packageName),
    orderId: readString(purchase.id) ?? readString(purchase.orderId),
    purchaseTimeMillis: purchase.transactionDate,
  })
}

function matchesExpectedPurchaseSku(
  store: BillingStore,
  purchase: unknown,
  expectedSkuInput: string,
): boolean {
  const expectedSku = readString(expectedSkuInput)
  if (!expectedSku || !isRecord(purchase)) return false

  if (store === "apple") {
    const purchaseProductId = readString(purchase.productId)
    if (purchaseProductId && purchaseProductId === expectedSku) return true
    const signedTransactionInfo = extractAppleSignedTransactionInfo(purchase)
    if (!signedTransactionInfo) return false
    const transactionMeta = parseAppleSignedTransactionMeta(signedTransactionInfo)
    return transactionMeta?.productId === expectedSku
  }

  const purchaseSku =
    readString(purchase.productId) ?? readString(purchase.sku) ?? readString(purchase.subscriptionId)
  return purchaseSku === expectedSku
}

function isAlreadyOwnedPurchaseError(error: unknown): boolean {
  if (!isRecord(error)) return false
  const normalizedCode = readString(error.code)?.toLowerCase()
  const normalizedMessage = readString(error.message)?.toLowerCase()

  return Boolean(
    normalizedCode === "already-owned" ||
      normalizedCode === "item-already-owned" ||
      normalizedCode === "e_already_owned" ||
      normalizedCode === "e_item_already_owned" ||
      normalizedMessage?.includes("already owned") ||
      normalizedMessage?.includes("already purchased"),
  )
}

function resolvePurchaseErrorMessage(error: unknown): string {
  if (!isRecord(error)) return translate("vocabulary:iap.errors.purchaseFailed")
  const code = readString(error.code)
  if (isAlreadyOwnedPurchaseError(error)) {
    return translate("vocabulary:iap.errors.alreadyOwned")
  }
  if (code === "user-cancelled" || code === "E_USER_CANCELLED") {
    return translate("vocabulary:iap.purchaseCanceled")
  }
  const message = readString(error.message)
  if (message) return message
  return translate("vocabulary:iap.errors.purchaseFailed")
}

function runListenerCleanup(cleanup: ListenerCleanup): void {
  if (!cleanup) return
  if (typeof cleanup === "function") {
    cleanup()
    return
  }
  cleanup.remove()
}

function resolvePurchaseEventKey(purchase: Record<string, unknown>): string | undefined {
  return (
    readString(purchase.transactionId) ??
    readString(purchase.id) ??
    readString(purchase.purchaseToken) ??
    readString(purchase.originalTransactionIdentifierIOS)
  )
}

function isSyntheticStoreSyncPurchase(purchase: Record<string, unknown>): boolean {
  return purchase.__storeSyncSynthetic === true
}

function canFinalizePurchase(purchase: Record<string, unknown>): boolean {
  if (isSyntheticStoreSyncPurchase(purchase)) return false
  return Boolean(
    readString(purchase.transactionId) ??
      readString(purchase.purchaseToken) ??
      readString(purchase.id) ??
      readString(purchase.originalTransactionIdentifierIOS),
  )
}

function formatPlanLabel(rawSku: string): string {
  const normalized = rawSku.trim()
  if (!normalized) return rawSku

  return normalized
    .split(/[._-]+/g)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function arePlansEqualBySku(current: BillingSkuPlan[], next: BillingSkuPlan[]): boolean {
  if (current.length !== next.length) return false
  for (let index = 0; index < current.length; index += 1) {
    if (current[index]?.sku !== next[index]?.sku) return false
  }
  return true
}

export const ProfileIapScreen: FC<ProfileIapScreenProps> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const { setSession } = useAuth()

  const platformStore: BillingStore = Platform.OS === "ios" ? "apple" : "google"
  const purchaseListenersRef = useRef<{
    updated?: ListenerCleanup
    error?: ListenerCleanup
  }>({})
  const iapReadyRef = useRef(false)
  const activePurchaseSkuRef = useRef<string | undefined>(undefined)
  const inFlightPurchaseKeysRef = useRef<Set<string>>(new Set())
  const failedPurchaseAttemptAtRef = useRef<Map<string, number>>(new Map())
  const verifyUnauthorizedUntilRef = useRef<number>(0)
  const verifyInProgressRef = useRef(false)
  const setSessionRef = useRef(setSession)
  const skuPlansRef = useRef<BillingSkuPlan[]>([])
  const creditBalanceWarnKindRef = useRef<string | null>(null)
  const subscriptionRef = useRef<BillingSubscriptionState | undefined>(undefined)

  const [skuPlans, setSkuPlans] = useState<BillingSkuPlan[]>([])
  const [storeProducts, setStoreProducts] = useState<Record<string, StoreProduct>>({})
  const [subscription, setSubscription] = useState<BillingSubscriptionState | undefined>(undefined)
  const [creditBalances, setCreditBalances] = useState<WordInsightCreditBalances | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [activePurchaseSku, setActivePurchaseSku] = useState<string | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)

  const currentPlanSku = subscription?.plan?.sku ?? subscription?.sku
  const googleManageSubscriptionUrl = useMemo(
    () => buildGoogleManageSubscriptionUrl(currentPlanSku),
    [currentPlanSku],
  )
  const currentPlanLabel = useMemo(() => {
    if (!currentPlanSku) return translate("vocabulary:iap.noActivePlan")
    return storeProducts[currentPlanSku]?.title ?? formatPlanLabel(currentPlanSku)
  }, [currentPlanSku, storeProducts])
  const availableSkuPlans = useMemo(
    () => skuPlans.filter((plan) => Boolean(storeProducts[plan.sku])),
    [skuPlans, storeProducts],
  )

  const basicRemainingCredits = useMemo(
    () => (creditBalances?.freeBasic ?? 0) + (creditBalances?.paidBasic ?? 0),
    [creditBalances?.freeBasic, creditBalances?.paidBasic],
  )
  const advancedRemainingCredits = useMemo(
    () => (creditBalances?.freeAdvanced ?? 0) + (creditBalances?.paidAdvanced ?? 0),
    [creditBalances?.freeAdvanced, creditBalances?.paidAdvanced],
  )
  const maxRemainingCredits = useMemo(
    () => Math.max(1, basicRemainingCredits, advancedRemainingCredits),
    [advancedRemainingCredits, basicRemainingCredits],
  )

  useEffect(() => {
    setSessionRef.current = setSession
  }, [setSession])
  useEffect(() => {
    activePurchaseSkuRef.current = activePurchaseSku
  }, [activePurchaseSku])
  useEffect(() => {
    subscriptionRef.current = subscription
  }, [subscription])
  const basicMeterPercent = useMemo(
    () =>
      basicRemainingCredits <= 0
        ? 0
        : Math.max(8, Math.min(100, Math.round((basicRemainingCredits / maxRemainingCredits) * 100))),
    [basicRemainingCredits, maxRemainingCredits],
  )
  const advancedMeterPercent = useMemo(
    () =>
      advancedRemainingCredits <= 0
        ? 0
        : Math.max(8, Math.min(100, Math.round((advancedRemainingCredits / maxRemainingCredits) * 100))),
    [advancedRemainingCredits, maxRemainingCredits],
  )

  const loadStoreProducts = useCallback(async (plans: BillingSkuPlan[]) => {
    if (!iapReadyRef.current || plans.length === 0) {
      setStoreProducts({})
      return [] as string[]
    }

    const skus = plans.map((plan) => plan.sku)
    const merged = new Map<string, StoreProduct>()

    try {
      const inAppResults = await fetchProducts({ skus, type: "in-app" })
      const normalizedInApp = Array.isArray(inAppResults) ? inAppResults : []
      normalizedInApp.forEach((entry) => {
        const parsed = parseStoreProduct(entry, "in-app")
        if (parsed) merged.set(parsed.sku, parsed)
      })
    } catch (error) {
      if (__DEV__) {
        console.warn("IAP in-app products fetch failed", error)
      }
    }

    try {
      const subscriptionResults = await fetchProducts({ skus, type: "subs" })
      const normalizedSubs = Array.isArray(subscriptionResults) ? subscriptionResults : []
      normalizedSubs.forEach((entry) => {
        const parsed = parseStoreProduct(entry, "subs")
        if (parsed) merged.set(parsed.sku, parsed)
      })
    } catch (error) {
      if (__DEV__) {
        console.warn("IAP subscription products fetch failed", error)
      }
    }

    setStoreProducts(Object.fromEntries(merged.entries()))
    return skus.filter((sku) => !merged.has(sku))
  }, [])

  const verifyAndFinalizePurchase = useCallback(
    async (
      purchase: unknown,
      options?: { suppressSuccessMessage?: boolean; expectedSku?: string },
    ): Promise<boolean> => {
      if (!isRecord(purchase)) return false

      const sku =
        readString(purchase.productId) ??
        readString(purchase.id) ??
        readString(purchase.transactionId)

      let fallbackAppleSignedTransactionInfo: string | undefined
      if (platformStore === "apple") {
        fallbackAppleSignedTransactionInfo = await resolveAppleSignedTransactionInfo(purchase, sku)
      }

      const receipt = buildReceiptPayload(
        platformStore,
        purchase,
        sku,
        fallbackAppleSignedTransactionInfo,
        options?.expectedSku,
      )

      if (!receipt) {
        setErrorMessage(translate("vocabulary:iap.errors.invalidReceipt"))
        return false
      }

      const verifyResponse = await billingApi.verifyReceipt({
        store: platformStore,
        receipt,
      })

      if (verifyResponse.kind !== "ok") {
        if (verifyResponse.kind === "unauthorized") {
          const meResponse = await authApi.getMe()
          if (meResponse.kind === "unauthorized") {
            setSessionRef.current(undefined)
            setErrorMessage(translate("vocabulary:iap.errors.unauthorized"))
          } else {
            setErrorMessage(verifyResponse.message || translate("vocabulary:iap.errors.generic"))
            if (
              platformStore === "apple" &&
              (verifyResponse.message ?? "").includes("Invalid Apple signed transaction payload")
            ) {
              verifyUnauthorizedUntilRef.current =
                Date.now() + RECEIPT_VERIFY_UNAUTHORIZED_COOLDOWN_MS
            }
            if (__DEV__) {
              console.warn("Receipt verify returned unauthorized while auth session is still valid", {
                code: verifyResponse.code,
                message: verifyResponse.message,
                requestId: verifyResponse.requestId,
              })
            }
          }
        } else {
          if (__DEV__) {
            console.warn("Billing receipt verify failed", verifyResponse)
          }
          setErrorMessage(resolveProblemMessage(verifyResponse))
        }
        return false
      }

      setSubscription(verifyResponse.data.subscription)
      if (__DEV__ && platformStore === "apple") {
        console.warn("Apple verify applied subscription snapshot", {
          status: verifyResponse.data.subscription.status,
          startsAt: verifyResponse.data.subscription.startsAt,
          expiresAt: verifyResponse.data.subscription.expiresAt,
          sku: verifyResponse.data.subscription.sku,
        })
      }
      if (
        !options?.suppressSuccessMessage &&
        sku &&
        isActiveSubscriptionStatus(verifyResponse.data.subscription.status)
      ) {
        setInfoMessage(translate("vocabulary:iap.purchaseApplied", { sku }))
      }
      setErrorMessage(undefined)

      try {
        if (canFinalizePurchase(purchase)) {
          await finishTransaction({
            purchase: purchase as never,
            isConsumable: false,
          })
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to finish transaction after verify", error)
        }
      }

      return true
    },
    [platformStore],
  )

  const loadBillingData = useCallback(
    async (mode: "initial" | "refresh") => {
      if (mode === "refresh") {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setErrorMessage(undefined)

      const [skuResponse, subscriptionResponse, creditsResponse] = await Promise.all([
        billingApi.listSkus(),
        billingApi.getSubscription(),
        wordInsightApi.getCreditBalances(),
      ])

      const hasUnauthorizedResponse =
        skuResponse.kind === "unauthorized" ||
        subscriptionResponse.kind === "unauthorized" ||
        creditsResponse.kind === "unauthorized"

      if (hasUnauthorizedResponse) {
        const meResponse = await authApi.getMe()
        if (meResponse.kind === "unauthorized") {
          setSessionRef.current(undefined)
          setErrorMessage(translate("vocabulary:iap.errors.unauthorized"))
          setIsLoading(false)
          setIsRefreshing(false)
          return
        }
        if (__DEV__) {
          console.warn("Billing endpoint returned unauthorized while auth session is still valid", {
            sku: skuResponse.kind,
            subscription: subscriptionResponse.kind,
            credits: creditsResponse.kind,
          })
        }
      }

      let filteredPlans: BillingSkuPlan[] = []

      if (skuResponse.kind === "ok") {
        filteredPlans = skuResponse.data.filter((plan) => plan.store === platformStore)
        if (!arePlansEqualBySku(skuPlansRef.current, filteredPlans)) {
          setSkuPlans(filteredPlans)
        }
        skuPlansRef.current = filteredPlans
      } else if (skuResponse.kind === "unauthorized") {
        filteredPlans = skuPlansRef.current
      } else {
        if (__DEV__) {
          console.warn("Billing SKU catalog request failed", skuResponse)
        }
        setSkuPlans([])
        skuPlansRef.current = []
        setErrorMessage(resolveProblemMessage(skuResponse))
      }

      if (subscriptionResponse.kind === "ok") {
        setSubscription(subscriptionResponse.data)
      } else if (subscriptionResponse.kind !== "unauthorized") {
        if (__DEV__) {
          console.warn("Billing subscription request failed", subscriptionResponse)
        }
        setErrorMessage(resolveProblemMessage(subscriptionResponse))
      }

      if (creditsResponse.kind === "ok") {
        setCreditBalances(creditsResponse.data)
        creditBalanceWarnKindRef.current = null
      } else if (creditsResponse.kind !== "unauthorized") {
        setCreditBalances(undefined)
        if (__DEV__ && creditBalanceWarnKindRef.current !== creditsResponse.kind) {
          console.warn("Failed to load credit balances", creditsResponse)
          creditBalanceWarnKindRef.current = creditsResponse.kind
        }
      } else {
        if (__DEV__ && creditBalanceWarnKindRef.current !== "unauthorized") {
          console.warn("Credit balances unauthorized while auth session is still valid")
          creditBalanceWarnKindRef.current = "unauthorized"
        }
      }

      const missingStoreSkus = await loadStoreProducts(filteredPlans)
      if (filteredPlans.length > 0 && missingStoreSkus.length > 0) {
        if (__DEV__) {
          console.warn("Store product catalog missing configured billing SKUs", {
            platformStore,
            missingStoreSkus,
          })
        }
        setErrorMessage((current) =>
          current ?? IAP_PRODUCTS_UNAVAILABLE_MESSAGE,
        )
      }

      setIsLoading(false)
      setIsRefreshing(false)
    },
    [loadStoreProducts, platformStore],
  )

  const restorePurchasesInternal = useCallback(
    async (options?: { expectedSku?: string }): Promise<{
      result: RestorePurchasesResult
      count: number
    }> => {
      const expectedSku = readString(options?.expectedSku)
      const purchases = await getAvailablePurchases()
      const normalizedPurchases = Array.isArray(purchases) ? purchases : []
      const fallbackSku = expectedSku ?? currentPlanSku

      const trySyntheticAppleRestore = async (): Promise<boolean> => {
        if (platformStore !== "apple" || !fallbackSku) return false
        const syntheticPurchase: Record<string, unknown> = {
          productId: fallbackSku,
          __storeSyncSynthetic: true,
        }
        return await verifyAndFinalizePurchase(syntheticPurchase, {
          suppressSuccessMessage: true,
          expectedSku,
        })
      }

      if (normalizedPurchases.length === 0) {
        const appliedFromSynthetic = await trySyntheticAppleRestore()
        if (appliedFromSynthetic) {
          await loadBillingData("refresh")
          return { result: "applied", count: 1 }
        }
        return { result: "none", count: 0 }
      }

      let purchasesToRestore = normalizedPurchases
      if (expectedSku) {
        const matchedPurchases = normalizedPurchases.filter((purchase) =>
          matchesExpectedPurchaseSku(platformStore, purchase, expectedSku),
        )
        if (matchedPurchases.length > 0) {
          purchasesToRestore = matchedPurchases
        } else {
          const appliedFromSynthetic = await trySyntheticAppleRestore()
          if (appliedFromSynthetic) {
            await loadBillingData("refresh")
            return { result: "applied", count: 1 }
          }
          return { result: "not-applicable", count: 0 }
        }
      }

      let restoredCount = 0
      for (const purchase of purchasesToRestore) {
        const applied = await verifyAndFinalizePurchase(purchase, {
          suppressSuccessMessage: true,
          expectedSku,
        })
        if (applied) restoredCount += 1
      }

      if (restoredCount > 0) {
        await loadBillingData("refresh")
        return { result: "applied", count: restoredCount }
      }

      return { result: "not-applicable", count: 0 }
    },
    [currentPlanSku, loadBillingData, platformStore, verifyAndFinalizePurchase],
  )

  useEffect(() => {
    let isUnmounted = false

    const setup = async () => {
      try {
        await initConnection()
        if (isUnmounted) return
        iapReadyRef.current = true
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to initialize IAP connection", error)
        }
        setErrorMessage(translate("vocabulary:iap.errors.iapUnavailable"))
      }

      purchaseListenersRef.current.updated = purchaseUpdatedListener((purchase: unknown) => {
        void (async () => {
          if (!isRecord(purchase)) return

          if (Date.now() < verifyUnauthorizedUntilRef.current) {
            return
          }
          if (verifyInProgressRef.current) {
            return
          }

          const purchaseEventKey = resolvePurchaseEventKey(purchase)
          if (purchaseEventKey) {
            const lastFailedAt = failedPurchaseAttemptAtRef.current.get(purchaseEventKey)
            if (
              typeof lastFailedAt === "number" &&
              Date.now() - lastFailedAt < APPLE_VERIFY_RETRY_COOLDOWN_MS
            ) {
              return
            }
          }
          if (purchaseEventKey && inFlightPurchaseKeysRef.current.has(purchaseEventKey)) {
            return
          }
          if (purchaseEventKey) {
            inFlightPurchaseKeysRef.current.add(purchaseEventKey)
          }
          verifyInProgressRef.current = true

          try {
            const expectedSku = activePurchaseSkuRef.current
            const verified = await verifyAndFinalizePurchase(purchase, {
              expectedSku,
              suppressSuccessMessage: !expectedSku,
            })
            setActivePurchaseSku(undefined)
            activePurchaseSkuRef.current = undefined
            if (verified) {
              if (purchaseEventKey) {
                failedPurchaseAttemptAtRef.current.delete(purchaseEventKey)
              }
              await loadBillingData("refresh")
            } else if (purchaseEventKey) {
              failedPurchaseAttemptAtRef.current.set(purchaseEventKey, Date.now())
            }
          } finally {
            if (purchaseEventKey) {
              inFlightPurchaseKeysRef.current.delete(purchaseEventKey)
            }
            verifyInProgressRef.current = false
          }
        })()
      })

      purchaseListenersRef.current.error = purchaseErrorListener((error: unknown) => {
        const attemptedSku = activePurchaseSkuRef.current
        setActivePurchaseSku(undefined)
        activePurchaseSkuRef.current = undefined
        if (isAlreadyOwnedPurchaseError(error)) {
          const currentSubscription = subscriptionRef.current
          const planSwitchAttempt = isPlanSwitchAttempt({
            attemptedSku,
            currentPlanSku: currentSubscription?.plan?.sku ?? currentSubscription?.sku,
            subscriptionStatus: currentSubscription?.status,
          })
          if (planSwitchAttempt) {
            setInfoMessage(undefined)
            setErrorMessage(translate("vocabulary:iap.errors.alreadyOwned"))
            void loadBillingData("refresh")
            return
          }
          setIsRestoring(true)
          setErrorMessage(undefined)
          setInfoMessage(translate("vocabulary:iap.alreadyOwnedRestoring"))
          void (async () => {
            try {
              const restoreResponse = await restorePurchasesInternal({
                expectedSku: attemptedSku,
              })
              if (restoreResponse.result === "none") {
                setInfoMessage(translate("vocabulary:iap.restoreNoPurchases"))
              } else if (restoreResponse.result === "applied") {
                setInfoMessage(
                  translate("vocabulary:iap.restoreApplied", { count: restoreResponse.count }),
                )
              } else {
                setInfoMessage(translate("vocabulary:iap.restoreNoApplicablePurchases"))
              }
            } catch (restoreError) {
              setErrorMessage(resolvePurchaseErrorMessage(restoreError))
            } finally {
              setIsRestoring(false)
            }
          })()
          return
        }
        const message = resolvePurchaseErrorMessage(error)
        if (message === translate("vocabulary:iap.purchaseCanceled")) {
          setInfoMessage(message)
          setErrorMessage(undefined)
          return
        }
        setErrorMessage(message)
      })

      await loadBillingData("initial")
    }

    void setup()

    return () => {
      isUnmounted = true
      runListenerCleanup(purchaseListenersRef.current.updated)
      runListenerCleanup(purchaseListenersRef.current.error)
      purchaseListenersRef.current = {}
      inFlightPurchaseKeysRef.current.clear()
      failedPurchaseAttemptAtRef.current.clear()
      verifyUnauthorizedUntilRef.current = 0
      verifyInProgressRef.current = false
      if (iapReadyRef.current) {
        void endConnection()
      }
      iapReadyRef.current = false
    }
  }, [loadBillingData, restorePurchasesInternal, verifyAndFinalizePurchase])

  useFocusEffect(
    useCallback(() => {
      void loadBillingData("refresh")
    }, [loadBillingData]),
  )

  const handleBuyPlan = useCallback(
    async (plan: BillingSkuPlan) => {
      if (!iapReadyRef.current) {
        setErrorMessage(translate("vocabulary:iap.errors.iapUnavailable"))
        return
      }

      const product = storeProducts[plan.sku]
      if (!product) {
        setErrorMessage(IAP_PRODUCT_UNAVAILABLE_MESSAGE)
        return
      }

      setErrorMessage(undefined)
      setInfoMessage(undefined)
      setActivePurchaseSku(plan.sku)
      activePurchaseSkuRef.current = plan.sku
      failedPurchaseAttemptAtRef.current.clear()
      verifyUnauthorizedUntilRef.current = 0

      const productType: StoreProductType = product.type

      try {
        await requestPurchase({
          request: {
            apple: {
              sku: plan.sku,
            },
            google: {
              skus: [plan.sku],
            },
          },
          type: productType,
        })
      } catch (error) {
        setActivePurchaseSku(undefined)
        activePurchaseSkuRef.current = undefined
        if (isAlreadyOwnedPurchaseError(error)) {
          const currentSubscription = subscriptionRef.current
          const planSwitchAttempt = isPlanSwitchAttempt({
            attemptedSku: plan.sku,
            currentPlanSku: currentSubscription?.plan?.sku ?? currentSubscription?.sku,
            subscriptionStatus: currentSubscription?.status,
          })
          if (planSwitchAttempt) {
            setErrorMessage(translate("vocabulary:iap.errors.alreadyOwned"))
            await loadBillingData("refresh")
            return
          }
          setIsRestoring(true)
          setErrorMessage(undefined)
          setInfoMessage(translate("vocabulary:iap.alreadyOwnedRestoring"))
          try {
            const restoreResponse = await restorePurchasesInternal({
              expectedSku: plan.sku,
            })
            if (restoreResponse.result === "none") {
              setInfoMessage(translate("vocabulary:iap.restoreNoPurchases"))
            } else if (restoreResponse.result === "applied") {
              setInfoMessage(
                translate("vocabulary:iap.restoreApplied", { count: restoreResponse.count }),
              )
            } else {
              setInfoMessage(translate("vocabulary:iap.restoreNoApplicablePurchases"))
            }
          } catch (restoreError) {
            setErrorMessage(resolvePurchaseErrorMessage(restoreError))
          } finally {
            setIsRestoring(false)
          }
          return
        }
        setErrorMessage(resolvePurchaseErrorMessage(error))
      }
    },
    [loadBillingData, restorePurchasesInternal, storeProducts],
  )

  const handleRestorePurchases = useCallback(async () => {
    if (!iapReadyRef.current) {
      setErrorMessage(translate("vocabulary:iap.errors.iapUnavailable"))
      return
    }

    setIsRestoring(true)
    setErrorMessage(undefined)
    setInfoMessage(undefined)
    verifyUnauthorizedUntilRef.current = 0

    try {
      const restoreResponse = await restorePurchasesInternal()
      if (restoreResponse.result === "none") {
        setInfoMessage(translate("vocabulary:iap.restoreNoPurchases"))
      } else if (restoreResponse.result === "applied") {
        setInfoMessage(translate("vocabulary:iap.restoreApplied", { count: restoreResponse.count }))
      } else {
        setInfoMessage(translate("vocabulary:iap.restoreNoApplicablePurchases"))
      }
    } catch (error) {
      setErrorMessage(resolvePurchaseErrorMessage(error))
    } finally {
      setIsRestoring(false)
    }
  }, [restorePurchasesInternal])

  const handleBillingRefresh = useCallback(async () => {
    if (iapReadyRef.current) {
      try {
        const restoreResult = await restorePurchasesInternal()
        if (restoreResult.result === "applied") {
          return
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("Store sync during billing refresh failed", error)
        }
      }
    }
    await loadBillingData("refresh")
  }, [loadBillingData, restorePurchasesInternal])

  const isSubscriptionActive = subscription?.status === "active"

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor={showroomColors.background}
      systemBarStyle={theme.isDark ? "light" : "dark"}
      contentContainerStyle={themed($screenContent)}
    >
      <View pointerEvents="none" style={themed($glowTop)} />
      <View pointerEvents="none" style={themed($glowBottom)} />

      <View style={themed($layout)}>
        <View style={themed($headerRow)}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:iap.accessibility.goBack")}
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
            hitSlop={6}
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>
          <Text style={themed($headerTitle)} text={translate("vocabulary:iap.title")} />
          <View style={themed($headerSpacer)}>
            <AppTutorialVideoButton
              screen="profile_iap"
              placement="overview"
              variant="help"
              containerStyle={themed($iconButton)}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={themed($scrollArea)}
          contentContainerStyle={themed($scrollAreaContent)}
        >
          <AppTutorialVideoButton
            screen="profile_iap"
            placement="overview"
            variant="banner"
            hideAfterSeen
            containerStyle={{ marginBottom: theme.spacing.md }}
          />

          <View style={themed($sectionCard)}>
            <Text
              style={themed($sectionTitle)}
              text={translate("vocabulary:iap.currentSubscription")}
            />
            {isLoading ? (
              <View style={themed($loadingRow)}>
                <ActivityIndicator size="small" color={showroomColors.textStrong} />
                <Text style={themed($sectionBody)} text={translate("vocabulary:iap.loading")} />
              </View>
            ) : (
              <>
                <View style={themed($statusRow)}>
                  <Text
                    style={themed($planInlineText)}
                    text={currentPlanLabel}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  />
                  <View style={themed(isSubscriptionActive ? $statusPillActive : $statusPillIdle)}>
                    <Text
                      style={themed(isSubscriptionActive ? $statusPillTextActive : $statusPillTextIdle)}
                      text={resolveSubscriptionStatus(subscription?.status ?? "none")}
                    />
                  </View>
                </View>
                <View style={themed($meterGroup)}>
                  <View style={themed($meterRow)}>
                    <View style={themed($meterHeaderRow)}>
                      <Text style={themed($meterLabel)} text={translate("vocabulary:weeklyAnalytics.modeBasic")} />
                      <Text
                        style={themed($meterValue)}
                        text={String(basicRemainingCredits)}
                      />
                    </View>
                    <View style={themed($meterTrack)}>
                      <View
                        style={[
                          themed($meterFillBasic),
                          { width: `${basicMeterPercent}%` as `${number}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={themed($meterRow)}>
                    <View style={themed($meterHeaderRow)}>
                      <Text
                        style={themed($meterLabel)}
                        text={translate("vocabulary:weeklyAnalytics.modeAdvanced")}
                      />
                      <Text
                        style={themed($meterValue)}
                        text={String(advancedRemainingCredits)}
                      />
                    </View>
                    <View style={themed($meterTrack)}>
                      <View
                        style={[
                          themed($meterFillAdvanced),
                          { width: `${advancedMeterPercent}%` as `${number}%` },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={themed($sectionCard)}>
            <Text style={themed($sectionTitle)} text={translate("vocabulary:iap.plansTitle")} />
            <Text style={themed($sectionBody)} text={translate("vocabulary:iap.plansBody")} />

            {availableSkuPlans.length === 0 && !isLoading ? (
              <Text style={themed($emptyText)} text={translate("vocabulary:iap.noPlans")} />
            ) : (
              availableSkuPlans.map((plan) => {
                const product = storeProducts[plan.sku]
                const isBuyingThisPlan = activePurchaseSku === plan.sku
                const isCurrentPlan = Boolean(currentPlanSku && plan.sku === currentPlanSku)
                const canRefreshCurrentPlan =
                  isCurrentPlan &&
                  (subscription?.status === "active" || subscription?.status === "pending")
                return (
                  <View
                    key={plan.sku}
                    style={[themed($planCard), isCurrentPlan ? themed($planCardActive) : null]}
                  >
                    <View style={themed($planHeaderRow)}>
                      <Text style={themed($planTitle)} text={product?.title ?? formatPlanLabel(plan.sku)} />
                      {isCurrentPlan ? (
                        <View style={themed($currentPlanPill)}>
                          <Text style={themed($currentPlanPillText)} text={resolveSubscriptionStatus(subscription?.status ?? "none")} />
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={themed($planMeta)}
                      text={translate("vocabulary:iap.planTopup", {
                        basic: plan.monthlyPaidBasicTopup,
                        advanced: plan.monthlyPaidAdvancedTopup,
                      })}
                    />
                    {product?.displayPrice ? (
                      <Text
                        style={themed($planPrice)}
                        text={translate("vocabulary:iap.priceLabel", {
                          price: product.displayPrice,
                        })}
                      />
                    ) : null}

                    <Pressable
                      disabled={isBuyingThisPlan || isRestoring || isLoading || isRefreshing}
                      accessibilityRole="button"
                      accessibilityLabel={
                        canRefreshCurrentPlan
                          ? translate("vocabulary:iap.accessibility.refresh")
                          : translate("vocabulary:iap.accessibility.buyPlan", {
                              plan: product?.title ?? formatPlanLabel(plan.sku),
                            })
                      }
                      onPress={() => {
                        if (canRefreshCurrentPlan) {
                          void handleBillingRefresh()
                          return
                        }
                        void handleBuyPlan(plan)
                      }}
                      style={({ pressed }) => [
                        themed($planBuyButton),
                        (isBuyingThisPlan || isRestoring || isLoading || isRefreshing) &&
                          themed($planBuyButtonDisabled),
                        pressed &&
                          !isBuyingThisPlan &&
                          !isRestoring &&
                          !isLoading &&
                          !isRefreshing &&
                          themed($planBuyButtonPressed),
                      ]}
                    >
                      <Text
                        style={themed($planBuyText)}
                        text={
                          isBuyingThisPlan
                            ? translate("vocabulary:iap.buying")
                            : canRefreshCurrentPlan
                              ? translate("vocabulary:iap.refresh")
                              : translate("vocabulary:iap.buyNow")
                        }
                      />
                    </Pressable>
                  </View>
                )
              })
            )}
          </View>

          {infoMessage ? (
            <View style={themed($infoWrap)}>
              <Text style={themed($infoText)} text={infoMessage} />
            </View>
          ) : null}

          {errorMessage ? (
            <View style={themed($errorWrap)}>
              <Text style={themed($errorText)} text={errorMessage} />
            </View>
          ) : null}

          <View style={themed([$footerWrap, $bottomInsets])}>
            <View style={themed($legalLinksWrap)}>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={translate("vocabulary:iap.privacyPolicy")}
                onPress={() => {
                  openLinkInBrowser(PRIVACY_POLICY_URL)
                }}
                style={({ pressed }) => [pressed && themed($legalLinkPressed)]}
              >
                <Text
                  style={themed($legalLinkText)}
                  text={translate("vocabulary:iap.privacyPolicy")}
                />
              </Pressable>

              <Pressable
                accessibilityRole="link"
                accessibilityLabel={
                  platformStore === "apple"
                    ? translate("vocabulary:iap.termsOfUse")
                    : translate("vocabulary:iap.manageSubscription")
                }
                onPress={() => {
                  openLinkInBrowser(
                    platformStore === "apple"
                      ? APPLE_TERMS_OF_USE_URL
                      : googleManageSubscriptionUrl,
                  )
                }}
                style={({ pressed }) => [pressed && themed($legalLinkPressed)]}
              >
                <Text
                  style={themed($legalLinkText)}
                  text={
                    platformStore === "apple"
                      ? translate("vocabulary:iap.termsOfUse")
                      : translate("vocabulary:iap.manageSubscription")
                  }
                />
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={translate("vocabulary:iap.accessibility.restorePurchases")}
              onPress={() => {
                void handleRestorePurchases()
              }}
              disabled={isRestoring || Boolean(activePurchaseSku)}
              style={({ pressed }) => [
                themed($secondaryButton),
                (isRestoring || Boolean(activePurchaseSku)) && themed($secondaryButtonDisabled),
                pressed && !isRestoring && !activePurchaseSku && themed($secondaryButtonPressed),
              ]}
            >
              <Text
                style={themed($secondaryButtonText)}
                text={
                  isRestoring
                    ? translate("vocabulary:iap.restoring")
                    : translate("vocabulary:iap.restorePurchases")
                }
              />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $glowTop: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: -120,
  left: -80,
  height: 260,
  width: 260,
  borderRadius: 130,
  backgroundColor: colors.vocabularyShowroom.glow,
})

const $glowBottom: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  bottom: -140,
  right: -100,
  height: 280,
  width: 280,
  borderRadius: 140,
  backgroundColor: colors.vocabularyShowroom.glow,
})

const $layout: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xl,
})

const $scrollArea: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $scrollAreaContent: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
})

const $headerRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $iconButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 40,
  width: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $iconButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 22,
  color: colors.vocabularyShowroom.textStrong,
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  width: 40,
})

const $sectionCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  padding: spacing.md,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  color: colors.vocabularyShowroom.textStrong,
})

const $sectionBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 18,
  color: colors.vocabularyShowroom.textMuted,
})

const $planInlineText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flex: 1,
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $statusRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.xs,
})

const $statusPillActive: ThemedStyle<ViewStyle> = ({ spacing, isDark }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxxs,
  borderRadius: 999,
  backgroundColor: isDark ? "rgba(34, 197, 94, 0.18)" : "rgba(34, 197, 94, 0.13)",
  borderWidth: 1,
  borderColor: isDark ? "rgba(74, 222, 128, 0.35)" : "rgba(22, 163, 74, 0.28)",
})

const $statusPillIdle: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxxs,
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $statusPillTextActive: ThemedStyle<TextStyle> = ({ typography, isDark }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 11,
  color: isDark ? "#9BE7B5" : "#1E7C3F",
})

const $statusPillTextIdle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 11,
  color: colors.vocabularyShowroom.textMuted,
})

const $meterGroup: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.sm,
  gap: spacing.xs,
})

const $meterRow: ThemedStyle<ViewStyle> = () => ({
  gap: 6,
})

const $meterHeaderRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $meterLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textStrong,
})

const $meterValue: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
})

const $meterTrack: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 7,
  borderRadius: 999,
  overflow: "hidden",
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $meterFillBasic: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  height: "100%",
  borderRadius: 999,
  backgroundColor: isDark ? "#84CC9A" : "#4D9C69",
})

const $meterFillAdvanced: ThemedStyle<ViewStyle> = ({ isDark }) => ({
  height: "100%",
  borderRadius: 999,
  backgroundColor: isDark ? "#9FB3D7" : "#6286B7",
})

const $loadingRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $planCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.sm,
})

const $planCardActive: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutline : colors.vocabularyShowroom.accent,
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceSoft : "rgba(141, 176, 145, 0.12)",
})

const $planHeaderRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.xs,
})

const $planTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $currentPlanPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xxxs,
})

const $currentPlanPillText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 10,
  color: colors.vocabularyShowroom.textMuted,
})

const $planMeta: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  lineHeight: 17,
  color: colors.vocabularyShowroom.textMuted,
})

const $planMetaMuted: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxxs,
  fontFamily: typography.primary.normal,
  fontSize: 11,
  lineHeight: 15,
  color: colors.vocabularyShowroom.textMuted,
  opacity: 0.85,
})

const $planPrice: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $planBuyButton: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  marginTop: spacing.sm,
  minHeight: 42,
  borderRadius: 21,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: isDark
    ? colors.vocabularyShowroom.surfaceSoft
    : colors.vocabularyShowroom.accent,
  borderWidth: isDark ? 1 : 0,
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutline : colors.transparent,
})

const $planBuyButtonDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  opacity: 0.55,
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $planBuyButtonPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  opacity: 0.85,
  backgroundColor: isDark
    ? colors.vocabularyShowroom.surfaceStrong
    : colors.vocabularyShowroom.accentPressed,
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutlinePressed : colors.transparent,
})

const $planBuyText: ThemedStyle<TextStyle> = ({ typography, colors, isDark }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 14,
  color: isDark ? colors.vocabularyShowroom.ctaOutline : "#FFFFFF",
})

const $emptyText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $infoWrap: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $infoText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 18,
  color: colors.vocabularyShowroom.textStrong,
})

const $errorWrap: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.error,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $errorText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 18,
  color: colors.error,
})

const $footerWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  gap: spacing.sm,
})

const $legalLinksWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.xs,
})

const $legalLinkText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.palette.primary500,
  textDecorationLine: "underline",
})

const $legalLinkPressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.7,
})

const $secondaryButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minHeight: 48,
  borderRadius: 24,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $secondaryButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $secondaryButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.55,
})

const $secondaryButtonText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})
