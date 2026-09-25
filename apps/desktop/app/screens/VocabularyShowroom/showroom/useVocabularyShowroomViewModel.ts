import { useCallback, useEffect, useRef, useState } from "react"
import { AppState, type AppStateStatus, LayoutChangeEvent, useWindowDimensions } from "react-native"
import { useFocusEffect, useIsFocused } from "@react-navigation/native"

import { WORD_INSIGHT_LIST_PAGE_LIMIT } from "@/config/pagination"
import { useAuth } from "@/context/AuthContext"
import { translate } from "@/i18n/translate"
import { billingApi } from "@/services/api/billingApi"
import { wordInsightApi } from "@/services/api/wordInsightApi"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import {
  clearRepeatWords,
  getRepeatWordLimit,
  loadRepeatState,
  removeRepeatWord,
  toggleRepeatWord,
  type RepeatToggleResult,
  type RepeatWordLimit,
  type RepeatWordItem,
} from "@/services/repeat/repeatService"
import { mapLearningItemToEntry, type VocabularyEntry } from "../types"

export type FavoriteToggleResult = "added" | "removed" | "failed"

export type VocabularyShowroomViewModel = {
  entries: VocabularyEntry[]
  isLoading: boolean
  isRefreshing: boolean
  isLoadingMore: boolean
  hasMoreEntries: boolean
  errorMessage?: string
  requiresLogin: boolean
  repeatWords: RepeatWordItem[]
  repeatWordCount: number
  repeatWordLimit: RepeatWordLimit
  isRepeatUnlimited: boolean
  cardHeight: number
  onListLayout: (event: LayoutChangeEvent) => void
  onRefresh: () => void
  onLoadMore: () => void
  onGoToLogin: () => void
  isWordInRepeatList: (wordId: string) => boolean
  isWordFavorited: (wordId: string) => boolean
  onToggleFavoriteWord: (entry: VocabularyEntry) => Promise<FavoriteToggleResult>
  onToggleRepeatWord: (entry: VocabularyEntry) => Promise<RepeatToggleResult>
  onRemoveRepeatWord: (wordId: string) => Promise<void>
  onClearRepeatWords: () => Promise<void>
}

function resolveErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return translate("vocabulary:errors.sessionExpired")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.listLoadFailed")
}

function resolveFavoriteErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return translate("vocabulary:errors.reloginRequired")
  }
  if (problem.kind === "not-found") {
    return translate("vocabulary:errors.itemNotFound")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.favoriteActionFailed")
}

export function useVocabularyShowroomViewModel(): VocabularyShowroomViewModel {
  const { setSession, userId } = useAuth()
  const isFocused = useIsFocused()
  const { height: windowHeight } = useWindowDimensions()
  const [listHeight, setListHeight] = useState(windowHeight)
  const [entries, setEntries] = useState<VocabularyEntry[]>([])
  const [repeatWords, setRepeatWords] = useState<RepeatWordItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreEntries, setHasMoreEntries] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [requiresLogin, setRequiresLogin] = useState(false)
  const [isRepeatUnlimited, setIsRepeatUnlimited] = useState(false)
  const requestVersionRef = useRef(0)
  const entriesRef = useRef<VocabularyEntry[]>([])
  const isLoadingRef = useRef(isLoading)
  const isRefreshingRef = useRef(isRefreshing)
  const isLoadingMoreRef = useRef(isLoadingMore)
  const hasMoreEntriesRef = useRef(hasMoreEntries)
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  const repeatWordLimit = getRepeatWordLimit({ unlimited: isRepeatUnlimited })

  useEffect(() => {
    entriesRef.current = entries
  }, [entries])
  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])
  useEffect(() => {
    isRefreshingRef.current = isRefreshing
  }, [isRefreshing])
  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore
  }, [isLoadingMore])
  useEffect(() => {
    hasMoreEntriesRef.current = hasMoreEntries
  }, [hasMoreEntries])

  const syncRepeatState = useCallback(() => {
    const repeatState = loadRepeatState(userId)
    setRepeatWords(repeatState.words)
  }, [userId])

  const syncRepeatLimit = useCallback(async () => {
    if (!userId?.trim()) {
      setIsRepeatUnlimited(false)
      return
    }

    const subscriptionResponse = await billingApi.getSubscription()
    if (subscriptionResponse.kind === "ok") {
      setIsRepeatUnlimited(subscriptionResponse.data.status === "active")
      return
    }

    if (subscriptionResponse.kind === "unauthorized") {
      setIsRepeatUnlimited(false)
      return
    }

    if (__DEV__) {
      console.warn("Billing subscription request failed while syncing repeat limit.", subscriptionResponse)
    }
  }, [userId])

  const loadEntries = useCallback(async (mode: "initial" | "refresh" | "loadMore") => {
    if (mode === "loadMore") {
      if (
        isLoadingRef.current ||
        isRefreshingRef.current ||
        isLoadingMoreRef.current ||
        !hasMoreEntriesRef.current
      ) {
        return
      }
    }

    requestVersionRef.current += 1
    const requestVersion = requestVersionRef.current
    const offset = mode === "loadMore" ? entriesRef.current.length : 0

    if (mode === "refresh") {
      isRefreshingRef.current = true
      setIsRefreshing(true)
    } else if (mode === "loadMore") {
      isLoadingMoreRef.current = true
      setIsLoadingMore(true)
    } else {
      isLoadingRef.current = true
      setIsLoading(true)
    }
    if (mode !== "loadMore") {
      setErrorMessage(undefined)
      setRequiresLogin(false)
    }

    const response = await wordInsightApi.listLearningItems({
      status: "active",
      limit: WORD_INSIGHT_LIST_PAGE_LIMIT,
      offset,
    })

    if (requestVersionRef.current !== requestVersion) return

    if (response.kind === "ok") {
      const mapped = response.data.map(mapLearningItemToEntry)
      if (mode === "loadMore") {
        setEntries((prev) => {
          const existingIds = new Set(prev.map((entry) => entry.id))
          const appended = mapped.filter((entry) => !existingIds.has(entry.id))
          return [...prev, ...appended]
        })
      } else {
        setEntries(mapped)
      }
      hasMoreEntriesRef.current = mapped.length >= WORD_INSIGHT_LIST_PAGE_LIMIT
      setHasMoreEntries(mapped.length >= WORD_INSIGHT_LIST_PAGE_LIMIT)
      isLoadingRef.current = false
      isRefreshingRef.current = false
      isLoadingMoreRef.current = false
      setIsLoading(false)
      setIsRefreshing(false)
      setIsLoadingMore(false)
      return
    }

    if (mode !== "loadMore") {
      isLoadingRef.current = false
      isRefreshingRef.current = false
      setIsLoading(false)
      setIsRefreshing(false)
      setErrorMessage(resolveErrorMessage(response))
      setRequiresLogin(response.kind === "unauthorized")
    }
    isLoadingMoreRef.current = false
    setIsLoadingMore(false)

    if (__DEV__) {
      console.warn("Vocabulary showroom entries request failed.", response)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void syncRepeatLimit()
      syncRepeatState()
      void loadEntries("initial")
    }, [loadEntries, syncRepeatLimit, syncRepeatState]),
  )

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const previousState = appStateRef.current
      appStateRef.current = nextState

      const wasBackgrounded = previousState === "background" || previousState === "inactive"
      if (!wasBackgrounded || nextState !== "active" || !isFocused) return

      void syncRepeatLimit()
      syncRepeatState()
      void loadEntries("refresh")
    })

    return () => {
      subscription.remove()
    }
  }, [isFocused, loadEntries, syncRepeatLimit, syncRepeatState])

  const onListLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height
    if (!nextHeight) return
    setListHeight((prev) => (prev === nextHeight ? prev : nextHeight))
  }, [])

  const onRefresh = useCallback(() => {
    void loadEntries("refresh")
  }, [loadEntries])

  const onLoadMore = useCallback(() => {
    void loadEntries("loadMore")
  }, [loadEntries])

  const onGoToLogin = useCallback(() => {
    setSession(undefined)
  }, [setSession])

  const isWordFavorited = useCallback(
    (wordId: string) => {
      const normalizedWordId = wordId.trim()
      if (!normalizedWordId) return false
      return entries.some((entry) => entry.id === normalizedWordId && entry.isFavorite)
    },
    [entries],
  )

  const onToggleFavoriteWord = useCallback(
    async (entry: VocabularyEntry): Promise<FavoriteToggleResult> => {
      const response = entry.isFavorite
        ? await wordInsightApi.unmarkLearningItemFavorite(entry.id)
        : await wordInsightApi.markLearningItemFavorite(entry.id)

      if (response.kind === "ok") {
        const nextEntry = mapLearningItemToEntry(response.data)
        setEntries((prev) => prev.map((item) => (item.id === nextEntry.id ? nextEntry : item)))
        return nextEntry.isFavorite ? "added" : "removed"
      }

      setErrorMessage(resolveFavoriteErrorMessage(response))
      if (response.kind === "unauthorized") {
        setRequiresLogin(true)
      }
      if (__DEV__) {
        console.warn("Vocabulary favorite update request failed.", response)
      }
      return "failed"
    },
    [],
  )

  const isWordInRepeatList = useCallback(
    (wordId: string) => {
      const normalizedWordId = wordId.trim()
      if (!normalizedWordId) return false
      return repeatWords.some((word) => word.id === normalizedWordId)
    },
    [repeatWords],
  )

  const onToggleRepeatWord = useCallback(
    async (entry: VocabularyEntry): Promise<RepeatToggleResult> => {
      const response = await toggleRepeatWord(userId, entry, { unlimited: isRepeatUnlimited })
      setRepeatWords(response.state.words)
      return response.result
    },
    [isRepeatUnlimited, userId],
  )

  const onRemoveRepeatWord = useCallback(
    async (wordId: string) => {
      const repeatState = await removeRepeatWord(userId, wordId)
      setRepeatWords(repeatState.words)
    },
    [userId],
  )

  const onClearRepeatWords = useCallback(async () => {
    const repeatState = await clearRepeatWords(userId)
    setRepeatWords(repeatState.words)
  }, [userId])

  return {
    entries,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMoreEntries,
    errorMessage,
    requiresLogin,
    repeatWords,
    repeatWordCount: repeatWords.length,
    repeatWordLimit,
    isRepeatUnlimited,
    cardHeight: listHeight || windowHeight,
    onListLayout,
    onRefresh,
    onLoadMore,
    onGoToLogin,
    isWordFavorited,
    onToggleFavoriteWord,
    isWordInRepeatList,
    onToggleRepeatWord,
    onRemoveRepeatWord,
    onClearRepeatWords,
  }
}
