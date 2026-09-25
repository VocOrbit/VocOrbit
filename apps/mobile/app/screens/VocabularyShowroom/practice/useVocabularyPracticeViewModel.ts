import { useCallback, useEffect, useState } from "react"
import { Platform, useWindowDimensions } from "react-native"

import type { IconTypes } from "@/components/Icon"
import { useVocabularyGroupSelection } from "@/context/VocabularyGroupContext"
import { translate } from "@/i18n/translate"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import {
  exercisesApi,
  type ExerciseCatalogAvailabilityReason,
  type ExerciseMode,
  type ExerciseQuestionType,
} from "@/services/api/exercisesApi"
import {
  type WordInsightLearningItemGroup,
  wordInsightApi,
} from "@/services/api/wordInsightApi"
import { useAppTheme } from "@/theme/context"
import { TABLET_WIDTH_BREAKPOINT, resolveConstrainedContentWidth } from "@/utils/layout"

export type PracticeLayout = {
  practiceTileSize: number
  practiceTileMinHeight: number
  tileGap: number
}

export type PracticeTileId = ExerciseQuestionType | "listen_say"

export type PracticeTileData = {
  id: PracticeTileId
  questionType?: ExerciseQuestionType
  label: string
  icon: IconTypes
  accent: string
  accentSoft: string
  available: boolean
  availableItemCount: number
  minimumItemCount: number
  reason?: ExerciseCatalogAvailabilityReason
}

export type VocabularyPracticeViewModel = {
  selectedMode: ExerciseMode
  isLoading: boolean
  problem?: GeneralApiProblem
  activeItemCount: number
  activeGroupId?: string
  sourceLabel: string
  sourceWordCount: number
  practiceTiles: PracticeTileData[]
  layout: PracticeLayout
  onSelectMode: (mode: ExerciseMode) => void
  onRetryLoad: () => void
}

const ORDERED_TYPES: ExerciseQuestionType[] = [
  "match_synonym",
  "guess_word",
  "fill_in_gap",
  "meaning_match",
]
const PRACTICE_TABLET_TILE_MIN_HEIGHT = 170

const TILE_META: Record<
  PracticeTileId,
  { icon: IconTypes; accent: string; accentSoft: string }
> = {
  meaning_match: {
    icon: "check",
    accent: "#D6C48A",
    accentSoft: "rgba(214, 196, 138, 0.18)",
  },
  fill_in_gap: {
    icon: "components",
    accent: "#A9C6E8",
    accentSoft: "rgba(169, 198, 232, 0.18)",
  },
  guess_word: {
    icon: "community",
    accent: "#E7B586",
    accentSoft: "rgba(231, 181, 134, 0.18)",
  },
  match_synonym: {
    icon: "view",
    accent: "#9BC9C6",
    accentSoft: "rgba(155, 201, 198, 0.18)",
  },
  listen_say: {
    icon: "podcast",
    accent: "#8FB4B0",
    accentSoft: "rgba(143, 180, 176, 0.18)",
  },
}

function resolvePracticeTileLabel(type: ExerciseQuestionType): string {
  switch (type) {
    case "meaning_match":
      return translate("vocabulary:practiceHub.tiles.meaningMatch")
    case "fill_in_gap":
      return translate("vocabulary:practiceHub.tiles.fillInGap")
    case "guess_word":
      return translate("vocabulary:practiceHub.tiles.guessWord")
    case "match_synonym":
      return translate("vocabulary:practiceHub.tiles.matchSynonyms")
    default:
      return type
  }
}

function mapCatalogToTiles(input: {
  items: Array<{
    type: ExerciseQuestionType
    available: boolean
    availableItemCount: number
    reason?: ExerciseCatalogAvailabilityReason
  }>
}): PracticeTileData[] {
  const itemByType = new Map(input.items.map((item) => [item.type, item]))

  return ORDERED_TYPES.map((type) => {
    const meta = TILE_META[type]
    const item = itemByType.get(type)

    return {
      id: type,
      questionType: type,
      label: resolvePracticeTileLabel(type),
      icon: meta.icon,
      accent: meta.accent,
      accentSoft: meta.accentSoft,
      available: item?.available === true,
      availableItemCount: item?.availableItemCount ?? 0,
      minimumItemCount: 2,
      reason: item?.reason,
    }
  })
}

function createListenSayTile(sourceWordCount: number): PracticeTileData {
  const meta = TILE_META.listen_say
  const available = sourceWordCount >= 1

  return {
    id: "listen_say",
    label: translate("vocabulary:practiceHub.tiles.listenSay"),
    icon: meta.icon,
    accent: meta.accent,
    accentSoft: meta.accentSoft,
    available,
    availableItemCount: sourceWordCount,
    minimumItemCount: 1,
    reason: available ? undefined : "not_enough_learning_items",
  }
}

function scopeTilesToSelectedGroup(
  tiles: PracticeTileData[],
  groupItemCount: number | undefined,
): PracticeTileData[] {
  if (groupItemCount === undefined) return tiles

  return tiles.map((tile) => {
    const availableItemCount = Math.min(tile.availableItemCount, groupItemCount)
    const hasEnoughItems = availableItemCount >= 2

    if (tile.questionType === "match_synonym") {
      return {
        ...tile,
        availableItemCount,
      }
    }

    return {
      ...tile,
      available: tile.available && hasEnoughItems,
      availableItemCount,
      reason: hasEnoughItems ? tile.reason : "not_enough_learning_items",
    }
  })
}

export function useVocabularyPracticeViewModel(): VocabularyPracticeViewModel {
  const { width } = useWindowDimensions()
  const { theme } = useAppTheme()
  const { selectedGroupId, setSelectedGroupId } = useVocabularyGroupSelection()
  const [selectedMode, setSelectedMode] = useState<ExerciseMode>("basic")
  const [practiceTiles, setPracticeTiles] = useState<PracticeTileData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [problem, setProblem] = useState<GeneralApiProblem | undefined>(undefined)
  const [activeItemCount, setActiveItemCount] = useState(0)
  const [groups, setGroups] = useState<WordInsightLearningItemGroup[]>([])

  const constrainedContentWidth = resolveConstrainedContentWidth(width)
  const horizontalPadding = theme.spacing.xl
  const tileGap = theme.spacing.md
  const practiceTileSize = Math.max(
    120,
    Math.floor((constrainedContentWidth - horizontalPadding * 2 - tileGap) / 2),
  )
  const isTabletViewport =
    Platform.OS === "ios" ? Platform.isPad === true : width >= TABLET_WIDTH_BREAKPOINT
  const practiceTileMinHeight = isTabletViewport
    ? Math.min(practiceTileSize, PRACTICE_TABLET_TILE_MIN_HEIGHT)
    : practiceTileSize

  const loadCatalog = useCallback(async () => {
    setIsLoading(true)
    setProblem(undefined)
    const response = await exercisesApi.getCatalog({
      mode: selectedMode,
      timezoneOffsetMinutes: -new Date().getTimezoneOffset(),
      groupIds: selectedGroupId ? [selectedGroupId] : undefined,
    })

    if (response.kind === "ok") {
      setPracticeTiles(mapCatalogToTiles({ items: response.data.items }))
      setActiveItemCount(response.data.activeItemCount)
      setIsLoading(false)
      return
    }

    setProblem(response)
    setPracticeTiles([])
    setActiveItemCount(0)
    setIsLoading(false)
    if (__DEV__) {
      console.warn("Practice catalog request failed.", response)
    }
  }, [selectedGroupId, selectedMode])

  const loadGroups = useCallback(async () => {
    const response = await wordInsightApi.listLearningItemGroups()
    if (response.kind === "ok") {
      setGroups(response.data)
      if (selectedGroupId && !response.data.some((group) => group.id === selectedGroupId)) {
        setSelectedGroupId(undefined)
      }
      return
    }

    setGroups([])
    if (__DEV__) {
      console.warn("Learning item groups request failed for practice hub.", response)
    }
  }, [selectedGroupId, setSelectedGroupId])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  useEffect(() => {
    void loadGroups()
  }, [loadGroups])

  const activeGroup = groups.find((group) => group.id === selectedGroupId)
  const selectedGroupWordCount = activeGroup?.itemCount ?? 0
  const hasEnoughSelectedGroupWords = !selectedGroupId || selectedGroupWordCount >= 2
  const groupScopedPracticeTiles = scopeTilesToSelectedGroup(practiceTiles, activeGroup?.itemCount)
  const resolvedBackendPracticeTiles = hasEnoughSelectedGroupWords
    ? groupScopedPracticeTiles
    : groupScopedPracticeTiles.map((tile) => ({
        ...tile,
        available: false,
        availableItemCount: 0,
        reason: "not_enough_learning_items" as const,
      }))
  const sourceWordCount = activeGroup?.itemCount ?? activeItemCount
  const listenSayTile = createListenSayTile(sourceWordCount)
  const resolvedPracticeTiles =
    selectedMode === "advanced"
      ? [...resolvedBackendPracticeTiles, listenSayTile]
      : resolvedBackendPracticeTiles

  return {
    selectedMode,
    isLoading,
    problem,
    activeItemCount,
    activeGroupId: selectedGroupId,
    sourceLabel: activeGroup?.name ?? translate("vocabulary:practiceHub.allWords"),
    sourceWordCount,
    practiceTiles: resolvedPracticeTiles,
    layout: {
      practiceTileSize,
      practiceTileMinHeight,
      tileGap,
    },
    onSelectMode: (mode) => {
      if (mode === selectedMode) return
      setSelectedMode(mode)
    },
    onRetryLoad: () => {
      void loadCatalog()
      void loadGroups()
    },
  }
}
