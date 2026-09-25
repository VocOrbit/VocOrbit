import { Platform } from "react-native"

const IPAD_FONT_SCALE = 1.12

const roundTypographyValue = (value: number): number => Math.round(value * 100) / 100

const scaleTypographyValue = (value: number): number =>
  roundTypographyValue(value * IPAD_FONT_SCALE)

export const isIpadDevice = Platform.OS === "ios" && Platform.isPad === true

export function scaleTypographyStyleForIpad<T>(style: T): T {
  if (!isIpadDevice || style == null || Array.isArray(style) || typeof style !== "object") {
    return style
  }

  const styleRecord = style as Record<string, unknown>
  const hasTypographyValue =
    typeof styleRecord.fontSize === "number" ||
    typeof styleRecord.lineHeight === "number" ||
    typeof styleRecord.letterSpacing === "number"

  if (!hasTypographyValue) return style

  return {
    ...styleRecord,
    fontSize:
      typeof styleRecord.fontSize === "number"
        ? scaleTypographyValue(styleRecord.fontSize)
        : styleRecord.fontSize,
    lineHeight:
      typeof styleRecord.lineHeight === "number"
        ? scaleTypographyValue(styleRecord.lineHeight)
        : styleRecord.lineHeight,
    letterSpacing:
      typeof styleRecord.letterSpacing === "number"
        ? scaleTypographyValue(styleRecord.letterSpacing)
        : styleRecord.letterSpacing,
  } as T
}
