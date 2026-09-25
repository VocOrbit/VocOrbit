import { vocabularyShowroomLight } from "./vocabularyShowroom"

const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F3F3F1",
  neutral300: "#E0E3DE",
  neutral400: "#C8CEC6",
  neutral500: "#A8B1AA",
  neutral600: "#6D7773",
  neutral700: "#46504D",
  neutral800: "#252A29",
  neutral900: "#111313",

  primary100: "#E2EEE4",
  primary200: "#C7DCC9",
  primary300: "#A8C5AB",
  primary400: "#90B095",
  primary500: "#789A81",
  primary600: "#5F7B67",

  secondary100: "#DDE7E9",
  secondary200: "#BECDD2",
  secondary300: "#9EB5BB",
  secondary400: "#7F9FA6",
  secondary500: "#617E86",

  accent100: "#F1F0E3",
  accent200: "#E7E5D0",
  accent300: "#D9D6B8",
  accent400: "#C9C6A1",
  accent500: "#B6B186",

  angry100: "#F6DCDA",
  angry500: "#C14F46",

  overlay20: "rgba(37, 42, 41, 0.2)",
  overlay50: "rgba(37, 42, 41, 0.5)",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral300,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
  vocabularyShowroom: vocabularyShowroomLight,
} as const
