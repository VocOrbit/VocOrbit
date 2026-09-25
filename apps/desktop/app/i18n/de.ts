import { Translations } from "./en"

const de: Translations = {
  "common": {
    "ok": "OK!",
    "cancel": "Abbrechen",
    "back": "Zurück",
    "logOut": "Abmelden"
  },
  "welcomeScreen": {
    "postscript": "psst – So sieht Ihre App wahrscheinlich nicht aus. (Es sei denn, Ihr Designer hat Ihnen diese Bildschirme ausgehändigt, und in diesem Fall schicken Sie sie!)",
    "readyForLaunch": "Ihre App, fast bereit für den Start!",
    "exciting": "(ohh, das ist aufregend!)",
    "letsGo": "Lass uns los!"
  },
  "errorScreen": {
    "title": "Etwas ist schiefgelaufen!",
    "friendlySubtitle": "Dies ist der Bildschirm, den Ihre Benutzer in der Produktion sehen, wenn ein Fehler ausgegeben wird. Sie möchten diese Nachricht (in `app/i18n/en.ts`) und wahrscheinlich auch das Layout (`app/screens/ErrorScreen`) anpassen. Wenn Sie dies vollständig entfernen möchten, überprüfen Sie `app/app.tsx` für die Komponente <ErrorBoundary>.",
    "reset": "App zurücksetzen",
    "traceTitle": "Fehler von %{name} Stack"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "So leer... so sad",
      "content": "Noch keine Daten gefunden. Versuchen Sie, auf die Schaltfläche zu klicken, um die App zu aktualisieren oder neu zu laden.",
      "button": "Lassen Sie es uns noch einmal versuchen"
    }
  },
  "errors": {
    "invalidEmail": "Ungültige E-Mail-Adresse."
  },
  "loginScreen": {
    "logIn": "Anmelden",
    "subtitle": "Fahren Sie mit Ihrem sozialen Konto fort, um auf Ihren Wortschatz zuzugreifen Fortschritt.",
    "continueWith": "WEITER MIT",
    "regionTitle": "Region",
    "regionSubtitle": "Aktuell: {{region}}",
    "regionNotSelected": "Nicht ausgewählt",
    "changeRegion": "Ändern",
    "signingIn": "Anmelden...",
    "googleButton": "Google",
    "appleButton": "Apfel",
    "moreProvidersSoon": "Weitere Anbieter werden in Kürze verfügbar sein.",
    "accessibility": {
      "openRegionSelection": "Offene Region Selection"
    },
    "errors": {
      "unauthorized": "Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.",
      "cannotConnect": "Verbindung zum Server konnte nicht hergestellt werden. Bitte versuchen Sie es erneut.",
      "server": "Servervalidierung fehlgeschlagen. Bitte versuchen Sie es in Kürze noch einmal.",
      "rejected": "Anmeldeanfrage wurde abgelehnt. Bitte überprüfen Sie die Authentifizierungskonfiguration.",
      "badData": "Unerwartete Antwort vom Server erhalten.",
      "generic": "Anmeldung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
      "googleCancelled": "Google-Anmeldung wurde abgebrochen.",
      "googleUnavailable": "Google-Anmeldung ist hier nicht verfügbar Gerät.",
      "googleFailed": "Anmeldung bei Google fehlgeschlagen. Bitte versuchen Sie es erneut."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "Wähle dein Sprachpaar",
    "titleSettings": "Spracheinstellungen",
    "subtitleOnboarding": "Wähle deine Muttersprache und Zielsprache aus einer globalen Liste mit Flaggen und Ländern.",
    "subtitleSettings": "Aktualisiere hier deine Muttersprache und Zielsprache mit Flagge und Länderinformationen.",
    "currentPair": "Aktuelles Paar",
    "availableOptionsCount": "{{count}} Sprach-/Länderoptionen verfügbar",
    "nativeLanguageTitle": "Muttersprache",
    "nativeLanguageBody": "Übersetzungen und Erklärungen werden in dieser Sprache angezeigt.",
    "learningLanguageTitle": "Lernsprache",
    "learningLanguageBody": "Definitionen und Kontexte werden in dieser Sprache erzeugt.",
    "selectedLabel": "Ausgewählt",
    "pickerTitleL1": "Muttersprache wählen",
    "pickerTitleL2": "Lernsprache wählen",
    "searchPlaceholder": "Sprache oder Land suchen",
    "noResults": "Keine Ergebnisse gefunden.",
    "saving": "Wird gespeichert...",
    "continue": "Weiter",
    "save": "Speichern",
    "accessibility": {
      "goBack": "Zurück",
      "selectNativeLanguage": "Muttersprache auswählen",
      "selectLearningLanguage": "Lernsprache auswählen",
      "continueWithSelectedLanguages": "Mit ausgewählten Sprachen fortfahren",
      "saveLanguages": "Sprachen speichern",
      "closeLanguagePicker": "Sprachauswahl schließen",
      "closePicker": "Auswahl schließen",
      "selectLanguageItem": "{{language}} {{country}} auswählen"
    },
    "errors": {
      "cannotConnect": "Verbindung zum Server konnte nicht hergestellt werden. Bitte versuchen Sie es erneut.",
      "unauthorized": "Sitzung ist ungültig. Bitte melden Sie sich erneut an.",
      "validation": "Spracheinstellungen konnten nicht gespeichert werden. Bitte überprüfen Sie Ihre Eingaben.",
      "server": "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es in Kürze erneut.",
      "saveFailed": "Spracheinstellungen konnten nicht gespeichert werden. Bitte versuchen Sie es erneut.",
      "noSession": "Keine aktive Sitzung gefunden. Bitte melden Sie sich erneut an.",
      "selectTwoLanguages": "Bitte wählen Sie beide Sprachen aus.",
      "sameLanguagePair": "Muttersprache und Lernsprache können nicht identisch sein."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "Erneut versuchen",
      "signIn": "Anmelden",
      "favoriteLabel": "Favorit",
      "learnedLabel": "Gelernt",
      "detailButton": "Details öffnen"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "Wie VocOrbit tatsächlich funktioniert",
      "subtitle": "Echter Ablauf: Wählen Sie einen Satz außerhalb der App aus, wählen Sie einen aus Wort, dann lerne es mit Kontext in VocOrbit.",
      "progress": "Schritt {{current}} / {{total}}",
      "progressSingle": "Schritt {{current}}",
      "mock": {
        "contextLabel": "Kontext Satz",
        "selectedWordLabel": "Ausgewähltes Wort",
        "meaningLabel": "Grundlegende Bedeutung",
        "whyLabel": "Warum in diesem Kontext"
      },
      "flowTitle": "Lernen Sie den Ablauf in 3 Schritten Schritte",
      "highlightsTitle": "Was Sie bekommen",
      "actions": {
        "previous": "Vorheriger",
        "next": "Nächster Schritt",
        "enterApp": "Lernen beginnen",
        "showExample": "Zeigen Sie eine echte example",
        "hideExample": "Beispiel ausblenden"
      },
      "steps": {
        "step1": {
          "step": "SCHRITT 1 • Teilen Sie einen Satz",
          "title": "Wählen Sie den Satz aus, in dem das Wort vorkommt",
          "body": "Drücken Sie lange auf Text im Browser, in Notizen oder in einer anderen App und senden Sie ihn an die VocOrbit Share Extension.",
          "source": "Wenn ich zurückblicke, bin ich wieder beeindruckt von der lebensspendenden Kraft der Literatur.",
          "word": "Literatur",
          "meaning": "schriftliche Werke, insbesondere die in Betracht gezogenen künstlerisch",
          "why": "In diesem Satz bezieht es sich auf Bücher und geschriebene Kunst, die den Sprecher stark beeinflussen.",
          "hint": "Tipp: Teilen Sie immer den gesamten Satz, nicht nur das einzelne Wort.",
          "bullets": {
            "one": "Funktioniert mit Browser, Notizen und vielen Lektüren apps",
            "two": "Sie behalten den ursprünglichen Satzkontext bei",
            "three": "Kein manueller Kopier- und Einfügevorgang erforderlich"
          }
        },
        "step2": {
          "step": "SCHRITT 2 • Wählen Sie das genaue Wort aus",
          "title": "Tippen Sie auf ein Wort und erhalten Sie sofort die Grundlagen Bedeutung",
          "body": "In der Freigabeansicht können Wörter angetippt werden. Wählen Sie ein Zielwort aus und führen Sie grundlegende Erkenntnisse durch.",
          "source": "Lesen sollte Kindern nicht als lästige Pflicht oder Pflicht präsentiert werden.",
          "word": "lästige Pflicht",
          "meaning": "eine Routineaufgabe, normalerweise unangenehm",
          "why": "Hier „lästige Pflicht“ betont, dass sich Lesen nicht wie Zwangsarbeit anfühlen darf.",
          "hint": "Tipp: Wenn Sie unsicher sind, beginnen Sie mit den Grundlagen. Führen Sie dann die erweiterte App in der App aus.",
          "bullets": {
            "one": "Bedeutung wird für genau diesen Satz generiert",
            "two": "Sie sehen auch, warum diese Bedeutung ausgewählt wurde",
            "three": "Unterstützt Ihr ausgewähltes Sprachpaar"
          }
        },
        "step3": {
          "step": "SCHRITT 3 • Speichern und organisieren",
          "title": "Verschieben Sie nützliche Wörter in Ihr persönliches System",
          "body": "Sobald das Wort VocOrbit erreicht, markieren Sie es als Favorit oder fügen Sie es zur Wiederholungsliste für aktives Lernen hinzu.",
          "source": "Verlassen Sie sich bei der Vorbereitung Ihres Projekts auf unsere Expertenerfahrung Erfolg.",
          "word": "Experte",
          "meaning": "eine Person mit besonderen Fähigkeiten oder Kenntnissen",
          "why": "Es beschreibt die Erfahrung als äußerst zuverlässig und kompetent in diesem Projektkontext.",
          "hint": "Tipp: Halten Sie die Wiederholungsliste fokussiert. 10 aktive Wörter sorgen für eine bessere Erinnerung.",
          "bullets": {
            "one": "Favoritenliste für wichtige Wörter",
            "two": "Wiederholungsliste für aktives Auswendiglernen",
            "three": "Der erlernte Status hält Ihren Fortschritt sauber"
          }
        },
        "step4": {
          "step": "SCHRITT 4 • Üben Schleife",
          "title": "Wiederholen, üben und als gelernt markieren",
          "body": "Verwenden Sie Übungsmodi und Erinnerungen, bis die Erinnerung stark ist, und markieren Sie dann das Wort als gelernt.",
          "source": "Möchten Sie sich über etwas anderes informieren?",
          "word": "Sprechen Sie mit uns",
          "meaning": "um jemanden zu kontaktieren",
          "why": "In diesem Zusammenhang ist es ein Phrasenverb, das Kommunikation bedeutet, nicht physisches Erreichen.",
          "hint": "Tipp: Verwenden Sie täglich Erinnerungen und kurze Sitzungen für stetige Fortschritte.",
          "bullets": {
            "one": "Übungskarten sind aus deinen eigenen Worten aufgebaut",
            "two": "Wöchentliche Analysen zeigen Schwachstellen",
            "three": "Gelernte Wörter verlassen die Wiederholungswarteschlange automatisch"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "Ihre Sitzung ist möglicherweise abgelaufen. Bitte melden Sie sich erneut an.",
      "cannotConnect": "Der Server konnte nicht erreicht werden. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
      "listLoadFailed": "Die Wortliste konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
      "searchLoadFailed": "Suchergebnisse konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
      "itemNotFound": "Wortdatensatz nicht gefunden.",
      "reloginRequired": "Bitte melden Sie sich erneut an, um fortzufahren.",
      "favoriteActionFailed": "Favoritenaktion fehlgeschlagen. Bitte versuchen Sie es erneut.",
      "detailLoadFailed": "Wortdetails konnten nicht geladen werden.",
      "stateUpdateFailed": "Status konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
      "analysisRequestFailed": "Analyseanfrage konnte nicht gesendet werden.",
      "invalidModelOutput": "Modellantwortformat war ungültig. Bitte versuchen Sie es erneut.",
      "analysisTimeout": "Zeitüberschreitung bei der Analyse. Bitte versuchen Sie es erneut.",
      "advancedCreditInsufficient": "Unzureichende erweiterte Credits.",
      "basicCreditInsufficient": "Unzureichende Basis-Credits.",
      "advancedAnalysisFailed": "Erweiterte Analyse konnte nicht abgeschlossen werden.",
      "basicAnalysisFailed": "Basisanalyse konnte nicht abgeschlossen werden abgeschlossen.",
      "repeatProgressUpdateFailed": "Der Wiederholungsfortschritt konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
      "missingContext": "Der für die Analyse erforderliche Kontext fehlt.",
      "selectedWordNotInSentence": "Das ausgewählte Wort wurde im Kontextsatz nicht gefunden.",
      "analysisFailedGeneric": "Analyse konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
      "unexpected": "Ein unerwarteter Fehler ist aufgetreten."
    },
    "search": {
      "title": "Suche",
      "placeholder": "Nach Wort, Bedeutung oder Erklärung suchen",
      "loading": "Wörter werden geladen...",
      "emptyResult": "Keine Wörter passen zu deiner Suche.",
      "emptyHint": "Beginne oben mit der Eingabe, um zu suchen."
    },
    "showroom": {
      "loading": "Wortliste wird geladen...",
      "emptyTitle": "Noch keine Wörter",
      "emptyBody": "Nachdem Sie Wörter über Word Insight hinzugefügt haben, wird diese Liste gefüllt automatisch.",
      "emptyCta": "Ankündigungen öffnen",
      "updateAvailableTitle": "Neue Version verfügbar",
      "updateAvailableBody": "Tippen Sie auf, um zu aktualisieren und weiterhin die neuesten Verbesserungen zu erhalten.",
      "updateNow": "Jetzt aktualisieren",
      "repeatAdded": "{{word}} zur Wiederholungsliste hinzugefügt ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}} wurde aus der Wiederholungsliste entfernt ({{count}}/{{limit}}).",
      "repeatLimitReached": "Sie haben Ihr Wiederholungslistenlimit erreicht (10/10).",
      "repeatPermissionRequired": "Für Erinnerungen ist eine Benachrichtigungserlaubnis erforderlich. Benachrichtigungen zum Hinzufügen von Wörtern aktivieren.",
      "favoriteAdded": "{{word}} zu Favoriten hinzugefügt.",
      "favoriteRemoved": "{{word}} aus Favoriten entfernt.",
      "repeatCleared": "Liste wiederholen gelöscht.",
      "repeatListTitle": "Wiederholungsliste",
      "repeatCount": "{{count}}/{{limit}} Wörter",
      "repeatEmpty": "Die Wiederholungsliste ist leer. Füge Wörter mit dem Glocken-Button hinzu.",
      "clearAll": "Alle löschen",
      "done": "Fertig",
      "practice": "Üben",
      "accessibility": {
        "showDetails": "Details anzeigen",
        "favoriteWord": "Lieblingswort",
        "repeatWordLater": "Dieses Wort später wiederholen",
        "openProfile": "Profil öffnen",
        "openRepeatList": "Wiederholungswortliste öffnen",
        "openAnnouncements": "Ankündigungen öffnen",
        "openUpdate": "Aktualisierungsseite öffnen",
        "dismissUpdate": "Aktualisierungsbenachrichtigung verwerfen",
        "searchWords": "Suchwörter",
        "switchToCard": "Zur Karte wechseln Ansicht",
        "switchToList": "Zur Listenansicht wechseln",
        "retryShowroom": "Versuchen Sie erneut, den Showroom zu laden",
        "closeRepeatList": "Wiederholungsliste schließen",
        "clearRepeatList": "Wiederholungsliste löschen",
        "removeFromRepeat": "Entfernen {{word}} aus der Wiederholungsliste",
        "practiceWord": "Üben Sie dieses Wort",
        "addWord": "Wort hinzufügen"
      },
      "quickAdd": {
        "eyebrow": "Schnell hinzufügen",
        "title": "Wort aus dem Kontext hinzufügen",
        "body": "Füge einen Satz ein, wähle das genaue Wort und speichere es.",
        "action": "Wort hinzufügen",
        "actionHint": "Einfügen und wählen"
      }
    },
    "practiceHub": {
      "title": "Üben",
      "sectionLabel": "ÜBEN",
      "selectAnswer": "ANTWORT AUSWÄHLEN",
      "modeBasic": "Basis",
      "modeAdvanced": "Fortgeschritten",
      "loadingTitle": "Katalog wird geladen",
      "loadingMessage": "Es wird geprüft, welche Übungsarten für dich verfügbar sind.",
      "loadingQuestionsTitle": "Übungsfragen werden vorbereitet...",
      "loadingQuestionsMessage": "Fragen werden basierend auf deinen verfügbaren Vokabeldaten erstellt.",
      "instructions": {
        "matchSynonyms": "Wähle das passendste Synonym."
      },
      "resultCta": {
        "backToPractice": "Zurück zum Üben",
        "seeResult": "Ergebnis ansehen",
        "nextWord": "Nächstes Wort"
      },
      "result": {
        "correctTitle": "Richtig!",
        "incorrectTitle": "Falsch!",
        "correctAnswerLabel": "Richtige Antwort:",
        "usedInSentenceLabel": "Im Satz verwendet:",
        "sessionResultLabel": "Sitzungsergebnis"
      },
      "leavePrompt": {
        "title": "Schon fertig?",
        "keepPlaying": "Weiter üben",
        "leave": "Verlassen",
        "closePromptAccessibility": "Beenden-Dialog schließen",
        "leavePracticeAccessibility": "Übung verlassen"
      },
      "hints": {
        "availableCount": "{{count}} Wörter verfügbar",
        "missingSynonyms": "Synonymdaten nicht verfügbar",
        "minActiveWords": "Mindestens 2 aktive Wörter erforderlich"
      },
      "tiles": {
        "meaningMatch": "Bedeutung zuordnen",
        "fillInGap": "Lücke füllen",
        "guessWord": "Wort erraten",
        "matchSynonyms": "Synonyme zuordnen"
      },
      "accessibility": {
        "goBack": "Zurück",
        "useMode": "{{mode}}-Modus verwenden",
        "closePractice": "Übung schließen"
      },
      "loadState": {
        "noQuestions": {
          "title": "Noch keine Übungsfragen",
          "message": "Du brauchst mindestens 2 aktive Wörter, um zu starten.",
          "actionLabel": "Wörter hinzufügen"
        },
        "unauthorized": {
          "title": "Anmeldung erforderlich",
          "message": "Deine Sitzung ist möglicherweise abgelaufen. Bitte melde dich erneut an.",
          "actionLabel": "Anmelden"
        },
        "forbidden": {
          "title": "Diese Funktion ist derzeit nicht verfügbar",
          "message": "Prüfe deinen Tarif oder deine Guthaben, um fortzufahren.",
          "actionLabel": "Guthaben holen"
        },
        "rejected": {
          "title": "Nicht genug Daten für diesen Modus",
          "message": "Füge mehr Wörter hinzu und versuche es erneut.",
          "actionLabel": "Wörter hinzufügen"
        },
        "server": {
          "title": "Server nicht erreichbar",
          "message": "Prüfe deine Verbindung und versuche es erneut.",
          "actionLabel": "Erneut versuchen"
        },
        "generic": {
          "title": "Übung konnte nicht gestartet werden",
          "message": "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.",
          "actionLabel": "Erneut versuchen"
        }
      }
    },
    "announcements": {
      "title": "Ankündigungen",
      "unreadCount": "{{count}} ungelesen",
      "markAllRead": "Alle als gelesen markieren",
      "loading": "Ankündigungen werden geladen...",
      "empty": "Zurzeit keine Ankündigungen.",
      "openLink": "Link öffnen",
      "openAnnouncement": "Ankündigung öffnen: {{title}}",
      "levelInfo": "Info",
      "levelWarning": "Warnung",
      "levelCritical": "Kritisch",
      "loadFailed": "Ankündigungen konnten nicht geladen werden. Bitte erneut versuchen.",
      "claimFailed": "Belohnungsanspruch fehlgeschlagen. Bitte versuchen Sie es erneut.",
      "requirementNotMet": "Anforderung ist noch nicht erfüllt. Laden Sie zuerst Freunde ein.",
      "referralCodeMissing": "Für dieses Konto fehlt der Empfehlungscode.",
      "referralProgress": "Empfehlungsfortschritt: {{current}}/{{required}}",
      "shareInvite": "Laden Sie einen ein Freund",
      "referralShareMessage": "Treten Sie VocOrbit bei.\nÖffnen Sie diesen Link:\n{{link}}",
      "rewardText": "Belohnung: +{{amount}} {{creditType}} Credits",
      "creditBasic": "Standard",
      "creditAdvanced": "Erweitert",
      "claimReward": "Einlösen",
      "claimingReward": "Beanspruchung ...",
      "rewardClaimed": "Eingelöst"
    },
    "forceUpdate": {
      "title": "Update erforderlich",
      "body": "Eine neue Version ist erforderlich, um VocOrbit weiterhin verwenden zu können.",
      "updateNow": "Jetzt aktualisieren",
      "checkAgain": "Überprüfen Sie es erneut"
    },
    "profile": {
      "title": "Profil",
      "accountDetailsTitle": "Kontodetails",
      "accountDetailsSubtitle": "Sieh dir deine E-Mail und Kontoinformationen an.",
      "settingsTitle": "Einstellungen",
      "settingsSubtitle": "Passe Textgröße und Reihenfolge der Aktionsbuttons an.",
      "favoriteWordsTitle": "Favoriten",
      "favoriteWordsSubtitle": "Wörter anzeigen, die zu Favoriten hinzugefügt wurden.",
      "learnedWordsTitle": "Gelernte Wörter",
      "learnedWordsSubtitle": "Wörter anzeigen, die als gelernt markiert wurden.",
      "weeklyAnalyticsTitle": "Wöchentliche Analysen",
      "weeklyAnalyticsSubtitle": "Sieh dir deine Übungsleistung der letzten 7 Tage an.",
      "regionTitle": "Region",
      "regionSubtitle": "Aktuell: {{region}}",
      "regionNotSelected": "Nicht ausgewählt",
      "emptyFavorites": "Noch keine Favoriten.",
      "emptyLearned": "Noch keine gelernten Wörter.",
      "loadingList": "Liste wird geladen...",
      "logOut": "Abmelden",
      "accessibility": {
        "goBack": "Zurück",
        "openAccountDetails": "Kontodetails öffnen",
        "openSettings": "Einstellungen öffnen",
        "openFavoriteWords": "Favoriten öffnen",
        "openLearnedWords": "Gelernte Wörter öffnen",
        "openWeeklyAnalytics": "Wöchentliche Analysen öffnen",
        "openRegion": "Regionseinstellungen öffnen",
        "logOut": "Abmelden",
        "playPronunciation": "Aussprache für {{word}} abspielen",
        "openDetailForWord": "Details für {{word}} öffnen",
        "removeWord": "{{word}} entfernen"
      }
    },
    "settings": {
      "title": "Einstellungen",
      "languagePairTitle": "Sprachpaar",
      "languagePairSubtitle": "Ändere deine Muttersprache und Lernsprache.",
      "billingCreditsTitle": "Abrechnung & Guthaben",
      "billingCreditsSubtitle": "Verwalte hier Basic-Meaning-Guthaben und IAP-Pakete.",
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
      "themeModeTitle": "Design",
      "themeModeSubtitle": "Wählen Sie hell, dunkel oder folgen Sie Ihrem System Einstellung.",
      "themeModeSystem": "System",
      "themeModeLight": "Hell",
      "themeModeDark": "Dunkel",
      "textSizeTitle": "Textgröße",
      "textSizeSubtitle": "Passe die Textgröße in Vokabelkarten an.",
      "actionOrderTitle": "Reihenfolge der Aktionen",
      "actionOrderSubtitle": "Lege die Reihenfolge der Buttons Detail/Favorit/Wiederholen fest.",
      "actionDetail": "Details",
      "actionFavorite": "Favorit",
      "actionRepeat": "Wiederholen",
      "resetToDefaults": "Auf Standard zurücksetzen",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "Zurück",
        "openLanguagePreferences": "Spracheinstellungen öffnen",
        "openBillingCredits": "Abrechnung und Guthaben öffnen",
        "useSystemTheme": "System verwenden Thema",
        "useLightTheme": "Verwenden Sie ein helles Thema",
        "useDarkTheme": "Verwenden Sie ein dunkles Thema",
        "decreaseTextSize": "Textgröße verkleinern",
        "increaseTextSize": "Textgröße vergrößern",
        "moveActionLeft": "{{action}} nach links verschieben",
        "moveActionRight": "{{action}} nach rechts verschieben",
        "resetSettings": "Vokabeleinstellungen zurücksetzen"
      }
    },
    "accountDetails": {
      "title": "Kontodetails",
      "emailLabel": "E-Mail",
      "userIdLabel": "Benutzer-ID",
      "regionLabel": "Heimatregion",
      "regionEndpointLabel": "Region-Endpunkt",
      "appVersionLabel": "App-Version",
      "buildLabel": "Build-Nummer",
      "platformLabel": "Plattform",
      "osVersionLabel": "OS-Version",
      "accessibility": {
        "goBack": "Zurück",
        "deleteAccount": "Konto dauerhaft löschen"
      },
      "deleteAccount": {
        "sectionTitle": "Konto löschen",
        "sectionBody": "Löschen Sie Ihr VocOrbit-Konto und die damit verknüpften App-Daten dauerhaft. Diese Aktion kann nicht rückgängig gemacht werden.",
        "action": "Konto dauerhaft löschen",
        "deleting": "Konto wird gelöscht...",
        "confirmTitle": "Konto löschen?",
        "confirmBody": "Dadurch werden Ihr VocOrbit-Konto und die verknüpften App-Daten dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
        "successTitle": "Konto gelöscht",
        "successBody": "Ihr VocOrbit-Konto wurde endgültig gelöscht.",
        "missingUser": "Ihre Konto-ID konnte nicht gefunden werden. Bitte melden Sie sich erneut an.",
        "cannotConnect": "Der Server konnte nicht erreicht werden. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
        "sessionExpired": "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
        "failed": "Wir konnten Ihr Konto derzeit nicht löschen. Bitte versuchen Sie es erneut."
      }
    },
    "iap": {
      "title": "Abrechnung & Guthaben",
      "loading": "Abrechnungsdetails werden geladen...",
      "currentSubscription": "Aktuelles Abonnement",
      "currentStatus": "Status: {{status}}",
      "currentPlan": "Aktueller Tarif: {{plan}}",
      "noActivePlan": "Kein aktiver Tarif",
      "refresh": "Abrechnung aktualisieren",
      "basicCreditsTitle": "Basic-Insight-Guthaben",
      "basicCreditsBody": "Die Basic-Meaning-Analyse im Share-Screen verbraucht dieses Guthaben.",
      "plansTitle": "Tarife",
      "plansBody": "Wähle einen Tarif und schließe die Zahlung über dein Store-Konto ab.",
      "noPlans": "Für diese Plattform wurden keine kaufbaren Tarife gefunden.",
      "planTopup": "Monatliches Aufladen: +{{basic}} basic · +{{advanced}} advanced",
      "planCaps": "Limits: {{basicCap}} basic · {{advancedCap}} advanced",
      "priceLabel": "Preis: {{price}}",
      "buyNow": "Jetzt kaufen",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "Kauf wird verarbeitet...",
      "purchaseCanceled": "Kauf abgebrochen.",
      "purchaseApplied": "{{sku}} erfolgreich aktiviert.",
      "alreadyOwnedRestoring": "Dieser Artikel ist bereits im Besitz. Ihre Einkäufe werden wiederhergestellt...",
      "restorePurchases": "Käufe wiederherstellen",
      "restoring": "Käufe werden wiederhergestellt...",
      "restoreNoPurchases": "Keine Käufe zum Wiederherstellen gefunden.",
      "restoreNoApplicablePurchases": "Keine wiederherstellbaren Käufe konnten angewendet werden.",
      "restoreApplied": "{{count}} Kauf/Käufe wiederhergestellt und verifiziert.",
      "status": {
        "none": "Nicht abonniert",
        "pending": "Ausstehend",
        "active": "Aktiv",
        "expired": "Abgelaufen",
        "canceled": "Gekündigt",
        "refunded": "Erstattet"
      },
      "errors": {
        "unauthorized": "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
        "cannotConnect": "Server nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.",
        "forbidden": "Dieser Kauf konnte deinem Konto nicht zugeordnet werden.",
        "generic": "Abrechnungsanfrage fehlgeschlagen. Bitte versuche es erneut.",
        "purchaseFailed": "Kauf fehlgeschlagen. Bitte versuche es erneut.",
        "alreadyOwned": "Dieser Artikel gehört bereits diesem Konto.",
        "invalidReceipt": "Store-Beleg konnte nicht validiert werden.",
        "iapUnavailable": "Der Store-Kaufdienst ist auf diesem Gerät derzeit nicht verfügbar."
      },
      "accessibility": {
        "goBack": "Zurück",
        "buyPlan": "{{plan}}-Tarif kaufen",
        "restorePurchases": "Frühere Käufe wiederherstellen",
        "refresh": "Abrechnung und Abo-Status aktualisieren"
      },
      "desktop": {
        "subtitle": "Sehen Sie hier Ihren aktuellen Kontostand. Neue Käufe und Abonnementänderungen werden auf Mobilgeräten fortgesetzt.",
        "desktopBadge": "Desktop-Ansicht",
        "phoneOnlyBadge": "Telefon für Einkäufe",
        "balanceTitle": "Ihr aktueller Kontostand",
        "balanceBody": "Desktop hält Ihr verfügbares Guthaben und Ihren Abonnementstatus sichtbar, sodass Sie Ihr Konto überprüfen können, bevor Sie mit dem Lernen fortfahren.",
        "basicAvailable": "Grundkredite",
        "advancedAvailable": "Erweiterte Credits",
        "freeCredits": "Frei",
        "paidCredits": "Bezahlt",
        "noPlanBody": "Für dieses Konto ist derzeit kein aktiver Mobilfunkabrechnungsplan vorhanden. Bereits vorhandene Credits können Sie hier weiterhin nutzen.",
        "mobileTitle": "Setzen Sie Ihre Einkäufe auf Ihrem Telefon fort",
        "mobileBody": "Guthabenkäufe und Abonnementänderungen werden in der mobilen App mit Ihrem App Store- oder Google Play-Konto abgeschlossen.",
        "storeLabel": "Shop: {{store}}",
        "renewsOn": "Verlängert am {{date}}",
        "expiresOn": "Endete am {{date}}",
        "updatedOn": "Letzte Synchronisierung: {{date}}",
        "stepOpenPhone": "Öffnen Sie VocOrbit auf Ihrem Telefon mit demselben Konto.",
        "stepOpenBilling": "Gehen Sie zu Profil > Abrechnung und Gutschriften.",
        "stepFinishPurchase": "Kaufen Sie dort Credits oder verwalten Sie Ihr Abonnement. Kehren Sie dann hierher zurück und aktualisieren Sie es.",
        "mobileHint": "Ihr Guthaben wird hier aktualisiert, nachdem der mobile Kauf auf dasselbe Konto angewendet wurde."
      }
    },
    "weeklyAnalytics": {
      "title": "Wöchentliche Analysen",
      "modeAll": "Alle",
      "modeBasic": "Basis",
      "modeAdvanced": "Fortgeschritten",
      "loading": "Wöchentliche Analysen werden geladen...",
      "summaryTitle": "Zusammenfassung (7 Tage)",
      "sessions": "Sitzungen",
      "completed": "Abgeschlossen",
      "answered": "Beantwortet",
      "accuracy": "Genauigkeit",
      "activeDays": "Aktive Tage",
      "streak": "Serie",
      "dailyTrend": "Täglicher Trend",
      "byQuestionType": "Nach Fragetyp",
      "byMode": "Nach Modus",
      "weakItems": "Schwache Einträge",
      "noWeakItems": "Diese Woche wurden keine auffälligen schwachen Wörter gefunden.",
      "weakItemMeta": "Falsch: {{wrongAnswers}} · Genauigkeit: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "Bedeutung zuordnen",
      "questionTypeGuessWord": "Wort erraten",
      "questionTypeFillInGap": "Lücke füllen",
      "questionTypeMatchSynonym": "Synonym zuordnen",
      "errors": {
        "unauthorized": "Deine Sitzung ist möglicherweise abgelaufen. Bitte melde dich erneut an.",
        "cannotConnect": "Der Server konnte nicht erreicht werden. Prüfe deine Verbindung und versuche es erneut.",
        "loadFailed": "Wöchentliche Analysen konnten nicht geladen werden. Bitte versuche es erneut."
      },
      "accessibility": {
        "goBack": "Zurück",
        "filterByMode": "Nach {{mode}} filtern",
        "retry": "Analyseanfrage erneut versuchen"
      }
    },
    "detail": {
      "closeDetails": "Wortdetails schließen",
      "loadingDetail": "Wortdetails werden geladen...",
      "detailLoadFailedTitle": "Details konnten nicht geladen werden",
      "statusLearned": "gelernt",
      "statusActive": "aktiv",
      "markAsLearned": "Als gelernt markieren",
      "moveBackToActive": "Zurück zu aktiv",
      "buyAdvancedCredits": "Erweiterte Guthaben kaufen",
      "buyBasicCredits": "Basis-Guthaben kaufen",
      "buyCredits": "Guthaben kaufen",
      "whyThisSense": "Warum diese Bedeutung",
      "examples": "Beispiele",
      "synonyms": "Synonyme",
      "antonyms": "Antonyme",
      "collocations": "Kollokationen",
      "alternativeMeanings": "Alternative Bedeutungen",
      "usageNotes": "Nutzungshinweise",
      "noSynonyms": "Noch keine Synonymdaten.",
      "stats": "Statistiken",
      "encountersAndLastMode": "Begegnungen: {{encounters}} | Letzter Modus: {{mode}}",
      "nextReminder": "Nächste Erinnerung",
      "currentPlan": "Aktueller Plan: {{due}}",
      "reviewHint": "Vergessen: +10 Min, Schwer: +1 Stunde, Gut: wächst ab +1 Tag.",
      "runAdvanced": "Erweiterte Analyse ausführen",
      "reviewForgot": "Vergessen",
      "reviewHard": "Schwer",
      "reviewGood": "Gut",
      "reviewOptionAccessibility": "{{title}} ausgewählt. Nächste Wiederholung in {{delay}}.",
      "repeatUnscheduled": "Nicht geplant",
      "repeatNow": "Jetzt",
      "repeatAfterMinutes": "{{count}} Min",
      "repeatAfterHours": "{{count}} Std",
      "repeatAfterDays": "{{count}} Tag",
      "repeatAfterWeeks": "{{count}} Woche",
      "repeatInMinutes": "in {{count}} Min",
      "repeatInHours": "in {{count}} Std",
      "repeatInDays": "in {{count}} Tag",
      "repeatInWeeks": "in {{count}} Woche",
      "repeatNotificationTitle": "Zeit für Wiederholung: {{word}}",
      "repeatNotificationBody": "Wiederhole das Wort {{word}}.",
      "reportIssue": "Falsche Bedeutung melden",
      "reportIssueAccessibility": "Falsche Bedeutung für {{word}} melden",
      "deleteWord": "Wort löschen",
      "deleteWordAccessibility": "{{word}} weich löschen",
      "deleteConfirmTitle": "Dieses Wort löschen?",
      "deleteConfirmBody": "\"{{word}}\" wird aus deiner Liste entfernt. Du kannst es später erneut hinzufügen.",
      "deleteConfirmCancel": "Abbrechen",
      "deleteConfirmAction": "Ja, löschen"
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
      "title": "Bedeutung melden",
      "subtitle": "Wenn „{{word}}“ in diesem Zusammenhang falsch aussieht, teilen Sie uns mit, was falsch ist.",
      "messageLabel": "Was scheint falsch zu sein?",
      "messagePlaceholder": "Beispiel: Diese Bedeutung passt nicht zum Satz. Es sollte die Kommunikation beschreiben, nicht den Standort.",
      "charactersLeft": "{{count}} verbleibende Zeichen",
      "submit": "Bericht senden",
      "successTitle": "Bericht gesendet",
      "successBody": "Vielen Dank für das Feedback. Wir werden diesen Artikel überprüfen.",
      "backToDetail": "Zurück zum Wortdetail",
      "errors": {
        "unauthorized": "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
        "cannotConnect": "Server konnte nicht erreicht werden. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
        "itemNotFound": "Word-Element konnte nicht gefunden werden.",
        "submitFailed": "Bericht konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
      },
      "accessibility": {
        "goBack": "Zurück",
        "submit": "Problembericht senden",
        "backToDetail": "Zurück zum Wortdetail"
      }
    },
    "capture": {
      "backButton": "Bibliothek",
      "headerTitle": "Wort hinzufügen",
      "headerBody": "Fügen Sie einen Satz ein und wählen Sie das Wort aus, das Sie speichern möchten.",
      "seedWordLabel": "Auf der Suche nach: {{word}}",
      "pasteHero": {
        "title": "Kopierten Text einfügen",
        "body": "Kopieren Sie einen Satz oder Absatz und fügen Sie ihn dann ein, um die Auswahl zu öffnen.",
        "bodyWithWord": "Kopieren Sie einen Satz, der „{{word}}“ enthält, und fügen Sie ihn dann ein, um die Auswahl zu öffnen.",
        "hint": "Der Picker öffnet sich nach dem Einfügen automatisch."
      },
      "picker": {
        "title": "Wählen Sie das Wort im Text aus",
        "body": "Klicken Sie unten auf das genaue Wort. Wenn Sie einen anderen Satz kopiert haben, fügen Sie ihn erneut ein.",
        "badge": "Wortauswahl",
        "hint": "VocOrbit erstellt die Wortkarte automatisch aus dieser Suche."
      },
      "status": {
        "pasteFirst": "Fügen Sie den kopierten Text ein, um zu beginnen.",
        "selectedWord": "Ausgewähltes Wort: {{word}}",
        "seedWordMissing": "Fügen Sie einen Satz mit „{{word}}“ ein oder wählen Sie unten ein anderes Wort aus.",
        "selectWord": "Klicken Sie unten auf das genaue Wort, um fortzufahren."
      },
      "actions": {
        "pasteCopiedText": "Kopierten Text einfügen",
        "pasteAgain": "Nochmals einfügen",
        "clear": "Klar",
        "readingClipboard": "Zwischenablage wird gelesen...",
        "reading": "Lektüre...",
        "analyzeAndSave": "Analysieren und speichern",
        "loadingMeaning": "Grundlegende Bedeutung verstehen ...",
        "openSavedWord": "Gespeichertes Wort öffnen",
        "backToLibrary": "Zurück zur Bibliothek",
        "pickAnotherWord": "Wählen Sie ein anderes Wort"
      },
      "loading": {
        "title": "Grundlegende Erkenntnisse zum Ausführen",
        "body": "VocOrbit ordnet das ausgewählte Wort diesem Satz zu."
      },
      "result": {
        "title": "Grundlegende Bedeutung",
        "savedFallback": "In Ihrer Bibliothek gespeichert.",
        "contextMeaning": "Kontextbedeutung",
        "whyThisMeaning": "Warum diese Bedeutung"
      },
      "problems": {
        "clipboardUnavailableTitle": "Zwischenablage nicht verfügbar",
        "clipboardUnavailableBody": "Der Zugriff auf die Zwischenablage ist in diesem Browserkontext blockiert. Fügen Sie den Satz manuell ein.",
        "contextRequiredTitle": "Kontext erforderlich",
        "contextRequiredBody": "Fügen Sie einen Satz oder einen kurzen Absatz ein, bevor Sie ein Wort auswählen.",
        "selectWordTitle": "Wählen Sie ein Wort im Text aus",
        "selectWordBody": "Klicken Sie auf das genaue Wort im Textblock, bevor Sie die Suche ausführen.",
        "signInRequiredTitle": "Anmeldung erforderlich",
        "signInRequiredBody": "Ihre Sitzung ist abgelaufen. Öffnen Sie VocOrbit erneut und melden Sie sich an, bevor Sie diese Suche erneut versuchen.",
        "basicCreditsRequiredTitle": "Grundkredit erforderlich",
        "basicCreditsRequiredBody": "Ihr Konto kann derzeit keine einfache Suche durchführen.",
        "requestTimedOutTitle": "Zeitüberschreitung bei der Anfrage",
        "requestTimedOutBody": "Die Suche hat zu lange gedauert. Versuchen Sie es noch einmal mit demselben Satz.",
        "connectionProblemTitle": "Verbindungsproblem",
        "connectionProblemBody": "VocOrbit konnte den Server nicht erreichen. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
        "lookupFailedTitle": "Die Suche ist fehlgeschlagen",
        "lookupFailedBody": "VocOrbit konnte diese Insight-Anfrage nicht abschließen.",
        "lookupIncompleteTitle": "Suche unvollständig",
        "lookupIncompleteBody": "VocOrbit hat eine unerwartete Antwort zurückgegeben. Versuchen Sie es noch einmal."
      }
    }
  }
}

export default de
