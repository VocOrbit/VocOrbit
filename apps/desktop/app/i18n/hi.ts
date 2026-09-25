import { Translations } from "./en"

const hi: Translations = {
  "common": {
    "ok": "ठीक है!",
    "cancel": "रद्द करें",
    "back": "वापस",
    "logOut": "लॉग आउट"
  },
  "welcomeScreen": {
    "postscript": "psst - शायद आपका ऐप ऐसा नहीं दिखता है। (जब तक कि आपके डिजाइनर ने आपको ये स्क्रीन नहीं दी हों, और उस स्थिति में, इसे लॉन्च करें!)",
    "readyForLaunch": "आपका ऐप, लगभग लॉन्च के लिए तैयार है!",
    "exciting": "(ओह, यह रोमांचक है!)",
    "letsGo": "चलो चलते हैं!"
  },
  "errorScreen": {
    "title": "कुछ गलत हो गया!",
    "friendlySubtitle": "यह वह स्क्रीन है जो आपके उपयोगकर्ता संचालन में देखेंगे जब कोई त्रुटि होगी। आप इस संदेश को बदलना चाहेंगे (जो `app/i18n/hi.ts` में स्थित है) और शायद लेआउट भी (`app/screens/ErrorScreen`)। यदि आप इसे पूरी तरह से हटाना चाहते हैं, तो `app/app.tsx` में <ErrorBoundary> कंपोनेंट की जांच करें।",
    "reset": "ऐप रीसेट करें",
    "traceTitle": "%{name} स्टैक से त्रुटि"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "इतना खाली... इतना उदास",
      "content": "अभी तक कोई डेटा नहीं मिला। रीफ्रेश करने या ऐप को पुनः लोड करने के लिए बटन दबाएं।",
      "button": "चलो फिर से कोशिश करते हैं"
    }
  },
  "errors": {
    "invalidEmail": "अमान्य ईमेल पता।"
  },
  "loginScreen": {
    "logIn": "लॉग इन करें",
    "subtitle": "अपनी शब्दावली की प्रगति तक पहुँचने के लिए अपने सोशल अकाउंट के साथ जारी रखें।",
    "continueWith": "के साथ जारी रखें",
    "regionTitle": "क्षेत्र",
    "regionSubtitle": "वर्तमान:{{region}}",
    "regionNotSelected": "नहीं चुने गए",
    "changeRegion": "बदलें",
    "signingIn": "साइन-इन करना...",
    "googleButton": "Google",
    "appleButton": "अंग्रेजी में सेब के पेड़ पर निबंध",
    "moreProvidersSoon": "और प्रदाता जल्द ही उपलब्ध होंगे।",
    "accessibility": {
      "openRegionSelection": "क्षेत्र चयन खोलें"
    },
    "errors": {
      "unauthorized": "प्रमाणीकरण विफल रहा। कृपया फिर से साइन इन करें।",
      "cannotConnect": "कनेक्ट नहीं हो सका. कृपया दोबारा कोशिश करें.",
      "server": "सर्वर सत्यापन विफल रहा। कृपया जल्द ही पुन: प्रयास करें।",
      "rejected": "साइन - इन का अनुरोध नामंज़ूर कर दिया गया। कृपया ऑथ कॉन्फ़िगरेशन वेरिफ़ाई करें।",
      "badData": "सर्वर से अप्रत्याशित प्रतिक्रिया मिली।",
      "generic": "साइन इन पूरा नहीं किया जा सका। कृपया फिर से कोशिश करें।",
      "googleCancelled": "Google साइन इन कैंसिल कर दिया गया था।",
      "googleUnavailable": "इस डिवाइस पर Google साइन इन उपलब्ध नहीं है।",
      "googleFailed": "Google साइन इन विफल रहा। कृपया फिर से कोशिश करें।"
    }
  },
  "languagePreferences": {
    "titleOnboarding": "अपनी भाषा चुनें",
    "titleSettings": "भाषा प्राथमिकताएँ",
    "subtitleOnboarding": "झंडे और देशों वाली वैश्विक सूची से अपनी मूल भाषा और लक्षित भाषा चुनें।",
    "subtitleSettings": "यहाँ अपनी मातृभाषा और लक्ष्य भाषा को झंडे और देश की जानकारी के साथ अपडेट करें।",
    "currentPair": "वर्तमान युग्म",
    "availableOptionsCount": "{{count}} भाषा/देश विकल्प उपलब्ध",
    "nativeLanguageTitle": "मातृभाषा",
    "nativeLanguageBody": "अनुवाद और व्याख्याएँ इसी भाषा में दिखाई जाएँगी।",
    "learningLanguageTitle": "सीखने की भाषा",
    "learningLanguageBody": "परिभाषाएँ और प्रसंग इसी भाषा में बनाए जाएँगे।",
    "selectedLabel": "चयनित",
    "pickerTitleL1": "मातृभाषा चुनें",
    "pickerTitleL2": "सीखने की भाषा चुनें",
    "searchPlaceholder": "भाषा या देश खोजें",
    "noResults": "कोई परिणाम नहीं मिला।",
    "saving": "सहेजा जा रहा है...",
    "continue": "जारी रखें",
    "save": "सहेजें",
    "accessibility": {
      "goBack": "वापस जाएँ",
      "selectNativeLanguage": "देशी भाषा चुनें",
      "selectLearningLanguage": "सीखने की भाषा चुनें",
      "continueWithSelectedLanguages": "चुनी हुई भाषाओं के साथ जारी रखें",
      "saveLanguages": "भाषाएँ सेव करें",
      "closeLanguagePicker": "भाषा पिकर बंद करें",
      "closePicker": "पिकर बंद करें",
      "selectLanguageItem": "चुनें{{language}}{{country}}"
    },
    "errors": {
      "cannotConnect": "कनेक्ट नहीं हो सका. कृपया दोबारा कोशिश करें.",
      "unauthorized": "सत्र अमान्य है। कृपया फिर से साइन इन करें।",
      "validation": "भाषा वरीयताएँ सेव नहीं की जा सकीं। कृपया अपने इनपुट की जाँच करें।",
      "server": "सर्वर में कोई गड़बड़ी हुई। कृपया जल्द ही फिर से कोशिश करें।",
      "saveFailed": "भाषा वरीयताएँ सेव नहीं की जा सकीं। कृपया फिर से कोशिश करें।",
      "noSession": "कोई सक्रिय सत्र नहीं मिला। कृपया फिर से साइन इन करें।",
      "selectTwoLanguages": "कृपया दोनों भाषाएँ चुनें।",
      "sameLanguagePair": "मूल भाषा और सीखने की भाषा एक जैसी नहीं हो सकती।"
    }
  },
  "vocabulary": {
    "common": {
      "retry": "फिर प्रयास करें",
      "signIn": "लॉग इन करें",
      "favoriteLabel": "पसंदीदा",
      "learnedLabel": "सीखा हुआ",
      "detailButton": "विवरण खोलें"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "VocOrbit वास्तव में कैसे काम करता है",
      "subtitle": "वास्तविक प्रवाह: ऐप के बाहर एक वाक्य चुनें, एक शब्द चुनें, फिर इसे VocOrbit के अंदर संदर्भ के साथ सीखें।",
      "progress": "चरण{{current}}/{{total}}",
      "progressSingle": "चरण{{current}}",
      "mock": {
        "contextLabel": "संदर्भ वाक्य",
        "selectedWordLabel": "चुना गया शब्द",
        "meaningLabel": "मूल अर्थ:",
        "whyLabel": "इस संदर्भ में क्यों"
      },
      "flowTitle": "3 त्वरित चरणों में प्रवाह सीखें",
      "highlightsTitle": "आपको क्या मिलता है",
      "actions": {
        "previous": "पिछला",
        "next": "अगला कदम",
        "enterApp": "सीखना शुरू करें",
        "showExample": "एक वास्तविक उदाहरण दिखाएँ",
        "hideExample": "उदाहरण छिपाएँ"
      },
      "steps": {
        "step1": {
          "step": "चरण 1 • एक वाक्य साझा करें",
          "title": "वह वाक्य चुनें जहाँ शब्द दिखाई देता है",
          "body": "ब्राउज़र, नोट्स या किसी भी ऐप में टेक्स्ट को लंबे समय तक दबाएं और इसे VocOrbit Share एक्सटेंशन पर भेजें।",
          "source": "जब मैं पीछे मुड़कर देखता हूं, तो मैं साहित्य की जीवन देने वाली शक्ति से फिर से प्रभावित होता हूं।",
          "word": "साहित्य",
          "meaning": "लिखित कार्य, विशेष रूप से जिन्हें कलात्मक माना जाता है",
          "why": "इस वाक्य में यह पुस्तकों और लिखित कला को संदर्भित करता है जो वक्ता को दृढ़ता से प्रभावित करते हैं।",
          "hint": "युक्ति: हमेशा पूरा वाक्य साझा करें, न कि केवल एक शब्द।",
          "bullets": {
            "one": "ब्राउज़र, नोट्स और कई रीडिंग ऐप्स के साथ काम करता है",
            "two": "आप मूल वाक्य का संदर्भ रखते हैं",
            "three": "मैन्युअल कॉपी - पेस्ट फ़्लो की ज़रूरत नहीं है"
          }
        },
        "step2": {
          "step": "चरण 2 • सटीक शब्द चुनें",
          "title": "एक शब्द पर टैप करें और तत्काल बुनियादी अर्थ प्राप्त करें",
          "body": "शेयर व्यू के अंदर, शब्द टैप किए जा सकते हैं। एक लक्षित शब्द का चयन करें और बुनियादी अंतर्दृष्टि चलाएं।",
          "source": "पढ़ना बच्चों को काम, कर्तव्य के रूप में प्रस्तुत नहीं किया जाना चाहिए।",
          "word": "Chore",
          "meaning": "एक नियमित कार्य, आमतौर पर अप्रिय",
          "why": "यहाँ 'काम' इस बात पर जोर देता है कि पढ़ने को जबरन काम की तरह महसूस नहीं करना चाहिए।",
          "hint": "सुझाव: अगर आप अनिश्चित हैं, तो बुनियादी से शुरू करें। फिर ऐप में एडवांस चलाएँ।",
          "bullets": {
            "one": "इस सटीक वाक्य के लिए अर्थ उत्पन्न होता है",
            "two": "आप यह भी देखते हैं कि इस भावना को क्यों चुना जाता है",
            "three": "आपकी चुनी हुई भाषा जोड़ी को सपोर्ट करता है"
          }
        },
        "step3": {
          "step": "चरण 3 • सहेजें और व्यवस्थित करें",
          "title": "उपयोगी शब्दों को अपने निजी सिस्टम में ले जाएँ",
          "body": "शब्द VocOrbit तक पहुंचने के बाद, सक्रिय सीखने के लिए पसंदीदा को चिह्नित करें या दोहराने की सूची में जोड़ें।",
          "source": "अपने प्रोजेक्ट को सफल बनाने के लिए हमारे विशेषज्ञ अनुभव का सहारा लें।",
          "word": "विशेषज्ञ",
          "meaning": "विशेष कौशल या ज्ञान वाला व्यक्ति",
          "why": "यह इस परियोजना के संदर्भ में अनुभव को अत्यधिक विश्वसनीय और कुशल के रूप में वर्णित करता है।",
          "hint": "सुझाव: दोहराने वाली सूची पर ध्यान केंद्रित रखें। 10 सक्रिय शब्द बेहतर प्रतिधारण प्रदान करते हैं।",
          "bullets": {
            "one": "महत्वपूर्ण शब्दों के लिए पसंदीदा सूची",
            "two": "सक्रिय याददाश्त के लिए सूची दोहराएँ",
            "three": "सीखी हुई स्थिति आपकी प्रगति को साफ़ रखती है"
          }
        },
        "step4": {
          "step": "चरण 4 • अभ्यास लूप",
          "title": "सीखे हुए के रूप में समीक्षा करें, अभ्यास करें और चिह्नित करें",
          "body": "जब तक रिकॉल मजबूत न हो तब तक अभ्यास मोड और अनुस्मारक का उपयोग करें, फिर शब्द को सीखा के रूप में चिह्नित करें।",
          "source": "किसी और चीज़ के बारे में हमसे संपर्क करना चाहते हैं?",
          "word": "संपर्क करें",
          "meaning": "किसी से संपर्क करना",
          "why": "इस संदर्भ में यह एक वाक्यांश क्रिया है जिसका अर्थ है संचार, भौतिक पहुंच नहीं।",
          "hint": "सुझाव: लगातार प्रगति के लिए हर दिन रिमाइंडर और छोटे सेशन का इस्तेमाल करें।",
          "bullets": {
            "one": "अभ्यास कार्ड आपके शब्दों से बने होते हैं",
            "two": "साप्ताहिक एनालिटिक्स में कमज़ोर पॉइंट दिखाई देते हैं",
            "three": "सीखे गए शब्द दोहराने वाली कतार को अपने आप छोड़ देते हैं"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "हो सकता है कि आपके सेशन की समय - सीमा खत्म हो गई हो। कृपया फिर से साइन इन करें।",
      "cannotConnect": "सर्वर तक नहीं पहुँचा जा सका। अपना कनेक्शन जाँचें और फिर से कोशिश करें।",
      "listLoadFailed": "शब्द सूची लोड नहीं की जा सकी। कृपया फिर से कोशिश करें।",
      "searchLoadFailed": "खोज परिणाम लोड नहीं किए जा सके। कृपया फिर से कोशिश करें।",
      "itemNotFound": "रिकॉर्ड नही मिला",
      "reloginRequired": "जारी रखने के लिए कृपया फिर से लॉग इन करें।",
      "favoriteActionFailed": "पसंदीदा एक्शन नहीं हो सका। कृपया फिर से कोशिश करें।",
      "detailLoadFailed": "शब्द विवरण लोड नहीं किया जा सका।",
      "stateUpdateFailed": "स्टेट अपडेट नहीं किया जा सका। कृपया फिर से कोशिश करें।",
      "analysisRequestFailed": "विश्लेषण अनुरोध नहीं भेजा जा सका।",
      "invalidModelOutput": "मॉडल प्रतिक्रिया प्रारूप अमान्य था। कृपया फिर से कोशिश करें।",
      "analysisTimeout": "विश्लेषण का समय खत्म हो गया। कृपया फिर से कोशिश करें।",
      "advancedCreditInsufficient": "एडवांस क्रेडिट अपर्याप्त हैं।",
      "basicCreditInsufficient": "अपर्याप्त बुनियादी क्रेडिट।",
      "advancedAnalysisFailed": "उन्नत विश्लेषण पूरा नहीं किया जा सका।",
      "basicAnalysisFailed": "बुनियादी विश्लेषण पूरा नहीं किया जा सका।",
      "repeatProgressUpdateFailed": "बार - बार की प्रगति अपडेट नहीं की जा सकी। कृपया फिर से कोशिश करें।",
      "missingContext": "विश्लेषण के लिए आवश्यक संदर्भ मौजूद नहीं है।",
      "selectedWordNotInSentence": "संदर्भ वाक्य में चयनित शब्द नहीं मिला है।",
      "analysisFailedGeneric": "विश्लेषण पूरा नहीं किया जा सका। कृपया फिर से कोशिश करें।",
      "unexpected": "कोई अनपेक्षित त्रुटि हुई। "
    },
    "search": {
      "title": "खोज",
      "placeholder": "शब्द, अर्थ या व्याख्या से खोजें",
      "loading": "शब्द लोड हो रहे हैं...",
      "emptyResult": "आपकी खोज से कोई शब्द मेल नहीं खाया।",
      "emptyHint": "खोजने के लिए ऊपर टाइप करना शुरू करें।"
    },
    "showroom": {
      "loading": "शब्द सूची लोड हो रही है...",
      "emptyTitle": "अभी तक कोई शब्द नहीं",
      "emptyBody": "Word Insight के ज़रिए शब्द जोड़ने के बाद, यह लिस्ट अपने आप पॉप्युलेट हो जाएगी।",
      "emptyCta": "खुली घोषणाएँ",
      "updateAvailableTitle": "नया संस्करण उपलब्ध है। ",
      "updateAvailableBody": "अपडेट करने के लिए टैप करें और ताज़ा सुधार पाते रहें।",
      "updateNow": "अभी अपडेट करें",
      "repeatAdded": "{{word}}को दोहराने की सूची में जोड़ा गया ({{count}}/{{limit}})।",
      "repeatRemoved": "{{word}}दोहराने की सूची से हटा दिया गया ({{count}}/{{limit}})।",
      "repeatLimitReached": "आप अपनी दोहराने की सूची की सीमा (10/10) तक पहुँच गए हैं।",
      "repeatPermissionRequired": "रिमाइंडर के लिए नोटिफ़िकेशन की अनुमति ज़रूरी है। शब्द जोड़ने के लिए नोटिफ़िकेशन सक्षम करें।",
      "favoriteAdded": "{{word}}पसंदीदा में जोड़ा गया।",
      "favoriteRemoved": "{{word}}पसंदीदा से हटा दिया गया।",
      "repeatCleared": "दोहराने वाली लिस्ट साफ़ हो गई।",
      "repeatListTitle": "रिपीट सूची",
      "repeatCount": "{{count}}/{{limit}} शब्द",
      "repeatEmpty": "रिपीट सूची खाली है। नीचे घंटी बटन से शब्द जोड़ें।",
      "clearAll": "सभी साफ़ करें",
      "done": "हो गया",
      "practice": "अभ्यास",
      "accessibility": {
        "showDetails": "ब्यौरा दिखाएँ",
        "favoriteWord": "पसंदीदा शब्द",
        "repeatWordLater": "इस शब्द को बाद में दोहराएँ",
        "openProfile": "प्रोफ़ाइल खोलें",
        "openRepeatList": "दोहराए जाने वाले शब्दों की सूची खोलें",
        "openAnnouncements": "खुली घोषणाएँ",
        "openUpdate": "अपडेट पेज खोलें",
        "dismissUpdate": "अपडेट नोटिफ़िकेशन खारिज करें",
        "searchWords": "शब्द खोजें",
        "switchToCard": "कार्ड व्यू पर स्विच करें",
        "switchToList": "सूची पर जाएं",
        "retryShowroom": "शोरूम फिर से लोड करने की कोशिश करें",
        "closeRepeatList": "दोहराने की लिस्ट बंद करें",
        "clearRepeatList": "दोहराने की लिस्ट साफ़ करें",
        "removeFromRepeat": "दोहराने की सूची से{{word}}निकालें",
        "practiceWord": "इस शब्द का अभ्यास करें",
        "addWord": "एक शब्द जोड़ें"
      },
      "quickAdd": {
        "eyebrow": "झटपट जोड़ें",
        "title": "संदर्भ से एक शब्द जोड़ें",
        "body": "एक वाक्य पेस्ट करें, सही शब्द चुनें और सेव करें।",
        "action": "शब्द जोड़ें",
        "actionHint": "पेस्ट करें और चुनें"
      }
    },
    "practiceHub": {
      "title": "अभ्यास",
      "sectionLabel": "अभ्यास",
      "selectAnswer": "उत्तर चुनें",
      "modeBasic": "बेसिक",
      "modeAdvanced": "एडवांस्ड",
      "loadingTitle": "कैटलॉग लोड हो रहा है",
      "loadingMessage": "यह जाँचा जा रहा है कि आपके लिए कौन-से अभ्यास प्रकार उपलब्ध हैं।",
      "loadingQuestionsTitle": "अभ्यास प्रश्न तैयार किए जा रहे हैं...",
      "loadingQuestionsMessage": "उपलब्ध शब्दावली डेटा के आधार पर प्रश्न बनाए जा रहे हैं।",
      "instructions": {
        "matchSynonyms": "सबसे निकटतम पर्यायवाची चुनें।"
      },
      "resultCta": {
        "backToPractice": "अभ्यास पर वापस जाएँ",
        "seeResult": "परिणाम देखें",
        "nextWord": "अगला शब्द"
      },
      "result": {
        "correctTitle": "सही उत्तर!",
        "incorrectTitle": "गलत उत्तर!",
        "correctAnswerLabel": "सही उत्तर:",
        "usedInSentenceLabel": "वाक्य में उपयोग:",
        "sessionResultLabel": "सेशन परिणाम"
      },
      "leavePrompt": {
        "title": "क्या अभी निकल रहे हैं?",
        "keepPlaying": "जारी रखें",
        "leave": "छोड़ें",
        "closePromptAccessibility": "छोड़ने का प्रॉम्प्ट बंद करें",
        "leavePracticeAccessibility": "अभ्यास छोड़ें"
      },
      "hints": {
        "availableCount": "{{count}} शब्द उपलब्ध",
        "missingSynonyms": "पर्यायवाची डेटा उपलब्ध नहीं है",
        "minActiveWords": "कम से कम 2 सक्रिय शब्द आवश्यक हैं"
      },
      "tiles": {
        "meaningMatch": "अर्थ मिलान",
        "fillInGap": "रिक्त स्थान भरें",
        "guessWord": "शब्द पहचानें",
        "matchSynonyms": "पर्याय मिलान"
      },
      "accessibility": {
        "goBack": "वापस जाएँ",
        "useMode": "{{mode}} मोड का उपयोग करें",
        "closePractice": "अभ्यास बंद करें"
      },
      "loadState": {
        "noQuestions": {
          "title": "अभी अभ्यास प्रश्न उपलब्ध नहीं हैं",
          "message": "शुरू करने के लिए कम से कम 2 सक्रिय शब्द चाहिए।",
          "actionLabel": "शब्द जोड़ें"
        },
        "unauthorized": {
          "title": "लॉग इन आवश्यक है",
          "message": "आपका सत्र समाप्त हो सकता है। जारी रखने के लिए फिर से लॉग इन करें।",
          "actionLabel": "लॉग इन करें"
        },
        "forbidden": {
          "title": "यह सुविधा अभी उपलब्ध नहीं है",
          "message": "जारी रखने के लिए अपना प्लान या क्रेडिट्स जाँचें।",
          "actionLabel": "क्रेडिट्स लें"
        },
        "rejected": {
          "title": "इस मोड के लिए पर्याप्त डेटा नहीं है",
          "message": "और शब्द जोड़ें और फिर प्रयास करें।",
          "actionLabel": "शब्द जोड़ें"
        },
        "server": {
          "title": "सर्वर तक पहुँचा नहीं जा सका",
          "message": "अपना कनेक्शन जाँचें और फिर प्रयास करें।",
          "actionLabel": "पुनः प्रयास करें"
        },
        "generic": {
          "title": "अभ्यास शुरू नहीं हो सका",
          "message": "एक अनपेक्षित त्रुटि हुई। कृपया फिर प्रयास करें।",
          "actionLabel": "पुनः प्रयास करें"
        }
      }
    },
    "announcements": {
      "title": "घोषणाएँ",
      "unreadCount": "{{count}} अपठित",
      "markAllRead": "सभी को पढ़ा हुआ चिन्हित करें",
      "loading": "घोषणाएँ लोड हो रही हैं...",
      "empty": "अभी कोई घोषणाएँ नहीं हैं।",
      "openLink": "लिंक खोलें",
      "openAnnouncement": "घोषणा खोलें: {{title}}",
      "levelInfo": "जानकारी",
      "levelWarning": "चेतावनी",
      "levelCritical": "गंभीर",
      "loadFailed": "घोषणाएँ लोड नहीं हो सकीं। कृपया फिर प्रयास करें।",
      "claimFailed": "रिवॉर्ड का दावा विफल रहा। कृपया फिर से कोशिश करें।",
      "requirementNotMet": "आवश्यकता अभी तक पूरी नहीं हुई है। सबसे पहले दोस्तों को इनवाइट करें।",
      "referralCodeMissing": "इस अकाउंट के लिए रेफ़रल कोड मौजूद नहीं है।",
      "referralProgress": "रेफ़रल प्रगति:{{current}}/{{required}}",
      "shareInvite": " मित्र को आमंत्रित करें",
      "referralShareMessage": "VocOrbit से जुड़ें।\nयह लिंक खोलें:\n{{link}}",
      "rewardText": "इनाम: +{{amount}}{{creditType}}क्रेडिट",
      "creditBasic": "   क्षारीय % 1 गी. बा.",
      "creditAdvanced": "एडवांस",
      "claimReward": "दावा",
      "claimingReward": "दावा किया जा रहा है...",
      "rewardClaimed": "क्लेम किया गया"
    },
    "forceUpdate": {
      "title": "अद्यतन जरूरी@ item:: intable",
      "body": "VocOrbit का उपयोग जारी रखने के लिए एक नया संस्करण आवश्यक है।",
      "updateNow": "अभी अपडेट करें",
      "checkAgain": "फिर से जाँचें"
    },
    "profile": {
      "title": "प्रोफ़ाइल",
      "accountDetailsTitle": "खाता विवरण",
      "accountDetailsSubtitle": "अपना ईमेल और खाते की जानकारी देखें।",
      "settingsTitle": "सेटिंग्स",
      "settingsSubtitle": "टेक्स्ट आकार और एक्शन बटन क्रम को अनुकूलित करें।",
      "favoriteWordsTitle": "पसंदीदा शब्द",
      "favoriteWordsSubtitle": "पसंदीदा में जोड़े गए शब्द देखें।",
      "learnedWordsTitle": "सीखे गए शब्द",
      "learnedWordsSubtitle": "सीखे हुए के रूप में चिह्नित शब्द देखें।",
      "weeklyAnalyticsTitle": "साप्ताहिक विश्लेषण",
      "weeklyAnalyticsSubtitle": "पिछले 7 दिनों के अभ्यास प्रदर्शन को देखें।",
      "regionTitle": "क्षेत्र",
      "regionSubtitle": "वर्तमान: {{region}}",
      "regionNotSelected": "चयनित नहीं",
      "emptyFavorites": "अभी तक कोई पसंदीदा शब्द नहीं हैं।",
      "emptyLearned": "अभी तक कोई सीखे गए शब्द नहीं हैं।",
      "loadingList": "सूची लोड हो रही है...",
      "logOut": "लॉग आउट",
      "accessibility": {
        "goBack": "वापस जाएँ",
        "openAccountDetails": "कृपया अपना संपर्क विवरण साझा करें",
        "openSettings": "सेटिंग्स खोलें",
        "openFavoriteWords": "पसंदीदा शब्द खोलें",
        "openLearnedWords": "सीखे हुए शब्द खोलें",
        "openWeeklyAnalytics": "साप्ताहिक एनालिटिक्स खोलें",
        "openRegion": "क्षेत्र सेटिंग खोलें",
        "logOut": "लॉग आउट करें",
        "playPronunciation": "{{word}}के लिए उच्चारण बजाएं",
        "openDetailForWord": "{{word}}के लिए विवरण खोलें",
        "removeWord": "{{word}}निकालें"
      }
    },
    "settings": {
      "title": "सेटिंग्स",
      "languagePairTitle": "भाषा युग्म",
      "languagePairSubtitle": "अपनी मातृभाषा और सीखने की भाषा बदलें।",
      "billingCreditsTitle": "बिलिंग और क्रेडिट्स",
      "billingCreditsSubtitle": "यहाँ बेसिक मीनिंग क्रेडिट्स और IAP पैकेज प्रबंधित करें।",
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
      "themeModeTitle": "इंडेफिनिट",
      "themeModeSubtitle": "लाइट, डार्क चुनें या अपनी सिस्टम सेटिंग पर अमल करें।",
      "themeModeSystem": "सिस्टम",
      "themeModeLight": "हल्का",
      "themeModeDark": "गहरा",
      "textSizeTitle": "टेक्स्ट आकार",
      "textSizeSubtitle": "वोकैबुलरी कार्ड में टेक्स्ट आकार समायोजित करें।",
      "actionOrderTitle": "एक्शन क्रम",
      "actionOrderSubtitle": "डिटेल/फेवरेट/रीपीट बटनों का क्रम सेट करें।",
      "actionDetail": "विवरण",
      "actionFavorite": "पसंदीदा",
      "actionRepeat": "दोहराएँ",
      "resetToDefaults": "डिफ़ॉल्ट पर रीसेट करें",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "वापस जाएँ",
        "openLanguagePreferences": "भाषा प्राथमिकताएँ खोलें",
        "openBillingCredits": "बिलिंग और क्रेडिट्स खोलें",
        "useSystemTheme": "तंत्र थीम का उपयोग करें",
        "useLightTheme": "लाइट थीम",
        "useDarkTheme": "डार्क थीम",
        "decreaseTextSize": "टेक्स्ट आकार घटाएँ",
        "increaseTextSize": "टेक्स्ट आकार बढ़ाएँ",
        "moveActionLeft": "{{action}} को बाएँ ले जाएँ",
        "moveActionRight": "{{action}} को दाएँ ले जाएँ",
        "resetSettings": "शब्दावली सेटिंग्स रीसेट करें"
      }
    },
    "accountDetails": {
      "title": "खाता विवरण",
      "emailLabel": "ईमेल",
      "userIdLabel": "यूज़र आईडी",
      "regionLabel": "होम क्षेत्र",
      "regionEndpointLabel": "क्षेत्र एंडपॉइंट",
      "appVersionLabel": "ऐप संस्करण",
      "buildLabel": "बिल्ड नंबर",
      "platformLabel": "प्लेटफ़ॉर्म",
      "osVersionLabel": "OS संस्करण",
      "accessibility": {
        "goBack": "वापस जाएँ",
        "deleteAccount": "खाता स्थायी रूप से हटाएँ"
      },
      "deleteAccount": {
        "sectionTitle": "खाता हटा दो",
        "sectionBody": "अपने VocOrbit खाते और उससे जुड़े ऐप डेटा को स्थायी रूप से हटा दें। इस एक्शन को वापस नहीं किया जा सकता।",
        "action": "खाता स्थायी रूप से हटाएँ",
        "deleting": "खाता हटाया जा रहा है...",
        "confirmTitle": "खाता हटा दो?",
        "confirmBody": "यह आपके VocOrbit खाते और लिंक किए गए ऐप डेटा को स्थायी रूप से हटा देता है। इस एक्शन को वापस नहीं किया जा सकता।",
        "successTitle": "खाता हटा दिया गया",
        "successBody": "आपका VocOrbit खाता स्थायी रूप से हटा दिया गया है।",
        "missingUser": "आपका खाता आईडी नहीं मिल सका. कृपया पुनः साइन इन करें.",
        "cannotConnect": "सर्वर तक नहीं पहुंच सका. अपना कनेक्शन जांचें और पुनः प्रयास करें।",
        "sessionExpired": "आपका सत्र समाप्त हो गया. कृपया पुनः साइन इन करें.",
        "failed": "हम अभी आपका खाता नहीं हटा सके. कृपया पुन: प्रयास करें।"
      }
    },
    "iap": {
      "title": "बिलिंग और क्रेडिट्स",
      "loading": "बिलिंग विवरण लोड हो रहे हैं...",
      "currentSubscription": "वर्तमान सदस्यता",
      "currentStatus": "स्थिति: {{status}}",
      "currentPlan": "वर्तमान योजना: {{plan}}",
      "noActivePlan": "कोई सक्रिय योजना नहीं",
      "refresh": "बिलिंग रीफ्रेश करें",
      "basicCreditsTitle": "बेसिक इनसाइट क्रेडिट्स",
      "basicCreditsBody": "शेयर स्क्रीन में बेसिक मीनिंग विश्लेषण इस क्रेडिट का उपयोग करता है।",
      "plansTitle": "योजनाएँ",
      "plansBody": "एक योजना चुनें और अपने स्टोर खाते से भुगतान पूरा करें।",
      "noPlans": "इस प्लेटफ़ॉर्म के लिए कोई खरीदने योग्य योजना नहीं मिली।",
      "planTopup": "मासिक टॉप-अप: +{{basic}} बेसिक · +{{advanced}} एडवांस्ड",
      "planCaps": "सीमाएँ: {{basicCap}} बेसिक · {{advancedCap}} एडवांस्ड",
      "priceLabel": "मूल्य: {{price}}",
      "buyNow": "अभी खरीदें",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "खरीद प्रोसेस हो रही है...",
      "purchaseCanceled": "क्रय रद्द कर  दिया गया",
      "purchaseApplied": "{{sku}}सफलतापूर्वक सक्रिय हो गया।",
      "alreadyOwnedRestoring": "यह आइटम पहले से ही स्वामित्व में है। आपकी खरीदारी बहाल की जा रही है...",
      "restorePurchases": "खरीदारी बहाल करें",
      "restoring": "खरीदारियाँ बहाल की जा रही हैं...",
      "restoreNoPurchases": "बहाल करने के लिए कोई खरीद नहीं मिली।",
      "restoreNoApplicablePurchases": "कोई पुनर्प्राप्ति योग्य खरीद लागू नहीं की जा सकी।",
      "restoreApplied": "{{count}}खरीद(ओं) को बहाल और सत्यापित किया गया।",
      "status": {
        "none": "सदस्यता नहीं",
        "pending": "लंबित",
        "active": "सक्रिय",
        "expired": "समाप्त",
        "canceled": "रद्द",
        "refunded": "रिफंड किया गया"
      },
      "errors": {
        "unauthorized": "आपके सेशन की समय - सीमा खत्म हो गई है। कृपया फिर से साइन इन करें।",
        "cannotConnect": "सर्वर तक नहीं पहुँचा जा सका। अपना कनेक्शन जाँचें और फिर से कोशिश करें।",
        "forbidden": "यह खरीद आपके अकाउंट के लिए लागू नहीं की जा सकी।",
        "generic": "बिलिंग का अनुरोध विफल रहा। कृपया फिर से कोशिश करें।",
        "purchaseFailed": "खरीदारी नहीं हो सकी। कृपया फिर से कोशिश करें।",
        "alreadyOwned": "यह आइटम पहले से ही इस अकाउंट पर मौजूद है।",
        "invalidReceipt": "स्टोर की रसीद मान्य नहीं की जा सकी।",
        "iapUnavailable": "स्टोर खरीद सेवा फ़िलहाल इस डिवाइस पर उपलब्ध नहीं है।"
      },
      "accessibility": {
        "goBack": "वापस जाएँ",
        "buyPlan": "खरीदें{{plan}}योजना",
        "restorePurchases": "पिछली खरीदारी बहाल करें",
        "refresh": "बिलिंग और सब्सक्रिप्शन की स्थिति रिफ़्रेश करें"
      },
      "desktop": {
        "subtitle": "अपना वर्तमान शेष यहां देखें। मोबाइल पर नई खरीदारी और सदस्यता परिवर्तन जारी रहते हैं।",
        "desktopBadge": "डेस्कटॉप दृश्य",
        "phoneOnlyBadge": "खरीदारी के लिए फ़ोन करें",
        "balanceTitle": "आपका वर्तमान शेष",
        "balanceBody": "डेस्कटॉप आपके उपलब्ध क्रेडिट और सदस्यता स्थिति को दृश्यमान रखता है, ताकि आप अपना सीखने का प्रवाह जारी रखने से पहले अपने खाते की जांच कर सकें।",
        "basicAvailable": "मूल श्रेय",
        "advancedAvailable": "उन्नत क्रेडिट",
        "freeCredits": "मुक्त",
        "paidCredits": "चुकाया गया",
        "noPlanBody": "इस खाते में अभी कोई सक्रिय मोबाइल बिलिंग योजना नहीं है। आप अभी भी यहां पहले से उपलब्ध किसी भी क्रेडिट का उपयोग कर सकते हैं।",
        "mobileTitle": "अपने फ़ोन पर खरीदारी जारी रखें",
        "mobileBody": "क्रेडिट खरीदारी और सदस्यता परिवर्तन आपके App Store या Google Play खाते से मोबाइल ऐप के अंदर पूरे किए जाते हैं।",
        "storeLabel": "स्टोर: {{store}}",
        "renewsOn": "{{date}} पर नवीनीकरण",
        "expiresOn": "{{date}} पर समाप्त हुआ",
        "updatedOn": "अंतिम सिंक: {{date}}",
        "stepOpenPhone": "उसी खाते से अपने फ़ोन पर VocOrbit खोलें।",
        "stepOpenBilling": "प्रोफ़ाइल > बिलिंग और क्रेडिट पर जाएँ।",
        "stepFinishPurchase": "वहां क्रेडिट खरीदें या अपनी सदस्यता प्रबंधित करें, फिर यहां लौटें और ताज़ा करें।",
        "mobileHint": "मोबाइल खरीदारी को उसी खाते में लागू करने के बाद आपका क्रेडिट बैलेंस यहां अपडेट हो जाता है।"
      }
    },
    "weeklyAnalytics": {
      "title": "साप्ताहिक विश्लेषण",
      "modeAll": "सभी",
      "modeBasic": "बेसिक",
      "modeAdvanced": "एडवांस्ड",
      "loading": "साप्ताहिक विश्लेषण लोड हो रहा है...",
      "summaryTitle": "सारांश (7 दिन)",
      "sessions": "सेशन",
      "completed": "पूर्ण",
      "answered": "उत्तरित",
      "accuracy": "सटीकता",
      "activeDays": "सक्रिय दिन",
      "streak": "स्ट्रीक",
      "dailyTrend": "दैनिक रुझान",
      "byQuestionType": "प्रश्न प्रकार के अनुसार",
      "byMode": "मोड के अनुसार",
      "weakItems": "कमजोर आइटम",
      "noWeakItems": "इस सप्ताह कोई उल्लेखनीय कमजोर शब्द नहीं मिला।",
      "weakItemMeta": "गलत: {{wrongAnswers}} · सटीकता: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "अर्थ मिलान",
      "questionTypeGuessWord": "शब्द पहचानें",
      "questionTypeFillInGap": "रिक्त स्थान भरें",
      "questionTypeMatchSynonym": "पर्याय मिलान",
      "errors": {
        "unauthorized": "आपका सत्र समाप्त हो सकता है। कृपया फिर से लॉग इन करें।",
        "cannotConnect": "सर्वर तक पहुँचा नहीं जा सका। कनेक्शन जाँचें और फिर प्रयास करें।",
        "loadFailed": "साप्ताहिक विश्लेषण लोड नहीं हो सका। कृपया फिर प्रयास करें।"
      },
      "accessibility": {
        "goBack": "वापस जाएँ",
        "filterByMode": "{{mode}} के अनुसार फ़िल्टर करें",
        "retry": "विश्लेषण अनुरोध पुनः प्रयास करें"
      }
    },
    "detail": {
      "closeDetails": "शब्द विवरण बंद करें",
      "loadingDetail": "शब्द विवरण लोड हो रहा है...",
      "detailLoadFailedTitle": "विवरण लोड नहीं हो सका",
      "statusLearned": "सीखा हुआ",
      "statusActive": "सक्रिय",
      "markAsLearned": "सीखा हुआ चिह्नित करें",
      "moveBackToActive": "फिर से सक्रिय करें",
      "buyAdvancedCredits": "उन्नत क्रेडिट खरीदें",
      "buyBasicCredits": "बेसिक क्रेडिट खरीदें",
      "buyCredits": "क्रेडिट खरीदें",
      "whyThisSense": "यही अर्थ क्यों",
      "examples": "उदाहरण",
      "synonyms": "पर्यायवाची",
      "antonyms": "विलोम",
      "collocations": "सहप्रयोग",
      "alternativeMeanings": "वैकल्पिक अर्थ",
      "usageNotes": "उपयोग नोट्स",
      "noSynonyms": "अभी पर्यायवाची डेटा उपलब्ध नहीं है।",
      "stats": "आंकड़े",
      "encountersAndLastMode": "मुलाकातें: {{encounters}} | पिछला मोड: {{mode}}",
      "nextReminder": "अगला रिमाइंडर",
      "currentPlan": "वर्तमान योजना: {{due}}",
      "reviewHint": "भूल गया: +10 मिनट, कठिन: +1 घंटा, अच्छा: +1 दिन से बढ़ता है।",
      "runAdvanced": "उन्नत विश्लेषण चलाएँ",
      "reviewForgot": "भूल गया",
      "reviewHard": "कठिन",
      "reviewGood": "अच्छा",
      "reviewOptionAccessibility": "{{title}} चुना गया। अगली समीक्षा {{delay}} में।",
      "repeatUnscheduled": "निर्धारित नहीं",
      "repeatNow": "अभी",
      "repeatAfterMinutes": "{{count}} मिनट",
      "repeatAfterHours": "{{count}} घंटा",
      "repeatAfterDays": "{{count}} दिन",
      "repeatAfterWeeks": "{{count}} सप्ताह",
      "repeatInMinutes": "{{count}} मिनट में",
      "repeatInHours": "{{count}} घंटे में",
      "repeatInDays": "{{count}} दिन में",
      "repeatInWeeks": "{{count}} सप्ताह में",
      "repeatNotificationTitle": "रीव्यू का समय: {{word}}",
      "repeatNotificationBody": "{{word}} शब्द की पुनरावृत्ति करें।",
      "reportIssue": "गलत अर्थ की रिपोर्ट करें",
      "reportIssueAccessibility": "{{word}} के लिए गलत अर्थ की रिपोर्ट करें",
      "deleteWord": "शब्द हटाएँ",
      "deleteWordAccessibility": "{{word}} को सॉफ्ट डिलीट करें",
      "deleteConfirmTitle": "क्या यह शब्द हटाएँ?",
      "deleteConfirmBody": "\"{{word}}\" आपकी सूची से हट जाएगा। आप इसे बाद में फिर जोड़ सकते हैं।",
      "deleteConfirmCancel": "रद्द करें",
      "deleteConfirmAction": "हाँ, हटाएँ"
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
      "title": "अर्थ की रिपोर्ट करें",
      "subtitle": "अगर इस संदर्भ में \"{{word}}\" गलत लगता है, तो हमें बताएँ कि क्या गलत है।",
      "messageLabel": "क्या गलत लगता है?",
      "messagePlaceholder": "उदाहरण: यह अर्थ वाक्य के अनुरूप नहीं है। इसमें लोकेशन नहीं, बल्कि कम्युनिकेशन का ब्यौरा होना चाहिए।",
      "charactersLeft": "{{count}}वर्ण बचे हैं",
      "submit": "रिपोर्ट भेजें",
      "successTitle": "रिपोर्ट भेजी जा चुकी है",
      "successBody": "फ़ीडबैक देने के लिए धन्यवाद। हम इस आइटम की समीक्षा करेंगे।",
      "backToDetail": "शब्द विवरण पर वापस जाएँ",
      "errors": {
        "unauthorized": "आपके सेशन की समय - सीमा खत्म हो गई है। कृपया फिर से साइन इन करें।",
        "cannotConnect": "सर्वर तक नहीं पहुँचा जा सका। अपना कनेक्शन जाँचें और फिर से कोशिश करें।",
        "itemNotFound": "शब्द आइटम नहीं मिला।",
        "submitFailed": "रिपोर्ट सबमिट नहीं की जा सकी। कृपया फिर से कोशिश करें।"
      },
      "accessibility": {
        "goBack": "वापस जाएँ",
        "submit": "समस्या की रिपोर्ट भेजें",
        "backToDetail": "शब्द विवरण पर वापस जाएँ"
      }
    },
    "capture": {
      "backButton": "पुस्तकालय",
      "headerTitle": "शब्द जोड़ें",
      "headerBody": "एक वाक्य चिपकाएँ और वह शब्द चुनें जिसे आप सहेजना चाहते हैं।",
      "seedWordLabel": "ढूंढ रहे हैं: {{word}}",
      "pasteHero": {
        "title": "कॉपी किया गया टेक्स्ट चिपकाएँ",
        "body": "किसी वाक्य या पैराग्राफ को कॉपी करें, फिर पिकर खोलने के लिए उसे पेस्ट करें।",
        "bodyWithWord": "एक वाक्य को कॉपी करें जिसमें \"{{word}}\" शामिल है, फिर इसे पिकर खोलने के लिए पेस्ट करें।",
        "hint": "पेस्ट करने के बाद पिकर अपने आप खुल जाता है।"
      },
      "picker": {
        "title": "पाठ में शब्द चुनें",
        "body": "नीचे सटीक शब्द पर क्लिक करें. यदि आपने कोई भिन्न वाक्य कॉपी किया है तो पुनः चिपकाएँ।",
        "badge": "शब्द चयनकर्ता",
        "hint": "VocOrbit इस लुकअप से स्वचालित रूप से शब्द कार्ड बनाता है।"
      },
      "status": {
        "pasteFirst": "शुरू करने के लिए कॉपी किया गया टेक्स्ट चिपकाएँ.",
        "selectedWord": "चयनित शब्द: {{word}}",
        "seedWordMissing": "\"{{word}}\" के साथ एक वाक्य चिपकाएँ या नीचे कोई अन्य शब्द चुनें।",
        "selectWord": "जारी रखने के लिए नीचे सटीक शब्द पर क्लिक करें।"
      },
      "actions": {
        "pasteCopiedText": "कॉपी किया गया टेक्स्ट चिपकाएँ",
        "pasteAgain": "पुनः चिपकाएँ",
        "clear": "स्पष्ट",
        "readingClipboard": "क्लिपबोर्ड पढ़ रहा है...",
        "reading": "पढ़ना...",
        "analyzeAndSave": "विश्लेषण करें और सहेजें",
        "loadingMeaning": "मूल अर्थ प्राप्त करना...",
        "openSavedWord": "सहेजा गया शब्द खोलें",
        "backToLibrary": "लाइब्रेरी में वापस जाएँ",
        "pickAnotherWord": "दूसरा शब्द चुनें"
      },
      "loading": {
        "title": "बुनियादी अंतर्दृष्टि चल रही है",
        "body": "VocOrbit इस वाक्य के सामने चयनित शब्द से मेल खा रहा है।"
      },
      "result": {
        "title": "मूल अर्थ",
        "savedFallback": "आपकी लाइब्रेरी में सहेजा गया.",
        "contextMeaning": "प्रसंग का अर्थ",
        "whyThisMeaning": "ये मतलब क्यों"
      },
      "problems": {
        "clipboardUnavailableTitle": "क्लिपबोर्ड अनुपलब्ध",
        "clipboardUnavailableBody": "इस ब्राउज़र संदर्भ में क्लिपबोर्ड पहुंच अवरुद्ध है। वाक्य को मैन्युअल रूप से चिपकाएँ.",
        "contextRequiredTitle": "प्रसंग आवश्यक है",
        "contextRequiredBody": "किसी शब्द का चयन करने से पहले एक वाक्य या छोटा पैराग्राफ चिपकाएँ।",
        "selectWordTitle": "पाठ में एक शब्द चुनें",
        "selectWordBody": "लुकअप चलाने से पहले टेक्स्ट ब्लॉक के अंदर सटीक शब्द पर क्लिक करें।",
        "signInRequiredTitle": "साइन इन आवश्यक",
        "signInRequiredBody": "आपका सत्र समाप्त हो गया. इस लुकअप को दोबारा आज़माने से पहले VocOrbit को दोबारा खोलें और साइन इन करें।",
        "basicCreditsRequiredTitle": "बुनियादी क्रेडिट की आवश्यकता है",
        "basicCreditsRequiredBody": "आपका खाता अभी बुनियादी लुकअप नहीं चला सकता.",
        "requestTimedOutTitle": "अनुरोध का समय समाप्त हो गया",
        "requestTimedOutBody": "लुकअप में बहुत लंबा समय लगा. उसी वाक्य के साथ पुनः प्रयास करें.",
        "connectionProblemTitle": "कनेक्शन समस्या",
        "connectionProblemBody": "VocOrbit सर्वर तक नहीं पहुंच सका. अपना कनेक्शन जांचें और पुनः प्रयास करें.",
        "lookupFailedTitle": "लुकअप विफल रहा",
        "lookupFailedBody": "VocOrbit इस अंतर्दृष्टि अनुरोध को पूरा नहीं कर सका।",
        "lookupIncompleteTitle": "लुकअप अधूरा",
        "lookupIncompleteBody": "VocOrbit ने एक अप्रत्याशित प्रतिक्रिया दी। एक बार पुनः प्रयास करें."
      }
    }
  }
}

export default hi
