import { Translations } from "./en"

const ru: Translations = {
  "common": {
    "ok": "ХОРОШО!",
    "cancel": "Отмена",
    "back": "Назад",
    "logOut": "Выйти"
  },
  "welcomeScreen": {
    "postscript": "psst — Вероятно, ваше приложение выглядит не так. (Если только ваш дизайнер не передал вам эти экраны и в этом случае не отправил их!)",
    "readyForLaunch": "Ваше приложение почти готово к запуску!",
    "exciting": "(ох, это захватывающе!)",
    "letsGo": "Поехали!"
  },
  "errorScreen": {
    "title": "Что-то пошло не так!",
    "friendlySubtitle": "Это экран, который ваши пользователи увидят в рабочей среде при возникновении ошибки. Вам понадобится настроить это сообщение (расположенное в `app/i18n/en.ts`) и, возможно, также макет (`app/screens/ErrorScreen`). Если вы хотите полностью удалить это, проверьте `app/app.tsx` на наличие компонента <ErrorBoundary>.",
    "reset": "СБРОС ПРИЛОЖЕНИЯ",
    "traceTitle": "Ошибка из стека %{name}"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "Так пусто... так грустно",
      "content": "Данные пока не найдены. Попробуйте нажать кнопку, чтобы обновить или перезагрузить приложение.",
      "button": "Давай попробуем это еще раз"
    }
  },
  "errors": {
    "invalidEmail": "Неверный адрес электронной почты."
  },
  "loginScreen": {
    "logIn": "Войти",
    "subtitle": "Продолжайте использовать свою учетную запись в социальной сети, чтобы отслеживать прогресс своего словарного запаса.",
    "continueWith": "ПРОДОЛЖИТЬ",
    "regionTitle": "Регион",
    "regionSubtitle": "Текущий: {{region}}",
    "regionNotSelected": "Не выбрано",
    "changeRegion": "Изменить",
    "signingIn": "Вход в систему...",
    "googleButton": "Гугл",
    "appleButton": "Яблоко (скоро)",
    "moreProvidersSoon": "Скоро будут доступны и другие провайдеры.",
    "accessibility": {
      "openRegionSelection": "Открытый выбор региона"
    },
    "errors": {
      "unauthorized": "Аутентификация не удалась. Пожалуйста, войдите еще раз.",
      "cannotConnect": "Не удалось подключиться к серверу. Пожалуйста, попробуйте еще раз.",
      "server": "Проверка сервера не удалась. Пожалуйста, повторите попытку в ближайшее время.",
      "rejected": "Запрос на вход был отклонен. Пожалуйста, проверьте конфигурацию аутентификации.",
      "badData": "Неожиданный ответ получен от сервера.",
      "generic": "Не удалось завершить вход. Повторите попытку.",
      "googleCancelled": "Вход в Google отменен.",
      "googleUnavailable": "Вход в Google недоступен на этом устройстве.",
      "googleFailed": "Не удалось войти в Google. Пожалуйста, попробуйте еще раз."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "Выберите свою языковую пару",
    "titleSettings": "Языковые предпочтения",
    "subtitleOnboarding": "Выберите свой родной и целевой язык из глобального списка с флагами и странами.",
    "subtitleSettings": "Обновите здесь свой родной и целевой язык, указав информацию о флаге и стране.",
    "currentPair": "Текущая пара",
    "availableOptionsCount": "{{count}} доступны варианты языка/страны",
    "nativeLanguageTitle": "Родной язык",
    "nativeLanguageBody": "Переводы и пояснения будут показаны на этом языке.",
    "learningLanguageTitle": "Изучение языка",
    "learningLanguageBody": "Определения и контексты будут генерироваться на этом языке.",
    "selectedLabel": "Выбрано",
    "pickerTitleL1": "Выбрать родной язык",
    "pickerTitleL2": "Выберите язык обучения",
    "searchPlaceholder": "Поиск языка или страны",
    "noResults": "Результаты не найдены.",
    "saving": "Сохранение...",
    "continue": "Продолжить",
    "save": "Сохранить",
    "accessibility": {
      "goBack": "Вернуться назад",
      "selectNativeLanguage": "Выберите родной язык",
      "selectLearningLanguage": "Выберите язык обучения",
      "continueWithSelectedLanguages": "Продолжить с выбранными языками",
      "saveLanguages": "Сохранение языков",
      "closeLanguagePicker": "Закрыть выбор языка",
      "closePicker": "Закрыть выбор",
      "selectLanguageItem": "Выберите {{language}} {{country}}"
    },
    "errors": {
      "cannotConnect": "Не удалось подключиться к серверу. Пожалуйста, попробуйте еще раз.",
      "unauthorized": "Сессия недействительна. Пожалуйста, войдите снова.",
      "validation": "Языковые настройки не удалось сохранить. Пожалуйста, проверьте введенные вами данные.",
      "server": "Произошла ошибка сервера. Пожалуйста, повторите попытку в ближайшее время.",
      "saveFailed": "Языковые настройки не удалось сохранить. Пожалуйста, попробуйте еще раз.",
      "noSession": "Активный сеанс не найден. Пожалуйста, войдите еще раз.",
      "selectTwoLanguages": "Пожалуйста, выберите оба языка.",
      "sameLanguagePair": "Родной язык и изучаемый язык не могут быть одним и тем же."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "Повторить попытку",
      "signIn": "Войти",
      "favoriteLabel": "Любимый",
      "learnedLabel": "узнал",
      "detailButton": "Открыть детали"
    },
    "welcome": {
      "badge": "ВОКОРБИТ",
      "title": "Как на самом деле работает VocOrbit",
      "subtitle": "Реальный процесс: выберите предложение вне приложения, выберите слово, а затем выучите его в контексте внутри VocOrbit.",
      "progress": "Шаг {{current}} / {{total}}",
      "progressSingle": "Шаг {{current}}",
      "mock": {
        "contextLabel": "Контекстное предложение",
        "selectedWordLabel": "Выбранное слово",
        "meaningLabel": "Основное значение",
        "whyLabel": "Почему в этом контексте"
      },
      "flowTitle": "Изучите процесс за 3 быстрых шага",
      "highlightsTitle": "Что вы получаете",
      "actions": {
        "previous": "Предыдущий",
        "next": "Следующий шаг",
        "enterApp": "Начать обучение",
        "showExample": "Show example",
        "hideExample": "Скрыть пример"
      },
      "steps": {
        "step1": {
          "step": "ШАГ 1 • Поделитесь предложением",
          "title": "Выберите предложение, в котором встречается это слово",
          "body": "Нажмите и удерживайте текст в браузере, заметках или любом приложении и отправьте его в расширение VocOrbit Share Extension.",
          "source": "Когда я оглядываюсь назад, я снова поражаюсь живительной силе литературы.",
          "word": "литература",
          "meaning": "письменные произведения, особенно те, которые считаются художественными",
          "why": "В этом предложении речь идет о книгах и произведениях искусства, которые сильно влияют на говорящего.",
          "hint": "Совет: всегда делитесь полным предложением, а не только одним словом.",
          "bullets": {
            "one": "Работает с браузером, заметками и многими приложениями для чтения.",
            "two": "Вы сохраняете исходный контекст предложения",
            "three": "Никакого ручного копирования и вставки не требуется"
          }
        },
        "step2": {
          "step": "ШАГ 2 • Выберите точное слово.",
          "title": "Нажмите одно слово и мгновенно получите основной смысл",
          "body": "В режиме общего доступа слова можно нажимать. Выберите одно целевое слово и запустите базовую аналитику.",
          "source": "Чтение не следует преподносить детям как рутину, обязанность.",
          "word": "работа по дому",
          "meaning": "рутинная задача, обычно неприятная",
          "why": "Здесь слово «рутина» подчеркивает, что чтение не должно ощущаться как вынужденная работа.",
          "hint": "Совет: если вы не уверены, начните с базового. Затем запустите «Дополнительно» в приложении.",
          "bullets": {
            "one": "Смысл генерируется именно для этого предложения",
            "two": "Вы также понимаете, почему выбрано именно это значение.",
            "three": "Поддерживает выбранную вами языковую пару"
          }
        },
        "step3": {
          "step": "ШАГ 3 • Сохраните и систематизируйте.",
          "title": "Переместите полезные слова в свою личную систему",
          "body": "После того, как слово достигнет VocOrbit, отметьте его как избранное или добавьте в список повторения для активного изучения.",
          "source": "Положитесь на наш экспертный опыт, чтобы обеспечить успех вашего проекта.",
          "word": "эксперт",
          "meaning": "человек, обладающий особыми навыками или знаниями",
          "why": "В нем описывается опыт как очень надежный и квалифицированный в контексте данного проекта.",
          "hint": "Совет: держите список повторений целенаправленным. 10 активных слов обеспечивают лучшее удержание.",
          "bullets": {
            "one": "Любимый список важных слов",
            "two": "Повторный список для активного запоминания",
            "three": "Состояние обучения сохраняет ваш прогресс в чистоте."
          }
        },
        "step4": {
          "step": "ШАГ 4 • Практический цикл",
          "title": "Повторите, попрактикуйтесь и отметьте как изученное",
          "body": "Используйте режимы тренировки и напоминания, пока запоминание не станет сильным, а затем отметьте слово как выученное.",
          "source": "Хотите поговорить о чем-то другом?",
          "word": "протянуть руку",
          "meaning": "связаться с кем-то",
          "why": "В данном контексте это фразовый глагол, означающий общение, а не физическое достижение.",
          "hint": "Совет: ежедневно используйте напоминания и короткие занятия для устойчивого прогресса.",
          "bullets": {
            "one": "Карточки с упражнениями составлены из ваших собственных слов.",
            "two": "Еженедельная аналитика показывает слабые места",
            "three": "Выученные слова автоматически покидают очередь повторения."
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "Возможно, срок вашей сессии истек. Пожалуйста, войдите снова.",
      "cannotConnect": "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.",
      "listLoadFailed": "Не удалось загрузить список слов. Пожалуйста, попробуйте еще раз.",
      "searchLoadFailed": "Не удалось загрузить результаты поиска. Пожалуйста, попробуйте еще раз.",
      "itemNotFound": "Запись слова не найдена.",
      "reloginRequired": "Пожалуйста, войдите еще раз, чтобы продолжить.",
      "favoriteActionFailed": "Любимое действие не удалось. Пожалуйста, попробуйте еще раз.",
      "detailLoadFailed": "Не удалось загрузить информацию о слове.",
      "stateUpdateFailed": "Не удалось обновить состояние. Пожалуйста, попробуйте еще раз.",
      "analysisRequestFailed": "Не удалось отправить запрос на анализ.",
      "invalidModelOutput": "Формат ответа модели недействителен. Пожалуйста, попробуйте еще раз.",
      "analysisTimeout": "Время анализа истекло. Пожалуйста, попробуйте еще раз.",
      "advancedCreditInsufficient": "Недостаточное количество продвинутых кредитов.",
      "basicCreditInsufficient": "Недостаточно базовых кредитов.",
      "advancedAnalysisFailed": "Не удалось выполнить расширенный анализ.",
      "basicAnalysisFailed": "Базовый анализ не удалось завершить.",
      "repeatProgressUpdateFailed": "Не удалось обновить повторный прогресс. Пожалуйста, попробуйте еще раз.",
      "missingContext": "Отсутствует контекст, необходимый для анализа.",
      "selectedWordNotInSentence": "Выбранное слово не найдено в контекстном предложении.",
      "analysisFailedGeneric": "Не удалось завершить анализ. Пожалуйста, попробуйте еще раз.",
      "unexpected": "Произошла непредвиденная ошибка."
    },
    "search": {
      "title": "Поиск",
      "placeholder": "Поиск по слову, значению или объяснению",
      "loading": "Загрузка слов...",
      "emptyResult": "Нет слов, соответствующих вашему запросу.",
      "emptyHint": "Начните вводить текст выше для поиска."
    },
    "showroom": {
      "loading": "Загрузка списка слов...",
      "emptyTitle": "Пока нет слов",
      "emptyBody": "После того как вы добавите слова с помощью Word Insight, этот список заполнится автоматически.",
      "emptyCta": "Открытые объявления",
      "updateAvailableTitle": "Доступна новая версия",
      "updateAvailableBody": "Нажмите, чтобы обновить и получать последние улучшения.",
      "updateNow": "Обновить сейчас",
      "repeatAdded": "{{word}} добавлен в список повторов ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}} удален из списка повторов ({{count}}/{{limit}}).",
      "repeatLimitReached": "Вы достигли лимита списка повторов (10/10).",
      "repeatPermissionRequired": "Для напоминаний требуется разрешение на уведомление. Включите уведомления о добавлении слов.",
      "favoriteAdded": "{{word}} добавлен в избранное.",
      "favoriteRemoved": "{{word}} удален из избранного.",
      "repeatCleared": "Список повторов очищен.",
      "repeatListTitle": "Повторить список",
      "repeatCount": "{{count}}/{{limit}} слов",
      "repeatEmpty": "Список повторов пуст. Добавляйте слова с помощью колокольчика ниже.",
      "clearAll": "Очистить все",
      "done": "Готово",
      "practice": "Практика",
      "accessibility": {
        "showDetails": "Показать детали",
        "favoriteWord": "Любимое слово",
        "repeatWordLater": "Повторите это слово позже",
        "openProfile": "Открыть профиль",
        "openRepeatList": "Открыть список повторяющихся слов",
        "openAnnouncements": "Открытые объявления",
        "openUpdate": "Открыть страницу обновления",
        "dismissUpdate": "Закрыть уведомление об обновлении",
        "searchWords": "Поисковые слова",
        "switchToCard": "Переключиться на карточный режим",
        "switchToList": "Переключиться на просмотр списка",
        "retryShowroom": "Попробуйте загрузить шоу-рум еще раз.",
        "closeRepeatList": "Закрыть список повторов",
        "clearRepeatList": "Очистить список повторов",
        "removeFromRepeat": "Удалить {{word}} из списка повторов",
        "practiceWord": "Практикуйте это слово",
        "addWord": "Добавить слово"
      },
      "quickAdd": {
        "eyebrow": "Быстрое добавление",
        "title": "Добавьте слово из контекста",
        "body": "Вставьте предложение, выберите нужное слово и сохраните его.",
        "action": "Добавить слово",
        "actionHint": "Вставить и выбрать"
      }
    },
    "practiceHub": {
      "title": "Практика",
      "sectionLabel": "Практика",
      "selectAnswer": "ВЫБЕРИТЕ ОТВЕТ",
      "modeBasic": "Базовый",
      "modeAdvanced": "Расширенный",
      "loadingTitle": "Загрузка каталога",
      "loadingMessage": "Проверка того, какие типы упражнений доступны для вас.",
      "loadingQuestionsTitle": "Подготовка практических вопросов...",
      "loadingQuestionsMessage": "Генерация вопросов на основе имеющихся у вас словарных данных.",
      "instructions": {
        "matchSynonyms": "Выберите наиболее близкий синоним."
      },
      "resultCta": {
        "backToPractice": "Вернемся к практике",
        "seeResult": "Посмотреть результат",
        "nextWord": "Следующее слово"
      },
      "result": {
        "correctTitle": "Это правильно!",
        "incorrectTitle": "Это неправильно!",
        "correctAnswerLabel": "Правильный ответ:",
        "usedInSentenceLabel": "Используется в предложении:",
        "sessionResultLabel": "Результат сеанса"
      },
      "leavePrompt": {
        "title": "Уже уходишь?",
        "keepPlaying": "Продолжайте играть",
        "leave": "Уйти",
        "closePromptAccessibility": "Закрыть запрос на выход",
        "leavePracticeAccessibility": "Оставить практику"
      },
      "hints": {
        "availableCount": "Доступно {{count}} слов",
        "missingSynonyms": "Данные о синонимах недоступны.",
        "minActiveWords": "Требуется минимум 2 активных слова"
      },
      "tiles": {
        "meaningMatch": "Значение совпадения",
        "fillInGap": "Заполните пробел",
        "guessWord": "Угадай слово",
        "matchSynonyms": "Сопоставить синонимы"
      },
      "accessibility": {
        "goBack": "Вернуться назад",
        "useMode": "Используйте режим {{mode}}",
        "closePractice": "Близкая практика"
      },
      "loadState": {
        "noQuestions": {
          "title": "Практических вопросов пока нет",
          "message": "Чтобы начать практику, вам нужно как минимум 2 активных слова.",
          "actionLabel": "Добавить слова"
        },
        "unauthorized": {
          "title": "Требуется вход",
          "message": "Возможно, срок вашей сессии истек. Войдите еще раз, чтобы продолжить.",
          "actionLabel": "Войти"
        },
        "forbidden": {
          "title": "Эта функция в настоящее время недоступна",
          "message": "Проверьте свой план или кредиты, чтобы продолжить.",
          "actionLabel": "Получить кредиты"
        },
        "rejected": {
          "title": "Недостаточно данных для этого режима.",
          "message": "Добавьте больше слов и повторите попытку.",
          "actionLabel": "Добавить слова"
        },
        "server": {
          "title": "Не удалось связаться с сервером",
          "message": "Проверьте подключение и повторите попытку.",
          "actionLabel": "Повторить попытку"
        },
        "generic": {
          "title": "Не удалось начать практику",
          "message": "Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.",
          "actionLabel": "Повторить попытку"
        }
      }
    },
    "announcements": {
      "title": "Объявления",
      "unreadCount": "{{count}} непрочитано",
      "markAllRead": "Отметить все прочитанными",
      "loading": "Загрузка объявлений...",
      "empty": "Никаких объявлений сейчас нет.",
      "openLink": "Открыть ссылку",
      "openAnnouncement": "Открытое объявление: {{title}}",
      "levelInfo": "Информация",
      "levelWarning": "Предупреждение",
      "levelCritical": "Критический",
      "loadFailed": "Не удалось загрузить объявления. Пожалуйста, попробуйте еще раз.",
      "claimFailed": "Заявка на вознаграждение не удалась. Пожалуйста, попробуйте еще раз.",
      "requirementNotMet": "Требование пока не выполнено. Сначала пригласите друзей.",
      "referralCodeMissing": "Для этого аккаунта отсутствует реферальный код.",
      "referralProgress": "Прогресс реферала: {{current}}/{{required}}",
      "shareInvite": "Пригласить друга",
      "referralShareMessage": "Присоединяйтесь к VocOrbit.\nОткройте эту ссылку:\n{{link}}",
      "rewardText": "Награда: +{{amount}} {{creditType}} кредитов.",
      "creditBasic": "базовый",
      "creditAdvanced": "продвинутый",
      "claimReward": "Претензия",
      "claimingReward": "Утверждение...",
      "rewardClaimed": "Заявлено"
    },
    "forceUpdate": {
      "title": "Требуется обновление",
      "body": "Для продолжения использования VocOrbit необходима новая версия.",
      "updateNow": "Обновить сейчас",
      "checkAgain": "Проверьте еще раз"
    },
    "profile": {
      "title": "Профиль",
      "accountDetailsTitle": "Детали учетной записи",
      "accountDetailsSubtitle": "Просмотрите свою электронную почту и информацию об учетной записи.",
      "settingsTitle": "Настройки",
      "settingsSubtitle": "Настройте размер текста и порядок кнопок действий.",
      "favoriteWordsTitle": "Любимые слова",
      "favoriteWordsSubtitle": "Просмотр слов, добавленных в избранное.",
      "learnedWordsTitle": "Выученные слова",
      "learnedWordsSubtitle": "Просмотр слов, отмеченных как выученные.",
      "weeklyAnalyticsTitle": "Еженедельная аналитика",
      "weeklyAnalyticsSubtitle": "Просмотрите результаты тренировок за последние 7 дней.",
      "regionTitle": "Регион",
      "regionSubtitle": "Текущий: {{region}}",
      "regionNotSelected": "Не выбрано",
      "emptyFavorites": "Любимых слов пока нет.",
      "emptyLearned": "Еще нет выученных слов.",
      "loadingList": "Загрузка списка...",
      "logOut": "Выйти",
      "accessibility": {
        "goBack": "Вернуться назад",
        "openAccountDetails": "Открыть данные счета",
        "openSettings": "Открыть настройки",
        "openFavoriteWords": "Открыть любимые слова",
        "openLearnedWords": "Открыть выученные слова",
        "openWeeklyAnalytics": "Открыть еженедельную аналитику",
        "openRegion": "Открыть настройки региона",
        "logOut": "Выйти",
        "playPronunciation": "Воспроизвести произношение {{word}}",
        "openDetailForWord": "Открыть подробную информацию о {{word}}",
        "removeWord": "Удалить {{word}}"
      }
    },
    "settings": {
      "title": "Настройки",
      "languagePairTitle": "Языковая пара",
      "languagePairSubtitle": "Меняйте родной и изучаемый язык.",
      "billingCreditsTitle": "Выставление счетов и кредиты",
      "billingCreditsSubtitle": "Управляйте базовыми кредитами и пакетами IAP здесь.",
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
      "themeModeTitle": "Тема",
      "themeModeSubtitle": "Выберите светлый, темный или следуйте настройкам системы.",
      "themeModeSystem": "Система",
      "themeModeLight": "Свет",
      "themeModeDark": "Темный",
      "textSizeTitle": "Размер текста",
      "textSizeSubtitle": "Отрегулируйте размер текста в словарных карточках.",
      "actionOrderTitle": "Порядок действий",
      "actionOrderSubtitle": "Установите порядок кнопок «Подробнее/Избранное/Повторить».",
      "actionDetail": "Деталь",
      "actionFavorite": "Любимый",
      "actionRepeat": "Повторить",
      "resetToDefaults": "Сбросить настройки по умолчанию",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "Вернуться назад",
        "openLanguagePreferences": "Открытые языковые настройки",
        "openBillingCredits": "Открытые счета и кредиты",
        "useSystemTheme": "Использовать системную тему",
        "useLightTheme": "Светлая тема",
        "useDarkTheme": "Использовать темную тему",
        "decreaseTextSize": "Уменьшить размер текста",
        "increaseTextSize": "Увеличить размер текста",
        "moveActionLeft": "Переместить {{action}} влево",
        "moveActionRight": "Переместите {{action}} вправо",
        "resetSettings": "Сбросить настройки словаря"
      }
    },
    "accountDetails": {
      "title": "Детали учетной записи",
      "emailLabel": "электронная почта",
      "userIdLabel": "Идентификатор пользователя",
      "regionLabel": "Домашний регион",
      "regionEndpointLabel": "Конечная точка региона",
      "appVersionLabel": "Версия приложения",
      "buildLabel": "Номер сборки",
      "platformLabel": "Платформа",
      "osVersionLabel": "Версия ОС",
      "accessibility": {
        "goBack": "Вернуться назад",
        "deleteAccount": "Удалить аккаунт навсегда"
      },
      "deleteAccount": {
        "sectionTitle": "Удалить аккаунт",
        "sectionBody": "Навсегда удалите свою учетную запись VocOrbit и связанные с ней данные приложения. Это действие невозможно отменить.",
        "action": "Удалить аккаунт навсегда",
        "deleting": "Удаление аккаунта...",
        "confirmTitle": "Удалить аккаунт?",
        "confirmBody": "При этом ваша учетная запись VocOrbit и данные связанного приложения будут удалены без возможности восстановления. Это действие невозможно отменить.",
        "successTitle": "Аккаунт удален",
        "successBody": "Ваша учетная запись VocOrbit была удалена без возможности восстановления.",
        "missingUser": "Не удалось найти идентификатор вашей учетной записи. Пожалуйста, войдите снова.",
        "cannotConnect": "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.",
        "sessionExpired": "Срок действия вашей сессии истек. Пожалуйста, войдите снова.",
        "failed": "Мы не смогли удалить вашу учетную запись прямо сейчас. Пожалуйста, попробуйте еще раз."
      }
    },
    "iap": {
      "title": "Выставление счетов и кредиты",
      "loading": "Загрузка платежных данных...",
      "currentSubscription": "Текущая подписка",
      "currentStatus": "Статус: {{status}}",
      "currentPlan": "Текущий план: {{plan}}",
      "noActivePlan": "Нет активного плана",
      "refresh": "Обновить платежные данные",
      "basicCreditsTitle": "Базовые знания",
      "basicCreditsBody": "Базовый смысловой анализ на экране общего доступа потребляет этот кредит.",
      "plansTitle": "Планы",
      "plansBody": "Выберите план и завершите оплату через учетную запись вашего магазина.",
      "noPlans": "Для этой платформы не найдено доступных для приобретения планов.",
      "planTopup": "Ежемесячное пополнение: +{{basic}} базовый · +{{advanced}} расширенный",
      "planCaps": "Заглавные буквы: {{basicCap}} базовый · {{advancedCap}} расширенный.",
      "priceLabel": "Цена: {{price}}",
      "buyNow": "Купить сейчас",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "Обработка покупки...",
      "purchaseCanceled": "Покупка отменена.",
      "purchaseApplied": "{{sku}} успешно активирован.",
      "alreadyOwnedRestoring": "Этот предмет уже принадлежит. Восстановление покупок...",
      "restorePurchases": "Восстановление покупок",
      "restoring": "Восстановление покупок...",
      "restoreNoPurchases": "Покупок для восстановления не найдено.",
      "restoreNoApplicablePurchases": "Восстанавливаемые покупки применить невозможно.",
      "restoreApplied": "Покупки {{count}} восстановлены и проверены.",
      "status": {
        "none": "Не подписан",
        "pending": "Ожидается",
        "active": "Активный",
        "expired": "Срок действия истек",
        "canceled": "Отменено",
        "refunded": "Возвращено"
      },
      "errors": {
        "unauthorized": "Срок действия вашей сессии истек. Пожалуйста, войдите еще раз.",
        "cannotConnect": "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.",
        "forbidden": "Эту покупку невозможно применить к вашему аккаунту.",
        "generic": "Запрос на выставление счета не выполнен. Пожалуйста, попробуйте еще раз.",
        "purchaseFailed": "Покупка не удалась. Пожалуйста, попробуйте еще раз.",
        "alreadyOwned": "Эта позиция уже принадлежит этому аккаунту.",
        "invalidReceipt": "Не удалось подтвердить чек из магазина.",
        "iapUnavailable": "Служба покупок в магазине в настоящее время недоступна на этом устройстве."
      },
      "accessibility": {
        "goBack": "Вернуться назад",
        "buyPlan": "Купить план {{plan}}",
        "restorePurchases": "Восстановить предыдущие покупки",
        "refresh": "Обновить состояние выставления счетов и подписки"
      },
      "desktop": {
        "subtitle": "Здесь вы можете увидеть свой текущий баланс. Новые покупки и изменения в подписках продолжаются на мобильных устройствах.",
        "desktopBadge": "Вид рабочего стола",
        "phoneOnlyBadge": "Телефон для покупок",
        "balanceTitle": "Ваш текущий баланс",
        "balanceBody": "Desktop сохраняет доступные кредиты и состояние подписки, поэтому вы можете проверить свою учетную запись, прежде чем продолжить процесс обучения.",
        "basicAvailable": "Базовые кредиты",
        "advancedAvailable": "Расширенные кредиты",
        "freeCredits": "Бесплатно",
        "paidCredits": "Оплаченный",
        "noPlanBody": "Для этого аккаунта сейчас нет активного тарифного плана для мобильных устройств. Вы по-прежнему можете использовать любые кредиты, уже доступные здесь.",
        "mobileTitle": "Продолжайте покупки на своем телефоне",
        "mobileBody": "Покупки кредитов и изменения подписки выполняются в мобильном приложении с вашей учетной записью App Store или Google Play.",
        "storeLabel": "Магазин: {{store}}",
        "renewsOn": "Обновления на {{date}}",
        "expiresOn": "Завершилось {{date}}",
        "updatedOn": "Последняя синхронизация: {{date}}",
        "stepOpenPhone": "Откройте VocOrbit на своем телефоне под той же учетной записью.",
        "stepOpenBilling": "Откройте «Профиль» > «Счета и кредиты».",
        "stepFinishPurchase": "Купите кредиты или управляйте своей подпиской там, затем вернитесь сюда и обновите подписку.",
        "mobileHint": "Ваш кредитный баланс обновляется здесь после того, как мобильная покупка будет применена к той же учетной записи."
      }
    },
    "weeklyAnalytics": {
      "title": "Еженедельная аналитика",
      "modeAll": "Все",
      "modeBasic": "Базовый",
      "modeAdvanced": "Расширенный",
      "loading": "Загрузка еженедельной аналитики...",
      "summaryTitle": "Резюме (7 дней)",
      "sessions": "Сессии",
      "completed": "Завершено",
      "answered": "Ответил",
      "accuracy": "Точность",
      "activeDays": "Активные дни",
      "streak": "Полоса",
      "dailyTrend": "Ежедневный тренд",
      "byQuestionType": "По типу вопроса",
      "byMode": "По режиму",
      "weakItems": "Слабые предметы",
      "noWeakItems": "На этой неделе не обнаружено заметных слабых слов.",
      "weakItemMeta": "Неверно: {{wrongAnswers}} · Точность: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "Значение совпадения",
      "questionTypeGuessWord": "Угадай слово",
      "questionTypeFillInGap": "Заполните пробел",
      "questionTypeMatchSynonym": "Сопоставить синоним",
      "errors": {
        "unauthorized": "Возможно, срок вашей сессии истек. Пожалуйста, войдите снова.",
        "cannotConnect": "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.",
        "loadFailed": "Не удалось загрузить еженедельную аналитику. Пожалуйста, попробуйте еще раз."
      },
      "accessibility": {
        "goBack": "Вернуться назад",
        "filterByMode": "Фильтровать по {{mode}}",
        "retry": "Повторить запрос аналитики"
      }
    },
    "detail": {
      "closeDetails": "Закрыть детали слова",
      "loadingDetail": "Загрузка сведений о слове...",
      "detailLoadFailedTitle": "Не удалось загрузить детали",
      "statusLearned": "узнал",
      "statusActive": "активный",
      "markAsLearned": "Отметить как изученное",
      "moveBackToActive": "Вернуться в активный режим",
      "buyAdvancedCredits": "Купить расширенные кредиты",
      "buyBasicCredits": "Купить базовые кредиты",
      "buyCredits": "Купить кредиты",
      "whyThisSense": "Почему это чувство",
      "examples": "Примеры",
      "synonyms": "Синонимы",
      "antonyms": "Антонимы",
      "collocations": "словосочетания",
      "alternativeMeanings": "Альтернативные значения",
      "usageNotes": "Примечания по использованию",
      "noSynonyms": "Данных о синонимах пока нет.",
      "stats": "Статистика",
      "encountersAndLastMode": "Встречи: {{encounters}} | Последний режим: {{mode}}",
      "nextReminder": "Следующее напоминание",
      "currentPlan": "Текущий план: {{due}}",
      "reviewHint": "Забыл: +10 минут, Сложно: +1 час, Хорошо: растет с +1 дня.",
      "runAdvanced": "Запустите расширенный анализ",
      "reviewForgot": "Забыл",
      "reviewHard": "Жесткий",
      "reviewGood": "Хорошо",
      "reviewOptionAccessibility": "{{title}} выбран. Следующий обзор в {{delay}}.",
      "repeatUnscheduled": "Не запланировано",
      "repeatNow": "Сейчас",
      "repeatAfterMinutes": "{{count}} мин.",
      "repeatAfterHours": "{{count}} час",
      "repeatAfterDays": "{{count}} день",
      "repeatAfterWeeks": "{{count}} неделя",
      "repeatInMinutes": "через {{count}} мин.",
      "repeatInHours": "через {{count}} час",
      "repeatInDays": "через {{count}} день",
      "repeatInWeeks": "через {{count}} неделю",
      "repeatNotificationTitle": "Время проверки: {{word}}",
      "repeatNotificationBody": "Просмотрите слово {{word}}.",
      "reportIssue": "Сообщить о неправильном значении",
      "reportIssueAccessibility": "Сообщить о неправильном значении {{word}}",
      "deleteWord": "Удалить слово",
      "deleteWordAccessibility": "Мягкое удаление {{word}}",
      "deleteConfirmTitle": "Удалить это слово?",
      "deleteConfirmBody": "«{{word}}» будет удален из вашего списка. Вы можете добавить его позже.",
      "deleteConfirmCancel": "Отмена",
      "deleteConfirmAction": "Да, удалить"
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
      "title": "Значение отчета",
      "subtitle": "Если «{{word}}» в этом контексте выглядит неправильно, сообщите нам, в чем дело.",
      "messageLabel": "Что кажется неправильным?",
      "messagePlaceholder": "Пример: Это значение не соответствует предложению. Оно должно описывать общение, а не местоположение.",
      "charactersLeft": "Осталось {{count}} символов",
      "submit": "Отправить отчет",
      "successTitle": "Отчет отправлен",
      "successBody": "Спасибо за отзыв. Мы рассмотрим этот товар.",
      "backToDetail": "Вернуться к деталям слова",
      "errors": {
        "unauthorized": "Срок действия вашей сессии истек. Пожалуйста, войдите еще раз.",
        "cannotConnect": "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.",
        "itemNotFound": "Словесный элемент не найден.",
        "submitFailed": "Не удалось отправить отчет. Пожалуйста, попробуйте еще раз."
      },
      "accessibility": {
        "goBack": "Вернуться назад",
        "submit": "Отправить отчет о проблеме",
        "backToDetail": "Вернуться к деталям слова"
      }
    },
    "capture": {
      "backButton": "Библиотека",
      "headerTitle": "Добавить слово",
      "headerBody": "Вставьте предложение и выберите слово, которое хотите сохранить.",
      "seedWordLabel": "Ищу: {{word}}",
      "pasteHero": {
        "title": "Вставить скопированный текст",
        "body": "Скопируйте предложение или абзац, а затем вставьте его, чтобы открыть окно выбора.",
        "bodyWithWord": "Скопируйте предложение, содержащее «{{word}}», а затем вставьте его, чтобы открыть средство выбора.",
        "hint": "Средство выбора открывается автоматически после вставки."
      },
      "picker": {
        "title": "Выбери слово в тексте",
        "body": "Нажмите на точное слово ниже. Вставьте еще раз, если вы скопировали другое предложение.",
        "badge": "Выбор слов",
        "hint": "VocOrbit автоматически создает карточку слова на основе этого поиска."
      },
      "status": {
        "pasteFirst": "Вставьте скопированный текст, чтобы начать.",
        "selectedWord": "Выбранное слово: {{word}}",
        "seedWordMissing": "Вставьте предложение с «{{word}}» или выберите другое слово ниже.",
        "selectWord": "Нажмите точное слово ниже, чтобы продолжить."
      },
      "actions": {
        "pasteCopiedText": "Вставить скопированный текст",
        "pasteAgain": "Вставить еще раз",
        "clear": "Прозрачный",
        "readingClipboard": "Чтение буфера обмена...",
        "reading": "Чтение...",
        "analyzeAndSave": "Анализируйте и сохраняйте",
        "loadingMeaning": "Получение основного смысла...",
        "openSavedWord": "Открыть сохраненное слово",
        "backToLibrary": "Вернуться в библиотеку",
        "pickAnotherWord": "Выбери другое слово"
      },
      "loading": {
        "title": "Базовая информация",
        "body": "VocOrbit сопоставляет выбранное слово с этим предложением."
      },
      "result": {
        "title": "Основное значение",
        "savedFallback": "Сохранено в вашей библиотеке.",
        "contextMeaning": "Контекстное значение",
        "whyThisMeaning": "Почему это значение"
      },
      "problems": {
        "clipboardUnavailableTitle": "Буфер обмена недоступен",
        "clipboardUnavailableBody": "Доступ к буферу обмена заблокирован в этом контексте браузера. Вставьте предложение вручную.",
        "contextRequiredTitle": "Требуется контекст",
        "contextRequiredBody": "Вставьте предложение или короткий абзац перед выбором слова.",
        "selectWordTitle": "Выбрать слово в тексте",
        "selectWordBody": "Прежде чем запускать поиск, щелкните точное слово внутри текстового блока.",
        "signInRequiredTitle": "Требуется вход",
        "signInRequiredBody": "Срок действия вашей сессии истек. Откройте VocOrbit еще раз и войдите в систему, прежде чем повторять поиск.",
        "basicCreditsRequiredTitle": "Требуются базовые кредиты",
        "basicCreditsRequiredBody": "В вашей учетной записи сейчас невозможно выполнить базовый поиск.",
        "requestTimedOutTitle": "Время запроса истекло",
        "requestTimedOutBody": "Поиск занял слишком много времени. Попробуйте еще раз с тем же предложением.",
        "connectionProblemTitle": "Проблема с подключением",
        "connectionProblemBody": "VocOrbit не удалось связаться с сервером. Проверьте соединение и повторите попытку.",
        "lookupFailedTitle": "Поиск не удался",
        "lookupFailedBody": "VocOrbit не удалось завершить этот запрос на понимание.",
        "lookupIncompleteTitle": "Поиск не завершен",
        "lookupIncompleteBody": "VocOrbit вернул неожиданный ответ. Попробуйте еще раз."
      }
    }
  }
}

export default ru
