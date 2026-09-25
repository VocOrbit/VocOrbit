import { FC } from "react"
// eslint-disable-next-line no-restricted-imports
import { Image, ImageStyle, Pressable, TextStyle, View, ViewStyle } from "react-native"

import { AppTutorialVideoButton } from "@/components/AppTutorialVideoButton"
import { Button, ButtonAccessoryProps } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import type { LoginViewModel } from "./useLoginViewModel"

type LoginViewProps = LoginViewModel

type LoginViewExtraProps = {
  selectedRegionLabel: string
  onOpenRegion: () => void
}

type LoginViewCombinedProps = LoginViewProps & LoginViewExtraProps

export const LoginView: FC<LoginViewCombinedProps> = ({
  onGoogleLogin,
  onAppleLogin,
  onReviewLogin,
  isAppleLoginAvailable,
  isReviewLoginAvailable,
  reviewEmail,
  reviewPassword,
  setReviewEmail,
  setReviewPassword,
  isLoading,
  loadingProvider,
  errorTx,
  selectedRegionLabel,
  onOpenRegion,
}) => {
  const { themed, theme } = useAppTheme()

  const GoogleLogo: FC<ButtonAccessoryProps> = ({ style }) => (
    <View style={style}>
      <View style={themed($brandBadge)}>
        <Image source={require("@assets/images/google.png")} style={themed($providerIconImage)} />
      </View>
    </View>
  )

  const AppleLogo: FC<ButtonAccessoryProps> = ({ style }) => (
    <View style={style}>
      <View style={themed($brandBadgeLight)}>
        <Image
          source={require("@assets/images/apple.png")}
          style={[themed($providerIconImage), themed($providerIconImageApple)]}
        />
      </View>
    </View>
  )

  return (
    <Screen
      preset="auto"
      backgroundColor={theme.colors.palette.neutral100}
      contentContainerStyle={themed($screenContentContainer)}
      safeAreaEdges={["top", "bottom"]}
    >
      <View pointerEvents="none" style={themed($decorLayer)}>
        <View style={themed($decorBlobPrimary)} />
        <View style={themed($decorBlobSecondary)} />
        <View style={themed($decorBlobTertiary)} />
      </View>

      <View style={themed($mainContent)}>
        <View style={themed($authCardCenter)}>
          {/* <View style={themed($brandRow)}>
            <View style={themed($brandLogoWrap)}>
              <Image source={require("@assets/images/logo.png")} style={themed($brandLogo)} />
            </View>
          </View> */}

          <Text testID="login-heading" tx="loginScreen:logIn" preset="heading" style={themed($logIn)} />

          <View style={themed($authCard)}>
            <View style={themed($sectionHeader)}>
              <Text tx="loginScreen:continueWith" size="xs" weight="medium" style={themed($sectionLabel)} />
              <View style={themed($sectionMarker)} />
            </View>

            <View style={themed($socialSection)}>
              <Button
                tx={loadingProvider === "google" ? "loginScreen:signingIn" : "loginScreen:googleButton"}
                preset="default"
                style={themed($googleButton)}
                pressedStyle={themed($googleButtonPressed)}
                textStyle={themed($socialButtonText)}
                LeftAccessory={GoogleLogo}
                disabled={isLoading}
                onPress={() => {
                  void onGoogleLogin()
                }}
              />

              <Button
                tx={loadingProvider === "apple" ? "loginScreen:signingIn" : "loginScreen:appleButton"}
                preset="default"
                style={themed($appleButton)}
                pressedStyle={themed($appleButtonPressed)}
                textStyle={themed($socialButtonText)}
                disabledStyle={themed($appleButtonDisabled)}
                disabledTextStyle={themed($socialButtonText)}
                LeftAccessory={AppleLogo}
                disabled={isLoading || !isAppleLoginAvailable}
                onPress={() => {
                  void onAppleLogin()
                }}
              />
            </View>

            {isReviewLoginAvailable ? (
              <View style={themed($reviewSection)}>
                <Text text="Review sign-in" size="xs" weight="medium" style={themed($reviewTitle)} />
                <TextField
                  value={reviewEmail}
                  onChangeText={setReviewEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="username"
                  placeholder="Email"
                  containerStyle={themed($reviewInputContainer)}
                  inputWrapperStyle={themed($reviewInputWrapper)}
                  style={themed($reviewInput)}
                  editable={!isLoading}
                />
                <TextField
                  value={reviewPassword}
                  onChangeText={setReviewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  secureTextEntry
                  placeholder="Password"
                  containerStyle={themed($reviewInputContainer)}
                  inputWrapperStyle={themed($reviewInputWrapper)}
                  style={themed($reviewInput)}
                  editable={!isLoading}
                />
                <Button
                  tx={loadingProvider === "review" ? "loginScreen:signingIn" : undefined}
                  text={loadingProvider === "review" ? undefined : "Sign in with Email"}
                  preset="default"
                  style={themed($reviewButton)}
                  pressedStyle={themed($reviewButtonPressed)}
                  textStyle={themed($reviewButtonText)}
                  disabled={isLoading}
                  onPress={() => {
                    void onReviewLogin()
                  }}
                />
              </View>
            ) : null}

            <Text tx="loginScreen:moreProvidersSoon" size="xs" style={themed($providersHint)} />

            {errorTx ? (
              <View style={themed($errorBanner)}>
                <View style={themed($errorBadge)}>
                  <Icon icon="x" size={10} color="#FFFFFF" />
                </View>
                <Text tx={errorTx} size="xs" style={themed($errorText)} />
              </View>
            ) : null}
          </View>

          <AppTutorialVideoButton
            screen="login"
            placement="overview"
            variant="banner"
            hideAfterSeen
            containerStyle={{ marginTop: theme.spacing.md }}
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={translate("loginScreen:accessibility.openRegionSelection")}
        onPress={onOpenRegion}
        style={({ pressed }) => [themed($regionButton), pressed && themed($regionButtonPressed)]}
      >
        <View style={themed($regionBadge)}>
          <Image source={require("@assets/images/region.png")} style={themed($regionBadgeImage)} />
        </View>
        <View style={themed($regionContent)}>
          <Text tx="loginScreen:regionTitle" style={themed($regionTitle)} />
          <Text
            tx="loginScreen:regionSubtitle"
            txOptions={{ region: selectedRegionLabel }}
            size="xs"
            style={themed($regionSubtitle)}
          />
        </View>
        <View style={themed($regionActionPill)}>
          <Text tx="loginScreen:changeRegion" size="xxs" weight="medium" style={themed($regionAction)} />
          <Icon icon="caretRight" size={12} color={theme.colors.tint} />
        </View>
      </Pressable>
    </Screen>
  )
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  justifyContent: "flex-start",
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxxs,
  paddingHorizontal: spacing.lg,
  gap: spacing.lg,
  position: "relative",
})

const $decorLayer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: -40,
  left: -24,
  right: -24,
  height: 300,
  zIndex: 0,
})

const $decorBlobPrimary: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: 190,
  height: 190,
  borderRadius: 95,
  backgroundColor: colors.palette.primary200,
  opacity: 0.65,
})

const $decorBlobSecondary: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 28,
  right: 4,
  width: 150,
  height: 150,
  borderRadius: 75,
  backgroundColor: colors.palette.secondary200,
  opacity: 0.55,
})

const $decorBlobTertiary: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 120,
  left: 120,
  width: 84,
  height: 84,
  borderRadius: 42,
  backgroundColor: colors.palette.accent200,
  opacity: 0.65,
})

const $mainContent: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
  zIndex: 1,
})

const $authCardCenter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  gap: spacing.lg,
})

const $brandRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.md,
})

const $brandLogoWrap: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 60,
  height: 60,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  shadowColor: colors.palette.neutral900,
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
})

const $brandLogo: ThemedStyle<ImageStyle> = () => ({
  width: 40,
  height: 40,
  resizeMode: "contain",
})

const $brandTextWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginLeft: spacing.sm,
})

const $brandEyebrow: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral800,
  letterSpacing: 1.4,
})

const $brandCaption: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $logIn: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  marginBottom: 0,
  fontFamily: typography.primary.bold,
  fontSize: 32,
  lineHeight: 36,
  letterSpacing: 0,
  color: colors.palette.neutral900,
  textAlign: "center",
})

const $authCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 28,
  padding: spacing.lg,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  shadowColor: colors.palette.neutral900,
  shadowOpacity: 0.06,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
})

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $sectionLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral700,
  letterSpacing: 1,
})

const $sectionMarker: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  height: 1,
  marginLeft: spacing.sm,
  backgroundColor: colors.palette.neutral300,
})

const $socialSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $reviewSection: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.sm,
  paddingTop: spacing.sm,
  gap: spacing.xs,
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral300,
})

const $reviewTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $reviewInputContainer: ThemedStyle<ViewStyle> = () => ({
  marginBottom: 0,
})

const $reviewInputWrapper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minHeight: 44,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.palette.neutral100,
})

const $reviewInput: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $reviewButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
})

const $reviewButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  borderColor: colors.palette.neutral400,
})

const $reviewButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral900,
})

const $googleButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 60,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "flex-start",
  paddingHorizontal: spacing.md,
  shadowColor: colors.palette.neutral900,
  shadowOpacity: 0.04,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
})

const $googleButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
})

const $appleButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 60,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "flex-start",
  paddingHorizontal: spacing.md,
})

const $appleButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  borderColor: colors.palette.neutral400,
})

const $appleButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.72,
})

const $socialButtonText: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  color: colors.palette.neutral900,
  textAlign: "left",
  marginLeft: spacing.xs,
  fontFamily: typography.primary.semiBold,
})

const $socialButtonTextLight: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  color: colors.palette.neutral100,
  textAlign: "left",
  marginLeft: spacing.xs,
  fontFamily: typography.primary.semiBold,
})

const $providersHint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.sm,
  textAlign: "center",
})

const $brandBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  alignItems: "center",
  justifyContent: "center",
})

const $brandBadgeLight: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  alignItems: "center",
  justifyContent: "center",
})

const $providerIconImage: ThemedStyle<ImageStyle> = () => ({
  width: 16,
  height: 16,
  resizeMode: "contain",
})

const $providerIconImageApple: ThemedStyle<ImageStyle> = ({ colors }) => ({
  tintColor: colors.palette.neutral900,
})

const $regionBadgeImage: ThemedStyle<ImageStyle> = () => ({
  width: 22,
  height: 22,
  resizeMode: "contain",
})

const $errorBanner: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.sm,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.error,
  backgroundColor: colors.errorBackground,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
})

const $errorBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: colors.error,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.xs,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
  flex: 1,
})

const $regionButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  zIndex: 1,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: colors.separator,
  backgroundColor: colors.palette.neutral100,
  minHeight: 84,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  shadowColor: colors.palette.neutral900,
  shadowOpacity: 0.05,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
})

const $regionButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.palette.primary300,
})

const $regionBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.palette.primary100,
  borderWidth: 1,
  borderColor: colors.palette.primary200,
})

const $regionContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.sm,
})

const $regionTitle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.semiBold,
  color: colors.palette.neutral900,
})

const $regionSubtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xxxs,
})

const $regionActionPill: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: 999,
  backgroundColor: colors.palette.primary100,
  borderWidth: 1,
  borderColor: colors.palette.primary200,
  marginLeft: spacing.xs,
})

const $regionAction: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.tint,
  marginRight: spacing.xxs,
})
