// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import { format } from "date-fns/format"
import type { Locale } from "date-fns/locale"
import { parseISO } from "date-fns/parseISO"
import i18n from "i18next"

type Options = Parameters<typeof format>[2]

let dateFnsLocale: Locale
export const loadDateFnsLocale = () => {
  const normalizedTag = i18n.language.trim().toLowerCase()
  const primaryTag = normalizedTag.split("-")[0]
  switch (primaryTag) {
    case "en":
      dateFnsLocale = require("date-fns/locale/en-US").default
      break
    case "ar":
      dateFnsLocale = require("date-fns/locale/ar").default
      break
    case "de":
      dateFnsLocale = require("date-fns/locale/de").default
      break
    case "ko":
      dateFnsLocale = require("date-fns/locale/ko").default
      break
    case "es":
      dateFnsLocale = require("date-fns/locale/es").default
      break
    case "fr":
      dateFnsLocale = require("date-fns/locale/fr").default
      break
    case "hi":
      dateFnsLocale = require("date-fns/locale/hi").default
      break
    case "ja":
      dateFnsLocale = require("date-fns/locale/ja").default
      break
    case "id":
      dateFnsLocale = require("date-fns/locale/id").default
      break
    case "it":
      dateFnsLocale = require("date-fns/locale/it").default
      break
    case "pl":
      dateFnsLocale = require("date-fns/locale/pl").default
      break
    case "pt":
      dateFnsLocale =
        normalizedTag === "pt-br"
          ? require("date-fns/locale/pt-BR").default
          : require("date-fns/locale/pt").default
      break
    case "ru":
      dateFnsLocale = require("date-fns/locale/ru").default
      break
    case "tr":
      dateFnsLocale = require("date-fns/locale/tr").default
      break
    case "vi":
      dateFnsLocale = require("date-fns/locale/vi").default
      break
    case "zh":
      if (normalizedTag === "zh-hk") {
        dateFnsLocale = require("date-fns/locale/zh-HK").default
      } else if (normalizedTag === "zh-tw") {
        dateFnsLocale = require("date-fns/locale/zh-TW").default
      } else {
        dateFnsLocale = require("date-fns/locale/zh-CN").default
      }
      break
    default:
      dateFnsLocale = require("date-fns/locale/en-US").default
      break
  }
}

export const formatDate = (date: string, dateFormat?: string, options?: Options) => {
  const dateOptions = {
    ...options,
    locale: dateFnsLocale,
  }
  return format(parseISO(date), dateFormat ?? "MMM dd, yyyy", dateOptions)
}
