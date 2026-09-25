import { Translations } from "./en"

const tl: Translations = {
  "common": {
    "ok": "OK!",
    "cancel": "Kanselahin",
    "back": "pabalik",
    "logOut": "Mag-log out"
  },
  "welcomeScreen": {
    "postscript": "psst  — Ito marahil ay hindi kung ano ang hitsura ng iyong app. (Maliban kung ipinasa sa iyo ng iyong taga - disenyo ang mga screen na ito, at sa kasong iyon, ipadala ito!)",
    "readyForLaunch": "Ang iyong app, halos handa na para sa paglulunsad!",
    "exciting": "(ohh, ito ay kapana - panabik!)",
    "letsGo": "Tara na!"
  },
  "errorScreen": {
    "title": "May nangyaring mali!",
    "friendlySubtitle": "Ito ang screen na makikita ng iyong mga user sa produksyon kapag ang isang error ay itinapon. Gusto mong i - customize ang mensaheng ito (matatagpuan sa`app/i18n/en.ts`) at marahil pati na rin ang layout (`app/screens/ErrorScreen`). Kung nais mong alisin ito nang buo, suriin ang`app/app.tsx`para sa<ErrorBoundary>component.",
    "reset": "I - RESET ANG APP",
    "traceTitle": "Error mula sa%{name}stack"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "Kaya walang laman... kaya malungkot",
      "content": "Wala pang nahanap na datos. Subukang i - click ang button para i - refresh o i - reload ang app.",
      "button": "Subukan natin ulit!"
    }
  },
  "errors": {
    "invalidEmail": "Hindi wasto ang email address. "
  },
  "loginScreen": {
    "logIn": "Mag-log in",
    "subtitle": "Magpatuloy gamit ang iyong social account upang ma - access ang pag - unlad ng iyong bokabularyo.",
    "continueWith": "magpatuloy sa,",
    "regionTitle": "Rehiyon",
    "regionSubtitle": "Kasalukuyan:{{region}}",
    "regionNotSelected": "Hindi napili",
    "changeRegion": "Palitan",
    "signingIn": "Nagsa - sign in...",
    "googleButton": "Wala lang",
    "appleButton": "Apple",
    "moreProvidersSoon": "Marami pang provider ang magiging available sa lalong madaling panahon.",
    "accessibility": {
      "openRegionSelection": "Buksan ang pagpili ng rehiyon"
    },
    "errors": {
      "unauthorized": "Nabigo ang pagpapatunay. Mangyaring mag - sign in muli.",
      "cannotConnect": "Hindi makakonekta. Pakisubukang muli.",
      "server": "Nabigo ang pagpapatunay ng server. Pakisubukan muli sa ilang sandali.",
      "rejected": "Tinanggihan ang kahilingan sa pag - sign in. Paki - verify ang configuration ng auth.",
      "badData": "Ang hindi inaasahang tugon ay natanggap mula sa server.",
      "generic": "Hindi makumpleto ang pag - sign in. Pakisubukan muli.",
      "googleCancelled": "Kinansela ang pag - sign in sa Google.",
      "googleUnavailable": "Hindi available sa device na ito ang pag - sign in sa Google.",
      "googleFailed": "Nabigo ang pag - sign in sa Google. Pakisubukan muli."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "Piliin ang iyong language pair",
    "titleSettings": "Mga preference sa wika",
    "subtitleOnboarding": "Piliin ang iyong katutubong wika at target na wika mula sa pandaigdigang listahan na may bandila at bansa.",
    "subtitleSettings": "I-update dito ang iyong katutubong wika at target na wika kasama ang bandila at impormasyon ng bansa.",
    "currentPair": "Kasalukuyang pares",
    "availableOptionsCount": "{{count}} na language/country option ang available",
    "nativeLanguageTitle": "Katutubong wika",
    "nativeLanguageBody": "Ipapakita sa wikang ito ang mga salin at paliwanag.",
    "learningLanguageTitle": "Wikang pinag-aaralan",
    "learningLanguageBody": "Sa wikang ito bubuuin ang mga depinisyon at konteksto.",
    "selectedLabel": "Napili",
    "pickerTitleL1": "Piliin ang katutubong wika",
    "pickerTitleL2": "Piliin ang wikang pinag-aaralan",
    "searchPlaceholder": "Maghanap ng wika o bansa",
    "noResults": "Walang nahanap na resulta.",
    "saving": "Sine-save...",
    "continue": "Magpatuloy",
    "save": "I-save",
    "accessibility": {
      "goBack": "Bumalik",
      "selectNativeLanguage": "Piliin ang katutubong wika",
      "selectLearningLanguage": "Piliin ang wikang pinag-aaralan",
      "continueWithSelectedLanguages": "Magpatuloy gamit ang napiling mga wika",
      "saveLanguages": "I-save ang mga wika",
      "closeLanguagePicker": "Isara ang language picker",
      "closePicker": "Isara ang picker",
      "selectLanguageItem": "Piliin ang {{language}} {{country}}"
    },
    "errors": {
      "cannotConnect": "Hindi makakonekta. Pakisubukang muli.",
      "unauthorized": "Hindi wasto ang session. Mangyaring mag - sign in muli.",
      "validation": "Hindi ma - save ang mga kagustuhan sa wika. Mangyaring suriin ang iyong mga input.",
      "server": "Nagkaroon ng error sa server. Pakisubukan muli sa ilang sandali.",
      "saveFailed": "Hindi ma - save ang mga kagustuhan sa wika. Pakisubukan muli.",
      "noSession": "Walang nahanap na aktibong session. Mangyaring mag - sign in muli.",
      "selectTwoLanguages": "Mangyaring piliin ang parehong wika.",
      "sameLanguagePair": "Ang katutubong wika at wika sa pag - aaral ay hindi maaaring magkapareho."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "Subukan muli",
      "signIn": "Mag-sign in",
      "favoriteLabel": "Paborito",
      "learnedLabel": "Natutunan",
      "detailButton": "Buksan ang detalye"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "Paano talaga gumagana ang VocOrbit",
      "subtitle": "Real daloy: pumili ng isang pangungusap sa labas ng app, pumili ng isang salita, pagkatapos ay malaman ito na may konteksto sa loob VocOrbit.",
      "progress": "Hakbang{{current}}/{{total}}",
      "progressSingle": "Hakbang{{current}}",
      "mock": {
        "contextLabel": "Pangungusap sa konteksto",
        "selectedWordLabel": "Napiling salita",
        "meaningLabel": "Kahulugan sapayak pangungusap",
        "whyLabel": "Bakit sa kontekstong ito"
      },
      "flowTitle": "Alamin ang daloy sa 3 mabilisang hakbang",
      "highlightsTitle": "Ang makukuha mo",
      "actions": {
        "previous": "Nakaraan",
        "next": "<g id=\"547158685\">Susunod na Hakbang:</g>",
        "enterApp": "Simulan ang pag-aaral",
        "showExample": "Ipakita ang isang tunay na halimbawa",
        "hideExample": "Itago ang halimbawa"
      },
      "steps": {
        "step1": {
          "step": "HAKBANG 1 • Ibahagi ang isang pangungusap",
          "title": "Piliin ang pangungusap kung saan lilitaw ang salita",
          "body": "Long pindutin ang teksto sa browser, mga tala, o anumang app at ipadala ito sa VocOrbit Share Extension.",
          "source": "Kapag tumingin ako sa likod, ako ay impressed muli sa ang nagbibigay - buhay na kapangyarihan ng panitikan.",
          "word": "panitikan",
          "meaning": "nakasulat na mga akda, lalo na ang mga itinuturing na artistikong",
          "why": "Sa pangungusap na ito ay tumutukoy sa mga aklat at sinulat na sining na malakas na nakakaapekto sa nagsasalita.",
          "hint": "Tip: Laging ibahagi ang buong pangungusap, hindi lamang ang isang salita.",
          "bullets": {
            "one": "Gumagana sa browser, mga tala, at maraming pagbabasa ng apps",
            "two": "Panatilihin mo ang orihinal na konteksto ng pangungusap",
            "three": "Walang kinakailangang manu - manong daloy ng copy - paste"
          }
        },
        "step2": {
          "step": "HAKBANG 2 • Piliin ang eksaktong salita",
          "title": "I - tap ang isang salita at makakuha ng instant basic na kahulugan",
          "body": "Sa loob ng share view, ang mga salita ay tappable. Pumili ng isang target na salita at patakbuhin ang pangunahing pananaw.",
          "source": "Ang pagbabasa ay hindi dapat iharap sa mga bata bilang isang gawain, isang tungkulin.",
          "word": "gawaing - bahay",
          "meaning": "isang regular na gawain, karaniwang hindi kasiya - siya",
          "why": "Dito ay binibigyang diin ng 'chore' na ang pagbabasa ay hindi dapat pakiramdam tulad ng sapilitang trabaho.",
          "hint": "Tip: Kung hindi ka sigurado, magsimula sa basic. Pagkatapos ay tumakbo advanced sa app.",
          "bullets": {
            "one": "Ang kahulugan ay nabuo para sa eksaktong pangungusap na ito",
            "two": "Nakikita mo rin kung bakit pinipili ang pakiramdam na ito",
            "three": "Sinusuportahan ang iyong napiling pares ng wika"
          }
        },
        "step3": {
          "step": "HAKBANG 3 • I - save at ayusin",
          "title": "Ilipat ang mga kapaki - pakinabang na salita sa iyong personal na sistema",
          "body": "Pagkatapos maabot ng salita ang VocOrbit, markahan ang paborito o idagdag sa paulit - ulit na listahan para sa aktibong pag - aaral.",
          "source": "Sumandal sa aming karanasan ng dalubhasa upang itakda ang iyong proyekto para sa tagumpay.",
          "word": "Eksperto",
          "meaning": "isang taong may espesyal na kasanayan o kaalaman",
          "why": "Inilalarawan nito ang karanasan bilang lubos na maaasahan at may kasanayan sa konteksto ng proyektong ito.",
          "hint": "Tip: Panatilihing nakatuon ang listahan ng pag - uulit. Ang mga aktibong salita ng 10 ay nagbibigay ng mas mahusay na pagpapanatili.",
          "bullets": {
            "one": "Paboritong listahan para sa mga mahahalagang salita",
            "two": "Ulitin ang listahan para sa aktibong memorization",
            "three": "Pinapanatiling malinis ng natutunang estado ang iyong progreso"
          }
        },
        "step4": {
          "step": "HAKBANG 4 • Magsanay ng loop",
          "title": "Suriin, isagawa, at markahan ang natutunan",
          "body": "Gumamit ng mga mode ng pagsasanay at mga paalala hanggang sa maging malakas ang pagpapabalik, pagkatapos ay markahan ang salita bilang natutunan.",
          "source": "Gusto mo bang makipag - ugnayan tungkol sa ibang bagay?",
          "word": "Magwalis",
          "meaning": "para makipag - ugnayan sa isang tao",
          "why": "Sa kontekstong ito ito ay isang pariralang pandiwa na nangangahulugang komunikasyon, hindi pisikal na pag - abot.",
          "hint": "Tip: Gumamit ng mga paalala at maikling sesyon araw - araw para sa matatag na progreso.",
          "bullets": {
            "one": "Ang mga card ng pagsasanay ay binuo mula sa iyong sariling mga salita",
            "two": "Ang lingguhang analytics ay nagpapakita ng mga mahinang puntos",
            "three": "Awtomatikong nag - iiwan ang mga natutunan na salita ng paulit - ulit na queue"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "Maaaring nag - expire na ang iyong sesyon. Mangyaring mag - sign in muli.",
      "cannotConnect": "Hindi maabot ang server. Suriin ang iyong koneksyon at subukang muli.",
      "listLoadFailed": "Hindi ma - load ang listahan ng salita. Pakisubukan muli.",
      "searchLoadFailed": "Hindi ma - load ang mga resulta ng paghahanap. Pakisubukan muli.",
      "itemNotFound": "Hindi nahanap ang talaan ng salita.",
      "reloginRequired": "Mangyaring mag - sign in muli upang magpatuloy.",
      "favoriteActionFailed": "Nabigo ang paboritong pagkilos. Pakisubukan muli.",
      "detailLoadFailed": "Hindi ma - load ang detalye ng salita.",
      "stateUpdateFailed": "Hindi ma - update ang estado. Pakisubukan muli.",
      "analysisRequestFailed": "Hindi maipadala ang kahilingan sa pagsusuri.",
      "invalidModelOutput": "Di - wasto ang format ng pagtugon sa modelo. Pakisubukan muli.",
      "analysisTimeout": "Nag - time out ang pagsusuri. Pakisubukan muli.",
      "advancedCreditInsufficient": "Hindi sapat ang mga advanced na kredito.",
      "basicCreditInsufficient": "Hindi sapat ang basic credits.",
      "advancedAnalysisFailed": "Hindi makumpleto ang advanced na pagsusuri.",
      "basicAnalysisFailed": "Hindi makumpleto ang pangunahing pagsusuri.",
      "repeatProgressUpdateFailed": "Hindi ma - update ang paulit - ulit na progreso. Pakisubukan muli.",
      "missingContext": "Wala ang kontekstong kinakailangan para sa pagsusuri.",
      "selectedWordNotInSentence": "Ang napiling salita ay hindi matatagpuan sa konteksto ng pangungusap.",
      "analysisFailedGeneric": "Hindi makumpleto ang pagsusuri. Pakisubukan muli.",
      "unexpected": "isang hindi inaasahang error ang naganap"
    },
    "search": {
      "title": "Maghanap",
      "placeholder": "Maghanap ayon sa salita, kahulugan o paliwanag",
      "loading": "Nilo-load ang mga salita...",
      "emptyResult": "Walang salitang tumugma sa iyong hinahanap.",
      "emptyHint": "Mag-type sa itaas para maghanap."
    },
    "showroom": {
      "loading": "Naglo - load ng listahan ng salita...",
      "emptyTitle": "Wala pang salita",
      "emptyBody": "Pagkatapos mong magdagdag ng mga salita sa pamamagitan ng Word Insight, awtomatikong pupunan ang listahang ito.",
      "emptyCta": "Mga bukas na anunsyo",
      "updateAvailableTitle": "Available ang bagong bersyon",
      "updateAvailableBody": "I - tap para i - update at patuloy na makuha ang mga pinakabagong pagpapahusay.",
      "updateNow": "Mag-update ngayon",
      "repeatAdded": "{{word}}idinagdag sa umuulit na listahan ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}}inalis mula sa umuulit na listahan ({{count}}/{{limit}}).",
      "repeatLimitReached": "Naabot mo ang limitasyon ng iyong paulit - ulit na listahan (10/10).",
      "repeatPermissionRequired": "Kinakailangan ang pahintulot sa notipikasyon para sa mga paalala. Paganahin ang mga notipikasyon upang magdagdag ng mga salita.",
      "favoriteAdded": "{{word}}idinagdag sa mga paborito.",
      "favoriteRemoved": "{{word}}inalis mula sa mga paborito.",
      "repeatCleared": "Na - clear ang repeat list.",
      "repeatListTitle": "Ulitin ang listahan",
      "repeatCount": "{{count}}/{{limit}} salita",
      "repeatEmpty": "Walang laman ang repeat list. Magdagdag ng mga salita gamit ang bell button sa ibaba.",
      "clearAll": "I-clear lahat",
      "done": "Tapos",
      "practice": "Mag-practice",
      "accessibility": {
        "showDetails": "Ipakita ang mga detalye",
        "favoriteWord": "Paboritong salita",
        "repeatWordLater": "Ulitin ang salitang ito sa ibang pagkakataon",
        "openProfile": "Buksan ang profile",
        "openRepeatList": "Buksan ang listahan ng paulit - ulit na salita",
        "openAnnouncements": "Mga bukas na anunsyo",
        "openUpdate": "Buksan ang page ng pag - update",
        "dismissUpdate": "I - dismiss ang notipikasyon sa pag - update",
        "searchWords": "hanap salita",
        "switchToCard": "Lumipat sa view ng card",
        "switchToList": "Lumipat sa list",
        "retryShowroom": "Subukang muling i - load ang showroom",
        "closeRepeatList": "Isara ang repeat list",
        "clearRepeatList": "I - clear ang repeat list",
        "removeFromRepeat": "Alisin ang{{word}}mula sa paulit - ulit na listahan",
        "practiceWord": "Ipraktis ang salitang ito",
        "addWord": "Magdagdag ng salita"
      },
      "quickAdd": {
        "eyebrow": "Mabilisang dagdag",
        "title": "Magdagdag ng salita mula sa konteksto",
        "body": "Mag-paste ng pangungusap, piliin ang tamang salita, at i-save ito.",
        "action": "Magdagdag ng salita",
        "actionHint": "I-paste at piliin"
      }
    },
    "practiceHub": {
      "title": "Pagsasanay",
      "sectionLabel": "PRACTICE",
      "selectAnswer": "PUMILI NG SAGOT",
      "modeBasic": "Pangunahin",
      "modeAdvanced": "Mas mataas",
      "loadingTitle": "Nilo-load ang catalog",
      "loadingMessage": "Sinusuri kung aling mga uri ng exercise ang available para sa iyo.",
      "loadingQuestionsTitle": "Inihahanda ang mga tanong sa practice...",
      "loadingQuestionsMessage": "Gumagawa ng mga tanong batay sa available mong vocabulary data.",
      "instructions": {
        "matchSynonyms": "Piliin ang pinakamalapit na kasingkahulugan."
      },
      "resultCta": {
        "backToPractice": "Bumalik sa practice",
        "seeResult": "Tingnan ang resulta",
        "nextWord": "Susunod na salita"
      },
      "result": {
        "correctTitle": "Tamang sagot!",
        "incorrectTitle": "Maling sagot!",
        "correctAnswerLabel": "Tamang sagot:",
        "usedInSentenceLabel": "Ginamit sa pangungusap:",
        "sessionResultLabel": "Resulta ng session"
      },
      "leavePrompt": {
        "title": "Aalis ka na ba?",
        "keepPlaying": "Magpatuloy",
        "leave": "Umalis",
        "closePromptAccessibility": "Isara ang leave prompt",
        "leavePracticeAccessibility": "Umalis sa practice"
      },
      "hints": {
        "availableCount": "{{count}} salitang available",
        "missingSynonyms": "Walang synonym data",
        "minActiveWords": "Kailangan ng hindi bababa sa 2 aktibong salita"
      },
      "tiles": {
        "meaningMatch": "Pagtutugma ng kahulugan",
        "fillInGap": "Punan ang patlang",
        "guessWord": "Hulaan ang salita",
        "matchSynonyms": "Itugma ang mga kasingkahulugan"
      },
      "accessibility": {
        "goBack": "Bumalik",
        "useMode": "Paggamit{{mode}}mode",
        "closePractice": "Isara ang practice"
      },
      "loadState": {
        "noQuestions": {
          "title": "Wala pang tanong sa practice",
          "message": "Kailangan mo ng hindi bababa sa 2 aktibong salita para makapagsimula.",
          "actionLabel": "Magdagdag ng mga salita"
        },
        "unauthorized": {
          "title": "Kailangang mag-sign in",
          "message": "Maaaring nag-expire ang session mo. Mag-sign in muli para magpatuloy.",
          "actionLabel": "Mag-sign in"
        },
        "forbidden": {
          "title": "Hindi available ang feature na ito sa ngayon",
          "message": "Suriin ang iyong plan o credits para magpatuloy.",
          "actionLabel": "Kumuha ng credits"
        },
        "rejected": {
          "title": "Kulang ang data para sa mode na ito",
          "message": "Magdagdag ng higit pang mga salita at subukan muli.",
          "actionLabel": "Magdagdag ng mga salita"
        },
        "server": {
          "title": "Hindi maabot ang server",
          "message": "Suriin ang iyong koneksyon at subukan muli.",
          "actionLabel": "Subukan muli"
        },
        "generic": {
          "title": "Hindi masimulan ang practice",
          "message": "May naganap na hindi inaasahang error. Pakisubukang muli.",
          "actionLabel": "Subukan muli"
        }
      }
    },
    "announcements": {
      "title": "Mga Anunsyo",
      "unreadCount": "{{count}} hindi pa nababasa",
      "markAllRead": "Markahan lahat bilang nabasa",
      "loading": "Nilo-load ang mga anunsyo...",
      "empty": "Walang anunsyo sa ngayon.",
      "openLink": "Buksan ang link",
      "openAnnouncement": "Buksan ang anunsyo: {{title}}",
      "levelInfo": "Impormasyon",
      "levelWarning": "Babala",
      "levelCritical": "Kritikal",
      "loadFailed": "Hindi ma-load ang mga anunsyo. Pakisubukang muli.",
      "claimFailed": "Nabigo ang claim ng gantimpala. Pakisubukan muli.",
      "requirementNotMet": "Hindi pa natutugunan ang requirement. Imbitahan muna ang mga kaibigan.",
      "referralCodeMissing": "Nawawala ang referral code para sa account na ito.",
      "referralProgress": "Pag - unlad ng referral:{{current}}/{{required}}",
      "shareInvite": "Mag-imbita ng kaibigan! ",
      "referralShareMessage": "Sumali sa VocOrbit.\nBuksan ang link na ito:\n{{link}}",
      "rewardText": "Gantimpala: +{{amount}}{{creditType}}credit",
      "creditBasic": "Ano Ang tagalog Ng basic",
      "creditAdvanced": "mas mataas",
      "claimReward": "Kunin",
      "claimingReward": "Inaangkin...",
      "rewardClaimed": "Nakuha"
    },
    "forceUpdate": {
      "title": "\"Kailangan ng Update\",",
      "body": "Kinakailangan ang isang bagong bersyon upang magpatuloy sa paggamit ng VocOrbit.",
      "updateNow": "Mag-update ngayon",
      "checkAgain": "Suriing Muli"
    },
    "profile": {
      "title": "Perfil",
      "accountDetailsTitle": "Detalye ng Account",
      "accountDetailsSubtitle": "Tingnan ang iyong email at impormasyon ng account.",
      "settingsTitle": "Mga Setting",
      "settingsSubtitle": "I-customize ang laki ng teksto at ayos ng mga action button.",
      "favoriteWordsTitle": "Paboritong Mga Salita",
      "favoriteWordsSubtitle": "Tingnan ang mga salitang idinagdag sa paborito.",
      "learnedWordsTitle": "Mga Natutunang Salita",
      "learnedWordsSubtitle": "Tingnan ang mga salitang minarkahang natutunan.",
      "weeklyAnalyticsTitle": "Lingguhang Analytics",
      "weeklyAnalyticsSubtitle": "Tingnan ang iyong practice performance sa huling 7 araw.",
      "regionTitle": "Rehiyon",
      "regionSubtitle": "Kasalukuyan: {{region}}",
      "regionNotSelected": "Hindi napili",
      "emptyFavorites": "Wala pang paboritong salita.",
      "emptyLearned": "Wala pang natutunang salita.",
      "loadingList": "Nilo-load ang listahan...",
      "logOut": "Mag-log out",
      "accessibility": {
        "goBack": "Bumalik",
        "openAccountDetails": "Mga detalye ng account",
        "openSettings": "Buksan ang mga setting",
        "openFavoriteWords": "Buksan ang mga paboritong salita",
        "openLearnedWords": "Buksan ang mga natutunan na salita",
        "openWeeklyAnalytics": "Buksan ang lingguhang analytics",
        "openRegion": "Buksan ang mga setting ng rehiyon",
        "logOut": "Mag-log out",
        "playPronunciation": "I - play ang pagbigkas para sa{{word}}",
        "openDetailForWord": "Buksan ang detalye para sa{{word}}",
        "removeWord": "Alisin{{word}}"
      }
    },
    "settings": {
      "title": "Mga Setting",
      "languagePairTitle": "Pares ng wika",
      "languagePairSubtitle": "Baguhin ang iyong katutubong wika at wikang pinag-aaralan.",
      "billingCreditsTitle": "Billing at credits",
      "billingCreditsSubtitle": "Pamahalaan dito ang basic meaning credits at mga IAP package.",
      "quickLookupShortcutTitle": "Quick lookup shortcut",
      "quickLookupShortcutSubtitle": "Change the global shortcut that opens the floating lookup window.",
      "quickLookupShortcutLoading": "Loading shortcut...",
      "quickLookupShortcutChange": "Change shortcut",
      "quickLookupShortcutReset": "Reset to default",
      "quickLookupShortcutListening": "Listening for shortcut...",
      "quickLookupShortcutListeningHint": "Press the new key combination now. Press Esc to cancel.",
      "quickLookupShortcutSaving": "Saving shortcut...",
      "quickLookupShortcutUpdated": "Current shortcut: {{shortcut}}",
      "quickLookupShortcutInvalid": "Use at least Cmd/Ctrl or Alt with another key.",
      "quickLookupShortcutSaveFailed": "VocOrbit could not update the shortcut right now.",
      "themeModeTitle": "Tema",
      "themeModeSubtitle": "Piliin ang liwanag, madilim, o sundin ang setting ng iyong system.",
      "themeModeSystem": "input method menu",
      "themeModeLight": "Kaunti",
      "themeModeDark": "Madilim",
      "textSizeTitle": "Laki ng teksto",
      "textSizeSubtitle": "Ayusin ang laki ng teksto sa mga vocabulary card.",
      "actionOrderTitle": "Ayos ng aksyon",
      "actionOrderSubtitle": "Itakda ang ayos ng mga button na detail/favorite/repeat.",
      "actionDetail": "Detalye",
      "actionFavorite": "Paborito",
      "actionRepeat": "Ulit",
      "resetToDefaults": "I-reset sa default",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "Bumalik",
        "openLanguagePreferences": "Buksan ang preferences sa wika",
        "openBillingCredits": "Buksan ang billing at credits",
        "useSystemTheme": "Gamitin ang tema ng system",
        "useLightTheme": "Gumamit ng magaan na tema",
        "useDarkTheme": "Gumamit ng madilim na tema",
        "decreaseTextSize": "Bawasan ang laki ng teksto",
        "increaseTextSize": "Dagdagan ang laki ng teksto",
        "moveActionLeft": "Ilipat pakaliwa ang {{action}}",
        "moveActionRight": "Ilipat pakanan ang {{action}}",
        "resetSettings": "I-reset ang mga setting ng vocabulary"
      }
    },
    "accountDetails": {
      "title": "Detalye ng Account",
      "emailLabel": "Email",
      "userIdLabel": "ID ng user",
      "regionLabel": "Rehiyon ng tuluyan",
      "regionEndpointLabel": "Rehiyon endpoint",
      "appVersionLabel": "Bersyon ng app",
      "buildLabel": "Bumuo ng numero",
      "platformLabel": "Plataporma",
      "osVersionLabel": "Bersyon ng OS",
      "accessibility": {
        "goBack": "Bumalik",
        "deleteAccount": "Permanenteng tanggalin ang account"
      },
      "deleteAccount": {
        "sectionTitle": "Tanggalin ang account",
        "sectionBody": "Permanenteng tanggalin ang iyong VocOrbit account at ang data ng app na naka-link dito. Ang pagkilos na ito ay hindi maaaring i-undo.",
        "action": "Permanenteng tanggalin ang account",
        "deleting": "Tinatanggal ang account...",
        "confirmTitle": "Tanggalin ang account?",
        "confirmBody": "Permanente nitong dine-delete ang iyong VocOrbit account at naka-link na data ng app. Ang pagkilos na ito ay hindi maaaring i-undo.",
        "successTitle": "Na-delete ang account",
        "successBody": "Ang iyong VocOrbit account ay permanenteng tinanggal.",
        "missingUser": "Hindi mahanap ang iyong account ID. Mangyaring mag-sign in muli.",
        "cannotConnect": "Hindi maabot ang server. Suriin ang iyong koneksyon at subukang muli.",
        "sessionExpired": "Nag-expire ang iyong session. Mangyaring mag-sign in muli.",
        "failed": "Hindi namin matanggal ang iyong account sa ngayon. Pakisubukang muli."
      }
    },
    "iap": {
      "title": "Billing at Credits",
      "loading": "Nilo-load ang detalye ng billing...",
      "currentSubscription": "Kasalukuyang subscription",
      "currentStatus": "Katayuan:{{status}}",
      "currentPlan": "Kasalukuyang plan: {{plan}}",
      "noActivePlan": "Walang aktibong plan",
      "refresh": "I-refresh ang billing",
      "basicCreditsTitle": "Mga pangunahing insight credit",
      "basicCreditsBody": "Ang basic meaning analysis sa share screen ay kumokonsumo ng credit na ito.",
      "plansTitle": "Mga plan",
      "plansBody": "Pumili ng plan at kumpletuhin ang bayad gamit ang iyong store account.",
      "noPlans": "Walang mabibiling plan para sa platform na ito.",
      "planTopup": "Buwanang dagdag: +{{basic}} basic · +{{advanced}} advanced",
      "planCaps": "Mga cap: {{basicCap}} basic · {{advancedCap}} advanced",
      "priceLabel": "Presyo: {{price}}",
      "buyNow": "Bumili ngayon",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "Pinoproseso ang pagbili...",
      "purchaseCanceled": "Kinansela ang pagbili.",
      "purchaseApplied": "Matagumpay na na-activate ang {{sku}}.",
      "alreadyOwnedRestoring": "Pag - aari na ang item na ito. Ipinapanumbalik ang iyong mga pagbili...",
      "restorePurchases": "I-restore ang mga binili",
      "restoring": "Nire-restore ang mga binili...",
      "restoreNoPurchases": "Walang nahanap na purchases na puwedeng i-restore.",
      "restoreNoApplicablePurchases": "Walang restorable purchases na na-apply.",
      "restoreApplied": "{{count}} purchase ang na-restore at na-verify.",
      "status": {
        "none": "Hindi naka-subscribe",
        "pending": "Naghihintay",
        "active": "Aktibo",
        "expired": "Nag-expire",
        "canceled": "Kinansela",
        "refunded": "Na-refund"
      },
      "errors": {
        "unauthorized": "Nag - expire na ang iyong session. Mangyaring mag - sign in muli.",
        "cannotConnect": "Hindi maabot ang server. Suriin ang iyong koneksyon at subukang muli.",
        "forbidden": "Hindi ma - apply ang pagbili na ito para sa iyong account.",
        "generic": "Nabigo ang kahilingan sa pagsingil. Pakisubukan muli.",
        "purchaseFailed": "Nabigo ang pagbili. Pakisubukan muli.",
        "alreadyOwned": "Ang item na ito ay pag - aari na sa account na ito.",
        "invalidReceipt": "Hindi mapatunayan ang resibo ng tindahan.",
        "iapUnavailable": "Kasalukuyang hindi available ang serbisyo sa pagbili sa tindahan sa device na ito."
      },
      "accessibility": {
        "goBack": "Bumalik",
        "buyPlan": "Bilhin ang {{plan}} plan",
        "restorePurchases": "I-restore ang mga dating binili",
        "refresh": "I-refresh ang billing at status ng subscription"
      },
      "desktop": {
        "subtitle": "Tingnan ang iyong kasalukuyang balanse dito. Ang mga bagong pagbili at pagbabago sa subscription ay nagpapatuloy sa mobile.",
        "desktopBadge": "View sa desktop",
        "phoneOnlyBadge": "Telepono para sa mga pagbili",
        "balanceTitle": "Ang iyong kasalukuyang balanse",
        "balanceBody": "Pinapanatili ng Desktop na nakikita ang iyong mga available na credit at status ng subscription, upang masuri mo ang iyong account bago ipagpatuloy ang iyong daloy ng pag-aaral.",
        "basicAvailable": "Mga pangunahing kredito",
        "advancedAvailable": "Mga advanced na kredito",
        "freeCredits": "Libre",
        "paidCredits": "Binayaran",
        "noPlanBody": "Ang account na ito ay walang aktibong mobile billing plan sa ngayon. Magagamit mo pa rin ang anumang mga credit na available na dito.",
        "mobileTitle": "Ipagpatuloy ang mga pagbili sa iyong telepono",
        "mobileBody": "Ang mga pagbili ng credit at mga pagbabago sa subscription ay nakumpleto sa loob ng mobile app gamit ang iyong App Store o Google Play account.",
        "storeLabel": "Tindahan: {{store}}",
        "renewsOn": "Nagre-renew sa {{date}}",
        "expiresOn": "Natapos noong {{date}}",
        "updatedOn": "Huling pag-sync: {{date}}",
        "stepOpenPhone": "Buksan ang VocOrbit sa iyong telepono gamit ang parehong account.",
        "stepOpenBilling": "Pumunta sa Profile > Pagsingil at Mga Kredito.",
        "stepFinishPurchase": "Bumili ng mga credit o pamahalaan ang iyong subscription doon, pagkatapos ay bumalik dito at i-refresh.",
        "mobileHint": "Ang iyong balanse sa kredito ay nag-a-update dito pagkatapos mailapat ang pagbili sa mobile sa parehong account."
      }
    },
    "weeklyAnalytics": {
      "title": "Lingguhang Analytics",
      "modeAll": "Lahat",
      "modeBasic": "Pangunahin",
      "modeAdvanced": "Mas mataas",
      "loading": "Nilo-load ang lingguhang analytics...",
      "summaryTitle": "Buod (7 araw)",
      "sessions": "Mga session",
      "completed": "Natapos",
      "answered": "Nasagot",
      "accuracy": "Katumpakan",
      "activeDays": "Aktibong araw",
      "streak": "Sunod-sunod",
      "dailyTrend": "Araw-araw na trend",
      "byQuestionType": "Ayon sa uri ng tanong",
      "byMode": "Ayon sa mode",
      "weakItems": "Mahihinang item",
      "noWeakItems": "Walang kapansin-pansing mahihinang salita ngayong linggo.",
      "weakItemMeta": "Mali: {{wrongAnswers}} · Katumpakan: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "Pagtutugma ng kahulugan",
      "questionTypeGuessWord": "Hulaan ang salita",
      "questionTypeFillInGap": "Punan ang patlang",
      "questionTypeMatchSynonym": "Itugma ang kasingkahulugan",
      "errors": {
        "unauthorized": "Maaaring nag-expire ang session mo. Mag-sign in muli.",
        "cannotConnect": "Hindi maabot ang server. Suriin ang koneksyon at subukan muli.",
        "loadFailed": "Hindi ma-load ang lingguhang analytics. Pakisubukang muli."
      },
      "accessibility": {
        "goBack": "Bumalik",
        "filterByMode": "I-filter ayon sa {{mode}}",
        "retry": "Subukang muli ang analytics request"
      }
    },
    "detail": {
      "closeDetails": "Isara ang detalye ng salita",
      "loadingDetail": "Nilo-load ang detalye ng salita...",
      "detailLoadFailedTitle": "Hindi ma-load ang detalye",
      "statusLearned": "natutunan",
      "statusActive": "aktibo",
      "markAsLearned": "Markahan bilang natutunan",
      "moveBackToActive": "Ibalik sa aktibo",
      "buyAdvancedCredits": "Bumili ng advanced credits",
      "buyBasicCredits": "Bumili ng basic credits",
      "buyCredits": "Bumili ng credits",
      "whyThisSense": "Bakit ito ang kahulugan",
      "examples": "Mga halimbawa",
      "synonyms": "Magkasingkahulugan",
      "antonyms": "Magkasalungat",
      "collocations": "Kolokasyon",
      "alternativeMeanings": "Ibang kahulugan",
      "usageNotes": "Mga tala sa paggamit",
      "noSynonyms": "Wala pang datos ng kasingkahulugan.",
      "stats": "Estadistika",
      "encountersAndLastMode": "Mga encounter: {{encounters}} | Huling mode: {{mode}}",
      "nextReminder": "Susunod na paalala",
      "currentPlan": "Kasalukuyang plano: {{due}}",
      "reviewHint": "Nakalimutan: +10 min, Mahirap: +1 oras, Magaling: tumataas mula +1 araw.",
      "runAdvanced": "Patakbuhin ang advanced na pagsusuri",
      "reviewForgot": "Nakalimutan",
      "reviewHard": "Mahirap",
      "reviewGood": "Magaling",
      "reviewOptionAccessibility": "Napili ang {{title}}. Susunod na review sa loob ng {{delay}}.",
      "repeatUnscheduled": "Hindi naka-iskedyul",
      "repeatNow": "Ngayon",
      "repeatAfterMinutes": "{{count}}min",
      "repeatAfterHours": "{{count}} oras",
      "repeatAfterDays": "{{count}} araw",
      "repeatAfterWeeks": "{{count}} linggo",
      "repeatInMinutes": "sa loob ng {{count}} min",
      "repeatInHours": "sa loob ng {{count}} oras",
      "repeatInDays": "sa loob ng {{count}} araw",
      "repeatInWeeks": "sa loob ng {{count}} linggo",
      "repeatNotificationTitle": "Oras ng review: {{word}}",
      "repeatNotificationBody": "I-review ang salitang {{word}}.",
      "reportIssue": "I-report ang maling kahulugan",
      "reportIssueAccessibility": "I-report ang maling kahulugan para sa {{word}}",
      "deleteWord": "Burahin ang salita",
      "deleteWordAccessibility": "Soft delete ng {{word}}",
      "deleteConfirmTitle": "Burahin ang salitang ito?",
      "deleteConfirmBody": "Aalisin ang \"{{word}}\" sa listahan mo. Maaari mo itong idagdag muli mamaya.",
      "deleteConfirmCancel": "Kanselahin",
      "deleteConfirmAction": "Oo, burahin"
    },
    "quickLookup": {
      "title": "Quick lookup",
      "subtitle": "Read a meaning without leaving the app you are using.",
      "shortcutHint": "Shortcut: {{shortcut}}",
      "loadingSession": "Preparing your VocOrbit session...",
      "authRequiredTitle": "Sign in required",
      "authRequiredBody": "Open VocOrbit, sign in, then use the quick lookup shortcut again.",
      "inputLabel": "Copied text",
      "inputPlaceholder": "Paste a sentence or paragraph here.",
      "selection": {
        "title": "Choose the target word",
        "empty": "Paste text first.",
        "pending": "Click the exact word inside the text.",
        "selected": "Selected: {{word}}"
      },
      "resultTitle": "Basic insight",
      "savedHint": "This lookup is already saved to your library.",
      "browserHint": "Open this page from VocOrbit Desktop to use the floating lookup window.",
      "actions": {
        "pasteClipboard": "Paste clipboard",
        "readingClipboard": "Reading clipboard...",
        "runBasicLookup": "Run basic lookup",
        "runningLookup": "Looking up...",
        "openVocOrbit": "Open VocOrbit",
        "close": "Close"
      },
      "errors": {
        "signInRequiredTitle": "Sign in required",
        "signInRequiredBody": "Your session is not ready. Open VocOrbit and sign in again.",
        "creditsRequiredTitle": "Basic credits required",
        "creditsRequiredBody": "Your account cannot run a basic lookup right now.",
        "timeoutTitle": "Request timed out",
        "timeoutBody": "The lookup took too long. Try again with the same text.",
        "connectionTitle": "Connection problem",
        "connectionBody": "VocOrbit could not reach the server. Check your connection and retry.",
        "lookupFailedTitle": "Lookup failed",
        "lookupFailedBody": "VocOrbit could not finish this insight request.",
        "clipboardUnavailableTitle": "Clipboard unavailable",
        "clipboardUnavailableBody": "Copy the text first, then trigger quick lookup again."
      }
    },
    "report": {
      "title": "Report",
      "subtitle": "Kung ang \"{{word}}\" ay mukhang mali sa kontekstong ito, sabihin sa amin kung ano ang mali.",
      "messageLabel": "Ano daw ang mali?",
      "messagePlaceholder": "Halimbawa: Hindi nababagay sa pangungusap ang kahulugan na ito. Dapat ilarawan ang komunikasyon, hindi ang lokasyon.",
      "charactersLeft": "{{count}}mga character na natitira",
      "submit": "Magpadala ng Ulat",
      "successTitle": "Naipadala na ang ulat",
      "successBody": "Thanks sa feedback. Susuriin namin ang item na ito.",
      "backToDetail": "Bumalik sa detalye ng salita",
      "errors": {
        "unauthorized": "Nag - expire na ang iyong session. Mangyaring mag - sign in muli.",
        "cannotConnect": "Hindi maabot ang server. Suriin ang iyong koneksyon at subukang muli.",
        "itemNotFound": "Hindi mahanap ang item ng salita.",
        "submitFailed": "Hindi makapagsumite ng ulat. Pakisubukan muli."
      },
      "accessibility": {
        "goBack": "Bumalik",
        "submit": "Magpadala ng ulat ng isyu",
        "backToDetail": "Bumalik sa detalye ng salita"
      }
    },
    "capture": {
      "backButton": "Aklatan",
      "headerTitle": "Magdagdag ng salita",
      "headerBody": "Mag-paste ng pangungusap at piliin ang salitang gusto mong i-save.",
      "seedWordLabel": "Naghahanap ng: {{word}}",
      "pasteHero": {
        "title": "Idikit ang kinopyang teksto",
        "body": "Kopyahin ang isang pangungusap o talata, pagkatapos ay i-paste ito upang buksan ang picker.",
        "bodyWithWord": "Kopyahin ang isang pangungusap na may kasamang \"{{word}}\", pagkatapos ay i-paste ito upang buksan ang picker.",
        "hint": "Awtomatikong bubukas ang picker pagkatapos i-paste."
      },
      "picker": {
        "title": "Piliin ang salita sa teksto",
        "body": "I-click ang eksaktong salita sa ibaba. Idikit muli kung kinopya mo ang ibang pangungusap.",
        "badge": "Tagapili ng salita",
        "hint": "Ang VocOrbit ay awtomatikong gumagawa ng word card mula sa lookup na ito."
      },
      "status": {
        "pasteFirst": "I-paste ang kinopyang text para magsimula.",
        "selectedWord": "Piniling salita: {{word}}",
        "seedWordMissing": "Mag-paste ng pangungusap na may \"{{word}}\" o pumili ng isa pang salita sa ibaba.",
        "selectWord": "I-click ang eksaktong salita sa ibaba upang magpatuloy."
      },
      "actions": {
        "pasteCopiedText": "Idikit ang kinopyang teksto",
        "pasteAgain": "Idikit muli",
        "clear": "Maaliwalas",
        "readingClipboard": "Binabasa ang clipboard...",
        "reading": "Binabasa...",
        "analyzeAndSave": "Suriin at i-save",
        "loadingMeaning": "Pagkuha ng pangunahing kahulugan...",
        "openSavedWord": "Buksan ang naka-save na salita",
        "backToLibrary": "Bumalik sa library",
        "pickAnotherWord": "Pumili ng isa pang salita"
      },
      "loading": {
        "title": "Pagpapatakbo ng pangunahing insight",
        "body": "Ang VocOrbit ay tumutugma sa napiling salita laban sa pangungusap na ito."
      },
      "result": {
        "title": "Pangunahing kahulugan",
        "savedFallback": "Nai-save sa iyong library.",
        "contextMeaning": "Kahulugan ng konteksto",
        "whyThisMeaning": "Bakit ganito ang kahulugan"
      },
      "problems": {
        "clipboardUnavailableTitle": "Hindi available ang clipboard",
        "clipboardUnavailableBody": "Naka-block ang access sa clipboard sa konteksto ng browser na ito. Idikit nang manu-mano ang pangungusap.",
        "contextRequiredTitle": "Kinakailangan ang konteksto",
        "contextRequiredBody": "Magdikit ng pangungusap o maikling talata bago pumili ng salita.",
        "selectWordTitle": "Pumili ng salita sa teksto",
        "selectWordBody": "I-click ang eksaktong salita sa loob ng text block bago patakbuhin ang paghahanap.",
        "signInRequiredTitle": "Kailangang mag-sign in",
        "signInRequiredBody": "Nag-expire ang iyong session. Buksan muli ang VocOrbit at mag-sign in bago muling subukan ang paghahanap na ito.",
        "basicCreditsRequiredTitle": "Kinakailangan ang mga pangunahing kredito",
        "basicCreditsRequiredBody": "Ang iyong account ay hindi maaaring magpatakbo ng isang pangunahing paghahanap sa ngayon.",
        "requestTimedOutTitle": "Nag-time out ang kahilingan",
        "requestTimedOutBody": "Masyadong matagal ang lookup. Subukang muli gamit ang parehong pangungusap.",
        "connectionProblemTitle": "Problema sa koneksyon",
        "connectionProblemBody": "Hindi maabot ng VocOrbit ang server. Suriin ang iyong koneksyon at subukang muli.",
        "lookupFailedTitle": "Nabigo ang paghahanap",
        "lookupFailedBody": "Hindi matapos ni VocOrbit ang kahilingan sa insight na ito.",
        "lookupIncompleteTitle": "Hindi kumpleto ang paghahanap",
        "lookupIncompleteBody": "Nagbalik ang VocOrbit ng hindi inaasahang tugon. Subukang muli."
      }
    }
  }
}

export default tl
