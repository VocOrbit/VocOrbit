import { Translations } from "./en"

const ar: Translations = {
  "common": {
    "ok": "نعم",
    "cancel": "حذف",
    "back": "خلف",
    "logOut": "تسجيل خروج"
  },
  "welcomeScreen": {
    "postscript": "ربما لا يكون هذا هو الشكل الذي يبدو عليه تطبيقك مالم يمنحك المصمم هذه الشاشات وشحنها في هذه الحالة",
    "readyForLaunch": "تطبيقك تقريبا جاهز للتشغيل",
    "exciting": "اوه هذا مثير",
    "letsGo": "لنذهب"
  },
  "errorScreen": {
    "title": "هناك خطأ ما",
    "friendlySubtitle": "هذه هي الشاشة التي سيشاهدها المستخدمون في عملية الانتاج عند حدوث خطأ. سترغب في تخصيص هذه الرسالة ( الموجودة في 'ts.en/i18n/app') وربما التخطيط ايضاً ('app/screens/ErrorScreen'). إذا كنت تريد إزالة هذا بالكامل، تحقق من 'app/app.tsp' من اجل عنصر <ErrorBoundary>.",
    "reset": "اعادة تعيين التطبيق",
    "traceTitle": "خطأ من مجموعة %{name}"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "فارغة جداً....حزين",
      "content": "لا توجد بيانات حتى الآن. حاول النقر فوق الزر لتحديث التطبيق او اعادة تحميله.",
      "button": "لنحاول هذا مرّة أخرى"
    }
  },
  "errors": {
    "invalidEmail": "عنوان البريد الالكتروني غير صالح"
  },
  "loginScreen": {
    "logIn": "تسجيل الدخول",
    "subtitle": "تابع باستخدام حسابك الاجتماعي للوصول إلى تقدم مفرداتك.",
    "continueWith": "تابع مع",
    "regionTitle": "المنطقة",
    "regionSubtitle": " الحالي: {{region}}",
    "regionNotSelected": "لم يتم التحديد",
    "changeRegion": "تغيير",
    "signingIn": "التوقيع في...",
    "googleButton": "مصدر الصورة: غوغل",
    "appleButton": "مصدر الصورة: شركة آبل",
    "moreProvidersSoon": "سيتوفر المزيد من مقدمي الخدمة قريبًا.",
    "accessibility": {
      "openRegionSelection": "منطقة مفتوحة التحديد"
    },
    "errors": {
      "unauthorized": "فشلت المصادقة. الرجاء تسجيل الدخول مرة أخرى.",
      "cannotConnect": "تعذر الاتصال بالخادم. الرجاء المحاولة مرة أخرى.",
      "server": " فشل التحقق من صحة الخادم. يرجى المحاولة مرة أخرى قريبًا.",
      "rejected": " تم رفض طلب تسجيل الدخول. يرجى التحقق من تكوين المصادقة.",
      "badData": "تم تلقي استجابة غير متوقعة من الخادم.",
      "generic": "تعذر إكمال تسجيل الدخول. الرجاء المحاولة مرة أخرى.",
      "googleCancelled": "تم تسجيل الدخول إلى Google تم الإلغاء.",
      "googleUnavailable": "تسجيل الدخول إلى Google غير متاح على هذا الجهاز.",
      "googleFailed": "فشل تسجيل الدخول إلى Google. يرجى المحاولة مرة أخرى."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "اختر زوج اللغات الخاص بك",
    "titleSettings": "تفضيلات اللغة",
    "subtitleOnboarding": "اختر لغتك الأم واللغة المستهدفة من قائمة عالمية تتضمن الأعلام والبلدان.",
    "subtitleSettings": "حدّث هنا لغتك الأم واللغة الهدف مع العلم ومعلومات الدولة.",
    "currentPair": "الزوج الحالي",
    "availableOptionsCount": "{{count}} خيار لغة/دولة متاح",
    "nativeLanguageTitle": "اللغة الأم",
    "nativeLanguageBody": "ستظهر الترجمات والشروحات بهذه اللغة.",
    "learningLanguageTitle": "لغة التعلّم",
    "learningLanguageBody": "سيتم إنشاء التعريفات والسياقات بهذه اللغة.",
    "selectedLabel": "المحدد",
    "pickerTitleL1": "اختر اللغة الأم",
    "pickerTitleL2": "اختر لغة التعلّم",
    "searchPlaceholder": "ابحث عن لغة أو دولة",
    "noResults": "لم يتم العثور على نتائج.",
    "saving": "جارٍ الحفظ...",
    "continue": "متابعة",
    "save": "حفظ",
    "accessibility": {
      "goBack": "الرجوع",
      "selectNativeLanguage": "حدد اللغة الأصلية language",
      "selectLearningLanguage": "حدد لغة التعلم",
      "continueWithSelectedLanguages": "تابع مع اللغات المحددة",
      "saveLanguages": "حفظ اللغات",
      "closeLanguagePicker": "إغلاق اللغة منتقي",
      "closePicker": "إغلاق المنتقي",
      "selectLanguageItem": "حدد {{language}} {{country}}"
    },
    "errors": {
      "cannotConnect": "تعذر الاتصال بالخادم. الرجاء المحاولة مرة أخرى.",
      "unauthorized": "الجلسة غير صالحة. الرجاء تسجيل الدخول مرة أخرى.",
      "validation": "تعذر حفظ تفضيلات اللغة. الرجاء التحقق من مدخلاتك.",
      "server": " حدث خطأ في الخادم. يرجى المحاولة مرة أخرى قريبًا.",
      "saveFailed": "تعذر حفظ تفضيلات اللغة. يرجى المحاولة مرة أخرى.",
      "noSession": "لم يتم العثور على جلسة نشطة. يرجى تسجيل الدخول مرة أخرى.",
      "selectTwoLanguages": "يرجى تحديد كلتا اللغتين.",
      "sameLanguagePair": " لا يمكن أن تكون اللغة الأصلية ولغة التعلم متماثلتين."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "إعادة المحاولة",
      "signIn": "تسجيل الدخول",
      "favoriteLabel": "مفضلة",
      "learnedLabel": "متعلّم",
      "detailButton": "فتح التفاصيل"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "كيف يعمل VocOrbit بالفعل",
      "subtitle": "التدفق الحقيقي: حدد جملة خارج التطبيق، واختر كلمة، ثم تعلمها مع السياق داخل VocOrbit.",
      "progress": "الخطوة {{current}} / {{total}}",
      "progressSingle": "الخطوة{{current}}",
      "mock": {
        "contextLabel": "جملة السياق",
        "selectedWordLabel": "الكلمة المختارة",
        "meaningLabel": "المعنى الأساسي",
        "whyLabel": "لماذا في هذا السياق"
      },
      "flowTitle": "تعلم التدفق في 3 خطوات سريعة",
      "highlightsTitle": "ما تحصل عليه",
      "actions": {
        "previous": "سابق",
        "next": "الخطوة التالية",
        "enterApp": "ابدأ التعلم",
        "showExample": "عرض مثال حقيقي",
        "hideExample": "إخفاء المثال"
      },
      "steps": {
        "step1": {
          "step": "الخطوة 1 • شارك جملة",
          "title": "حدد الجملة التي تظهر فيها الكلمة",
          "body": "اضغط لفترة طويلة على النص في المتصفح أو الملاحظات أو أي تطبيق وأرسله إلى VocOrbit Share Extension.",
          "source": "عندما أنظر إلى الوراء، تعجبني مرة أخرى قوة الأدب الواهبة للحياة.",
          "word": "الأدب",
          "meaning": "الأعمال المكتوبة، وخاصة تلك التي تعتبر فنية",
          "why": "تشير في هذه الجملة إلى الكتب والفن المكتوب الذي يؤثر بشدة على المتحدث.",
          "hint": "نصيحة: قم دائمًا بمشاركة الجملة الكاملة، وليس كلمة واحدة فقط.",
          "bullets": {
            "one": "يعمل مع المتصفح والملاحظات والعديد من تطبيقات القراءة",
            "two": "تحتفظ بالجمله الأصلية سياق",
            "three": " لا حاجة إلى تدفق نسخ ولصق يدوي "
          }
        },
        "step2": {
          "step": " الخطوة 2 • اختر الكلمة الدقيقة",
          "title": "انقر فوق كلمة واحدة واحصل على المعنى الأساسي الفوري",
          "body": " داخل عرض المشاركة، تكون الكلمات قابل للنقر. حدد كلمة واحدة مستهدفة وقم بتشغيل الرؤية الأساسية.",
          "source": " لا ينبغي تقديم القراءة للأطفال كعمل روتيني أو واجب.",
          "word": "عمل روتيني, مهمة روتينية, العمل النظامي",
          "meaning": " هي مهمة روتينية، عادةً غير سارة",
          "why": " هنا يؤكد \"العمل الرتيب\" على أن القراءة يجب ألا تبدو وكأنها عمل قسري.",
          "hint": "نصيحة: إذا لم تكن متأكدًا، فابدأ بالأساسيات. ثم قم بتشغيل متقدمة في التطبيق.",
          "bullets": {
            "one": " يتم إنشاء المعنى لهذه الجملة بالضبط",
            "two": " كما ترى سبب اختيار هذا المعنى",
            "three": "يدعم لغتك المحددة إقران"
          }
        },
        "step3": {
          "step": "الخطوة 3 • احفظ ونظم",
          "title": " انقل الكلمات المفيدة إلى نظامك الشخصي",
          "body": " بعد وصول الكلمة إلى VocOrbit، ضع علامة على المفضلة أو أضفها إلى قائمة التكرار للنشط التعلم.",
          "source": " اعتمد على خبرتنا المتخصصة لإعداد مشروعك لتحقيق النجاح.",
          "word": "Expert",
          "meaning": "شخص يتمتع بمهارة أو معرفة خاصة",
          "why": " يصف التجربة بأنها موثوقة للغاية ومهارة في سياق المشروع هذا.",
          "hint": "نصيحة: حافظ على تركيز قائمة التكرار. 10 كلمات نشطة توفر احتفاظًا أفضل.",
          "bullets": {
            "one": "القائمة المفضلة للكلمات المهمة",
            "two": "قائمة التكرار للحفظ النشط",
            "three": " الحالة المكتسبة تحافظ على تقدمك clean"
          }
        },
        "step4": {
          "step": "الخطوة 4 • حلقة التدريب ",
          "title": " قم بالمراجعة والتمرين ووضع علامة على أنها تعلمت",
          "body": " استخدم أوضاع التدريب والتذكيرات حتى يصبح الاستدعاء قويًا، ثم ضع علامة على الكلمة كـ تعلمت.",
          "source": " هل تريد التواصل بشأن شيء آخر؟",
          "word": "الوصول إلى",
          "meaning": "للاتصال بشخص ما",
          "why": " في هذا السياق، فهو فعل مركب يعني التواصل، وليس جسديًا الوصول.",
          "hint": "نصيحة: استخدم التذكيرات والجلسات القصيرة يوميًا لتحقيق تقدم ثابت.",
          "bullets": {
            "one": "يتم إنشاء بطاقات التدريب من كلماتك الخاصة",
            "two": " تظهر التحليلات الأسبوعية ضعيفة point",
            "three": " الكلمات التي تم تعلمها تترك قائمة الانتظار المتكررة تلقائيًا"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": " ربما انتهت صلاحية جلستك. الرجاء تسجيل الدخول مرة أخرى.",
      "cannotConnect": "تعذر الوصول إلى الخادم. تحقق من اتصالك وحاول مرة أخرى.",
      "listLoadFailed": "تعذر تحميل قائمة الكلمات. الرجاء المحاولة مرة أخرى.",
      "searchLoadFailed": "تعذر تحميل نتائج البحث. الرجاء المحاولة مرة أخرى.",
      "itemNotFound": "لم يتم العثور على سجل الكلمات.",
      "reloginRequired": "يرجى تسجيل الدخول مرة أخرى للمتابعة.",
      "favoriteActionFailed": "فشل الإجراء المفضل. يرجى المحاولة مرة أخرى.",
      "detailLoadFailed": "تعذر تحميل تفاصيل الكلمة.",
      "stateUpdateFailed": "تعذر تحديث الحالة. يرجى المحاولة مرة أخرى.",
      "analysisRequestFailed": "تعذر إرسال طلب التحليل.",
      "invalidModelOutput": "تنسيق استجابة النموذج غير صالح. يرجى المحاولة مرة أخرى.",
      "analysisTimeout": " انتهت مهلة التحليل. يرجى المحاولة مرة أخرى.",
      "advancedCreditInsufficient": "الاعتمادات المتقدمة غير كافية.",
      "basicCreditInsufficient": "الاعتمادات الأساسية غير كافية.",
      "advancedAnalysisFailed": "تعذر إكمال التحليل المتقدم.",
      "basicAnalysisFailed": "تعذر إكمال التحليل الأساسي. اكتمل.",
      "repeatProgressUpdateFailed": "تعذر تحديث التقدم المتكرر. يرجى المحاولة مرة أخرى.",
      "missingContext": "السياق المطلوب للتحليل مفقود.",
      "selectedWordNotInSentence": "لم يتم العثور على الكلمة المحددة في جملة السياق.",
      "analysisFailedGeneric": "تعذر إكمال التحليل. الرجاء المحاولة مرة أخرى.",
      "unexpected": "حدث خطأ غير متوقع."
    },
    "search": {
      "title": "البحث",
      "placeholder": "ابحث بالكلمة أو المعنى أو الشرح",
      "loading": "جارٍ تحميل الكلمات...",
      "emptyResult": "لا توجد كلمات تطابق بحثك.",
      "emptyHint": "ابدأ الكتابة في الأعلى للبحث."
    },
    "showroom": {
      "loading": "جاري تحميل قائمة الكلمات...",
      "emptyTitle": "لا توجد كلمات حتى الآن",
      "emptyBody": "بعد إضافة كلمات عبر Word Insight، سيتم ملء هذه القائمة تلقائيًا.",
      "emptyCta": "فتح الإعلانات",
      "updateAvailableTitle": " يتوفر إصدار جديد",
      "updateAvailableBody": "انقر للتحديث واستمر في الحصول على الأحدث التحسينات.",
      "updateNow": "التحديث الآن",
      "repeatAdded": "{{word}}تمت إضافته إلى قائمة التكرار ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}} تمت إزالته من التكرار القائمة ({{count}}/{{limit}}).",
      "repeatLimitReached": " لقد وصلت إلى الحد الأقصى لقائمة التكرار (10/10).",
      "repeatPermissionRequired": " مطلوب إذن الإعلام للتذكيرات. تمكين الإشعارات لإضافة كلمات.",
      "favoriteAdded": "{{word}} تمت إضافتها إلى المفضلة.",
      "favoriteRemoved": "{{word}}تمت إزالتها من المفضلة.",
      "repeatCleared": "كرر القائمة تم مسحها.",
      "repeatListTitle": "قائمة التكرار",
      "repeatCount": "{{count}}/{{limit}} كلمة",
      "repeatEmpty": "قائمة التكرار فارغة. أضف كلمات باستخدام زر الجرس بالأسفل.",
      "clearAll": "مسح الكل",
      "done": "تم",
      "practice": "تدرّب",
      "accessibility": {
        "showDetails": "إظهار التفاصيل",
        "favoriteWord": "الكلمة المفضلة",
        "repeatWordLater": " كرر هذه الكلمة لاحقًا",
        "openProfile": "فتح الملف الشخصي",
        "openRepeatList": "فتح قائمة الكلمات المتكررة",
        "openAnnouncements": "فتح الإعلانات",
        "openUpdate": "فتح صفحة التحديث",
        "dismissUpdate": "تجاهل إشعار التحديث",
        "searchWords": "كلمات البحث",
        "switchToCard": "التبديل إلى عرض البطاقة",
        "switchToList": "التبديل إلى عرض القائمة",
        "retryShowroom": "حاول تحميل صالة العرض مرة أخرى",
        "closeRepeatList": "إغلاق قائمة التكرار",
        "clearRepeatList": "مسح قائمة التكرار",
        "removeFromRepeat": "قم بإزالة{{word}}من قائمة التكرار",
        "practiceWord": "تدرب على هذه الكلمة",
        "addWord": "أضف كلمة"
      },
      "quickAdd": {
        "eyebrow": "إضافة سريعة",
        "title": "أضف كلمة من السياق",
        "body": "الصق جملة، اختر الكلمة الصحيحة، ثم احفظها.",
        "action": "أضف كلمة",
        "actionHint": "الصق ثم اختر"
      }
    },
    "practiceHub": {
      "title": "التدريب",
      "sectionLabel": "التدريب",
      "selectAnswer": "اختر الإجابة",
      "modeBasic": "أساسي",
      "modeAdvanced": "متقدم",
      "loadingTitle": "جارٍ تحميل الكتالوج",
      "loadingMessage": "جارٍ التحقق من أنواع التمارين المتاحة لك.",
      "loadingQuestionsTitle": "جارٍ إعداد أسئلة التدريب...",
      "loadingQuestionsMessage": "جارٍ إنشاء الأسئلة بناءً على بيانات المفردات المتاحة لديك.",
      "instructions": {
        "matchSynonyms": "اختر أقرب مرادف."
      },
      "resultCta": {
        "backToPractice": "العودة إلى التدريب",
        "seeResult": "عرض النتيجة",
        "nextWord": "الكلمة التالية"
      },
      "result": {
        "correctTitle": "إجابة صحيحة!",
        "incorrectTitle": "إجابة غير صحيحة!",
        "correctAnswerLabel": "الإجابة الصحيحة:",
        "usedInSentenceLabel": "الاستخدام في جملة:",
        "sessionResultLabel": "نتيجة الجلسة"
      },
      "leavePrompt": {
        "title": "هل ستغادر الآن؟",
        "keepPlaying": "واصل اللعب",
        "leave": "مغادرة",
        "closePromptAccessibility": "إغلاق نافذة المغادرة",
        "leavePracticeAccessibility": "مغادرة التدريب"
      },
      "hints": {
        "availableCount": "{{count}} كلمة متاحة",
        "missingSynonyms": "بيانات المرادفات غير متوفرة",
        "minActiveWords": "يلزم كلمتان نشطتان على الأقل"
      },
      "tiles": {
        "meaningMatch": "مطابقة المعنى",
        "fillInGap": "املأ الفراغ",
        "guessWord": "خمن الكلمة",
        "matchSynonyms": "مطابقة المرادفات"
      },
      "accessibility": {
        "goBack": "عودة",
        "useMode": "استخدم وضع {{mode}}",
        "closePractice": "إغلاق التدريب"
      },
      "loadState": {
        "noQuestions": {
          "title": "لا توجد أسئلة تدريب بعد",
          "message": "تحتاج إلى كلمتين نشطتين على الأقل لبدء التدريب.",
          "actionLabel": "أضف كلمات"
        },
        "unauthorized": {
          "title": "تسجيل الدخول مطلوب",
          "message": "قد تكون جلستك انتهت. سجّل الدخول مرة أخرى للمتابعة.",
          "actionLabel": "تسجيل الدخول"
        },
        "forbidden": {
          "title": "هذه الميزة غير متاحة حاليًا",
          "message": "تحقق من خطتك أو أرصدتك للمتابعة.",
          "actionLabel": "الحصول على أرصدة"
        },
        "rejected": {
          "title": "لا توجد بيانات كافية لهذا الوضع",
          "message": "أضف المزيد من الكلمات وحاول مرة أخرى.",
          "actionLabel": "أضف كلمات"
        },
        "server": {
          "title": "تعذر الوصول إلى الخادم",
          "message": "تحقق من اتصالك وحاول مرة أخرى.",
          "actionLabel": "إعادة المحاولة"
        },
        "generic": {
          "title": "تعذر بدء التدريب",
          "message": "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
          "actionLabel": "إعادة المحاولة"
        }
      }
    },
    "announcements": {
      "title": "الإعلانات",
      "unreadCount": "{{count}} غير مقروء",
      "markAllRead": "تحديد الكل كمقروء",
      "loading": "جارٍ تحميل الإعلانات...",
      "empty": "لا توجد إعلانات الآن.",
      "openLink": "فتح الرابط",
      "openAnnouncement": "فتح الإعلان: {{title}}",
      "levelInfo": "معلومة",
      "levelWarning": "تحذير",
      "levelCritical": "حرج",
      "loadFailed": "تعذر تحميل الإعلانات. حاول مرة أخرى.",
      "claimFailed": "فشلت المطالبة بالمكافأة. يرجى المحاولة مرة أخرى.",
      "requirementNotMet": "لم يتم استيفاء المطلب بعد. قم بدعوة الأصدقاء أولاً.",
      "referralCodeMissing": "رمز الإحالة مفقود لهذا الحساب.",
      "referralProgress": "تقدم الإحالة: {{current}}/_{{required}}",
      "shareInvite": "قم بدعوة صديق",
      "referralShareMessage": "انضم إلى VocOrbit.\nافتح هذا الرابط:\n{{link}}",
      "rewardText": "المكافأة: +_{{amount}} {{creditType}} رصيد",
      "creditBasic": "أساسي",
      "creditAdvanced": "متقدم",
      "claimReward": "مطالبة",
      "claimingReward": "جارٍ المطالبة...",
      "rewardClaimed": "ادعى"
    },
    "forceUpdate": {
      "title": "التحديث مطلوب",
      "body": "يلزم إصدار جديد لمواصلة استخدام VocOrbit.",
      "updateNow": "التحديث الآن",
      "checkAgain": "تحقق مرة أخرى"
    },
    "profile": {
      "title": "الملف الشخصي",
      "accountDetailsTitle": "تفاصيل الحساب",
      "accountDetailsSubtitle": "اعرض بريدك الإلكتروني ومعلومات الحساب.",
      "settingsTitle": "الإعدادات",
      "settingsSubtitle": "خصّص حجم النص وترتيب أزرار الإجراءات.",
      "favoriteWordsTitle": "الكلمات المفضلة",
      "favoriteWordsSubtitle": "اعرض الكلمات المضافة إلى المفضلة.",
      "learnedWordsTitle": "الكلمات المتعلمة",
      "learnedWordsSubtitle": "اعرض الكلمات التي تم تعليمها كمتعلَّمة.",
      "weeklyAnalyticsTitle": "التحليلات الأسبوعية",
      "weeklyAnalyticsSubtitle": "اعرض أداء ممارستك خلال آخر 7 أيام.",
      "regionTitle": "المنطقة",
      "regionSubtitle": "الحالية: {{region}}",
      "regionNotSelected": "غير محددة",
      "emptyFavorites": "لا توجد كلمات مفضلة بعد.",
      "emptyLearned": "لا توجد كلمات متعلمة بعد.",
      "loadingList": "جارٍ تحميل القائمة...",
      "logOut": "تسجيل خروج",
      "accessibility": {
        "goBack": "الرجوع",
        "openAccountDetails": "افتح تفاصيل الحساب",
        "openSettings": "فتح الإعدادات",
        "openFavoriteWords": "افتح الكلمات المفضلة",
        "openLearnedWords": "افتح الكلمات المستفادة",
        "openWeeklyAnalytics": "افتح التحليلات الأسبوعية",
        "openRegion": "افتح المنطقة الإعدادات",
        "logOut": "تسجيل الخروج",
        "playPronunciation": "تشغيل النطق لـ {{word}}",
        "openDetailForWord": "افتح التفاصيل لـ {{word}}",
        "removeWord": "إزالة {{word}}"
      }
    },
    "settings": {
      "title": "الإعدادات",
      "languagePairTitle": "زوج اللغات",
      "languagePairSubtitle": "غيّر لغتك الأم واللغة التي تتعلمها.",
      "billingCreditsTitle": "الفوترة والأرصدة",
      "billingCreditsSubtitle": "أدر أرصدة المعاني الأساسية وحِزم الشراء داخل التطبيق هنا.",
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
      "themeModeTitle": "المحور",
      "themeModeSubtitle": " اختر الضوء أو الظلام أو اتبع نظامك الإعداد.",
      "themeModeSystem": "النظام",
      "themeModeLight": "الخفيفة",
      "themeModeDark": "غامق",
      "textSizeTitle": "حجم النص",
      "textSizeSubtitle": "اضبط حجم النص في بطاقات المفردات.",
      "actionOrderTitle": "ترتيب الإجراءات",
      "actionOrderSubtitle": "حدّد ترتيب أزرار التفاصيل/المفضلة/التكرار.",
      "actionDetail": "تفاصيل",
      "actionFavorite": "مفضلة",
      "actionRepeat": "تكرار",
      "resetToDefaults": "إعادة الضبط الافتراضي",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "عودة",
        "openLanguagePreferences": "فتح تفضيلات اللغة",
        "openBillingCredits": "فتح الفوترة والأرصدة",
        "useSystemTheme": "استخدم النظام theme",
        "useLightTheme": " استخدم المظهر الفاتح",
        "useDarkTheme": "استخدم المظهر الداكن",
        "decreaseTextSize": "تصغير حجم النص",
        "increaseTextSize": "تكبير حجم النص",
        "moveActionLeft": "نقل {{action}} إلى اليسار",
        "moveActionRight": "نقل {{action}} إلى اليمين",
        "resetSettings": "إعادة ضبط إعدادات المفردات"
      }
    },
    "accountDetails": {
      "title": "تفاصيل الحساب",
      "emailLabel": "البريد الإلكتروني",
      "userIdLabel": "معرّف المستخدم",
      "regionLabel": "المنطقة الرئيسية",
      "regionEndpointLabel": "نقطة نهاية المنطقة",
      "appVersionLabel": "إصدار التطبيق",
      "buildLabel": "رقم الإصدار",
      "platformLabel": "المنصة",
      "osVersionLabel": "إصدار النظام",
      "accessibility": {
        "goBack": "عودة",
        "deleteAccount": "حذف الحساب نهائيا"
      },
      "deleteAccount": {
        "sectionTitle": "حذف الحساب",
        "sectionBody": "احذف حساب VocOrbit الخاص بك وبيانات التطبيق المرتبطة به نهائيًا. لا يمكن التراجع عن هذا الإجراء.",
        "action": "حذف الحساب نهائيا",
        "deleting": "جارٍ حذف الحساب...",
        "confirmTitle": "هل تريد حذف الحساب؟",
        "confirmBody": "يؤدي هذا إلى حذف حساب VocOrbit الخاص بك وبيانات التطبيق المرتبطة نهائيًا. لا يمكن التراجع عن هذا الإجراء.",
        "successTitle": "تم حذف الحساب",
        "successBody": "لقد تم حذف حسابك VocOrbit نهائيًا.",
        "missingUser": "لا يمكن العثور على معرف حسابك. الرجاء تسجيل الدخول مرة أخرى.",
        "cannotConnect": "لا يمكن الوصول إلى الخادم. تحقق من اتصالك وحاول مرة أخرى.",
        "sessionExpired": "انتهت جلستك. الرجاء تسجيل الدخول مرة أخرى.",
        "failed": "لم نتمكن من حذف حسابك الآن. يرجى المحاولة مرة أخرى."
      }
    },
    "iap": {
      "title": "الفوترة والأرصدة",
      "loading": "جارٍ تحميل تفاصيل الفوترة...",
      "currentSubscription": "الاشتراك الحالي",
      "currentStatus": "الحالة: {{status}}",
      "currentPlan": "الخطة الحالية: {{plan}}",
      "noActivePlan": "لا توجد خطة نشطة",
      "refresh": "تحديث الفوترة",
      "basicCreditsTitle": "أرصدة التحليل الأساسي",
      "basicCreditsBody": "تحليل المعنى الأساسي في شاشة المشاركة يستهلك هذا الرصيد.",
      "plansTitle": "الخطط",
      "plansBody": "اختر خطة وأكمل الدفع عبر حساب المتجر الخاص بك.",
      "noPlans": "لم يتم العثور على خطط قابلة للشراء لهذه المنصة.",
      "planTopup": "زيادة شهرية: +{{basic}} أساسي · +{{advanced}} متقدم",
      "planCaps": "الحدود: {{basicCap}} أساسي · {{advancedCap}} متقدم",
      "priceLabel": "السعر: {{price}}",
      "buyNow": "اشترِ الآن",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "جارٍ معالجة الشراء...",
      "purchaseCanceled": "تم إلغاء الشراء.",
      "purchaseApplied": "{{sku}}تم تنشيطه بنجاح.",
      "alreadyOwnedRestoring": "هذا العنصر مملوك بالفعل. استعادة مشترياتك...",
      "restorePurchases": "استعادة المشتريات",
      "restoring": "جارٍ استعادة المشتريات...",
      "restoreNoPurchases": "لم يتم العثور على مشتريات لاستعادتها.",
      "restoreNoApplicablePurchases": "لا يمكن تطبيق أي مشتريات قابلة للاستعادة.",
      "restoreApplied": "{{count}} تمت استعادة عمليات الشراء و تم التحقق.",
      "status": {
        "none": "غير مشترك",
        "pending": "قيد الانتظار",
        "active": "نشط",
        "expired": "منتهي",
        "canceled": "ملغى",
        "refunded": "مسترد"
      },
      "errors": {
        "unauthorized": " انتهت صلاحية جلستك. الرجاء تسجيل الدخول مرة أخرى.",
        "cannotConnect": "تعذر الوصول إلى الخادم. تحقق من الاتصال وحاول مرة أخرى.",
        "forbidden": "لا يمكن تطبيق عملية الشراء هذه على حسابك.",
        "generic": "فشل طلب الفوترة. الرجاء المحاولة مرة أخرى.",
        "purchaseFailed": "فشلت عملية الشراء. يرجى المحاولة مرة أخرى.",
        "alreadyOwned": "هذا العنصر مملوك بالفعل على هذا الحساب.",
        "invalidReceipt": "تعذر التحقق من صحة إيصال المتجر.",
        "iapUnavailable": " خدمة الشراء من المتجر غير متوفرة حاليًا على هذا الجهاز."
      },
      "accessibility": {
        "goBack": "الرجوع",
        "buyPlan": "شراء {{plan}} الخطة",
        "restorePurchases": "استعادة المشتريات السابقة",
        "refresh": "تحديث حالة الفوترة والاشتراك"
      },
      "desktop": {
        "subtitle": "انظر رصيدك الحالي هنا. تستمر عمليات الشراء الجديدة وتغييرات الاشتراك على الهاتف المحمول.",
        "desktopBadge": "عرض سطح المكتب",
        "phoneOnlyBadge": "الهاتف للمشتريات",
        "balanceTitle": "رصيدك الحالي",
        "balanceBody": "يحافظ سطح المكتب على أرصدتك المتاحة وحالة الاشتراك مرئية، حتى تتمكن من التحقق من حسابك قبل مواصلة تدفق التعلم.",
        "basicAvailable": "الاعتمادات الأساسية",
        "advancedAvailable": "الاعتمادات المتقدمة",
        "freeCredits": "حر",
        "paidCredits": "مدفوع",
        "noPlanBody": "لا يحتوي هذا الحساب على خطة فوترة نشطة للهاتف المحمول في الوقت الحالي. لا يزال بإمكانك استخدام أي أرصدة متاحة بالفعل هنا.",
        "mobileTitle": "متابعة عمليات الشراء على هاتفك",
        "mobileBody": "يتم إكمال عمليات شراء الرصيد وتغييرات الاشتراك داخل تطبيق الهاتف المحمول باستخدام حساب App Store أو Google Play الخاص بك.",
        "storeLabel": "المتجر: {{store}}",
        "renewsOn": "يتم التجديد على {{date}}",
        "expiresOn": "انتهت في {{date}}",
        "updatedOn": "آخر مزامنة: {{date}}",
        "stepOpenPhone": "افتح VocOrbit على هاتفك بنفس الحساب.",
        "stepOpenBilling": "انتقل إلى الملف الشخصي > الفواتير والائتمانات.",
        "stepFinishPurchase": "يمكنك شراء أرصدة أو إدارة اشتراكك هناك، ثم العودة إلى هنا وتحديثه.",
        "mobileHint": "يتم تحديث رصيدك الائتماني هنا بعد تطبيق عملية الشراء عبر الهاتف المحمول على نفس الحساب."
      }
    },
    "weeklyAnalytics": {
      "title": "التحليلات الأسبوعية",
      "modeAll": "الكل",
      "modeBasic": "أساسي",
      "modeAdvanced": "متقدم",
      "loading": "جارٍ تحميل التحليلات الأسبوعية...",
      "summaryTitle": "الملخص (7 أيام)",
      "sessions": "الجلسات",
      "completed": "المكتملة",
      "answered": "المجاب عنها",
      "accuracy": "الدقة",
      "activeDays": "الأيام النشطة",
      "streak": "التتابع",
      "dailyTrend": "الاتجاه اليومي",
      "byQuestionType": "حسب نوع السؤال",
      "byMode": "حسب النمط",
      "weakItems": "العناصر الضعيفة",
      "noWeakItems": "لم يتم العثور على كلمات ضعيفة ملحوظة هذا الأسبوع.",
      "weakItemMeta": "أخطاء: {{wrongAnswers}} · الدقة: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "مطابقة المعنى",
      "questionTypeGuessWord": "تخمين الكلمة",
      "questionTypeFillInGap": "املأ الفراغ",
      "questionTypeMatchSynonym": "مطابقة المرادفات",
      "errors": {
        "unauthorized": "قد تكون جلستك منتهية. يرجى تسجيل الدخول مرة أخرى.",
        "cannotConnect": "تعذر الوصول إلى الخادم. تحقق من اتصالك وحاول مرة أخرى.",
        "loadFailed": "تعذر تحميل التحليلات الأسبوعية. حاول مرة أخرى."
      },
      "accessibility": {
        "goBack": "عودة",
        "filterByMode": "التصفية حسب {{mode}}",
        "retry": "إعادة محاولة طلب التحليلات"
      }
    },
    "detail": {
      "closeDetails": "إغلاق تفاصيل الكلمة",
      "loadingDetail": "جارٍ تحميل تفاصيل الكلمة...",
      "detailLoadFailedTitle": "تعذر تحميل التفاصيل",
      "statusLearned": "متعلّم",
      "statusActive": "نشط",
      "markAsLearned": "وضع علامة كمتعلّم",
      "moveBackToActive": "إرجاع إلى النشط",
      "buyAdvancedCredits": "شراء رصيد متقدم",
      "buyBasicCredits": "شراء رصيد أساسي",
      "buyCredits": "شراء رصيد",
      "whyThisSense": "لماذا هذا المعنى",
      "examples": "أمثلة",
      "synonyms": "مرادفات",
      "antonyms": "أضداد",
      "collocations": "تراكيب شائعة",
      "alternativeMeanings": "معانٍ بديلة",
      "usageNotes": "ملاحظات الاستخدام",
      "noSynonyms": "لا توجد بيانات مرادفات بعد.",
      "stats": "إحصاءات",
      "encountersAndLastMode": "عدد المرات: {{encounters}} | آخر وضع: {{mode}}",
      "nextReminder": "التذكير التالي",
      "currentPlan": "الخطة الحالية: {{due}}",
      "reviewHint": "نسيت: +10 دقائق، صعب: +1 ساعة، جيد: يزيد بدءًا من +1 يوم.",
      "runAdvanced": "تشغيل التحليل المتقدم",
      "reviewForgot": "نسيت",
      "reviewHard": "صعب",
      "reviewGood": "جيد",
      "reviewOptionAccessibility": "تم اختيار {{title}}. المراجعة التالية بعد {{delay}}.",
      "repeatUnscheduled": "غير مجدول",
      "repeatNow": "الآن",
      "repeatAfterMinutes": "{{count}} دقيقة",
      "repeatAfterHours": "{{count}} ساعة",
      "repeatAfterDays": "{{count}} يوم",
      "repeatAfterWeeks": "{{count}} أسبوع",
      "repeatInMinutes": "بعد {{count}} دقيقة",
      "repeatInHours": "بعد {{count}} ساعة",
      "repeatInDays": "بعد {{count}} يوم",
      "repeatInWeeks": "بعد {{count}} أسبوع",
      "repeatNotificationTitle": "وقت المراجعة: {{word}}",
      "repeatNotificationBody": "راجع كلمة {{word}}.",
      "reportIssue": "الإبلاغ عن معنى خاطئ",
      "reportIssueAccessibility": "الإبلاغ عن معنى خاطئ لكلمة {{word}}",
      "deleteWord": "حذف الكلمة",
      "deleteWordAccessibility": "حذف {{word}} حذفًا مرنًا",
      "deleteConfirmTitle": "حذف هذه الكلمة؟",
      "deleteConfirmBody": "ستُزال \"{{word}}\" من قائمتك. يمكنك إضافتها مرة أخرى لاحقًا.",
      "deleteConfirmCancel": "إلغاء",
      "deleteConfirmAction": "نعم، احذف"
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
      "title": "الإبلاغ معنى",
      "subtitle": "إذا كان \"{{word}}\" يبدو خاطئًا في هذا السياق، فأخبرنا ما هو الخطأ.",
      "messageLabel": "ما الذي يبدو خاطئًا؟",
      "messagePlaceholder": "مثال: هذا المعنى لا يناسب الجملة. يجب أن يصف الاتصال، وليس الموقع.",
      "charactersLeft": "{{count}} الأحرف المتبقية",
      "submit": "إرسال تقرير",
      "successTitle": "تم إرسال التقرير",
      "successBody": " شكرًا على التعليقات. سنراجع هذا العنصر.",
      "backToDetail": "الرجوع إلى تفاصيل الكلمة",
      "errors": {
        "unauthorized": " انتهت صلاحية جلستك. الرجاء تسجيل الدخول مرة أخرى.",
        "cannotConnect": "تعذر الوصول إلى الخادم. تحقق من الاتصال وحاول مرة أخرى.",
        "itemNotFound": "تعذر العثور على عنصر Word.",
        "submitFailed": "تعذر إرسال التقرير. يرجى المحاولة مرة أخرى."
      },
      "accessibility": {
        "goBack": "الرجوع",
        "submit": "إرسال تقرير المشكلة",
        "backToDetail": "الرجوع إلى تفاصيل الكلمة"
      }
    },
    "capture": {
      "backButton": "مكتبة",
      "headerTitle": "أضف كلمة",
      "headerBody": "الصق جملة واختر الكلمة التي تريد حفظها.",
      "seedWordLabel": "البحث عن: {{word}}",
      "pasteHero": {
        "title": "لصق النص المنسوخ",
        "body": "انسخ جملة أو فقرة، ثم الصقها لفتح المنتقي.",
        "bodyWithWord": "انسخ جملة تتضمن \"{{word}}\"، ثم ألصقها لفتح المنتقي.",
        "hint": "يتم فتح المنتقي تلقائيًا بعد اللصق."
      },
      "picker": {
        "title": "اختر الكلمة في النص",
        "body": "انقر فوق الكلمة المحددة أدناه. الصق مرة أخرى إذا قمت بنسخ جملة مختلفة.",
        "badge": "منتقي الكلمات",
        "hint": "يقوم VocOrbit بإنشاء بطاقة الكلمات تلقائيًا من هذا البحث."
      },
      "status": {
        "pasteFirst": "الصق النص المنسوخ للبدء.",
        "selectedWord": "الكلمة المختارة: {{word}}",
        "seedWordMissing": "الصق جملة بـ \"{{word}}\" أو اختر كلمة أخرى أدناه.",
        "selectWord": "انقر فوق الكلمة المحددة أدناه للمتابعة."
      },
      "actions": {
        "pasteCopiedText": "لصق النص المنسوخ",
        "pasteAgain": "لصق مرة أخرى",
        "clear": "واضح",
        "readingClipboard": "قراءة الحافظة...",
        "reading": "قراءة...",
        "analyzeAndSave": "تحليل وحفظ",
        "loadingMeaning": "الحصول على المعنى الأساسي...",
        "openSavedWord": "فتح الكلمة المحفوظة",
        "backToLibrary": "العودة إلى المكتبة",
        "pickAnotherWord": "اختر كلمة أخرى"
      },
      "loading": {
        "title": "تشغيل البصيرة الأساسية",
        "body": "يقوم VocOrbit بمطابقة الكلمة المحددة مع هذه الجملة."
      },
      "result": {
        "title": "المعنى الأساسي",
        "savedFallback": "تم الحفظ في مكتبتك.",
        "contextMeaning": "معنى السياق",
        "whyThisMeaning": "لماذا هذا المعنى"
      },
      "problems": {
        "clipboardUnavailableTitle": "الحافظة غير متاحة",
        "clipboardUnavailableBody": "تم حظر الوصول إلى الحافظة في سياق المتصفح هذا. الصق الجملة يدويا.",
        "contextRequiredTitle": "السياق مطلوب",
        "contextRequiredBody": "الصق جملة أو فقرة قصيرة قبل تحديد الكلمة.",
        "selectWordTitle": "حدد كلمة في النص",
        "selectWordBody": "انقر فوق الكلمة المحددة داخل كتلة النص قبل تشغيل البحث.",
        "signInRequiredTitle": "تسجيل الدخول مطلوب",
        "signInRequiredBody": "انتهت جلستك. افتح VocOrbit مرة أخرى وقم بتسجيل الدخول قبل إعادة محاولة هذا البحث.",
        "basicCreditsRequiredTitle": "الاعتمادات الأساسية المطلوبة",
        "basicCreditsRequiredBody": "لا يمكن لحسابك إجراء بحث أساسي الآن.",
        "requestTimedOutTitle": "انتهت مهلة الطلب",
        "requestTimedOutBody": "استغرق البحث وقتا طويلا. حاول مرة أخرى بنفس الجملة.",
        "connectionProblemTitle": "مشكلة في الاتصال",
        "connectionProblemBody": "تعذر على VocOrbit الوصول إلى الخادم. تحقق من اتصالك وأعد المحاولة.",
        "lookupFailedTitle": "فشل البحث",
        "lookupFailedBody": "تعذر على VocOrbit إنهاء طلب المعلومات هذا.",
        "lookupIncompleteTitle": "البحث غير مكتمل",
        "lookupIncompleteBody": "أرجع VocOrbit استجابة غير متوقعة. حاول مرة أخرى مرة أخرى."
      }
    }
  }
}

export default ar
