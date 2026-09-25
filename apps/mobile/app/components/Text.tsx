import { ReactNode, forwardRef, ForwardedRef } from "react"
/* eslint-disable no-restricted-imports */
import {
  StyleProp,
  StyleSheet,
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from "react-native"
/* eslint-enable no-restricted-imports */
import { TOptions } from "i18next"

import { useOptionalUiPreferences } from "@/context/UiPreferencesContext"
import { isRTL, TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle, ThemedStyleArray } from "@/theme/types"
import { typography } from "@/theme/typography"
import { scaleTypographyStyleForIpad } from "@/theme/typographyScale"
import { DEFAULT_MAX_FONT_SIZE_MULTIPLIER } from "@/utils/textScaling"

type Sizes = keyof typeof $sizeStyles
type Weights = keyof typeof typography.primary
type Presets = "default" | "bold" | "heading" | "subheading" | "formLabel" | "formHelper"

export interface TextProps extends RNTextProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TxKeyPath
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TOptions
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<TextStyle>
  /**
   * One of the different types of text presets.
   */
  preset?: Presets
  /**
   * Text weight modifier.
   */
  weight?: Weights
  /**
   * Text size modifier.
   */
  size?: Sizes
  /**
   * Children components.
   */
  children?: ReactNode
}

/**
 * For your text displaying needs.
 * This component is a HOC over the built-in React Native one.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Text/}
 * @param {TextProps} props - The props for the `Text` component.
 * @returns {JSX.Element} The rendered `Text` component.
 */
export const Text = forwardRef(function Text(props: TextProps, ref: ForwardedRef<RNText>) {
  const {
    weight,
    size,
    tx,
    txOptions,
    text,
    children,
    style: $styleOverride,
    allowFontScaling = true,
    maxFontSizeMultiplier = DEFAULT_MAX_FONT_SIZE_MULTIPLIER,
    ...rest
  } = props
  const { themed } = useAppTheme()
  const uiPreferences = useOptionalUiPreferences()

  const i18nText = tx && translate(tx, txOptions)
  const content = i18nText || text || children

  const preset: Presets = props.preset ?? "default"
  const $styles: StyleProp<TextStyle> = [
    $rtlStyle,
    themed($presets[preset]),
    weight && $fontWeightStyles[weight],
    size && scaleTypographyStyleForIpad($sizeStyles[size]),
    $styleOverride,
  ]
  const $scaledTextStyle = createScaledTextStyle($styles, uiPreferences?.vocabularyFontScale ?? 1)

  return (
    <RNText
      {...rest}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={$scaledTextStyle ? [$styles, $scaledTextStyle] : $styles}
      ref={ref}
    >
      {content}
    </RNText>
  )
})

function createScaledTextStyle(
  style: StyleProp<TextStyle>,
  fontScale: number,
): TextStyle | undefined {
  if (fontScale === 1) return undefined

  const flattened = StyleSheet.flatten(style)
  if (!flattened) return undefined

  const scaledStyle: TextStyle = {}
  if (typeof flattened.fontSize === "number") {
    scaledStyle.fontSize = Math.round(flattened.fontSize * fontScale)
  }
  if (typeof flattened.lineHeight === "number") {
    scaledStyle.lineHeight = Math.round(flattened.lineHeight * fontScale)
  }

  return Object.keys(scaledStyle).length > 0 ? scaledStyle : undefined
}

const $sizeStyles = {
  xxl: { fontSize: 36, lineHeight: 44 } satisfies TextStyle,
  xl: { fontSize: 24, lineHeight: 34 } satisfies TextStyle,
  lg: { fontSize: 20, lineHeight: 32 } satisfies TextStyle,
  md: { fontSize: 18, lineHeight: 26 } satisfies TextStyle,
  sm: { fontSize: 16, lineHeight: 24 } satisfies TextStyle,
  xs: { fontSize: 14, lineHeight: 21 } satisfies TextStyle,
  xxs: { fontSize: 12, lineHeight: 18 } satisfies TextStyle,
}

const $fontWeightStyles = Object.entries(typography.primary).reduce((acc, [weight, fontFamily]) => {
  return { ...acc, [weight]: { fontFamily } }
}, {}) as Record<Weights, TextStyle>

const $baseStyle: ThemedStyle<TextStyle> = (theme) => ({
  ...$sizeStyles.sm,
  ...$fontWeightStyles.normal,
  color: theme.colors.text,
})

const $presets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [$baseStyle],
  bold: [$baseStyle, { ...$fontWeightStyles.bold }],
  heading: [
    $baseStyle,
    {
      ...$sizeStyles.xxl,
      ...$fontWeightStyles.bold,
    },
  ],
  subheading: [$baseStyle, { ...$sizeStyles.lg, ...$fontWeightStyles.medium }],
  formLabel: [$baseStyle, { ...$fontWeightStyles.medium }],
  formHelper: [$baseStyle, { ...$sizeStyles.sm, ...$fontWeightStyles.normal }],
}
const $rtlStyle: TextStyle = isRTL ? { writingDirection: "rtl" } : {}
