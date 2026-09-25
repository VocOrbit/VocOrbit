import { I18nManager } from "react-native"
import * as Localization from "expo-localization"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import "intl-pluralrules"

// if English isn't your default language, move Translations to the appropriate language file.
import ar from "./ar"
import de from "./de"
import en, { Translations } from "./en"
import es from "./es"
import fr from "./fr"
import hi from "./hi"
import id from "./id"
import it from "./it"
import ja from "./ja"
import ko from "./ko"
import pl from "./pl"
import ptBr from "./pt-br"
import ru from "./ru"
import tl from "./tl"
import tr from "./tr"
import vi from "./vi"
import zhHans from "./zh-hans"

const fallbackLocale = "en"

const systemLocales = Localization.getLocales()

const FALLBACK_UI_LOCALE_CODES = [
  "af",
  "am",
  "az",
  "be",
  "bg",
  "bn",
  "bs",
  "ca",
  "cs",
  "cy",
  "da",
  "el",
  "et",
  "eu",
  "fa",
  "fi",
  "ga",
  "gl",
  "gu",
  "he",
  "hr",
  "hu",
  "hy",
  "id",
  "is",
  "it",
  "ka",
  "kk",
  "km",
  "kn",
  "lo",
  "lt",
  "lv",
  "mk",
  "ml",
  "mn",
  "mr",
  "ms",
  "my",
  "ne",
  "nl",
  "no",
  "pa",
  "pl",
  "pt",
  "ro",
  "ru",
  "si",
  "sk",
  "sl",
  "so",
  "sq",
  "sr",
  "sv",
  "sw",
  "ta",
  "te",
  "th",
  "uk",
  "ur",
  "uz",
  "vi",
  "zh",
  "zu",
] as const

type FallbackUiLocaleCode = (typeof FALLBACK_UI_LOCALE_CODES)[number]

// These UI locales are selectable via language pair but currently reuse English UI strings
// until dedicated translations are added.
const fallbackUiResources = Object.fromEntries(
  FALLBACK_UI_LOCALE_CODES.map((code) => [code, en]),
) as Record<FallbackUiLocaleCode, Translations>

const resources = {
  ...fallbackUiResources,
  ar,
  de,
  en,
  es,
  fr,
  hi,
  id,
  it,
  ja,
  ko,
  pl,
  "pt-br": ptBr,
  ru,
  tl,
  tr,
  vi,
  "zh-hans": zhHans,

  // Normalize common regional variants to the dedicated locale resource.
  pt: ptBr,
  "pt-pt": ptBr,
  zh: zhHans,
  "zh-cn": zhHans,
}
const supportedTags = Object.keys(resources)

export type SupportedUiLocale = keyof typeof resources

export function resolveSupportedUiLocale(input?: string): SupportedUiLocale {
  if (typeof input !== "string") return fallbackLocale as SupportedUiLocale
  const normalized = input.trim().toLowerCase()
  if (!normalized) return fallbackLocale as SupportedUiLocale
  if (supportedTags.includes(normalized)) return normalized as SupportedUiLocale
  const primary = normalized.split("-")[0]
  if (primary && supportedTags.includes(primary)) return primary as SupportedUiLocale
  return fallbackLocale as SupportedUiLocale
}

// Checks to see if the device locale matches any of the supported locales
// Device locale may be more specific and still match (e.g., en-US matches en)
const systemTagMatchesSupportedTags = (deviceTag: string) => {
  const primaryTag = deviceTag.split("-")[0]
  return supportedTags.includes(primaryTag)
}

const pickSupportedLocale: () => Localization.Locale | undefined = () => {
  return systemLocales.find((locale) => systemTagMatchesSupportedTags(locale.languageTag))
}

const locale = pickSupportedLocale()

export let isRTL = false

// Need to set RTL ASAP to ensure the app is rendered correctly. Waiting for i18n to init is too late.
if (locale?.languageTag && locale?.textDirection === "rtl") {
  I18nManager.allowRTL(true)
  isRTL = true
} else {
  I18nManager.allowRTL(false)
}

export const initI18n = async () => {
  i18n.use(initReactI18next)

  const resolvedInitialLocale = resolveSupportedUiLocale(locale?.languageTag ?? fallbackLocale)

  await i18n.init({
    resources,
    lng: resolvedInitialLocale,
    fallbackLng: fallbackLocale,
    interpolation: {
      escapeValue: false,
    },
  })

  return i18n
}

/**
 * Builds up valid keypaths for translations.
 */

export type TxKeyPath = RecursiveKeyOf<Translations>

// via: https://stackoverflow.com/a/65333050
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, true>
}[keyof TObj & (string | number)]

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, false>
}[keyof TObj & (string | number)]

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
  IsFirstLevel extends boolean,
> = TValue extends any[]
  ? Text
  : TValue extends object
    ? IsFirstLevel extends true
      ? Text | `${Text}:${RecursiveKeyOfInner<TValue>}`
      : Text | `${Text}.${RecursiveKeyOfInner<TValue>}`
    : Text
