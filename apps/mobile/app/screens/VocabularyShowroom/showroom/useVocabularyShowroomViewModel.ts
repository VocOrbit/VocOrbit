import { useCallback, useEffect, useRef, useState } from "react"
import { AppState, type AppStateStatus, LayoutChangeEvent, useWindowDimensions } from "react-native"
import { useFocusEffect, useIsFocused } from "@react-navigation/native"

import { WORD_INSIGHT_LIST_PAGE_LIMIT } from "@/config/pagination"
import { useAuth } from "@/context/AuthContext"
import { useVocabularyGroupSelection } from "@/context/VocabularyGroupContext"
import { translate } from "@/i18n/translate"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { billingApi } from "@/services/api/billingApi"
import { wordInsightApi, type WordInsightLearningItemGroup } from "@/services/api/wordInsightApi"
import {
  clearRepeatWords,
  getRepeatDueWordCount,
  getRepeatWordLimit,
  loadRepeatState,
  removeRepeatWord,
  syncRepeatWordMetadata,
  toggleRepeatWord,
  type RepeatToggleResult,
  type RepeatWordLimit,
  type RepeatWordItem,
} from "@/services/repeat/repeatService"

import { mapLearningItemToEntry, type VocabularyEntry } from "../types"

export type FavoriteToggleResult = "added" | "removed" | "failed"
export type GroupMutationResult = "updated" | "failed"

export type VocabularyShowroomViewModel = {
  entries: VocabularyEntry[]
  groups: WordInsightLearningItemGroup[]
  activeGroupId?: string
  activeGroupName?: string
  isLoading: boolean
  isLoadingGroups: boolean
  isGroupMutating: boolean
  isRefreshing: boolean
  isLoadingMore: boolean
  hasMoreEntries: boolean
  errorMessage?: string
  requiresLogin: boolean
  repeatWords: RepeatWordItem[]
  repeatWordCount: number
  repeatDueWordCount: number
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
  onReloadGroups: () => Promise<void>
  onCreateGroup: (name: string) => Promise<GroupMutationResult>
  onRenameGroup: (groupId: string, name: string) => Promise<GroupMutationResult>
  onDeleteGroup: (groupId: string) => Promise<GroupMutationResult>
  onAddEntriesToGroup: (groupId: string, entryIds: string[]) => Promise<GroupMutationResult>
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

function resolveGroupErrorMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return translate("vocabulary:errors.reloginRequired")
  }
  if (problem.kind === "not-found") {
    return translate("vocabulary:errors.groupNotFound")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:errors.cannotConnect")
  }
  return translate("vocabulary:errors.groupActionFailed")
}

export function useVocabularyShowroomViewModel(): VocabularyShowroomViewModel {
  const { setSession, userId } = useAuth()
  const { selectedGroupId, setSelectedGroupId } = useVocabularyGroupSelection()
  const isFocused = useIsFocused()
  const { height: windowHeight } = useWindowDimensions()
  const [listHeight, setListHeight] = useState(windowHeight)
  const [entries, setEntries] = useState<VocabularyEntry[]>([])
  const [groups, setGroups] = useState<WordInsightLearningItemGroup[]>([])
  const [repeatWords, setRepeatWords] = useState<RepeatWordItem[]>([])
  const [repeatDueWordCount, setRepeatDueWordCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const [isGroupMutating, setIsGroupMutating] = useState(false)
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
  const loadedGroupIdRef = useRef<string | undefined>(undefined)
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
    setRepeatDueWordCount(getRepeatDueWordCount(userId))
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
      console.warn(
        "Billing subscription request failed while syncing repeat limit.",
        subscriptionResponse,
      )
    }
  }, [userId])

  const loadEntries = useCallback(
    async (mode: "initial" | "refresh" | "loadMore") => {
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
      const requestedGroupId = selectedGroupId

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

      const responseToUse = requestedGroupId
        ? await wordInsightApi.listLearningItemsByGroup(requestedGroupId, {
            limit: WORD_INSIGHT_LIST_PAGE_LIMIT,
            offset,
          })
        : await wordInsightApi.listLearningItems({
            status: "active",
            limit: WORD_INSIGHT_LIST_PAGE_LIMIT,
            offset,
          })

      if (requestVersionRef.current !== requestVersion) return

      if (responseToUse.kind === "ok") {
        const mapped = responseToUse.data.map(mapLearningItemToEntry)
        const syncedRepeatState = syncRepeatWordMetadata(userId, mapped)
        setRepeatWords(syncedRepeatState.words)
        setRepeatDueWordCount(getRepeatDueWordCount(userId))
        if (mode === "loadMore") {
          setEntries((prev) => {
            const existingIds = new Set(prev.map((entry) => entry.id))
            const appended = mapped.filter((entry) => !existingIds.has(entry.id))
            return [...prev, ...appended]
          })
        } else {
          setEntries(mapped)
          loadedGroupIdRef.current = requestedGroupId
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

      if (requestedGroupId && responseToUse.kind === "not-found") {
        setSelectedGroupId(undefined)
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
        setErrorMessage(resolveErrorMessage(responseToUse))
        setRequiresLogin(responseToUse.kind === "unauthorized")
      }
      isLoadingMoreRef.current = false
      setIsLoadingMore(false)

      if (__DEV__) {
        console.warn("Vocabulary showroom entries request failed.", responseToUse)
      }
    },
    [selectedGroupId, setSelectedGroupId, userId],
  )

  const loadGroups = useCallback(async () => {
    setIsLoadingGroups(true)
    const response = await wordInsightApi.listLearningItemGroups()
    if (response.kind === "ok") {
      setGroups(response.data)
      if (selectedGroupId && !response.data.some((group) => group.id === selectedGroupId)) {
        setSelectedGroupId(undefined)
      }
      setIsLoadingGroups(false)
      return
    }

    setIsLoadingGroups(false)
    setErrorMessage(resolveGroupErrorMessage(response))
    setRequiresLogin(response.kind === "unauthorized")
    if (__DEV__) {
      console.warn("Vocabulary groups request failed.", response)
    }
  }, [selectedGroupId, setSelectedGroupId])

  const activeGroupName = groups.find((group) => group.id === selectedGroupId)?.name

  useFocusEffect(
    useCallback(() => {
      void syncRepeatLimit()
      syncRepeatState()
      const shouldLoadEntries =
        entriesRef.current.length === 0 || loadedGroupIdRef.current !== selectedGroupId
      if (shouldLoadEntries) {
        void loadEntries("initial")
      }
      void loadGroups()
    }, [loadEntries, loadGroups, selectedGroupId, syncRepeatLimit, syncRepeatState]),
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
      void loadGroups()
    })

    return () => {
      subscription.remove()
    }
  }, [isFocused, loadEntries, loadGroups, syncRepeatLimit, syncRepeatState])

  const onListLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height
    if (!nextHeight) return
    setListHeight((prev) => (prev === nextHeight ? prev : nextHeight))
  }, [])

  const onRefresh = useCallback(() => {
    void loadEntries("refresh")
    void loadGroups()
  }, [loadEntries, loadGroups])

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
      setRepeatDueWordCount(getRepeatDueWordCount(userId))
      return response.result
    },
    [isRepeatUnlimited, userId],
  )

  const onRemoveRepeatWord = useCallback(
    async (wordId: string) => {
      const repeatState = await removeRepeatWord(userId, wordId)
      setRepeatWords(repeatState.words)
      setRepeatDueWordCount(getRepeatDueWordCount(userId))
    },
    [userId],
  )

  const onClearRepeatWords = useCallback(async () => {
    const repeatState = await clearRepeatWords(userId)
    setRepeatWords(repeatState.words)
    setRepeatDueWordCount(0)
  }, [userId])

  const handleCreateGroup = useCallback(async (name: string): Promise<GroupMutationResult> => {
    setIsGroupMutating(true)
    try {
      const response = await wordInsightApi.createLearningItemGroup(name)
      if (response.kind === "ok") {
        setGroups((prev) => [
          response.data,
          ...prev.filter((group) => group.id !== response.data.id),
        ])
        return "updated"
      }
      setErrorMessage(resolveGroupErrorMessage(response))
      setRequiresLogin(response.kind === "unauthorized")
      return "failed"
    } finally {
      setIsGroupMutating(false)
    }
  }, [])

  const handleRenameGroup = useCallback(
    async (groupId: string, name: string): Promise<GroupMutationResult> => {
      setIsGroupMutating(true)
      try {
        const response = await wordInsightApi.updateLearningItemGroup(groupId, name)
        if (response.kind === "ok") {
          setGroups((prev) => prev.map((group) => (group.id === groupId ? response.data : group)))
          return "updated"
        }
        setErrorMessage(resolveGroupErrorMessage(response))
        setRequiresLogin(response.kind === "unauthorized")
        return "failed"
      } finally {
        setIsGroupMutating(false)
      }
    },
    [],
  )

  const handleDeleteGroup = useCallback(async (groupId: string): Promise<GroupMutationResult> => {
    setIsGroupMutating(true)
    try {
      const response = await wordInsightApi.deleteLearningItemGroup(groupId)
      if (response.kind === "ok") {
        setGroups((prev) => prev.filter((group) => group.id !== groupId))
        return "updated"
      }
      setErrorMessage(resolveGroupErrorMessage(response))
      setRequiresLogin(response.kind === "unauthorized")
      return "failed"
    } finally {
      setIsGroupMutating(false)
    }
  }, [])

  const handleAddEntriesToGroup = useCallback(
    async (groupId: string, entryIds: string[]): Promise<GroupMutationResult> => {
      const uniqueEntryIds = [...new Set(entryIds.map((entryId) => entryId.trim()).filter(Boolean))]
      if (uniqueEntryIds.length === 0) return "failed"

      setIsGroupMutating(true)
      try {
        const response = await wordInsightApi.addLearningItemsToGroup(groupId, uniqueEntryIds)
        if (response.kind === "ok") {
          setGroups((prev) => prev.map((group) => (group.id === groupId ? response.data : group)))
          return "updated"
        }
        setErrorMessage(resolveGroupErrorMessage(response))
        setRequiresLogin(response.kind === "unauthorized")
        return "failed"
      } finally {
        setIsGroupMutating(false)
      }
    },
    [],
  )

  return {
    entries,
    groups,
    activeGroupId: selectedGroupId,
    activeGroupName,
    isLoading,
    isLoadingGroups,
    isGroupMutating,
    isRefreshing,
    isLoadingMore,
    hasMoreEntries,
    errorMessage,
    requiresLogin,
    repeatWords,
    repeatWordCount: repeatWords.length,
    repeatDueWordCount,
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
    onReloadGroups: loadGroups,
    onCreateGroup: handleCreateGroup,
    onRenameGroup: handleRenameGroup,
    onDeleteGroup: handleDeleteGroup,
    onAddEntriesToGroup: handleAddEntriesToGroup,
  }
}
