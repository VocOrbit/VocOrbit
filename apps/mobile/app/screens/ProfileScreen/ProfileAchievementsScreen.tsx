import { FC, useMemo, useState } from "react"
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import {
  type ProfileAchievement,
  type ProfileAchievementCategory,
  normalizeProfileAchievementSnapshot,
  resolveProfileAchievements,
} from "./profileAchievementsModel"

type ProfileAchievementsScreenProps = AppStackScreenProps<"ProfileAchievements">
type AchievementFilter = "All" | ProfileAchievementCategory

const FILTERS: AchievementFilter[] = [
  "All",
  "Vocabulary",
  "Practice",
  "Consistency",
  "Organization",
]

function getAchievementFilterLabel(filter: AchievementFilter): string {
  switch (filter) {
    case "All":
      return translate("vocabulary:achievements.filters.all")
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

export const ProfileAchievementsScreen: FC<ProfileAchievementsScreenProps> = ({
  navigation,
  route,
}) => {
  useTranslation()
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const [selectedFilter, setSelectedFilter] = useState<AchievementFilter>("All")
  const snapshot = useMemo(
    () => normalizeProfileAchievementSnapshot(route.params?.snapshot),
    [route.params?.snapshot],
  )
  const achievements = resolveProfileAchievements(snapshot)
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length
  const totalCount = achievements.length
  const overallProgress = totalCount > 0 ? unlockedCount / totalCount : 0
  const overallProgressWidth: `${number}%` = `${Math.round(overallProgress * 100)}%`
  const filteredAchievements = useMemo(
    () =>
      selectedFilter === "All"
        ? achievements
        : achievements.filter((achievement) => achievement.category === selectedFilter),
    [achievements, selectedFilter],
  )
  const nextAchievement = achievements.find((achievement) => !achievement.unlocked)

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor={showroomColors.background}
      systemBarStyle={theme.isDark ? "light" : "dark"}
      contentContainerStyle={themed($screenContent)}
    >
      <View style={themed($layout)}>
        <View style={themed($headerRow)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("common:back")}
            onPress={() => navigation.goBack()}
            hitSlop={6}
            style={({ pressed }) => [themed($iconButton), pressed && themed($pressedSoft)]}
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>
          <Text style={themed($headerTitle)} text={translate("vocabulary:achievements.title")} />
          <View style={themed($headerSpacer)} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themed([$scrollContent, $bottomInsets])}
        >
          <View style={themed($heroCard)}>
            <View style={themed($heroTopRow)}>
              <View style={themed($heroIcon)}>
                <MaterialCommunityIcons name="trophy-outline" size={26} color="#FFFFFF" />
              </View>
              <View style={themed($heroCopy)}>
                <Text
                  style={themed($heroEyebrow)}
                  text={translate("vocabulary:achievements.learningMilestones")}
                />
                <Text
                  style={themed($heroTitle)}
                  text={translate("vocabulary:achievements.unlockedCount", {
                    unlocked: unlockedCount,
                    total: totalCount,
                  })}
                />
              </View>
            </View>

            <View style={themed($overallTrack)}>
              <View style={[themed($overallFill), { width: overallProgressWidth }]} />
            </View>

            <Text
              style={themed($heroBody)}
              text={
                nextAchievement
                  ? translate("vocabulary:achievements.next", {
                      title: nextAchievement.title,
                      progress: nextAchievement.progressLabel,
                    })
                  : translate("vocabulary:achievements.allUnlocked")
              }
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={themed($filterRow)}
          >
            {FILTERS.map((filter) => {
              const isSelected = selectedFilter === filter
              const filterLabel = getAchievementFilterLabel(filter)
              return (
                <Pressable
                  key={filter}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={translate("vocabulary:achievements.showFilter", {
                    filter: filterLabel,
                  })}
                  onPress={() => setSelectedFilter(filter)}
                  style={({ pressed }) => [
                    themed($filterChip),
                    isSelected && themed($filterChipSelected),
                    pressed && themed($pressedSoft),
                  ]}
                >
                  <Text
                    style={isSelected ? themed($filterTextSelected) : themed($filterText)}
                    text={filterLabel}
                  />
                </Pressable>
              )
            })}
          </ScrollView>

          <View style={themed($achievementList)}>
            {filteredAchievements.map((achievement) => (
              <AchievementRow key={achievement.id} achievement={achievement} />
            ))}
          </View>
        </ScrollView>
      </View>
    </Screen>
  )
}

const AchievementRow: FC<{ achievement: ProfileAchievement }> = ({ achievement }) => {
  const { themed, theme } = useAppTheme()
  const showroomColors = theme.colors.vocabularyShowroom
  const progressWidth: `${number}%` = `${Math.round(achievement.progress * 100)}%`

  return (
    <View style={[themed($achievementCard), !achievement.unlocked && themed($achievementLocked)]}>
      <View
        style={[themed($achievementIcon), achievement.unlocked && themed($achievementIconUnlocked)]}
      >
        <MaterialCommunityIcons
          name={achievement.icon as never}
          size={22}
          color={achievement.unlocked ? "#FFFFFF" : showroomColors.textMuted}
        />
      </View>

      <View style={themed($achievementCopy)}>
        <View style={themed($achievementTitleRow)}>
          <Text style={themed($achievementTitle)} text={achievement.title} numberOfLines={1} />
          <View style={[themed($statusPill), achievement.unlocked && themed($statusPillUnlocked)]}>
            <Text
              style={achievement.unlocked ? themed($statusTextUnlocked) : themed($statusText)}
              text={
                achievement.unlocked
                  ? translate("vocabulary:achievements.status.unlocked")
                  : translate("vocabulary:achievements.status.locked")
              }
              numberOfLines={1}
              adjustsFontSizeToFit
            />
          </View>
        </View>

        <Text style={themed($achievementBody)} text={achievement.description} />
        <View style={themed($achievementMetaRow)}>
          <Text style={themed($achievementCategory)} text={achievement.categoryLabel} />
          <Text style={themed($achievementProgressText)} text={achievement.progressLabel} />
        </View>
        <View style={themed($achievementTrack)}>
          <View
            style={[
              themed($achievementFill),
              achievement.unlocked && themed($achievementFillUnlocked),
              { width: progressWidth },
            ]}
          />
        </View>
      </View>
    </View>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $layout: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.background,
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

const $pressedSoft: ThemedStyle<ViewStyle> = ({ colors }) => ({
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

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.lg,
  paddingBottom: spacing.xl,
  gap: spacing.md,
})

const $heroCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderRadius: 24,
  padding: spacing.lg,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  shadowColor: "#000000",
  shadowOpacity: 0.05,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 3,
})

const $heroTopRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
})

const $heroIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 56,
  width: 56,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $heroCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $heroEyebrow: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $heroTitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxxs,
  fontFamily: typography.primary.bold,
  fontSize: 28,
  lineHeight: 34,
  color: colors.vocabularyShowroom.textStrong,
})

const $overallTrack: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  height: 9,
  borderRadius: 999,
  overflow: "hidden",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $overallFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $heroBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
})

const $filterRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
  paddingRight: spacing.lg,
})

const $filterChip: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 38,
  borderRadius: 19,
  paddingHorizontal: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $filterChipSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
  borderColor: colors.vocabularyShowroom.accent,
})

const $filterText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textMuted,
})

const $filterTextSelected: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: "#FFFFFF",
})

const $achievementList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $achievementCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  minHeight: 118,
  borderRadius: 20,
  padding: spacing.md,
  flexDirection: "row",
  gap: spacing.md,
  backgroundColor: colors.vocabularyShowroom.surface,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
})

const $achievementLocked: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.78,
})

const $achievementIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 46,
  width: 46,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $achievementIconUnlocked: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $achievementCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $achievementTitleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $achievementTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flex: 1,
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  lineHeight: 21,
  color: colors.vocabularyShowroom.textStrong,
})

const $statusPill: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexShrink: 0,
  minWidth: 68,
  minHeight: 26,
  borderRadius: 13,
  paddingHorizontal: spacing.xs,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $statusPillUnlocked: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
})

const $statusText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 11,
  color: colors.vocabularyShowroom.textMuted,
})

const $statusTextUnlocked: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 11,
  color: "#FFFFFF",
})

const $achievementBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xxs,
  fontFamily: typography.primary.normal,
  fontSize: 13,
  lineHeight: 18,
  color: colors.vocabularyShowroom.textMuted,
})

const $achievementMetaRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
})

const $achievementCategory: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  color: colors.vocabularyShowroom.textStrong,
})

const $achievementProgressText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  flexShrink: 1,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "right",
})

const $achievementTrack: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xs,
  height: 6,
  borderRadius: 999,
  overflow: "hidden",
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $achievementFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  borderRadius: 999,
  backgroundColor: colors.vocabularyShowroom.textMuted,
})

const $achievementFillUnlocked: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.accent,
})
