import type { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"

export type ProfileAchievementCategory = "Vocabulary" | "Practice" | "Consistency" | "Organization"

export type ProfileAchievementSnapshot = {
  totalWords: number
  favoriteWords: number
  collections: number
  currentStreak: number
  repeatWords: number
  repeatDueWords: number
  learnedWords: number
  activeWords: number
  weeklyStudiedWords: number
  weeklyLearnedWords: number
  weakWords: number
  activeDays: number
  sessionsCompleted: number
  answeredQuestions: number
  correctAnswers: number
  accuracyPercent: number
}

export type ProfileAchievement = {
  id: string
  title: string
  description: string
  category: ProfileAchievementCategory
  categoryLabel: string
  icon: string
  unlocked: boolean
  progress: number
  progressLabel: string
}

type AchievementDefinition = {
  id: string
  title: TxKeyPath
  description: TxKeyPath
  category: ProfileAchievementCategory
  icon: string
  target: number
  getCurrent: (snapshot: ProfileAchievementSnapshot) => number
  getProgress?: (snapshot: ProfileAchievementSnapshot) => number
  getProgressLabel?: (snapshot: ProfileAchievementSnapshot) => string
  isUnlocked?: (snapshot: ProfileAchievementSnapshot) => boolean
}

export const EMPTY_PROFILE_ACHIEVEMENT_SNAPSHOT: ProfileAchievementSnapshot = {
  totalWords: 0,
  favoriteWords: 0,
  collections: 0,
  currentStreak: 0,
  repeatWords: 0,
  repeatDueWords: 0,
  learnedWords: 0,
  activeWords: 0,
  weeklyStudiedWords: 0,
  weeklyLearnedWords: 0,
  weakWords: 0,
  activeDays: 0,
  sessionsCompleted: 0,
  answeredQuestions: 0,
  correctAnswers: 0,
  accuracyPercent: 0,
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(value, 1))
}

function cleanNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.round(value))
}

function formatDefaultProgress(current: number, target: number): string {
  return translate("vocabulary:achievements.progress.default", {
    current: formatNumber(current),
    target: formatNumber(target),
  })
}

function getAchievementCategoryLabel(category: ProfileAchievementCategory): string {
  switch (category) {
    case "Vocabulary":
      return translate("vocabulary:achievements.filters.vocabulary")
    case "Practice":
      return translate("vocabulary:achievements.filters.practice")
    case "Consistency":
      return translate("vocabulary:achievements.filters.consistency")
    case "Organization":
      return translate("vocabulary:achievements.filters.organization")
  }
}

export function normalizeProfileAchievementSnapshot(
  snapshot?: Partial<ProfileAchievementSnapshot>,
): ProfileAchievementSnapshot {
  return {
    totalWords: cleanNumber(snapshot?.totalWords),
    favoriteWords: cleanNumber(snapshot?.favoriteWords),
    collections: cleanNumber(snapshot?.collections),
    currentStreak: cleanNumber(snapshot?.currentStreak),
    repeatWords: cleanNumber(snapshot?.repeatWords),
    repeatDueWords: cleanNumber(snapshot?.repeatDueWords),
    learnedWords: cleanNumber(snapshot?.learnedWords),
    activeWords: cleanNumber(snapshot?.activeWords),
    weeklyStudiedWords: cleanNumber(snapshot?.weeklyStudiedWords),
    weeklyLearnedWords: cleanNumber(snapshot?.weeklyLearnedWords),
    weakWords: cleanNumber(snapshot?.weakWords),
    activeDays: cleanNumber(snapshot?.activeDays),
    sessionsCompleted: cleanNumber(snapshot?.sessionsCompleted),
    answeredQuestions: cleanNumber(snapshot?.answeredQuestions),
    correctAnswers: cleanNumber(snapshot?.correctAnswers),
    accuracyPercent: cleanNumber(snapshot?.accuracyPercent),
  }
}

export const PROFILE_ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first-save",
    title: "vocabulary:achievements.definitions.firstSave.title",
    description: "vocabulary:achievements.definitions.firstSave.description",
    category: "Vocabulary",
    icon: "bookmark-check-outline",
    target: 1,
    getCurrent: (snapshot) => snapshot.totalWords,
  },
  {
    id: "word-stack",
    title: "vocabulary:achievements.definitions.wordStack.title",
    description: "vocabulary:achievements.definitions.wordStack.description",
    category: "Vocabulary",
    icon: "cards-outline",
    target: 10,
    getCurrent: (snapshot) => snapshot.totalWords,
  },
  {
    id: "library-builder",
    title: "vocabulary:achievements.definitions.libraryBuilder.title",
    description: "vocabulary:achievements.definitions.libraryBuilder.description",
    category: "Vocabulary",
    icon: "bookshelf",
    target: 50,
    getCurrent: (snapshot) => snapshot.totalWords,
  },
  {
    id: "orbit-archive",
    title: "vocabulary:achievements.definitions.orbitArchive.title",
    description: "vocabulary:achievements.definitions.orbitArchive.description",
    category: "Vocabulary",
    icon: "orbit",
    target: 100,
    getCurrent: (snapshot) => snapshot.totalWords,
  },
  {
    id: "first-favorite",
    title: "vocabulary:achievements.definitions.firstFavorite.title",
    description: "vocabulary:achievements.definitions.firstFavorite.description",
    category: "Vocabulary",
    icon: "heart-outline",
    target: 1,
    getCurrent: (snapshot) => snapshot.favoriteWords,
  },
  {
    id: "taste-maker",
    title: "vocabulary:achievements.definitions.tasteMaker.title",
    description: "vocabulary:achievements.definitions.tasteMaker.description",
    category: "Vocabulary",
    icon: "heart-multiple-outline",
    target: 10,
    getCurrent: (snapshot) => snapshot.favoriteWords,
  },
  {
    id: "first-collection",
    title: "vocabulary:achievements.definitions.firstCollection.title",
    description: "vocabulary:achievements.definitions.firstCollection.description",
    category: "Organization",
    icon: "folder-plus-outline",
    target: 1,
    getCurrent: (snapshot) => snapshot.collections,
  },
  {
    id: "collection-system",
    title: "vocabulary:achievements.definitions.collectionSystem.title",
    description: "vocabulary:achievements.definitions.collectionSystem.description",
    category: "Organization",
    icon: "folder-multiple-outline",
    target: 3,
    getCurrent: (snapshot) => snapshot.collections,
  },
  {
    id: "repeat-ready",
    title: "vocabulary:achievements.definitions.repeatReady.title",
    description: "vocabulary:achievements.definitions.repeatReady.description",
    category: "Practice",
    icon: "bell-ring-outline",
    target: 1,
    getCurrent: (snapshot) => snapshot.repeatWords,
  },
  {
    id: "review-queue",
    title: "vocabulary:achievements.definitions.reviewQueue.title",
    description: "vocabulary:achievements.definitions.reviewQueue.description",
    category: "Practice",
    icon: "playlist-check",
    target: 3,
    getCurrent: (snapshot) => snapshot.repeatDueWords,
  },
  {
    id: "practice-starter",
    title: "vocabulary:achievements.definitions.practiceStarter.title",
    description: "vocabulary:achievements.definitions.practiceStarter.description",
    category: "Practice",
    icon: "target",
    target: 1,
    getCurrent: (snapshot) => snapshot.sessionsCompleted,
  },
  {
    id: "question-run",
    title: "vocabulary:achievements.definitions.questionRun.title",
    description: "vocabulary:achievements.definitions.questionRun.description",
    category: "Practice",
    icon: "checkbox-marked-circle-outline",
    target: 25,
    getCurrent: (snapshot) => snapshot.answeredQuestions,
  },
  {
    id: "accuracy-spark",
    title: "vocabulary:achievements.definitions.accuracySpark.title",
    description: "vocabulary:achievements.definitions.accuracySpark.description",
    category: "Practice",
    icon: "check-decagram-outline",
    target: 70,
    getCurrent: (snapshot) => snapshot.accuracyPercent,
    getProgress: (snapshot) =>
      Math.min(snapshot.accuracyPercent / 70, snapshot.answeredQuestions / 10),
    getProgressLabel: (snapshot) =>
      translate("vocabulary:achievements.progress.accuracyAnswers", {
        accuracy: formatNumber(snapshot.accuracyPercent),
        answered: formatNumber(snapshot.answeredQuestions),
        target: 10,
      }),
    isUnlocked: (snapshot) => snapshot.accuracyPercent >= 70 && snapshot.answeredQuestions >= 10,
  },
  {
    id: "sharp-memory",
    title: "vocabulary:achievements.definitions.sharpMemory.title",
    description: "vocabulary:achievements.definitions.sharpMemory.description",
    category: "Practice",
    icon: "brain",
    target: 85,
    getCurrent: (snapshot) => snapshot.accuracyPercent,
    getProgress: (snapshot) =>
      Math.min(snapshot.accuracyPercent / 85, snapshot.answeredQuestions / 20),
    getProgressLabel: (snapshot) =>
      translate("vocabulary:achievements.progress.accuracyAnswers", {
        accuracy: formatNumber(snapshot.accuracyPercent),
        answered: formatNumber(snapshot.answeredQuestions),
        target: 20,
      }),
    isUnlocked: (snapshot) => snapshot.accuracyPercent >= 85 && snapshot.answeredQuestions >= 20,
  },
  {
    id: "weekly-focus",
    title: "vocabulary:achievements.definitions.weeklyFocus.title",
    description: "vocabulary:achievements.definitions.weeklyFocus.description",
    category: "Consistency",
    icon: "calendar-week-outline",
    target: 10,
    getCurrent: (snapshot) => snapshot.weeklyStudiedWords,
  },
  {
    id: "active-week",
    title: "vocabulary:achievements.definitions.activeWeek.title",
    description: "vocabulary:achievements.definitions.activeWeek.description",
    category: "Consistency",
    icon: "calendar-check-outline",
    target: 5,
    getCurrent: (snapshot) => snapshot.activeDays,
  },
  {
    id: "three-day-rhythm",
    title: "vocabulary:achievements.definitions.threeDayRhythm.title",
    description: "vocabulary:achievements.definitions.threeDayRhythm.description",
    category: "Consistency",
    icon: "fire",
    target: 3,
    getCurrent: (snapshot) => snapshot.currentStreak,
  },
  {
    id: "seven-day-orbit",
    title: "vocabulary:achievements.definitions.sevenDayOrbit.title",
    description: "vocabulary:achievements.definitions.sevenDayOrbit.description",
    category: "Consistency",
    icon: "weather-sunny",
    target: 7,
    getCurrent: (snapshot) => snapshot.currentStreak,
  },
  {
    id: "first-mastery",
    title: "vocabulary:achievements.definitions.firstMastery.title",
    description: "vocabulary:achievements.definitions.firstMastery.description",
    category: "Vocabulary",
    icon: "school-outline",
    target: 1,
    getCurrent: (snapshot) => snapshot.learnedWords,
  },
  {
    id: "mastery-sprint",
    title: "vocabulary:achievements.definitions.masterySprint.title",
    description: "vocabulary:achievements.definitions.masterySprint.description",
    category: "Vocabulary",
    icon: "medal-outline",
    target: 10,
    getCurrent: (snapshot) => snapshot.learnedWords,
  },
]

export function resolveProfileAchievements(
  input?: Partial<ProfileAchievementSnapshot>,
): ProfileAchievement[] {
  const snapshot = normalizeProfileAchievementSnapshot(input)

  return PROFILE_ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const current = definition.getCurrent(snapshot)
    const unlocked = definition.isUnlocked
      ? definition.isUnlocked(snapshot)
      : current >= definition.target
    const progress = definition.getProgress
      ? definition.getProgress(snapshot)
      : current / definition.target

    return {
      id: definition.id,
      title: translate(definition.title),
      description: translate(definition.description),
      category: definition.category,
      categoryLabel: getAchievementCategoryLabel(definition.category),
      icon: definition.icon,
      unlocked,
      progress: unlocked ? 1 : clampProgress(progress),
      progressLabel:
        definition.getProgressLabel?.(snapshot) ??
        formatDefaultProgress(current, definition.target),
    }
  })
}
