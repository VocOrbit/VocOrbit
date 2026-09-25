import { Translations } from "./en"

const pl: Translations = {
  "common": {
    "ok": "OK!",
    "cancel": "Anuluj",
    "back": "Cofnij",
    "logOut": "Wyloguj się"
  },
  "welcomeScreen": {
    "postscript": "psst  — Twoja aplikacja prawdopodobnie nie wygląda tak. (O ile Twój projektant nie wręczył Ci tych ekranów, a w takim razie wyślij je!)",
    "readyForLaunch": "Twoja aplikacja jest już prawie gotowa do uruchomienia!",
    "exciting": "(och, to ekscytujące!)",
    "letsGo": "Jazda!"
  },
  "errorScreen": {
    "title": "Wystąpił błąd.",
    "friendlySubtitle": "Jest to ekran, który użytkownicy zobaczą podczas produkcji, gdy zostanie wyświetlony błąd. Będziesz chciał dostosować tę wiadomość (znajdującą się w `app/i18n/en.ts`), a także prawdopodobnie układ (`app/screens/ErrorScreen`). Jeśli chcesz usunąć to całkowicie, sprawdź `app/app.tsx` pod kątem komponentu <ErrorBoundary>.",
    "reset": "Zresetuj aplikację",
    "traceTitle": "Błąd ze stosu %{name}"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "Tak pusto... tak smutno",
      "content": "Nie znaleziono jeszcze danych. Spróbuj kliknąć przycisk, aby odświeżyć lub ponownie załadować aplikację.",
      "button": "Spróbujmy jeszcze raz "
    }
  },
  "errors": {
    "invalidEmail": "Nieprawidłowy adres e-mail."
  },
  "loginScreen": {
    "logIn": "Zaloguj się",
    "subtitle": "Kontynuuj za pomocą konta społecznościowego, aby uzyskać dostęp do postępów w zakresie słownictwa.",
    "continueWith": "Kontynuuj z",
    "regionTitle": "Województwo",
    "regionSubtitle": "Aktualnie: {{region}}",
    "regionNotSelected": "Nie wybrano",
    "changeRegion": "Zmień",
    "signingIn": "Logowanie...",
    "googleButton": "Google",
    "appleButton": "Apple (wkrótce)",
    "moreProvidersSoon": "Wkrótce dostępnych będzie więcej dostawców.",
    "accessibility": {
      "openRegionSelection": "Wybór regionu"
    },
    "errors": {
      "unauthorized": "Uwierzytelnianie nie powiodło się. Zaloguj się ponownie.",
      "cannotConnect": "Nie można połączyć się z serwerem. Proszę spróbować ponownie!",
      "server": "Weryfikacja serwera nie powiodła się. Spróbuj ponownie za chwilę.",
      "rejected": "Żądanie logowania zostało odrzucone. Sprawdź konfigurację autoryzacji.",
      "badData": "Nieoczekiwana odpowiedź otrzymana z serwera.",
      "generic": "Nie udało się dokończyć logowania. Spróbuj ponownie.",
      "googleCancelled": "Logowanie Google zostało anulowane.",
      "googleUnavailable": "Logowanie Google jest niedostępne na tym urządzeniu.",
      "googleFailed": "Logowanie Google nie powiodło się. Spróbuj ponownie."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "Wybierz język",
    "titleSettings": "Preferencje językowe",
    "subtitleOnboarding": "Wybierz język ojczysty i docelowy z globalnej listy z flagami i krajami.",
    "subtitleSettings": "Zaktualizuj tutaj swój język ojczysty i docelowy, podając informacje o fladze i kraju.",
    "currentPair": "Bieżąca para",
    "availableOptionsCount": "Dostępne opcje języka/kraju: {{count}}",
    "nativeLanguageTitle": "Język ojczysty",
    "nativeLanguageBody": "Tłumaczenia i wyjaśnienia będą wyświetlane w tym języku.",
    "learningLanguageTitle": "Nauka języka",
    "learningLanguageBody": "Definicje i konteksty będą generowane w tym języku.",
    "selectedLabel": "Wybrane",
    "pickerTitleL1": "Wybierz język ojczysty",
    "pickerTitleL2": "Wybierz język do nauki",
    "searchPlaceholder": "Wyszukaj język lub kraj",
    "noResults": "Nie znaleziono wyników.",
    "saving": "Zapisywanie...",
    "continue": "Kontynuuj",
    "save": "Zapisz",
    "accessibility": {
      "goBack": "Wstecz",
      "selectNativeLanguage": "Wybierz język ojczysty",
      "selectLearningLanguage": "Wybierz język do nauki",
      "continueWithSelectedLanguages": "Kontynuuj z wybranymi językami",
      "saveLanguages": "Zapisz języki",
      "closeLanguagePicker": "Zamknij selektor języka",
      "closePicker": "Zamknij wybierającego",
      "selectLanguageItem": "Wybierz {{language}} {{country}}"
    },
    "errors": {
      "cannotConnect": "Nie można połączyć się z serwerem. Proszę spróbować ponownie!",
      "unauthorized": "Sesja jest nieprawidłowa. Zaloguj się ponownie.",
      "validation": "Nie można zapisać preferencji językowych. Sprawdź swoje dane wejściowe.",
      "server": "Wystąpił błąd serwera. Spróbuj ponownie za chwilę.",
      "saveFailed": "Nie można zapisać preferencji językowych. Spróbuj ponownie.",
      "noSession": "Nie znaleziono aktywnej sesji. Zaloguj się ponownie.",
      "selectTwoLanguages": "Wybierz oba języki.",
      "sameLanguagePair": "Język ojczysty i język do nauki nie mogą być takie same."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "Jeszcze raz",
      "signIn": "Zaloguj się",
      "favoriteLabel": "Ulubione",
      "learnedLabel": "Nauczone",
      "detailButton": "Otwórz szczegóły"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "Jak działa VocOrbit",
      "subtitle": "Rzeczywisty przepływ: wybierz zdanie poza aplikacją, wybierz słowo, a następnie naucz się go za pomocą kontekstu w VocOrbit.",
      "progress": "Krok {{current}} / {{total}}",
      "progressSingle": "Krok {{current}}",
      "mock": {
        "contextLabel": "Zdanie kontekstowe",
        "selectedWordLabel": "Wybrane słowo",
        "meaningLabel": "Podstawowe znaczenie",
        "whyLabel": "rynków zagranicznych w tym"
      },
      "flowTitle": "Poznaj przepływ w 3 szybkich krokach",
      "highlightsTitle": "Co otrzymujesz",
      "actions": {
        "previous": "Poprzednie",
        "next": "Następny krok",
        "enterApp": "Zacznij naukę",
        "showExample": "Show example",
        "hideExample": "Ukryj przykład"
      },
      "steps": {
        "step1": {
          "step": "KROK 1 • Podziel się zdaniem",
          "title": "Wybierz zdanie, w którym pojawia się słowo",
          "body": "Naciśnij i przytrzymaj tekst w przeglądarce, notatkach lub dowolnej aplikacji i wyślij go do rozszerzenia VocOrbit Share Extension.",
          "source": "Kiedy patrzę wstecz, znów jestem pod wrażeniem życiodajnej mocy literatury.",
          "word": "literatura",
          "meaning": "utwory pisane, szczególnie te uznawane za artystyczne",
          "why": "W zdaniu tym odnosi się do książek i sztuki pisanej, które silnie oddziałują na mówcę.",
          "hint": "Wskazówka: Zawsze dziel się pełnym zdaniem, a nie tylko pojedynczym słowem.",
          "bullets": {
            "one": "Współpracuje z przeglądarką, notatkami i wieloma aplikacjami do czytania",
            "two": "Zachowujesz oryginalny kontekst zdania",
            "three": "Nie jest wymagany ręczny proces kopiowania i wklejania"
          }
        },
        "step2": {
          "step": "KROK 2 • Wybierz dokładne słowo",
          "title": "Dotknij jednego słowa i uzyskaj natychmiastowe podstawowe znaczenie",
          "body": "W widoku udostępniania można dotknąć słów. Wybierz jedno słowo docelowe i uruchom podstawową analizę.",
          "source": "Czytanie nie powinno być przedstawiane dzieciom jako obowiązek, powinność.",
          "word": "praca",
          "meaning": "rutynowe zadanie, zwykle nieprzyjemne",
          "why": "Tutaj „obowiązek” podkreśla, że czytanie nie może przypominać pracy przymusowej.",
          "hint": "Wskazówka: jeśli nie masz pewności, zacznij od Basic. Następnie uruchom zaawansowane w aplikacji.",
          "bullets": {
            "one": "Znaczenie jest generowane dla tego dokładnego zdania",
            "two": "Widzicie też, dlaczego ten zmysł jest wybierany",
            "three": "Obsługuje wybraną parę językową"
          }
        },
        "step3": {
          "step": "KROK 3 • Zapisz i zorganizuj",
          "title": "Przenieś przydatne słowa do swojego systemu osobistego",
          "body": "Gdy słowo osiągnie VocOrbit, zaznacz ulubione lub dodaj do listy powtórzeń, aby aktywnie się uczyć.",
          "source": "Skorzystaj z naszego doświadczenia eksperckiego, aby przygotować swój projekt do sukcesu.",
          "word": "expert",
          "meaning": "osoba o szczególnych umiejętnościach lub wiedzy",
          "why": "Opisuje doświadczenie jako wysoce wiarygodne i wykwalifikowane w kontekście tego projektu.",
          "hint": "Wskazówka: Skoncentruj się na liście powtórzeń. 10 aktywnych słów zapewnia lepszą retencję.",
          "bullets": {
            "one": "Lista ulubionych ważnych słów",
            "two": "Powtórz listę dla aktywnej zapamiętywania",
            "three": "Wczytany stan utrzymuje Twoje postępy w czystości"
          }
        },
        "step4": {
          "step": "KROK 4 • Pętla treningowa",
          "title": "Przejrzyj, przećwicz i oznacz jako wyuczone",
          "body": "Używaj trybów ćwiczeń i przypomnień, aż przypomnienie będzie silne, a następnie oznacz słowo jako nauczone.",
          "source": "Chcesz skontaktować się z nami w innej sprawie?",
          "word": "dotrzyj",
          "meaning": "skontaktować się z kimś",
          "why": "W tym kontekście jest to czasownik złożony oznaczający komunikację, a nie fizyczny zasięg.",
          "hint": "Wskazówka: używaj codziennie przypomnień i krótkich sesji, aby osiągnąć stały postęp.",
          "bullets": {
            "one": "Karty do ćwiczeń są tworzone z własnych słów",
            "two": "Cotygodniowe analizy pokazują słabe strony",
            "three": "Nauczone słowa automatycznie opuszczają kolejkę powtórzeń"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "Twoja sesja mogła wygasnąć. Zaloguj się ponownie.",
      "cannotConnect": "Nie można połączyć się z serwerem. Sprawdź połączenie i spróbuj ponownie.",
      "listLoadFailed": "Nie można załadować listy słów. Spróbuj ponownie.",
      "searchLoadFailed": "Nie można załadować wyników wyszukiwania. Spróbuj ponownie.",
      "itemNotFound": "Rejestr nie znaleziony",
      "reloginRequired": "Zaloguj się ponownie, aby kontynuować oglądanie.",
      "favoriteActionFailed": "Akcja: nieudana. Proszę spróbuj ponownie.",
      "detailLoadFailed": "Nie można załadować szczegółów słowa.",
      "stateUpdateFailed": "Nie można zaktualizować stanu. Spróbuj ponownie.",
      "analysisRequestFailed": "Nie można wysłać żądania analizy.",
      "invalidModelOutput": "Format odpowiedzi modelu był nieprawidłowy. Spróbuj ponownie.",
      "analysisTimeout": "Upłynął limit czasu analizy. Spróbuj ponownie.",
      "advancedCreditInsufficient": "Niewystarczająca liczba zaawansowanych kredytów.",
      "basicCreditInsufficient": "Niewystarczająca liczba punktów podstawowych.",
      "advancedAnalysisFailed": "Nie można ukończyć analizy zaawansowanej.",
      "basicAnalysisFailed": "Nie można ukończyć analizy podstawowej.",
      "repeatProgressUpdateFailed": "Nie można zaktualizować postępu powtarzania. Spróbuj ponownie.",
      "missingContext": "Brak kontekstu wymaganego do analizy.",
      "selectedWordNotInSentence": "Wybrane słowo nie występuje w zdaniu kontekstowym.",
      "analysisFailedGeneric": "Nie można ukończyć analizy. Spróbuj ponownie.",
      "unexpected": "Wystąpił nieoczekiwany błąd. "
    },
    "search": {
      "title": "Szukaj",
      "placeholder": "Szukaj według słowa, znaczenia lub wyjaśnienia",
      "loading": "Ładowanie słów...",
      "emptyResult": "Żadne słowa nie pasują do Twojego zapytania.",
      "emptyHint": "Zacznij pisać, aby wyszukać..."
    },
    "showroom": {
      "loading": "Ładowanie listy słów...",
      "emptyTitle": "Bez słów",
      "emptyBody": "Po dodaniu słów za pośrednictwem Word Insight lista ta wypełni się automatycznie.",
      "emptyCta": "Otwarte ogłoszenia",
      "updateAvailableTitle": "Dostępna nowa wersja",
      "updateAvailableBody": "Dotknij, aby zaktualizować i nadal otrzymywać najnowsze ulepszenia.",
      "updateNow": "Aktualizuj teraz",
      "repeatAdded": "{{word}} dodano do listy powtórzeń ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}} usunięto z listy powtórzeń ({{count}}/{{limit}}).",
      "repeatLimitReached": "Osiągnięto limit listy powtórzeń (10/10).",
      "repeatPermissionRequired": "W przypadku przypomnień wymagane jest zezwolenie na powiadomienie. Włącz powiadomienia, aby dodać słowa.",
      "favoriteAdded": "{{word}} dodano do ulubionych.",
      "favoriteRemoved": "{{word}} usunięto z ulubionych.",
      "repeatCleared": "Wyczyszczono listę powtórzeń.",
      "repeatListTitle": "Powtórz listę odtwarzania",
      "repeatCount": "{{count}}/{{limit}} słowa",
      "repeatEmpty": "Lista powtórzeń jest pusta. Dodaj słowa za pomocą przycisku dzwonka poniżej.",
      "clearAll": "Wyczyść wszystko",
      "done": "Gotowe",
      "practice": "Ćwicz",
      "accessibility": {
        "showDetails": "Pokaż szczegóły",
        "favoriteWord": "MOJE ULUBIONE SŁOWO",
        "repeatWordLater": "Powtórz to słowo później",
        "openProfile": "Otwórz profil",
        "openRepeatList": "Otwórz listę powtarzających się słów",
        "openAnnouncements": "Otwarte ogłoszenia",
        "openUpdate": "Otwórz stronę aktualizacji",
        "dismissUpdate": "Odrzuć powiadomienie o aktualizacji",
        "searchWords": "Wyszukuj słowa",
        "switchToCard": "Przełącz na widok karty",
        "switchToList": "Przełącz na listę",
        "retryShowroom": "Spróbuj ponownie załadować salon wystawowy",
        "closeRepeatList": "Zamknij listę powtórzeń",
        "clearRepeatList": "Wyczyść listę powtórzeń",
        "removeFromRepeat": "Usuń {{word}} z listy powtórzeń",
        "practiceWord": "Przećwicz to słowo",
        "addWord": "Dodaj słowo"
      },
      "quickAdd": {
        "eyebrow": "Szybkie dodawanie",
        "title": "Dodaj słowo z kontekstu",
        "body": "Wklej zdanie, wybierz właściwe słowo i zapisz je.",
        "action": "Dodaj słowo",
        "actionHint": "Wklej i wybierz"
      }
    },
    "practiceHub": {
      "title": "Ćwicz",
      "sectionLabel": "Ćwicz",
      "selectAnswer": "Wybierz odpowiedź",
      "modeBasic": "Podstawowy",
      "modeAdvanced": "Zaawansowane",
      "loadingTitle": "Wczytywanie katalogu",
      "loadingMessage": "Sprawdzenie, jakie rodzaje ćwiczeń są dla Ciebie dostępne.",
      "loadingQuestionsTitle": "Przygotowywanie pytań próbnych...",
      "loadingQuestionsMessage": "Generowanie pytań na podstawie dostępnych danych słownikowych.",
      "instructions": {
        "matchSynonyms": "Wybierz najbliższy synonim."
      },
      "resultCta": {
        "backToPractice": "ćwiczyć",
        "seeResult": "zobacz wynik",
        "nextWord": "Następne słowo"
      },
      "result": {
        "correctTitle": "Odpowiedź prawidłowa!",
        "incorrectTitle": "That's incorrect.",
        "correctAnswerLabel": "Prawidłowa odpowiedź:",
        "usedInSentenceLabel": "Użyte w zdaniu:",
        "sessionResultLabel": "Wynik sesji"
      },
      "leavePrompt": {
        "title": "Już nas opuszczasz?",
        "keepPlaying": "Graj dalej",
        "leave": "urlop",
        "closePromptAccessibility": "Zamknij monit o urlop",
        "leavePracticeAccessibility": "Opuść trening"
      },
      "hints": {
        "availableCount": "Dostępne słowa: {{count}}",
        "missingSynonyms": "Synonim danych niedostępny",
        "minActiveWords": "Wymagane są co najmniej 2 aktywne słowa"
      },
      "tiles": {
        "meaningMatch": "Znaczenie dopasowania",
        "fillInGap": "Uzupełnij lukę",
        "guessWord": "Odgadnij słowo.",
        "matchSynonyms": "Dopasuj synonimy"
      },
      "accessibility": {
        "goBack": "Wstecz",
        "useMode": "Użyj trybu {{mode}}",
        "closePractice": "Zamknij ćwiczenie"
      },
      "loadState": {
        "noQuestions": {
          "title": "Nie ma jeszcze pytań praktycznych",
          "message": "Potrzebujesz co najmniej 2 aktywnych słów, aby rozpocząć ćwiczenie.",
          "actionLabel": "Dodaj słowa"
        },
        "unauthorized": {
          "title": "Wymagane logowanie",
          "message": "Twoja sesja mogła wygasnąć. Zaloguj się ponownie, aby kontynuować.",
          "actionLabel": "Zaloguj się"
        },
        "forbidden": {
          "title": "Ta funkcja jest niestety tymczasowo niedostępna!",
          "message": "Sprawdź swój plan lub kredyty, aby kontynuować.",
          "actionLabel": "Zdobądź darmowe punkty"
        },
        "rejected": {
          "title": "Za mało danych dla tego trybu",
          "message": "Dodaj więcej słów i spróbuj ponownie.",
          "actionLabel": "Dodaj słowa"
        },
        "server": {
          "title": "Nie można połączyć się z serwerem",
          "message": "Sprawdź swoje połączenie i spróbuj ponownie.",
          "actionLabel": "Jeszcze raz"
        },
        "generic": {
          "title": "Nie można rozpocząć ćwiczeń",
          "message": "Wystąpił błąd. Spróbuj ponownie później.",
          "actionLabel": "Jeszcze raz"
        }
      }
    },
    "announcements": {
      "title": "Ogłoszenia",
      "unreadCount": "{{count}} nieprzeczytane",
      "markAllRead": "Oznacz wszystko jako do odczytu",
      "loading": "Trwa ładowanie ogłoszeń...",
      "empty": "W tej chwili nie ma żadnych ogłoszeń.",
      "openLink": "Otwórz link",
      "openAnnouncement": "Otwarte ogłoszenie: {{title}}",
      "levelInfo": "Info",
      "levelWarning": "Ostrzeżenie",
      "levelCritical": "Krytyczny",
      "loadFailed": "Nie można załadować ogłoszeń. Spróbuj ponownie.",
      "claimFailed": "Żądanie nagrody nie powiodło się. Spróbuj ponownie.",
      "requirementNotMet": "Wymaganie nie zostało jeszcze spełnione. Najpierw zaproś znajomych.",
      "referralCodeMissing": "Brak kodu polecenia dla tego konta.",
      "referralProgress": "Postęp polecenia: {{current}}/{{required}}",
      "shareInvite": "Zaproś znajomego",
      "referralShareMessage": "Dołącz do VocOrbit.\nOtwórz ten link:\n{{link}}",
      "rewardText": "Nagroda: +{{amount}} {{creditType}} kredyty",
      "creditBasic": "podstawowe",
      "creditAdvanced": "zaawansowane",
      "claimReward": "Żądanie",
      "claimingReward": "Twierdzenie",
      "rewardClaimed": "Odebrane"
    },
    "forceUpdate": {
      "title": "Wymagana jest aktualizacja",
      "body": "Do dalszego korzystania z VocOrbit wymagana jest nowa wersja.",
      "updateNow": "Aktualizuj teraz",
      "checkAgain": "Sprawdź ponownie"
    },
    "profile": {
      "title": "Profil",
      "accountDetailsTitle": "Szczegóły konta",
      "accountDetailsSubtitle": "Wyświetl adres e-mail i informacje o koncie.",
      "settingsTitle": "Ustawienia",
      "settingsSubtitle": "Dostosuj rozmiar tekstu i kolejność przycisków akcji.",
      "favoriteWordsTitle": "Ulubione słowa?",
      "favoriteWordsSubtitle": "Wyświetl słowa dodane do ulubionych.",
      "learnedWordsTitle": "Nauczone słowa",
      "learnedWordsSubtitle": "Wyświetl słowa oznaczone jako poznane.",
      "weeklyAnalyticsTitle": "Cotygodniowa analityka",
      "weeklyAnalyticsSubtitle": "Zobacz swoje ostatnie 7 dni ćwiczeń.",
      "regionTitle": "Województwo",
      "regionSubtitle": "Aktualnie: {{region}}",
      "regionNotSelected": "Nie wybrano",
      "emptyFavorites": "Nie ma jeszcze ulubionych słów.",
      "emptyLearned": "Nie ma jeszcze nauczonych słów.",
      "loadingList": "Wykaz załadunkowy",
      "logOut": "Wyloguj się",
      "accessibility": {
        "goBack": "Wstecz",
        "openAccountDetails": "Otwórz szczegóły konta",
        "openSettings": "Otwórz ustawienia",
        "openFavoriteWords": "Ulubione słowa?",
        "openLearnedWords": "Otwarte wyuczone słowa",
        "openWeeklyAnalytics": "Otwórz cotygodniowe analizy",
        "openRegion": "Otwórz ustawienia regionu",
        "logOut": "Wyloguj się",
        "playPronunciation": "Odtwórz wymowę dla {{word}}",
        "openDetailForWord": "Otwórz szczegóły dla {{word}}",
        "removeWord": "Usuń {{word}}"
      }
    },
    "settings": {
      "title": "Ustawienia",
      "languagePairTitle": "Para językowa",
      "languagePairSubtitle": "Zmień język ojczysty i język nauki.",
      "billingCreditsTitle": "Rozliczenia i kredyty",
      "billingCreditsSubtitle": "Zarządzaj podstawowymi kredytami znaczeniowymi i pakietami IAP tutaj.",
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
      "themeModeTitle": "Temat",
      "themeModeSubtitle": "Wybierz jasny, ciemny lub postępuj zgodnie z ustawieniami systemu.",
      "themeModeSystem": "System",
      "themeModeLight": "Podpal",
      "themeModeDark": "Mroczny/a/e",
      "textSizeTitle": "Rozmiar czcionki",
      "textSizeSubtitle": "Dostosuj rozmiar tekstu na kartach słownictwa.",
      "actionOrderTitle": "Kolejność działań",
      "actionOrderSubtitle": "Ustaw kolejność przycisków Detail/Favorite/repeat.",
      "actionDetail": "Szczegół",
      "actionFavorite": "Ulubione",
      "actionRepeat": "Powtórz",
      "resetToDefaults": "Powróć do ustawień domyślnych",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "Wstecz",
        "openLanguagePreferences": "Preferencje językowe",
        "openBillingCredits": "Otwarte rozliczenia i kredyty",
        "useSystemTheme": "Motyw systemu",
        "useLightTheme": "Jasny motyw",
        "useDarkTheme": "Użyj ciemnego motywu.",
        "decreaseTextSize": "Zmniejsz wielkość czcionki",
        "increaseTextSize": "Zwiększ wielkość czcionki",
        "moveActionLeft": "Przenieś {{action}} w lewo",
        "moveActionRight": "Przenieś {{action}} w prawo",
        "resetSettings": "Zresetuj ustawienia słownictwa"
      }
    },
    "accountDetails": {
      "title": "Szczegóły konta",
      "emailLabel": "E-mail",
      "userIdLabel": "Identyfikator użytkownika",
      "regionLabel": "Region macierzysty",
      "regionEndpointLabel": "Punkt końcowy regionu",
      "appVersionLabel": "Wersja aplikacji",
      "buildLabel": "Numer kompilacji",
      "platformLabel": "Platforma",
      "osVersionLabel": "Wersja systemu operacyjnego",
      "accessibility": {
        "goBack": "Wstecz",
        "deleteAccount": "Usuń konto trwale"
      },
      "deleteAccount": {
        "sectionTitle": "Usuń konto",
        "sectionBody": "Usuń trwale swoje konto VocOrbit i powiązane z nim dane aplikacji. Tej akcji nie można cofnąć.",
        "action": "Usuń konto trwale",
        "deleting": "Usuwanie konta...",
        "confirmTitle": "Usunąć konto?",
        "confirmBody": "Spowoduje to trwałe usunięcie Twojego konta VocOrbit i powiązanych danych aplikacji. Tej akcji nie można cofnąć.",
        "successTitle": "Konto usunięte",
        "successBody": "Twoje konto VocOrbit zostało trwale usunięte.",
        "missingUser": "Nie można znaleźć identyfikatora Twojego konta. Zaloguj się ponownie.",
        "cannotConnect": "Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie.",
        "sessionExpired": "Twoja sesja wygasła. Zaloguj się ponownie.",
        "failed": "Nie mogliśmy teraz usunąć Twojego konta. Spróbuj ponownie."
      }
    },
    "iap": {
      "title": "Rozliczenia i kredyty",
      "loading": "Trwa ładowanie danych rozliczeniowych...",
      "currentSubscription": "Bieżąca subskrypcja",
      "currentStatus": "Status: {{status}}",
      "currentPlan": "Obecny plan: {{plan}}",
      "noActivePlan": "aktywny plan",
      "refresh": "Odśwież rozliczenia",
      "basicCreditsTitle": "Podstawowe kredyty wglądu",
      "basicCreditsBody": "Podstawowa analiza znaczenia na ekranie udostępniania zużywa ten kredyt.",
      "plansTitle": "Plany",
      "plansBody": "Wybierz plan i dokonaj płatności za pośrednictwem konta swojego sklepu.",
      "noPlans": "Nie znaleziono planów zakupu dla tej platformy.",
      "planTopup": "Doładowanie miesięczne: +{{basic}} Basic · +{{advanced}} Advanced",
      "planCaps": "Czapki: {{basicCap}} Basic · {{advancedCap}} Advanced",
      "priceLabel": "Cena: {{price}}",
      "buyNow": "Kup teraz",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "Przetwarzanie zakupu...",
      "purchaseCanceled": "Zakup został anulowany",
      "purchaseApplied": "{{sku}} aktywowano pomyślnie.",
      "alreadyOwnedRestoring": "Ten element jest już własnością. Przywracanie zakupów...",
      "restorePurchases": "Przywróć zakupy",
      "restoring": "Przywracanie zakupów...",
      "restoreNoPurchases": "Nie znaleziono zakupów do przywrócenia.",
      "restoreNoApplicablePurchases": "Nie można zastosować żadnych zakupów podlegających odnowieniu.",
      "restoreApplied": "Zakupy {{count}} zostały przywrócone i zweryfikowane.",
      "status": {
        "none": "Jak wiele osób się interesuje się tym produktem",
        "pending": "Oczekujące",
        "active": "Aktywny",
        "expired": "Wygasłe",
        "canceled": "Anulowane",
        "refunded": "Zwrócone"
      },
      "errors": {
        "unauthorized": "Sesja wygasła, zaloguj się ponownie.",
        "cannotConnect": "Nie można połączyć się z serwerem. Sprawdź połączenie i spróbuj ponownie.",
        "forbidden": "Nie można zastosować tego zakupu do Twojego konta.",
        "generic": "Żądanie rozliczenia nie powiodło się. Spróbuj ponownie.",
        "purchaseFailed": "Zapis się nie powiódł. Spróbuj ponownie.",
        "alreadyOwned": "Ten przedmiot jest już w posiadaniu tego konta.",
        "invalidReceipt": "Nie można zweryfikować paragonu sklepu.",
        "iapUnavailable": "Usługa zakupu w sklepie jest obecnie niedostępna na tym urządzeniu."
      },
      "accessibility": {
        "goBack": "Wstecz",
        "buyPlan": "Kup plan {{plan}}",
        "restorePurchases": "Przywróć poprzednie zakupy",
        "refresh": "Odśwież stan rozliczeń i subskrypcji"
      },
      "desktop": {
        "subtitle": "Tutaj możesz sprawdzić swoje aktualne saldo. Nowe zakupy i zmiany w subskrypcjach będą kontynuowane na urządzeniach mobilnych.",
        "desktopBadge": "Widok pulpitu",
        "phoneOnlyBadge": "Telefon do zakupów",
        "balanceTitle": "Twoje aktualne saldo",
        "balanceBody": "Program Desktop wyświetla dostępne środki i stan subskrypcji, dzięki czemu możesz sprawdzić swoje konto przed kontynuowaniem nauki.",
        "basicAvailable": "Podstawowe kredyty",
        "advancedAvailable": "Zaawansowane kredyty",
        "freeCredits": "Bezpłatny",
        "paidCredits": "Płatny",
        "noPlanBody": "To konto nie ma obecnie aktywnego planu rozliczeń mobilnych. Nadal możesz korzystać z dostępnych tutaj kredytów.",
        "mobileTitle": "Kontynuuj zakupy na swoim telefonie",
        "mobileBody": "Zakup środków i zmiany subskrypcji można realizować w aplikacji mobilnej za pomocą konta App Store lub Google Play.",
        "storeLabel": "Sklep: {{store}}",
        "renewsOn": "Odnawia się w dniu {{date}}",
        "expiresOn": "Zakończono w dniu {{date}}",
        "updatedOn": "Ostatnia synchronizacja: {{date}}",
        "stepOpenPhone": "Otwórz VocOrbit na swoim telefonie z tym samym kontem.",
        "stepOpenBilling": "Przejdź do opcji Profil > Rozliczenia i środki.",
        "stepFinishPurchase": "Kup tam kredyty lub zarządzaj swoją subskrypcją, a następnie wróć tutaj i odśwież.",
        "mobileHint": "Twoje saldo kredytu jest aktualizowane tutaj po zastosowaniu zakupu mobilnego na tym samym koncie."
      }
    },
    "weeklyAnalytics": {
      "title": "Cotygodniowa analityka",
      "modeAll": "Wszystko",
      "modeBasic": "Podstawowy",
      "modeAdvanced": "Zaawansowane",
      "loading": "Ładowanie cotygodniowych analiz...",
      "summaryTitle": "Podsumowanie (7 dni)",
      "sessions": "Sesje",
      "completed": "Zakończone",
      "answered": "Odebrane",
      "accuracy": "Precyzyjność",
      "activeDays": "Aktywne dni",
      "streak": "Seria",
      "dailyTrend": "Tendencja dzienna",
      "byQuestionType": "Typ pytania",
      "byMode": "Według trybu",
      "weakItems": "Słabe pozycje",
      "noWeakItems": "W tym tygodniu nie znaleziono żadnych słabych słów.",
      "weakItemMeta": "Błąd: {{wrongAnswers}} · Dokładność: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "Znaczenie dopasowania",
      "questionTypeGuessWord": "Odgadnij słowo",
      "questionTypeFillInGap": "Uzupełnij lukę",
      "questionTypeMatchSynonym": "Synonim dopasowania",
      "errors": {
        "unauthorized": "Twoja sesja mogła wygasnąć. Zaloguj się ponownie.",
        "cannotConnect": "Nie można połączyć się z serwerem. Sprawdź połączenie i spróbuj ponownie.",
        "loadFailed": "Nie można załadować cotygodniowych analiz. Spróbuj ponownie."
      },
      "accessibility": {
        "goBack": "Wstecz",
        "filterByMode": "Filtruj według {{mode}}",
        "retry": "Ponów żądanie analizy"
      }
    },
    "detail": {
      "closeDetails": "Zamknij szczegóły słowa",
      "loadingDetail": "Ładowanie szczegółów słowa...",
      "detailLoadFailedTitle": "Nie można załadować szczegółów",
      "statusLearned": ".",
      "statusActive": "aktywne",
      "markAsLearned": "Oznacz jako nauczony",
      "moveBackToActive": "Wróć do aktywności",
      "buyAdvancedCredits": "Kup zaawansowane kredyty",
      "buyBasicCredits": "Kup kredyty podstawowe",
      "buyCredits": "Kup kredyty",
      "whyThisSense": "Dlaczego ten zmysł",
      "examples": "Przykłady",
      "synonyms": "Synonimy",
      "antonyms": "Antonim",
      "collocations": "Kolokacja",
      "alternativeMeanings": "Alternatywne znaczenia",
      "usageNotes": "Uwagi dotyczące użytkowania",
      "noSynonyms": "Brak danych synonimu.",
      "stats": "Statystyki",
      "encountersAndLastMode": "Spotkania: {{encounters}} | Ostatni tryb: {{mode}}",
      "nextReminder": "Następne przypomnienie",
      "currentPlan": "Obecny plan: {{due}}",
      "reviewHint": "Zapomniane: +10 min, trudne: +1 godzina, dobre: rośnie od +1 dnia.",
      "runAdvanced": "Uruchom analizę zaawansowaną",
      "reviewForgot": "Zapomnij",
      "reviewHard": "Twarda",
      "reviewGood": "Dobrze",
      "reviewOptionAccessibility": "Wybrano {{title}}. Następna recenzja za {{delay}}.",
      "repeatUnscheduled": "Nie zaplanowane",
      "repeatNow": "Teraz",
      "repeatAfterMinutes": "{{count}} min",
      "repeatAfterHours": "{{count}} godzina",
      "repeatAfterDays": "{{count}} dzień",
      "repeatAfterWeeks": "{{count}} tydzień",
      "repeatInMinutes": "za {{count}} min",
      "repeatInHours": "za {{count}} godzinę",
      "repeatInDays": "za {{count}} dzień",
      "repeatInWeeks": "za {{count}} tydzień",
      "repeatNotificationTitle": "Czas recenzji: {{word}}",
      "repeatNotificationBody": "Zapoznaj się ze słowem {{word}}.",
      "reportIssue": "Zgłoś niewłaściwe znaczenie",
      "reportIssueAccessibility": "Zgłoś niewłaściwe znaczenie dla {{word}}",
      "deleteWord": "Usuń słowo",
      "deleteWordAccessibility": "Miękkie usuwanie {{word}}",
      "deleteConfirmTitle": "Usunąć to słowo?",
      "deleteConfirmBody": "„{{word}}” zostanie usunięty z Twojej listy. Możesz dodać go ponownie później.",
      "deleteConfirmCancel": "Anuluj",
      "deleteConfirmAction": "Tak, usuń"
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
      "title": "Znaczenie raportu",
      "subtitle": "Jeśli „{{word}}” wygląda źle w tym kontekście, powiedz nam, co jest nie tak.",
      "messageLabel": "Co wydaje się nie tak?",
      "messagePlaceholder": "Przykład: To znaczenie nie pasuje do zdania. Powinien opisywać komunikację, a nie lokalizację.",
      "charactersLeft": "Pozostało znaków: {{count}}",
      "submit": "Wyślij zgłoszenie",
      "successTitle": "Raport został wysłany",
      "successBody": "Dziękujemy za opinię. Sprawdzimy ten element.",
      "backToDetail": "Powrót do szczegółów słowa",
      "errors": {
        "unauthorized": "Sesja wygasła, zaloguj się ponownie.",
        "cannotConnect": "Nie można połączyć się z serwerem. Sprawdź połączenie i spróbuj ponownie.",
        "itemNotFound": "Nie można znaleźć elementu programu Word.",
        "submitFailed": "Nie można przesłać raportu. Spróbuj ponownie."
      },
      "accessibility": {
        "goBack": "Wstecz",
        "submit": "Wyślij raport o problemie",
        "backToDetail": "Powrót do szczegółów słowa"
      }
    },
    "capture": {
      "backButton": "Biblioteka",
      "headerTitle": "Dodaj słowo",
      "headerBody": "Wklej zdanie i wybierz słowo, które chcesz zapisać.",
      "seedWordLabel": "Poszukuje: {{word}}",
      "pasteHero": {
        "title": "Wklej skopiowany tekst",
        "body": "Skopiuj zdanie lub akapit, a następnie wklej je, aby otworzyć selektor.",
        "bodyWithWord": "Skopiuj zdanie zawierające „{{word}}”, a następnie wklej je, aby otworzyć selektor.",
        "hint": "Selektor otwiera się automatycznie po wklejeniu."
      },
      "picker": {
        "title": "Wybierz słowo w tekście",
        "body": "Kliknij dokładnie słowo poniżej. Wklej ponownie, jeśli skopiowałeś inne zdanie.",
        "badge": "Selektor słów",
        "hint": "VocOrbit automatycznie tworzy kartę słowną na podstawie tego wyszukiwania."
      },
      "status": {
        "pasteFirst": "Aby rozpocząć, wklej skopiowany tekst.",
        "selectedWord": "Wybrane słowo: {{word}}",
        "seedWordMissing": "Wklej zdanie zawierające „{{word}}” lub wybierz inne słowo poniżej.",
        "selectWord": "Kliknij dokładnie słowo poniżej, aby kontynuować."
      },
      "actions": {
        "pasteCopiedText": "Wklej skopiowany tekst",
        "pasteAgain": "Wklej ponownie",
        "clear": "Jasne",
        "readingClipboard": "Czytanie schowka...",
        "reading": "Czytanie...",
        "analyzeAndSave": "Analizuj i oszczędzaj",
        "loadingMeaning": "Uzyskanie podstawowego znaczenia...",
        "openSavedWord": "Otwórz zapisane słowo",
        "backToLibrary": "Powrót do biblioteki",
        "pickAnotherWord": "Wybierz inne słowo"
      },
      "loading": {
        "title": "Uruchamianie podstawowych informacji",
        "body": "VocOrbit dopasowuje wybrane słowo do tego zdania."
      },
      "result": {
        "title": "Podstawowe znaczenie",
        "savedFallback": "Zapisano w Twojej bibliotece.",
        "contextMeaning": "Znaczenie kontekstu",
        "whyThisMeaning": "Dlaczego takie znaczenie"
      },
      "problems": {
        "clipboardUnavailableTitle": "Schowek niedostępny",
        "clipboardUnavailableBody": "Dostęp do schowka jest zablokowany w tym kontekście przeglądarki. Wklej zdanie ręcznie.",
        "contextRequiredTitle": "Wymagany kontekst",
        "contextRequiredBody": "Przed wybraniem słowa wklej zdanie lub krótki akapit.",
        "selectWordTitle": "Wybierz słowo w tekście",
        "selectWordBody": "Przed uruchomieniem wyszukiwania kliknij dokładnie słowo w bloku tekstowym.",
        "signInRequiredTitle": "Wymagane zalogowanie się",
        "signInRequiredBody": "Twoja sesja wygasła. Otwórz ponownie VocOrbit i zaloguj się przed ponowną próbą wyszukiwania.",
        "basicCreditsRequiredTitle": "Wymagane podstawowe kredyty",
        "basicCreditsRequiredBody": "Na Twoim koncie nie można teraz przeprowadzić podstawowego wyszukiwania.",
        "requestTimedOutTitle": "Upłynął limit czasu żądania",
        "requestTimedOutBody": "Wyszukiwanie trwało zbyt długo. Spróbuj ponownie z tym samym zdaniem.",
        "connectionProblemTitle": "Problem z połączeniem",
        "connectionProblemBody": "VocOrbit nie mógł połączyć się z serwerem. Sprawdź połączenie i spróbuj ponownie.",
        "lookupFailedTitle": "Wyszukiwanie nie powiodło się",
        "lookupFailedBody": "VocOrbit nie mógł dokończyć tego żądania wglądu.",
        "lookupIncompleteTitle": "Wyszukiwanie niekompletne",
        "lookupIncompleteBody": "VocOrbit zwrócił nieoczekiwaną odpowiedź. Spróbuj jeszcze raz."
      }
    }
  }
}

export default pl
