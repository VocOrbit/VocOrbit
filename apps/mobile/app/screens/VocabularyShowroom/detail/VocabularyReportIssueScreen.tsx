import { FC, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, TextInput, TextStyle, View, ViewStyle } from "react-native"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { translate } from "@/i18n/translate"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { wordInsightApi } from "@/services/api/wordInsightApi"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { DEFAULT_MAX_FONT_SIZE_MULTIPLIER } from "@/utils/textScaling"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

type VocabularyReportIssueScreenProps = AppStackScreenProps<"VocabularyReportIssue">

const MIN_REPORT_MESSAGE_LENGTH = 8
const MAX_REPORT_MESSAGE_LENGTH = 1_000
const REPORT_INPUT_HEIGHT = 220

function resolveSubmitError(problem: GeneralApiProblem): string {
  if (problem.kind === "unauthorized") {
    return translate("vocabulary:report.errors.unauthorized")
  }
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("vocabulary:report.errors.cannotConnect")
  }
  if (problem.kind === "not-found") {
    return translate("vocabulary:report.errors.itemNotFound")
  }
  return translate("vocabulary:report.errors.submitFailed")
}

export const VocabularyReportIssueScreen: FC<VocabularyReportIssueScreenProps> = ({
  navigation,
  route,
}) => {
  const { themed, theme } = useAppTheme()
  const { logout } = useAuth()
  const showroomColors = theme.colors.vocabularyShowroom
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const { entryId, word } = route.params

  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const normalizedMessage = useMemo(() => message.trim(), [message])
  const charactersLeft = MAX_REPORT_MESSAGE_LENGTH - message.length
  const isSubmitDisabled =
    isSubmitting || normalizedMessage.length < MIN_REPORT_MESSAGE_LENGTH || message.length > MAX_REPORT_MESSAGE_LENGTH

  const handleMessageChange = (nextMessage: string) => {
    if (nextMessage.length <= MAX_REPORT_MESSAGE_LENGTH) {
      setMessage(nextMessage)
      return
    }

    setMessage(nextMessage.slice(0, MAX_REPORT_MESSAGE_LENGTH))
  }

  const handleSubmit = async () => {
    if (isSubmitDisabled) return

    setIsSubmitting(true)
    setErrorMessage(undefined)

    const response = await wordInsightApi.reportLearningItemIssue(entryId, normalizedMessage)
    if (response.kind === "ok") {
      setIsSubmitted(true)
      setIsSubmitting(false)
      return
    }

    if (response.kind === "unauthorized") {
      logout()
    }

    setErrorMessage(resolveSubmitError(response))
    setIsSubmitting(false)
  }

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
            accessibilityLabel={translate("vocabulary:report.accessibility.goBack")}
            style={({ pressed }) => [themed($iconButton), pressed && themed($iconButtonPressed)]}
            hitSlop={6}
          >
            <Icon icon="back" size={16} color={showroomColors.textStrong} />
          </Pressable>
          <Text style={themed($headerTitle)} text={translate("vocabulary:report.title")} />
          <View style={themed($headerSpacer)}>
            <AppTutorialVideoButton
              screen="vocabulary_report_issue"
              placement="overview"
              variant="help"
              containerStyle={themed($iconButton)}
            />
          </View>
        </View>

        <Text
          style={themed($subtitle)}
          text={translate("vocabulary:report.subtitle", {
            word,
          })}
        />

        <AppTutorialVideoButton
          screen="vocabulary_report_issue"
          placement="overview"
          variant="banner"
          hideAfterSeen
          containerStyle={{ marginBottom: theme.spacing.md }}
        />

        <View style={themed($formCard)}>
          {isSubmitted ? (
            <View style={themed($successWrap)}>
              <Text style={themed($successTitle)} text={translate("vocabulary:report.successTitle")} />
              <Text style={themed($successBody)} text={translate("vocabulary:report.successBody")} />
              <Pressable
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel={translate("vocabulary:report.accessibility.backToDetail")}
                style={({ pressed }) => [
                  themed($successCtaButton),
                  pressed && themed($successCtaButtonPressed),
                ]}
              >
                <Text
                  style={themed($successCtaText)}
                  text={translate("vocabulary:report.backToDetail")}
                />
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={themed($inputLabel)} text={translate("vocabulary:report.messageLabel")} />
              <TextInput
                value={message}
                onChangeText={handleMessageChange}
                multiline
                scrollEnabled
                autoCapitalize="sentences"
                autoCorrect
                placeholder={translate("vocabulary:report.messagePlaceholder")}
                placeholderTextColor={showroomColors.textMuted}
                maxLength={MAX_REPORT_MESSAGE_LENGTH}
                allowFontScaling
                maxFontSizeMultiplier={DEFAULT_MAX_FONT_SIZE_MULTIPLIER}
                style={themed($input)}
                textAlignVertical="top"
              />
              <Text
                style={themed($counterText)}
                text={translate("vocabulary:report.charactersLeft", {
                  count: Math.max(charactersLeft, 0),
                })}
              />
              {errorMessage ? <Text style={themed($errorText)} text={errorMessage} /> : null}
            </>
          )}
        </View>
      </View>

      {!isSubmitted ? (
        <View style={themed([$ctaWrap, $bottomInsets])}>
          <Pressable
            onPress={() => {
              void handleSubmit()
            }}
            disabled={isSubmitDisabled}
            accessibilityRole="button"
            accessibilityLabel={translate("vocabulary:report.accessibility.submit")}
            style={({ pressed }) => [
              themed($ctaButton),
              isSubmitDisabled && themed($ctaButtonDisabled),
              pressed && !isSubmitDisabled && themed($ctaButtonPressed),
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={showroomColors.accentText} />
            ) : (
              <Text style={themed($ctaText)} text={translate("vocabulary:report.submit")} />
            )}
          </Pressable>
        </View>
      ) : null}
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
  fontSize: 21,
  color: colors.vocabularyShowroom.textStrong,
})

const $headerSpacer: ThemedStyle<ViewStyle> = () => ({
  width: 40,
})

const $subtitle: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.md,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
})

const $formCard: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  padding: spacing.md,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $inputLabel: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 13,
  color: colors.vocabularyShowroom.textStrong,
})

const $input: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  minHeight: REPORT_INPUT_HEIGHT,
  maxHeight: REPORT_INPUT_HEIGHT,
  height: REPORT_INPUT_HEIGHT,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 22,
  color: colors.vocabularyShowroom.textStrong,
  backgroundColor: colors.vocabularyShowroom.surfaceSoft,
})

const $counterText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "right",
})

const $errorText: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.xs,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  color: colors.error,
})

const $successWrap: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
})

const $successTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 20,
  color: colors.vocabularyShowroom.textStrong,
  textAlign: "center",
})

const $successBody: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginTop: spacing.sm,
  fontFamily: typography.primary.normal,
  fontSize: 14,
  lineHeight: 20,
  color: colors.vocabularyShowroom.textMuted,
  textAlign: "center",
})

const $successCtaButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.lg,
  height: 46,
  borderRadius: 999,
  alignSelf: "stretch",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.vocabularyShowroom.outline,
  backgroundColor: colors.vocabularyShowroom.surfaceStrong,
})

const $successCtaButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.vocabularyShowroom.surface,
})

const $successCtaText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  color: colors.vocabularyShowroom.textStrong,
})

const $ctaWrap: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.sm,
  paddingBottom: spacing.lg,
  borderTopWidth: 1,
  borderTopColor: colors.vocabularyShowroom.detailDivider,
  backgroundColor: colors.vocabularyShowroom.background,
})

const $ctaButton: ThemedStyle<ViewStyle> = ({ spacing, colors, isDark }) => ({
  minHeight: 50,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: isDark ? 1.5 : 0,
  borderColor: colors.vocabularyShowroom.ctaOutline,
  backgroundColor: isDark ? colors.vocabularyShowroom.surface : colors.vocabularyShowroom.accent,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.xs,
})

const $ctaButtonDisabled: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  opacity: 0.7,
  borderWidth: isDark ? 1.5 : 0,
  borderColor: colors.vocabularyShowroom.ctaOutline,
  backgroundColor: isDark ? colors.vocabularyShowroom.surface : colors.vocabularyShowroom.accent,
})

const $ctaButtonPressed: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  backgroundColor: isDark ? colors.vocabularyShowroom.surfaceStrong : colors.vocabularyShowroom.accentPressed,
  borderColor: isDark ? colors.vocabularyShowroom.ctaOutlinePressed : colors.vocabularyShowroom.accentPressed,
})

const $ctaText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 16,
  textAlign: "center",
  color: "#FFFFFF",
})
