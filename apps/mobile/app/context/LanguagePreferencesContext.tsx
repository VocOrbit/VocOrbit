import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import i18n from "i18next"

import { useAuth } from "@/context/AuthContext"
import { useUiPreferences } from "@/context/UiPreferencesContext"
import { resolveSupportedUiLocale } from "@/i18n"
import { translate } from "@/i18n/translate"
import {
  languagePreferencesApi,
  type UserLanguagePreferencesPayload,
} from "@/services/api/languagePreferencesApi"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { clearPronunciationVoiceCache } from "@/services/pronunciation/pronunciationService"
import { setCrashLanguagePair } from "@/utils/crashReporting"
import { syncLanguagePreferencesToKeychain } from "@/utils/sharedKeychain"
import { loadString, saveString } from "@/utils/storage"

const DEFAULT_L1_LANGUAGE = "en-gb"
const DEFAULT_ENGLISH_VARIANT = "en-gb"
const DEFAULT_L2_LANGUAGE = "es"
const ONBOARDING_COMPLETED_KEY_PREFIX = "LanguagePreferences.onboardingCompleted"
const PRESERVED_REGIONAL_LANGUAGE_CODES = new Set<string>(["en-gb", "en-us"])

function normalizeLanguageCode(value: string): string {
  return value.trim().toLowerCase()
}

function normalizePreferenceLanguageCode(value: string): string {
  const normalized = normalizeLanguageCode(value)
  if (PRESERVED_REGIONAL_LANGUAGE_CODES.has(normalized)) return normalized
  const [baseCode] = normalized.split("-")
  if (baseCode === "en") {
    return DEFAULT_ENGLISH_VARIANT
  }
  return baseCode ?? normalized
}

function countryCodeToFlag(countryCode: string): string {
  const normalized = countryCode.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return "🌐"
  const [first, second] = normalized
  if (!first || !second) return "🌐"
  return String.fromCodePoint(first.charCodeAt(0) + 127397, second.charCodeAt(0) + 127397)
}

type SupportedLanguageSeed = {
  code: string
  language: string
  nativeName: string
  countryCode: string
  country: string
}

export type SupportedLanguageOption = {
  code: string
  language: string
  nativeName: string
  countryCode: string
  country: string
  flag: string
}

const supportedLanguageSeeds: SupportedLanguageSeed[] = [
  { code: "af-za", language: "Afrikaans", nativeName: "Afrikaans", countryCode: "ZA", country: "South Africa" },
  { code: "sq-al", language: "Albanian", nativeName: "Shqip", countryCode: "AL", country: "Albania" },
  { code: "am-et", language: "Amharic", nativeName: "Amharic", countryCode: "ET", country: "Ethiopia" },
  { code: "ar", language: "Arabic", nativeName: "العربية", countryCode: "SA", country: "Saudi Arabia" },
  { code: "ar-ae", language: "Arabic", nativeName: "العربية", countryCode: "AE", country: "United Arab Emirates" },
  { code: "ar-dz", language: "Arabic", nativeName: "العربية", countryCode: "DZ", country: "Algeria" },
  { code: "ar-eg", language: "Arabic", nativeName: "العربية", countryCode: "EG", country: "Egypt" },
  { code: "ar-iq", language: "Arabic", nativeName: "العربية", countryCode: "IQ", country: "Iraq" },
  { code: "ar-jo", language: "Arabic", nativeName: "العربية", countryCode: "JO", country: "Jordan" },
  { code: "ar-kw", language: "Arabic", nativeName: "العربية", countryCode: "KW", country: "Kuwait" },
  { code: "ar-lb", language: "Arabic", nativeName: "العربية", countryCode: "LB", country: "Lebanon" },
  { code: "ar-ma", language: "Arabic", nativeName: "العربية", countryCode: "MA", country: "Morocco" },
  { code: "ar-om", language: "Arabic", nativeName: "العربية", countryCode: "OM", country: "Oman" },
  { code: "ar-qa", language: "Arabic", nativeName: "العربية", countryCode: "QA", country: "Qatar" },
  { code: "ar-sa", language: "Arabic", nativeName: "العربية", countryCode: "SA", country: "Saudi Arabia" },
  { code: "ar-sy", language: "Arabic", nativeName: "العربية", countryCode: "SY", country: "Syria" },
  { code: "ar-tn", language: "Arabic", nativeName: "العربية", countryCode: "TN", country: "Tunisia" },
  { code: "ar-ye", language: "Arabic", nativeName: "العربية", countryCode: "YE", country: "Yemen" },
  { code: "hy-am", language: "Armenian", nativeName: "Հայերեն", countryCode: "AM", country: "Armenia" },
  { code: "az-az", language: "Azerbaijani", nativeName: "Azərbaycanca", countryCode: "AZ", country: "Azerbaijan" },
  { code: "eu-es", language: "Basque", nativeName: "Euskara", countryCode: "ES", country: "Spain" },
  { code: "be-by", language: "Belarusian", nativeName: "Беларуская", countryCode: "BY", country: "Belarus" },
  { code: "bn", language: "Bengali", nativeName: "বাংলা", countryCode: "BD", country: "Bangladesh" },
  { code: "bn-bd", language: "Bengali", nativeName: "বাংলা", countryCode: "BD", country: "Bangladesh" },
  { code: "bn-in", language: "Bengali", nativeName: "বাংলা", countryCode: "IN", country: "India" },
  { code: "bs-ba", language: "Bosnian", nativeName: "Bosanski", countryCode: "BA", country: "Bosnia and Herzegovina" },
  { code: "bg", language: "Bulgarian", nativeName: "Български", countryCode: "BG", country: "Bulgaria" },
  { code: "bg-bg", language: "Bulgarian", nativeName: "Български", countryCode: "BG", country: "Bulgaria" },
  { code: "my-mm", language: "Burmese", nativeName: "မြန်မာ", countryCode: "MM", country: "Myanmar" },
  { code: "ca-es", language: "Catalan", nativeName: "Català", countryCode: "ES", country: "Spain" },
  { code: "zh", language: "Chinese", nativeName: "中文", countryCode: "CN", country: "China" },
  { code: "zh-cn", language: "Chinese", nativeName: "中文", countryCode: "CN", country: "China" },
  { code: "zh-hk", language: "Chinese", nativeName: "中文", countryCode: "HK", country: "Hong Kong" },
  { code: "zh-sg", language: "Chinese", nativeName: "中文", countryCode: "SG", country: "Singapore" },
  { code: "zh-tw", language: "Chinese", nativeName: "中文", countryCode: "TW", country: "Taiwan" },
  { code: "hr-hr", language: "Croatian", nativeName: "Hrvatski", countryCode: "HR", country: "Croatia" },
  { code: "cs", language: "Czech", nativeName: "Čeština", countryCode: "CZ", country: "Czechia" },
  { code: "cs-cz", language: "Czech", nativeName: "Čeština", countryCode: "CZ", country: "Czechia" },
  { code: "da", language: "Danish", nativeName: "Dansk", countryCode: "DK", country: "Denmark" },
  { code: "da-dk", language: "Danish", nativeName: "Dansk", countryCode: "DK", country: "Denmark" },
  { code: "nl", language: "Dutch", nativeName: "Nederlands", countryCode: "NL", country: "Netherlands" },
  { code: "nl-be", language: "Dutch", nativeName: "Nederlands", countryCode: "BE", country: "Belgium" },
  { code: "nl-nl", language: "Dutch", nativeName: "Nederlands", countryCode: "NL", country: "Netherlands" },
  { code: "en", language: "English", nativeName: "English", countryCode: "GB", country: "United Kingdom" },
  { code: "en-au", language: "English", nativeName: "English", countryCode: "AU", country: "Australia" },
  { code: "en-ca", language: "English", nativeName: "English", countryCode: "CA", country: "Canada" },
  { code: "en-gb", language: "English", nativeName: "English", countryCode: "GB", country: "United Kingdom" },
  { code: "en-ie", language: "English", nativeName: "English", countryCode: "IE", country: "Ireland" },
  { code: "en-in", language: "English", nativeName: "English", countryCode: "IN", country: "India" },
  { code: "en-nz", language: "English", nativeName: "English", countryCode: "NZ", country: "New Zealand" },
  { code: "en-ph", language: "English", nativeName: "English", countryCode: "PH", country: "Philippines" },
  { code: "en-sg", language: "English", nativeName: "English", countryCode: "SG", country: "Singapore" },
  { code: "en-us", language: "English", nativeName: "English", countryCode: "US", country: "United States" },
  { code: "en-za", language: "English", nativeName: "English", countryCode: "ZA", country: "South Africa" },
  { code: "et-ee", language: "Estonian", nativeName: "Eesti", countryCode: "EE", country: "Estonia" },
  { code: "fa", language: "Persian", nativeName: "فارسی", countryCode: "IR", country: "Iran" },
  { code: "fa-ir", language: "Persian", nativeName: "فارسی", countryCode: "IR", country: "Iran" },
  { code: "fi", language: "Finnish", nativeName: "Suomi", countryCode: "FI", country: "Finland" },
  { code: "fi-fi", language: "Finnish", nativeName: "Suomi", countryCode: "FI", country: "Finland" },
  { code: "tl-ph", language: "Filipino", nativeName: "Filipino", countryCode: "PH", country: "Philippines" },
  { code: "fr", language: "French", nativeName: "Français", countryCode: "FR", country: "France" },
  { code: "fr-be", language: "French", nativeName: "Français", countryCode: "BE", country: "Belgium" },
  { code: "fr-ca", language: "French", nativeName: "Français", countryCode: "CA", country: "Canada" },
  { code: "fr-ch", language: "French", nativeName: "Français", countryCode: "CH", country: "Switzerland" },
  { code: "fr-fr", language: "French", nativeName: "Français", countryCode: "FR", country: "France" },
  { code: "fr-lu", language: "French", nativeName: "Français", countryCode: "LU", country: "Luxembourg" },
  { code: "ga-ie", language: "Irish", nativeName: "Gaeilge", countryCode: "IE", country: "Ireland" },
  { code: "gl-es", language: "Galician", nativeName: "Galego", countryCode: "ES", country: "Spain" },
  { code: "ka-ge", language: "Georgian", nativeName: "ქართული", countryCode: "GE", country: "Georgia" },
  { code: "de", language: "German", nativeName: "Deutsch", countryCode: "DE", country: "Germany" },
  { code: "de-at", language: "German", nativeName: "Deutsch", countryCode: "AT", country: "Austria" },
  { code: "de-ch", language: "German", nativeName: "Deutsch", countryCode: "CH", country: "Switzerland" },
  { code: "de-de", language: "German", nativeName: "Deutsch", countryCode: "DE", country: "Germany" },
  { code: "de-lu", language: "German", nativeName: "Deutsch", countryCode: "LU", country: "Luxembourg" },
  { code: "el", language: "Greek", nativeName: "Ελληνικά", countryCode: "GR", country: "Greece" },
  { code: "el-cy", language: "Greek", nativeName: "Ελληνικά", countryCode: "CY", country: "Cyprus" },
  { code: "el-gr", language: "Greek", nativeName: "Ελληνικά", countryCode: "GR", country: "Greece" },
  { code: "gu-in", language: "Gujarati", nativeName: "ગુજરાતી", countryCode: "IN", country: "India" },
  { code: "he", language: "Hebrew", nativeName: "עברית", countryCode: "IL", country: "Israel" },
  { code: "he-il", language: "Hebrew", nativeName: "עברית", countryCode: "IL", country: "Israel" },
  { code: "hi", language: "Hindi", nativeName: "हिन्दी", countryCode: "IN", country: "India" },
  { code: "hi-in", language: "Hindi", nativeName: "हिन्दी", countryCode: "IN", country: "India" },
  { code: "hu", language: "Hungarian", nativeName: "Magyar", countryCode: "HU", country: "Hungary" },
  { code: "hu-hu", language: "Hungarian", nativeName: "Magyar", countryCode: "HU", country: "Hungary" },
  { code: "is-is", language: "Icelandic", nativeName: "Íslenska", countryCode: "IS", country: "Iceland" },
  { code: "id", language: "Indonesian", nativeName: "Bahasa Indonesia", countryCode: "ID", country: "Indonesia" },
  { code: "id-id", language: "Indonesian", nativeName: "Bahasa Indonesia", countryCode: "ID", country: "Indonesia" },
  { code: "it", language: "Italian", nativeName: "Italiano", countryCode: "IT", country: "Italy" },
  { code: "it-ch", language: "Italian", nativeName: "Italiano", countryCode: "CH", country: "Switzerland" },
  { code: "it-it", language: "Italian", nativeName: "Italiano", countryCode: "IT", country: "Italy" },
  { code: "ja", language: "Japanese", nativeName: "日本語", countryCode: "JP", country: "Japan" },
  { code: "ja-jp", language: "Japanese", nativeName: "日本語", countryCode: "JP", country: "Japan" },
  { code: "kn-in", language: "Kannada", nativeName: "ಕನ್ನಡ", countryCode: "IN", country: "India" },
  { code: "kk-kz", language: "Kazakh", nativeName: "Қазақ", countryCode: "KZ", country: "Kazakhstan" },
  { code: "km-kh", language: "Khmer", nativeName: "ខ្មែរ", countryCode: "KH", country: "Cambodia" },
  { code: "ko", language: "Korean", nativeName: "한국어", countryCode: "KR", country: "South Korea" },
  { code: "ko-kr", language: "Korean", nativeName: "한국어", countryCode: "KR", country: "South Korea" },
  { code: "lo-la", language: "Lao", nativeName: "ລາວ", countryCode: "LA", country: "Laos" },
  { code: "lv-lv", language: "Latvian", nativeName: "Latviešu", countryCode: "LV", country: "Latvia" },
  { code: "lt-lt", language: "Lithuanian", nativeName: "Lietuvių", countryCode: "LT", country: "Lithuania" },
  { code: "mk-mk", language: "Macedonian", nativeName: "Македонски", countryCode: "MK", country: "North Macedonia" },
  { code: "ms-my", language: "Malay", nativeName: "Bahasa Melayu", countryCode: "MY", country: "Malaysia" },
  { code: "ms-sg", language: "Malay", nativeName: "Bahasa Melayu", countryCode: "SG", country: "Singapore" },
  { code: "ml-in", language: "Malayalam", nativeName: "മലയാളം", countryCode: "IN", country: "India" },
  { code: "mr-in", language: "Marathi", nativeName: "मराठी", countryCode: "IN", country: "India" },
  { code: "mn-mn", language: "Mongolian", nativeName: "Монгол", countryCode: "MN", country: "Mongolia" },
  { code: "ne-np", language: "Nepali", nativeName: "नेपाली", countryCode: "NP", country: "Nepal" },
  { code: "no", language: "Norwegian", nativeName: "Norsk", countryCode: "NO", country: "Norway" },
  { code: "no-no", language: "Norwegian", nativeName: "Norsk", countryCode: "NO", country: "Norway" },
  { code: "pa-in", language: "Punjabi", nativeName: "ਪੰਜਾਬੀ", countryCode: "IN", country: "India" },
  { code: "pa-pk", language: "Punjabi", nativeName: "پنجابی", countryCode: "PK", country: "Pakistan" },
  { code: "pl", language: "Polish", nativeName: "Polski", countryCode: "PL", country: "Poland" },
  { code: "pl-pl", language: "Polish", nativeName: "Polski", countryCode: "PL", country: "Poland" },
  { code: "pt", language: "Portuguese", nativeName: "Português", countryCode: "PT", country: "Portugal" },
  { code: "pt-ao", language: "Portuguese", nativeName: "Português", countryCode: "AO", country: "Angola" },
  { code: "pt-br", language: "Portuguese", nativeName: "Português", countryCode: "BR", country: "Brazil" },
  { code: "pt-mz", language: "Portuguese", nativeName: "Português", countryCode: "MZ", country: "Mozambique" },
  { code: "pt-pt", language: "Portuguese", nativeName: "Português", countryCode: "PT", country: "Portugal" },
  { code: "ro", language: "Romanian", nativeName: "Română", countryCode: "RO", country: "Romania" },
  { code: "ro-md", language: "Romanian", nativeName: "Română", countryCode: "MD", country: "Moldova" },
  { code: "ro-ro", language: "Romanian", nativeName: "Română", countryCode: "RO", country: "Romania" },
  { code: "ru", language: "Russian", nativeName: "Русский", countryCode: "RU", country: "Russia" },
  { code: "ru-kz", language: "Russian", nativeName: "Русский", countryCode: "KZ", country: "Kazakhstan" },
  { code: "ru-ru", language: "Russian", nativeName: "Русский", countryCode: "RU", country: "Russia" },
  { code: "ru-ua", language: "Russian", nativeName: "Русский", countryCode: "UA", country: "Ukraine" },
  { code: "sr-rs", language: "Serbian", nativeName: "Српски", countryCode: "RS", country: "Serbia" },
  { code: "si-lk", language: "Sinhala", nativeName: "සිංහල", countryCode: "LK", country: "Sri Lanka" },
  { code: "sk-sk", language: "Slovak", nativeName: "Slovenčina", countryCode: "SK", country: "Slovakia" },
  { code: "sl-si", language: "Slovenian", nativeName: "Slovenščina", countryCode: "SI", country: "Slovenia" },
  { code: "so-so", language: "Somali", nativeName: "Soomaali", countryCode: "SO", country: "Somalia" },
  { code: "es", language: "Spanish", nativeName: "Español", countryCode: "ES", country: "Spain" },
  { code: "es-ar", language: "Spanish", nativeName: "Español", countryCode: "AR", country: "Argentina" },
  { code: "es-bo", language: "Spanish", nativeName: "Español", countryCode: "BO", country: "Bolivia" },
  { code: "es-cl", language: "Spanish", nativeName: "Español", countryCode: "CL", country: "Chile" },
  { code: "es-co", language: "Spanish", nativeName: "Español", countryCode: "CO", country: "Colombia" },
  { code: "es-do", language: "Spanish", nativeName: "Español", countryCode: "DO", country: "Dominican Republic" },
  { code: "es-ec", language: "Spanish", nativeName: "Español", countryCode: "EC", country: "Ecuador" },
  { code: "es-es", language: "Spanish", nativeName: "Español", countryCode: "ES", country: "Spain" },
  { code: "es-gt", language: "Spanish", nativeName: "Español", countryCode: "GT", country: "Guatemala" },
  { code: "es-hn", language: "Spanish", nativeName: "Español", countryCode: "HN", country: "Honduras" },
  { code: "es-mx", language: "Spanish", nativeName: "Español", countryCode: "MX", country: "Mexico" },
  { code: "es-ni", language: "Spanish", nativeName: "Español", countryCode: "NI", country: "Nicaragua" },
  { code: "es-pa", language: "Spanish", nativeName: "Español", countryCode: "PA", country: "Panama" },
  { code: "es-pe", language: "Spanish", nativeName: "Español", countryCode: "PE", country: "Peru" },
  { code: "es-pr", language: "Spanish", nativeName: "Español", countryCode: "PR", country: "Puerto Rico" },
  { code: "es-py", language: "Spanish", nativeName: "Español", countryCode: "PY", country: "Paraguay" },
  { code: "es-sv", language: "Spanish", nativeName: "Español", countryCode: "SV", country: "El Salvador" },
  { code: "es-us", language: "Spanish", nativeName: "Español", countryCode: "US", country: "United States" },
  { code: "es-uy", language: "Spanish", nativeName: "Español", countryCode: "UY", country: "Uruguay" },
  { code: "es-ve", language: "Spanish", nativeName: "Español", countryCode: "VE", country: "Venezuela" },
  { code: "sw-ke", language: "Swahili", nativeName: "Kiswahili", countryCode: "KE", country: "Kenya" },
  { code: "sw-tz", language: "Swahili", nativeName: "Kiswahili", countryCode: "TZ", country: "Tanzania" },
  { code: "sv", language: "Swedish", nativeName: "Svenska", countryCode: "SE", country: "Sweden" },
  { code: "sv-fi", language: "Swedish", nativeName: "Svenska", countryCode: "FI", country: "Finland" },
  { code: "sv-se", language: "Swedish", nativeName: "Svenska", countryCode: "SE", country: "Sweden" },
  { code: "ta-in", language: "Tamil", nativeName: "தமிழ்", countryCode: "IN", country: "India" },
  { code: "ta-lk", language: "Tamil", nativeName: "தமிழ்", countryCode: "LK", country: "Sri Lanka" },
  { code: "ta-sg", language: "Tamil", nativeName: "தமிழ்", countryCode: "SG", country: "Singapore" },
  { code: "te-in", language: "Telugu", nativeName: "తెలుగు", countryCode: "IN", country: "India" },
  { code: "th", language: "Thai", nativeName: "ไทย", countryCode: "TH", country: "Thailand" },
  { code: "th-th", language: "Thai", nativeName: "ไทย", countryCode: "TH", country: "Thailand" },
  { code: "tr", language: "Turkish", nativeName: "Türkçe", countryCode: "TR", country: "Türkiye" },
  { code: "tr-tr", language: "Turkish", nativeName: "Türkçe", countryCode: "TR", country: "Türkiye" },
  { code: "uk", language: "Ukrainian", nativeName: "Українська", countryCode: "UA", country: "Ukraine" },
  { code: "uk-ua", language: "Ukrainian", nativeName: "Українська", countryCode: "UA", country: "Ukraine" },
  { code: "ur-in", language: "Urdu", nativeName: "اردو", countryCode: "IN", country: "India" },
  { code: "ur-pk", language: "Urdu", nativeName: "اردو", countryCode: "PK", country: "Pakistan" },
  { code: "uz-uz", language: "Uzbek", nativeName: "Oʻzbek", countryCode: "UZ", country: "Uzbekistan" },
  { code: "vi", language: "Vietnamese", nativeName: "Tiếng Việt", countryCode: "VN", country: "Vietnam" },
  { code: "vi-vn", language: "Vietnamese", nativeName: "Tiếng Việt", countryCode: "VN", country: "Vietnam" },
  { code: "cy-gb", language: "Welsh", nativeName: "Cymraeg", countryCode: "GB", country: "United Kingdom" },
  { code: "zu-za", language: "Zulu", nativeName: "IsiZulu", countryCode: "ZA", country: "South Africa" },
]

const normalizedLanguageOptions = supportedLanguageSeeds.map((seed) => ({
  code: normalizeLanguageCode(seed.code),
  language: seed.language,
  nativeName: seed.nativeName,
  countryCode: seed.countryCode.toUpperCase(),
  country: seed.country,
  flag: countryCodeToFlag(seed.countryCode),
}))

const uniqueByCodeMap = new Map<string, SupportedLanguageOption>()
for (const option of normalizedLanguageOptions) {
  if (!uniqueByCodeMap.has(option.code)) {
    uniqueByCodeMap.set(option.code, option)
  }
}

const baseLanguageOptionMap = new Map<string, SupportedLanguageOption>()
for (const option of uniqueByCodeMap.values()) {
  const [baseCode] = option.code.split("-")
  if (!baseCode) continue
  const existing = baseLanguageOptionMap.get(baseCode)

  // Prefer an explicit base-language seed (for example `en`) if available.
  if (!existing || option.code === baseCode) {
    baseLanguageOptionMap.set(baseCode, {
      ...option,
      code: baseCode,
    })
  }
}

const selectableLanguageOptionMap = new Map<string, SupportedLanguageOption>()
for (const option of baseLanguageOptionMap.values()) {
  if (option.code === "en") continue
  selectableLanguageOptionMap.set(option.code, option)
}

for (const preservedCode of PRESERVED_REGIONAL_LANGUAGE_CODES) {
  const option = uniqueByCodeMap.get(preservedCode)
  if (!option) continue
  selectableLanguageOptionMap.set(preservedCode, {
    ...option,
    code: preservedCode,
  })
}

export const supportedLanguageOptions: SupportedLanguageOption[] = [...selectableLanguageOptionMap.values()]
  .sort((a, b) => {
    const languageCompare = a.language.localeCompare(b.language)
    if (languageCompare !== 0) return languageCompare
    return a.country.localeCompare(b.country)
  })

export function resolveLanguageOption(code?: string): SupportedLanguageOption | undefined {
  if (!code) return undefined

  const normalizedCode = normalizePreferenceLanguageCode(code)
  return supportedLanguageOptions.find((item) => item.code === normalizedCode)
}

export function resolveLanguageLabel(code?: string): string {
  if (!code) return "-"
  const match = resolveLanguageOption(code)
  if (match) {
    return `${match.flag} ${match.language} (${match.country})`
  }
  return normalizeLanguageCode(code).toUpperCase()
}

type SaveLanguagePreferencesResult = {
  ok: boolean
  errorMessage?: string
}

type LanguagePreferencesContextType = {
  isResolved: boolean
  isLoading: boolean
  preferences?: UserLanguagePreferencesPayload
  needsOnboarding: boolean
  savePreferences: (input: {
    l1Language: string
    l2Language: string
  }) => Promise<SaveLanguagePreferencesResult>
  refreshPreferences: () => Promise<void>
}

const LanguagePreferencesContext = createContext<LanguagePreferencesContextType | null>(null)

function onboardingCompletedKey(userId: string): string {
  return `${ONBOARDING_COMPLETED_KEY_PREFIX}.${userId}`
}

function readOnboardingCompleted(userId: string): boolean {
  return loadString(onboardingCompletedKey(userId)) === "true"
}

function setOnboardingCompleted(userId: string): void {
  saveString(onboardingCompletedKey(userId), "true")
}

function buildFallbackPreferences(userId: string): UserLanguagePreferencesPayload {
  return {
    userId,
    l1Language: DEFAULT_L1_LANGUAGE,
    l2Language: DEFAULT_L2_LANGUAGE,
    updatedAt: new Date(0).toISOString(),
  }
}

function mapApiProblemToMessage(problem: GeneralApiProblem): string {
  if (problem.kind === "cannot-connect" || problem.kind === "timeout") {
    return translate("languagePreferences:errors.cannotConnect")
  }
  if (problem.kind === "unauthorized") {
    return translate("languagePreferences:errors.unauthorized")
  }
  if (problem.kind === "forbidden" || problem.kind === "rejected") {
    return translate("languagePreferences:errors.validation")
  }
  if (problem.kind === "server") {
    return translate("languagePreferences:errors.server")
  }
  return translate("languagePreferences:errors.saveFailed")
}

function applyUiLocaleFromL1(l1Language: string | undefined, forceEnglishUi: boolean) {
  if (!i18n.isInitialized) return

  const nextLocale = forceEnglishUi ? "en" : resolveSupportedUiLocale(l1Language)
  const currentLocale = resolveSupportedUiLocale(i18n.language)
  if (currentLocale === nextLocale) return

  void i18n.changeLanguage(nextLocale)
}

export const LanguagePreferencesProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isAuthenticated, userId } = useAuth()
  const { forceEnglishUi } = useUiPreferences()
  const [isResolved, setIsResolved] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState<UserLanguagePreferencesPayload | undefined>(undefined)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)
  const preferenceL1Language = preferences?.l1Language
  const preferenceL2Language = preferences?.l2Language

  useEffect(() => {
    setCrashLanguagePair(preferenceL1Language, preferenceL2Language)
  }, [preferenceL1Language, preferenceL2Language])

  useEffect(() => {
    if (!preferenceL1Language && !preferenceL2Language) return
    clearPronunciationVoiceCache()
  }, [preferenceL1Language, preferenceL2Language])

  useEffect(() => {
    if (!forceEnglishUi && !preferenceL1Language) return
    applyUiLocaleFromL1(preferenceL1Language, forceEnglishUi)
  }, [forceEnglishUi, preferenceL1Language])

  const refreshPreferences = useCallback(async () => {
    if (!userId || !isAuthenticated) return

    setIsLoading(true)
    const response = await languagePreferencesApi.getLanguagePreferences(userId)

    if (response.kind === "ok") {
      const nextPreferences = {
        ...response.data,
        l1Language: normalizePreferenceLanguageCode(response.data.l1Language),
        l2Language: normalizePreferenceLanguageCode(response.data.l2Language),
      }
      setPreferences(nextPreferences)
      void syncLanguagePreferencesToKeychain({
        l1Language: nextPreferences.l1Language,
        l2Language: nextPreferences.l2Language,
      })
      setIsLoading(false)
      return
    }

    if (__DEV__) {
      console.warn("Language preferences request failed, using defaults.", response)
    }
    setPreferences((prev) => {
      if (prev && prev.userId === userId) return prev
      const fallback = buildFallbackPreferences(userId)
      return fallback
    })
    setIsLoading(false)
  }, [isAuthenticated, userId])

  useEffect(() => {
    let cancelled = false

    if (!isAuthenticated || !userId) {
      setIsResolved(true)
      setIsLoading(false)
      setPreferences(undefined)
      setHasCompletedOnboarding(true)
      return
    }

    setIsResolved(false)
    setHasCompletedOnboarding(readOnboardingCompleted(userId))
    setIsResolved(true)
    setIsLoading(true)

    void (async () => {
      const response = await languagePreferencesApi.getLanguagePreferences(userId)
      if (cancelled) return

      if (response.kind === "ok") {
        const nextPreferences = {
          ...response.data,
          l1Language: normalizePreferenceLanguageCode(response.data.l1Language),
          l2Language: normalizePreferenceLanguageCode(response.data.l2Language),
        }
        setPreferences(nextPreferences)
        void syncLanguagePreferencesToKeychain({
          l1Language: nextPreferences.l1Language,
          l2Language: nextPreferences.l2Language,
        })
      } else {
        if (__DEV__) {
          console.warn("Language preferences bootstrap failed, using defaults.", response)
        }
        const fallback = buildFallbackPreferences(userId)
        setPreferences(fallback)
      }

      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, userId])

  const savePreferences = useCallback(
    async (input: { l1Language: string; l2Language: string }): Promise<SaveLanguagePreferencesResult> => {
      if (!isAuthenticated || !userId) {
        return {
          ok: false,
          errorMessage: translate("languagePreferences:errors.noSession"),
        }
      }

      const l1Language = normalizePreferenceLanguageCode(input.l1Language)
      const l2Language = normalizePreferenceLanguageCode(input.l2Language)

      if (!l1Language || !l2Language) {
        return {
          ok: false,
          errorMessage: translate("languagePreferences:errors.selectTwoLanguages"),
        }
      }

      if (l1Language === l2Language) {
        return {
          ok: false,
          errorMessage: translate("languagePreferences:errors.sameLanguagePair"),
        }
      }

      setIsLoading(true)
      const response = await languagePreferencesApi.setLanguagePreferences(userId, {
        l1Language,
        l2Language,
      })

      if (response.kind !== "ok") {
        setIsLoading(false)
        return {
          ok: false,
          errorMessage: mapApiProblemToMessage(response),
        }
      }

      const nextPreferences = {
        ...response.data,
        l1Language: normalizePreferenceLanguageCode(response.data.l1Language),
        l2Language: normalizePreferenceLanguageCode(response.data.l2Language),
      }
      setPreferences(nextPreferences)
      await syncLanguagePreferencesToKeychain({
        l1Language: nextPreferences.l1Language,
        l2Language: nextPreferences.l2Language,
      })
      setOnboardingCompleted(userId)
      setHasCompletedOnboarding(true)
      setIsLoading(false)
      return { ok: true }
    },
    [isAuthenticated, userId],
  )

  const value = useMemo<LanguagePreferencesContextType>(() => {
    const needsOnboarding = Boolean(isAuthenticated && userId && isResolved && !hasCompletedOnboarding)

    return {
      isResolved,
      isLoading,
      preferences,
      needsOnboarding,
      savePreferences,
      refreshPreferences,
    }
  }, [
    hasCompletedOnboarding,
    isAuthenticated,
    isLoading,
    isResolved,
    preferences,
    refreshPreferences,
    savePreferences,
    userId,
  ])

  return <LanguagePreferencesContext.Provider value={value}>{children}</LanguagePreferencesContext.Provider>
}

export function useLanguagePreferences(): LanguagePreferencesContextType {
  const context = useContext(LanguagePreferencesContext)
  if (!context) {
    throw new Error("useLanguagePreferences must be used within a LanguagePreferencesProvider")
  }
  return context
}
