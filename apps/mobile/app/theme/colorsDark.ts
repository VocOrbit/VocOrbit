import { vocabularyShowroomDark } from "./vocabularyShowroom"

const palette = {
  neutral900: "#F8F8F5",
  neutral800: "#E7ECE7",
  neutral700: "#CFD9D0",
  neutral600: "#AEB8B0",
  neutral500: "#87928C",
  neutral400: "#5E6964",
  neutral300: "#39423F",
  neutral200: "#1D2321",
  neutral100: "#0C0F0F",

  primary600: "#E2EEE4",
  primary500: "#C7DCC9",
  primary400: "#A8C5AB",
  primary300: "#90B095",
  primary200: "#789A81",
  primary100: "#5F7B67",

  secondary500: "#DDE7E9",
  secondary400: "#BECDD2",
  secondary300: "#9EB5BB",
  secondary200: "#7F9FA6",
  secondary100: "#617E86",

  accent500: "#F1F0E3",
  accent400: "#E7E5D0",
  accent300: "#D9D6B8",
  accent200: "#C9C6A1",
  accent100: "#B6B186",

  angry100: "#F6DCDA",
  angry500: "#D56A61",

  overlay20: "rgba(12, 15, 15, 0.2)",
  overlay50: "rgba(12, 15, 15, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textDim: palette.neutral600,
  background: palette.neutral200,
  border: palette.neutral400,
  tint: palette.primary500,
  tintInactive: palette.neutral300,
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
  vocabularyShowroom: vocabularyShowroomDark,
} as const
