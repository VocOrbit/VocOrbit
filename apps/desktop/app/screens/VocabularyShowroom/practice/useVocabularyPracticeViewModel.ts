import { useCallback, useEffect, useState } from "react"
import { Platform, useWindowDimensions } from "react-native"

import type { IconTypes } from "@/components/Icon"
import { translate } from "@/i18n/translate"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import {
  exercisesApi,
  type ExerciseMode,
  type ExerciseCatalogAvailabilityReason,
  type ExerciseQuestionType,
} from "@/services/api/exercisesApi"
import { useAppTheme } from "@/theme/context"
import { TABLET_WIDTH_BREAKPOINT, resolveConstrainedContentWidth } from "@/utils/layout"

export type PracticeLayout = {
  practiceTileSize: number
  practiceTileMinHeight: number
  tileGap: number
}

export type PracticeTileData = {
  id: ExerciseQuestionType
  questionType: ExerciseQuestionType
  label: string
  icon: IconTypes
  accent: string
  accentSoft: string
  available: boolean
  availableItemCount: number
  reason?: ExerciseCatalogAvailabilityReason
}

export type VocabularyPracticeViewModel = {
  selectedMode: ExerciseMode
  isLoading: boolean
  problem?: GeneralApiProblem
  activeItemCount: number
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
  ExerciseQuestionType,
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
      reason: item?.reason,
    }
  })
}

export function useVocabularyPracticeViewModel(): VocabularyPracticeViewModel {
  const { width } = useWindowDimensions()
  const { theme } = useAppTheme()
  const [selectedMode, setSelectedMode] = useState<ExerciseMode>("basic")
  const [practiceTiles, setPracticeTiles] = useState<PracticeTileData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [problem, setProblem] = useState<GeneralApiProblem | undefined>(undefined)
  const [activeItemCount, setActiveItemCount] = useState(0)

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
  }, [selectedMode])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  return {
    selectedMode,
    isLoading,
    problem,
    activeItemCount,
    practiceTiles,
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
    },
  }
}
