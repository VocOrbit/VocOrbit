import { Translations } from "./en"

const it: Translations = {
  "common": {
    "ok": "OK!",
    "cancel": "Annulla",
    "back": "Indietro",
    "logOut": "Esci"
  },
  "welcomeScreen": {
    "postscript": "psst: probabilmente non è l'aspetto della tua app. (A meno che il tuo designer non ti abbia consegnato questi schermi e, in tal caso, spediscili!)",
    "readyForLaunch": "La tua app, quasi pronta per il lancio!",
    "exciting": "(ohh, è emozionante!)",
    "letsGo": "Andiamo!"
  },
  "errorScreen": {
    "title": "Qualcosa è andato storto!",
    "friendlySubtitle": "Questa è la schermata che i tuoi utenti vedranno in produzione quando viene generato un errore. Ti consigliamo di personalizzare questo messaggio (situato in `app/i18n/en.ts`) e probabilmente anche il layout (`app/screens/ErrorScreen`). Se vuoi rimuoverlo completamente, controlla `app/app.tsx` per il componente <ErrorBoundary>.",
    "reset": "RESETTARE L'APP",
    "traceTitle": "Errore dallo stack %{name}"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "Così vuoto... così triste",
      "content": "Nessun dato ancora trovato. Prova a fare clic sul pulsante per aggiornare o ricaricare l'app.",
      "button": "Proviamo di nuovo"
    }
  },
  "errors": {
    "invalidEmail": "Indirizzo e-mail non valido."
  },
  "loginScreen": {
    "logIn": "Accedi",
    "subtitle": "Continua con il tuo account social per accedere ai progressi del tuo vocabolario.",
    "continueWith": "CONTINUA CON",
    "regionTitle": "Regione",
    "regionSubtitle": "Attuale: {{region}}",
    "regionNotSelected": "Non selezionato",
    "changeRegion": "Cambiare",
    "signingIn": "Accesso...",
    "googleButton": "Google",
    "appleButton": "Mela (presto)",
    "moreProvidersSoon": "Presto saranno disponibili altri fornitori.",
    "accessibility": {
      "openRegionSelection": "Apri la selezione della regione"
    },
    "errors": {
      "unauthorized": "Autenticazione non riuscita. Per favore accedi di nuovo.",
      "cannotConnect": "Impossibile connettersi al server. Per favore riprova.",
      "server": "Convalida del server non riuscita. Per favore riprova a breve.",
      "rejected": "La richiesta di accesso è stata rifiutata. Verifica la configurazione dell'autenticazione.",
      "badData": "Risposta imprevista ricevuta dal server.",
      "generic": "Impossibile completare l'accesso. Riprova.",
      "googleCancelled": "L'accesso a Google è stato annullato.",
      "googleUnavailable": "L'accesso a Google non è disponibile su questo dispositivo.",
      "googleFailed": "Accesso a Google non riuscito. Per favore riprova."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "Scegli la tua coppia linguistica",
    "titleSettings": "Preferenze linguistiche",
    "subtitleOnboarding": "Scegli la tua lingua madre e quella di destinazione da un elenco globale con bandiere e paesi.",
    "subtitleSettings": "Aggiorna qui la tua lingua madre e quella di destinazione con le informazioni sulla bandiera e sul paese.",
    "currentPair": "Coppia attuale",
    "availableOptionsCount": "{{count}} opzioni lingua/paese disponibili",
    "nativeLanguageTitle": "Lingua nativa",
    "nativeLanguageBody": "Le traduzioni e le spiegazioni verranno mostrate in questa lingua.",
    "learningLanguageTitle": "Imparare la lingua",
    "learningLanguageBody": "Definizioni e contesti verranno generati in questa lingua.",
    "selectedLabel": "Selezionato",
    "pickerTitleL1": "Scegli la lingua madre",
    "pickerTitleL2": "Scegli la lingua di apprendimento",
    "searchPlaceholder": "Cerca lingua o paese",
    "noResults": "Nessun risultato trovato",
    "saving": "Salvataggio...",
    "continue": "Continua",
    "save": "Salva",
    "accessibility": {
      "goBack": "Torna indietro",
      "selectNativeLanguage": "Seleziona la lingua madre",
      "selectLearningLanguage": "Seleziona la lingua di apprendimento",
      "continueWithSelectedLanguages": "Continua con le lingue selezionate",
      "saveLanguages": "Salva le lingue",
      "closeLanguagePicker": "Chiudi il selettore della lingua",
      "closePicker": "Chiudi selettore",
      "selectLanguageItem": "Seleziona {{language}} {{country}}"
    },
    "errors": {
      "cannotConnect": "Impossibile connettersi al server. Per favore riprova.",
      "unauthorized": "La sessione non è valida. Per favore accedi di nuovo.",
      "validation": "Impossibile salvare le preferenze della lingua. Controlla i tuoi input.",
      "server": "Si è verificato un errore del server. Per favore riprova a breve.",
      "saveFailed": "Impossibile salvare le preferenze della lingua. Per favore riprova.",
      "noSession": "Nessuna sessione attiva trovata. Per favore accedi di nuovo.",
      "selectTwoLanguages": "Seleziona entrambe le lingue.",
      "sameLanguagePair": "La lingua madre e la lingua di apprendimento non possono essere la stessa cosa."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "Riprova",
      "signIn": "Accedi",
      "favoriteLabel": "Preferito",
      "learnedLabel": "Imparato",
      "detailButton": "Apri i dettagli"
    },
    "welcome": {
      "badge": "VOCORBITA",
      "title": "Come funziona effettivamente VocOrbit",
      "subtitle": "Flusso reale: seleziona una frase fuori dall'app, scegli una parola, quindi imparala con il contesto all'interno di VocOrbit.",
      "progress": "Passaggio {{current}} / {{total}}",
      "progressSingle": "Passaggio {{current}}",
      "mock": {
        "contextLabel": "Frase contestuale",
        "selectedWordLabel": "Parola selezionata",
        "meaningLabel": "Significato di base",
        "whyLabel": "Perché in questo contesto"
      },
      "flowTitle": "Scopri il flusso in 3 rapidi passaggi",
      "highlightsTitle": "Cosa ottieni",
      "actions": {
        "previous": "Precedente",
        "next": "Prossimo passo",
        "enterApp": "Inizia ad imparare",
        "showExample": "Show example",
        "hideExample": "Nascondi esempio"
      },
      "steps": {
        "step1": {
          "step": "PASSO 1 • Condividere una frase",
          "title": "Seleziona la frase in cui appare la parola",
          "body": "Premi a lungo il testo nel browser, nelle note o in qualsiasi app e invialo all'estensione VocOrbit Share.",
          "source": "Quando guardo indietro, rimango nuovamente colpito dal potere vivificante della letteratura.",
          "word": "letteratura",
          "meaning": "opere scritte, soprattutto quelle considerate artistiche",
          "why": "In questa frase si riferisce a libri e arte scritta che colpiscono fortemente chi parla.",
          "hint": "Suggerimento: condividi sempre l'intera frase, non solo la singola parola.",
          "bullets": {
            "one": "Funziona con browser, note e molte app di lettura",
            "two": "Mantieni il contesto della frase originale",
            "three": "Non è necessario alcun flusso manuale di copia-incolla"
          }
        },
        "step2": {
          "step": "PASSO 2 • Scegli la parola esatta",
          "title": "Tocca una parola e ottieni immediatamente il significato di base",
          "body": "All'interno della visualizzazione condivisa, le parole sono toccabili. Seleziona una parola target ed esegui informazioni di base.",
          "source": "La lettura non dovrebbe essere presentata ai bambini come un compito ingrato, un dovere.",
          "word": "compito",
          "meaning": "un compito di routine, solitamente spiacevole",
          "why": "Qui il \"lavoro di routine\" sottolinea che la lettura non deve sembrare un lavoro forzato.",
          "hint": "Suggerimento: se non sei sicuro, inizia con il livello base. Quindi esegui la procedura avanzata nell'app.",
          "bullets": {
            "one": "Il significato viene generato per questa frase esatta",
            "two": "Vedi anche perché viene scelto questo senso",
            "three": "Supporta la coppia linguistica selezionata"
          }
        },
        "step3": {
          "step": "PASSO 3 • Salvare e organizzare",
          "title": "Sposta parole utili nel tuo sistema personale",
          "body": "Dopo che la parola raggiunge VocOrbit, contrassegnala come preferita o aggiungila all'elenco delle ripetizioni per l'apprendimento attivo.",
          "source": "Affidati alla nostra esperienza di esperti per impostare il tuo progetto verso il successo.",
          "word": "esperto",
          "meaning": "una persona con abilità o conoscenze speciali",
          "why": "Descrive l'esperienza come altamente affidabile e competente in questo contesto di progetto.",
          "hint": "Suggerimento: mantieni focalizzato l'elenco delle ripetizioni. 10 parole attive garantiscono una migliore ritenzione.",
          "bullets": {
            "one": "Elenco preferiti per parole importanti",
            "two": "Elenco di ripetizione per la memorizzazione attiva",
            "three": "Lo stato appreso mantiene puliti i tuoi progressi"
          }
        },
        "step4": {
          "step": "PASSO 4 • Ciclo di pratica",
          "title": "Rivedi, esercitati e valuta come appreso",
          "body": "Utilizza le modalità di pratica e i promemoria finché il ricordo non è forte, quindi contrassegna la parola come appresa.",
          "source": "Vuoi contattarci per qualcos'altro?",
          "word": "raggiungere",
          "meaning": "per contattare qualcuno",
          "why": "In questo contesto è un verbo frasale che significa comunicazione, non raggiungimento fisico.",
          "hint": "Suggerimento: utilizza promemoria e sessioni brevi ogni giorno per progressi costanti.",
          "bullets": {
            "one": "Le carte di pratica sono costruite con le tue parole",
            "two": "L’analisi settimanale mostra i punti deboli",
            "three": "Le parole apprese lasciano automaticamente la coda di ripetizione"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "La tua sessione potrebbe essere scaduta. Per favore accedi di nuovo.",
      "cannotConnect": "Impossibile raggiungere il server. Controlla la connessione e riprova.",
      "listLoadFailed": "Impossibile caricare l'elenco delle parole. Per favore riprova.",
      "searchLoadFailed": "Impossibile caricare i risultati della ricerca. Per favore riprova.",
      "itemNotFound": "Record di parole non trovato.",
      "reloginRequired": "Accedi nuovamente per continuare.",
      "favoriteActionFailed": "L'azione preferita non è riuscita. Per favore riprova.",
      "detailLoadFailed": "Impossibile caricare i dettagli della parola.",
      "stateUpdateFailed": "Impossibile aggiornare lo stato. Per favore riprova.",
      "analysisRequestFailed": "Impossibile inviare la richiesta di analisi.",
      "invalidModelOutput": "Il formato della risposta del modello non è valido. Per favore riprova.",
      "analysisTimeout": "Analisi scaduta. Per favore riprova.",
      "advancedCreditInsufficient": "Crediti anticipati insufficienti.",
      "basicCreditInsufficient": "Crediti di base insufficienti.",
      "advancedAnalysisFailed": "Impossibile completare l'analisi avanzata.",
      "basicAnalysisFailed": "Impossibile completare l'analisi di base.",
      "repeatProgressUpdateFailed": "Impossibile aggiornare l'avanzamento della ripetizione. Per favore riprova.",
      "missingContext": "Manca il contesto richiesto per l'analisi.",
      "selectedWordNotInSentence": "La parola selezionata non si trova nella frase di contesto.",
      "analysisFailedGeneric": "Impossibile completare l'analisi. Per favore riprova.",
      "unexpected": "Si è verificato un errore imprevisto."
    },
    "search": {
      "title": "Cerca",
      "placeholder": "Cerca per parola, significato o spiegazione",
      "loading": "Caricamento parole...",
      "emptyResult": "Nessuna parola corrisponde alla tua query.",
      "emptyHint": "Inizia a digitare sopra per cercare."
    },
    "showroom": {
      "loading": "Caricamento elenco parole...",
      "emptyTitle": "Ancora nessuna parola",
      "emptyBody": "Dopo aver aggiunto parole tramite Word Insight, questo elenco verrà compilato automaticamente.",
      "emptyCta": "Annunci aperti",
      "updateAvailableTitle": "Nuova versione disponibile",
      "updateAvailableBody": "Tocca per aggiornare e continuare a ricevere gli ultimi miglioramenti.",
      "updateNow": "Aggiorna ora",
      "repeatAdded": "{{word}} aggiunto all'elenco delle ripetizioni ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}} rimosso dall'elenco delle ripetizioni ({{count}}/{{limit}}).",
      "repeatLimitReached": "Hai raggiunto il limite dell'elenco di ripetizioni (10/10).",
      "repeatPermissionRequired": "Per i promemoria è necessaria l'autorizzazione alle notifiche. Abilita le notifiche per aggiungere parole.",
      "favoriteAdded": "{{word}} aggiunto ai preferiti.",
      "favoriteRemoved": "{{word}} rimosso dai preferiti.",
      "repeatCleared": "Elenco ripetizioni cancellato.",
      "repeatListTitle": "Ripeti l'elenco",
      "repeatCount": "{{count}}/{{limit}} parole",
      "repeatEmpty": "L'elenco delle ripetizioni è vuoto. Aggiungi parole con il pulsante campanello qui sotto.",
      "clearAll": "Cancella tutto",
      "done": "Fatto",
      "practice": "Pratica",
      "accessibility": {
        "showDetails": "Mostra dettagli",
        "favoriteWord": "Parola preferita",
        "repeatWordLater": "Ripeti questa parola più tardi",
        "openProfile": "Apri profilo",
        "openRepeatList": "Apri l'elenco delle parole ripetute",
        "openAnnouncements": "Annunci aperti",
        "openUpdate": "Apri la pagina di aggiornamento",
        "dismissUpdate": "Ignora la notifica di aggiornamento",
        "searchWords": "Cerca parole",
        "switchToCard": "Passa alla visualizzazione scheda",
        "switchToList": "Passa alla visualizzazione elenco",
        "retryShowroom": "Prova a caricare nuovamente lo showroom",
        "closeRepeatList": "Chiudi l'elenco delle ripetizioni",
        "clearRepeatList": "Cancella l'elenco delle ripetizioni",
        "removeFromRepeat": "Rimuovi {{word}} dall'elenco delle ripetizioni",
        "practiceWord": "Esercitati con questa parola",
        "addWord": "Aggiungi una parola"
      },
      "quickAdd": {
        "eyebrow": "Aggiunta rapida",
        "title": "Aggiungi una parola dal contesto",
        "body": "Incolla una frase, scegli la parola esatta e salvala.",
        "action": "Aggiungi parola",
        "actionHint": "Incolla e scegli"
      }
    },
    "practiceHub": {
      "title": "Pratica",
      "sectionLabel": "Pratica",
      "selectAnswer": "SELEZIONA RISPOSTA",
      "modeBasic": "Essenziale",
      "modeAdvanced": "Avanzato",
      "loadingTitle": "Caricamento catalogo",
      "loadingMessage": "Verifica quali tipi di esercizi sono disponibili per te.",
      "loadingQuestionsTitle": "Preparazione delle domande pratiche...",
      "loadingQuestionsMessage": "Generazione di domande basate sui dati del vocabolario disponibile.",
      "instructions": {
        "matchSynonyms": "Scegli il sinonimo più vicino."
      },
      "resultCta": {
        "backToPractice": "Ritorno alla pratica",
        "seeResult": "Vedi il risultato",
        "nextWord": "Parola successiva"
      },
      "result": {
        "correctTitle": "È corretto!",
        "incorrectTitle": "Non è corretto!",
        "correctAnswerLabel": "Risposta corretta:",
        "usedInSentenceLabel": "Utilizzato in una frase:",
        "sessionResultLabel": "Risultato della sessione"
      },
      "leavePrompt": {
        "title": "Sei già in partenza?",
        "keepPlaying": "Continua a giocare",
        "leave": "Lascia",
        "closePromptAccessibility": "Chiudi il prompt di congedo",
        "leavePracticeAccessibility": "Lascia la pratica"
      },
      "hints": {
        "availableCount": "{{count}} parole disponibili",
        "missingSynonyms": "Dati sui sinonimi non disponibili",
        "minActiveWords": "Sono richieste almeno 2 parole attive"
      },
      "tiles": {
        "meaningMatch": "Corrispondenza di significato",
        "fillInGap": "Riempi il vuoto",
        "guessWord": "Indovina la parola",
        "matchSynonyms": "Abbina i sinonimi"
      },
      "accessibility": {
        "goBack": "Torna indietro",
        "useMode": "Utilizza la modalità {{mode}}",
        "closePractice": "Pratica ravvicinata"
      },
      "loadState": {
        "noQuestions": {
          "title": "Nessuna domanda pratica ancora",
          "message": "Sono necessarie almeno 2 parole attive per iniziare la pratica.",
          "actionLabel": "Aggiungi parole"
        },
        "unauthorized": {
          "title": "È richiesto l'accesso",
          "message": "La tua sessione potrebbe essere scaduta. Accedi nuovamente per continuare.",
          "actionLabel": "Accedi"
        },
        "forbidden": {
          "title": "Questa funzionalità non è attualmente disponibile",
          "message": "Controlla il tuo piano o i tuoi crediti per continuare.",
          "actionLabel": "Ottieni crediti"
        },
        "rejected": {
          "title": "Dati insufficienti per questa modalità",
          "message": "Aggiungi più parole e riprova.",
          "actionLabel": "Aggiungi parole"
        },
        "server": {
          "title": "Impossibile raggiungere il server",
          "message": "Controlla la connessione e riprova.",
          "actionLabel": "Riprova"
        },
        "generic": {
          "title": "Impossibile avviare la pratica",
          "message": "Si è verificato un errore imprevisto. Per favore riprova.",
          "actionLabel": "Riprova"
        }
      }
    },
    "announcements": {
      "title": "Annunci",
      "unreadCount": "{{count}} non letto",
      "markAllRead": "Segna tutto letto",
      "loading": "Caricamento annunci...",
      "empty": "Nessun annuncio in questo momento.",
      "openLink": "Apri collegamento",
      "openAnnouncement": "Annuncio aperto: {{title}}",
      "levelInfo": "Informazioni",
      "levelWarning": "Avvertimento",
      "levelCritical": "Critico",
      "loadFailed": "Impossibile caricare gli annunci. Per favore riprova.",
      "claimFailed": "La richiesta del premio non è riuscita. Per favore riprova.",
      "requirementNotMet": "Il requisito non è ancora soddisfatto. Invita prima gli amici.",
      "referralCodeMissing": "Manca il codice referral per questo account.",
      "referralProgress": "Avanzamento del referral: {{current}}/{{required}}",
      "shareInvite": "Invita un amico",
      "referralShareMessage": "Unisciti a VocOrbit.\nApri questo collegamento:\n{{link}}",
      "rewardText": "Ricompensa: +{{amount}} {{creditType}} crediti",
      "creditBasic": "basilare",
      "creditAdvanced": "avanzato",
      "claimReward": "Richiedi",
      "claimingReward": "Rivendicando...",
      "rewardClaimed": "Reclamato"
    },
    "forceUpdate": {
      "title": "Aggiornamento richiesto",
      "body": "È necessaria una nuova versione per continuare a utilizzare VocOrbit.",
      "updateNow": "Aggiorna ora",
      "checkAgain": "Controlla di nuovo"
    },
    "profile": {
      "title": "Profilo",
      "accountDetailsTitle": "Dettagli dell'account",
      "accountDetailsSubtitle": "Visualizza la tua email e le informazioni sull'account.",
      "settingsTitle": "Impostazioni",
      "settingsSubtitle": "Personalizza la dimensione del testo e l'ordine dei pulsanti di azione.",
      "favoriteWordsTitle": "Parole preferite",
      "favoriteWordsSubtitle": "Visualizza le parole aggiunte ai preferiti.",
      "learnedWordsTitle": "Parole apprese",
      "learnedWordsSubtitle": "Visualizza le parole contrassegnate come apprese.",
      "weeklyAnalyticsTitle": "Analisi settimanale",
      "weeklyAnalyticsSubtitle": "Visualizza le tue prestazioni di allenamento degli ultimi 7 giorni.",
      "regionTitle": "Regione",
      "regionSubtitle": "Attuale: {{region}}",
      "regionNotSelected": "Non selezionato",
      "emptyFavorites": "Nessuna parola preferita ancora.",
      "emptyLearned": "Nessuna parola imparata ancora.",
      "loadingList": "Caricamento elenco...",
      "logOut": "Esci",
      "accessibility": {
        "goBack": "Torna indietro",
        "openAccountDetails": "Apri i dettagli del conto",
        "openSettings": "Apri le impostazioni",
        "openFavoriteWords": "Apri le parole preferite",
        "openLearnedWords": "Apri le parole apprese",
        "openWeeklyAnalytics": "Apri analisi settimanali",
        "openRegion": "Apri le impostazioni della regione",
        "logOut": "Esci",
        "playPronunciation": "Riproduci la pronuncia per {{word}}",
        "openDetailForWord": "Apri dettaglio per {{word}}",
        "removeWord": "Rimuovi {{word}}"
      }
    },
    "settings": {
      "title": "Impostazioni",
      "languagePairTitle": "Coppia linguistica",
      "languagePairSubtitle": "Cambia la tua lingua madre e quella di apprendimento.",
      "billingCreditsTitle": "Fatturazione e crediti",
      "billingCreditsSubtitle": "Gestisci qui i crediti di significato di base e i pacchetti IAP.",
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
      "themeModeSubtitle": "Scegli la luce, il buio o segui le impostazioni di sistema.",
      "themeModeSystem": "Sistema",
      "themeModeLight": "Chiaro",
      "themeModeDark": "Scuro",
      "textSizeTitle": "Dimensione del testo",
      "textSizeSubtitle": "Regola la dimensione del testo nelle schede del vocabolario.",
      "actionOrderTitle": "Ordine di azione",
      "actionOrderSubtitle": "Imposta l'ordine dei pulsanti dettaglio/preferiti/ripeti.",
      "actionDetail": "Dettaglio",
      "actionFavorite": "Preferito",
      "actionRepeat": "Ripeti",
      "resetToDefaults": "Ripristina le impostazioni predefinite",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "Torna indietro",
        "openLanguagePreferences": "Apri le preferenze della lingua",
        "openBillingCredits": "Fatturazione e crediti aperti",
        "useSystemTheme": "Usa tema di sistema",
        "useLightTheme": "Tema chiaro",
        "useDarkTheme": "Usa un tema scuro",
        "decreaseTextSize": "Diminuisci la dimensione del testo",
        "increaseTextSize": "Aumenta la dimensione del testo",
        "moveActionLeft": "Sposta {{action}} a sinistra",
        "moveActionRight": "Sposta {{action}} a destra",
        "resetSettings": "Ripristina le impostazioni del vocabolario"
      }
    },
    "accountDetails": {
      "title": "Dettagli dell'account",
      "emailLabel": "E-mail",
      "userIdLabel": "ID utente",
      "regionLabel": "Regione di origine",
      "regionEndpointLabel": "Endpoint della regione",
      "appVersionLabel": "Versione dell'app",
      "buildLabel": "Numero di costruzione",
      "platformLabel": "Piattaforma",
      "osVersionLabel": "Versione del sistema operativo",
      "accessibility": {
        "goBack": "Torna indietro",
        "deleteAccount": "Elimina l'account in modo permanente"
      },
      "deleteAccount": {
        "sectionTitle": "Elimina account",
        "sectionBody": "Elimina definitivamente il tuo account VocOrbit e i dati dell'app ad esso collegati. Questa azione non può essere annullata.",
        "action": "Elimina l'account in modo permanente",
        "deleting": "Eliminazione account...",
        "confirmTitle": "Eliminare l'account?",
        "confirmBody": "Questa operazione eliminerà definitivamente il tuo account VocOrbit e i dati delle app collegate. Questa azione non può essere annullata.",
        "successTitle": "Conto eliminato",
        "successBody": "Il tuo account VocOrbit è stato eliminato definitivamente.",
        "missingUser": "Impossibile trovare l'ID del tuo account. Per favore accedi di nuovo.",
        "cannotConnect": "Impossibile raggiungere il server. Controlla la connessione e riprova.",
        "sessionExpired": "La tua sessione è scaduta. Per favore accedi di nuovo.",
        "failed": "Non è stato possibile eliminare il tuo account in questo momento. Per favore riprova."
      }
    },
    "iap": {
      "title": "Fatturazione e crediti",
      "loading": "Caricamento dettagli di fatturazione...",
      "currentSubscription": "Abbonamento attuale",
      "currentStatus": "Stato: {{status}}",
      "currentPlan": "Piano attuale: {{plan}}",
      "noActivePlan": "Nessun piano attivo",
      "refresh": "Aggiorna fatturazione",
      "basicCreditsTitle": "Crediti di approfondimento di base",
      "basicCreditsBody": "L'analisi del significato di base nella schermata di condivisione consuma questo credito.",
      "plansTitle": "Piani",
      "plansBody": "Scegli un piano e completa il pagamento tramite l'account del tuo negozio.",
      "noPlans": "Nessun piano acquistabile trovato per questa piattaforma.",
      "planTopup": "Ricarica mensile: +{{basic}} base · +{{advanced}} avanzato",
      "planCaps": "Maiuscole: {{basicCap}} base · {{advancedCap}} avanzato",
      "priceLabel": "Prezzo: {{price}}",
      "buyNow": "Acquista ora",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "Elaborazione dell'acquisto in corso...",
      "purchaseCanceled": "Acquisto annullato.",
      "purchaseApplied": "{{sku}} attivato con successo.",
      "alreadyOwnedRestoring": "Questo oggetto è già di proprietà. Ripristino dei tuoi acquisti in corso...",
      "restorePurchases": "Ripristina gli acquisti",
      "restoring": "Ripristino degli acquisti...",
      "restoreNoPurchases": "Nessun acquisto trovato da ripristinare.",
      "restoreNoApplicablePurchases": "Non è stato possibile applicare acquisti ripristinabili.",
      "restoreApplied": "{{count}} acquisti ripristinati e verificati.",
      "status": {
        "none": "Non iscritto",
        "pending": "In sospeso",
        "active": "Attivo",
        "expired": "Scaduto",
        "canceled": "Annullato",
        "refunded": "Rimborsato"
      },
      "errors": {
        "unauthorized": "La tua sessione è scaduta. Per favore accedi di nuovo.",
        "cannotConnect": "Impossibile raggiungere il server. Controlla la connessione e riprova.",
        "forbidden": "Impossibile applicare questo acquisto per il tuo account.",
        "generic": "Richiesta di fatturazione non riuscita. Per favore riprova.",
        "purchaseFailed": "Acquisto fallito. Per favore riprova.",
        "alreadyOwned": "Questo articolo è già di proprietà di questo account.",
        "invalidReceipt": "Impossibile convalidare la ricevuta del negozio.",
        "iapUnavailable": "Il servizio di acquisto in negozio non è attualmente disponibile su questo dispositivo."
      },
      "accessibility": {
        "goBack": "Torna indietro",
        "buyPlan": "Acquista il piano {{plan}}",
        "restorePurchases": "Ripristina gli acquisti precedenti",
        "refresh": "Aggiorna lo stato di fatturazione e abbonamento"
      },
      "desktop": {
        "subtitle": "Controlla il tuo saldo attuale qui. Continuano i nuovi acquisti e le modifiche agli abbonamenti su mobile.",
        "desktopBadge": "Visualizzazione del desktop",
        "phoneOnlyBadge": "Telefono per acquisti",
        "balanceTitle": "Il tuo saldo attuale",
        "balanceBody": "Desktop mantiene visibili i crediti disponibili e lo stato dell'abbonamento, così puoi controllare il tuo account prima di continuare il flusso di apprendimento.",
        "basicAvailable": "Crediti di base",
        "advancedAvailable": "Crediti avanzati",
        "freeCredits": "Gratuito",
        "paidCredits": "Pagato",
        "noPlanBody": "Questo account non ha un piano di fatturazione mobile attivo al momento. Puoi comunque utilizzare eventuali crediti già disponibili qui.",
        "mobileTitle": "Continua gli acquisti sul tuo telefono",
        "mobileBody": "Gli acquisti di crediti e le modifiche agli abbonamenti vengono completati all'interno dell'app mobile con il tuo account App Store o Google Play.",
        "storeLabel": "Negozio: {{store}}",
        "renewsOn": "Si rinnova su {{date}}",
        "expiresOn": "Terminato il {{date}}",
        "updatedOn": "Ultima sincronizzazione: {{date}}",
        "stepOpenPhone": "Apri VocOrbit sul tuo telefono con lo stesso account.",
        "stepOpenBilling": "Vai su Profilo > Fatturazione e crediti.",
        "stepFinishPurchase": "Acquista crediti o gestisci il tuo abbonamento lì, quindi torna qui e aggiorna.",
        "mobileHint": "Il saldo del tuo credito viene aggiornato qui dopo che l'acquisto del dispositivo mobile è stato applicato allo stesso account."
      }
    },
    "weeklyAnalytics": {
      "title": "Analisi settimanale",
      "modeAll": "Tutto",
      "modeBasic": "Essenziale",
      "modeAdvanced": "Avanzato",
      "loading": "Caricamento analisi settimanali...",
      "summaryTitle": "Riepilogo (7 giorni)",
      "sessions": "Sessioni",
      "completed": "Completato",
      "answered": "Risposto",
      "accuracy": "Precisione",
      "activeDays": "Giornate attive",
      "streak": "Striscia",
      "dailyTrend": "Tendenza giornaliera",
      "byQuestionType": "Per tipo di domanda",
      "byMode": "Per modalità",
      "weakItems": "Articoli deboli",
      "noWeakItems": "Nessuna parola debole degna di nota trovata questa settimana.",
      "weakItemMeta": "Sbagliato: {{wrongAnswers}} · Precisione: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "Corrispondenza di significato",
      "questionTypeGuessWord": "Indovina la parola",
      "questionTypeFillInGap": "Riempi lo spazio vuoto",
      "questionTypeMatchSynonym": "Sinonimo corrispondente",
      "errors": {
        "unauthorized": "La tua sessione potrebbe essere scaduta. Per favore accedi di nuovo.",
        "cannotConnect": "Impossibile raggiungere il server. Controlla la connessione e riprova.",
        "loadFailed": "Impossibile caricare l'analisi settimanale. Per favore riprova."
      },
      "accessibility": {
        "goBack": "Torna indietro",
        "filterByMode": "Filtra per {{mode}}",
        "retry": "Riprovare la richiesta di analisi"
      }
    },
    "detail": {
      "closeDetails": "Chiudi i dettagli della parola",
      "loadingDetail": "Caricamento dettaglio parola...",
      "detailLoadFailedTitle": "Impossibile caricare i dettagli",
      "statusLearned": "imparato",
      "statusActive": "attivo",
      "markAsLearned": "Segna come appreso",
      "moveBackToActive": "Torna ad attivo",
      "buyAdvancedCredits": "Acquista crediti avanzati",
      "buyBasicCredits": "Acquista crediti base",
      "buyCredits": "Acquista crediti",
      "whyThisSense": "Perché questo senso",
      "examples": "Esempi",
      "synonyms": "Sinonimi",
      "antonyms": "Contrari",
      "collocations": "Collocazioni",
      "alternativeMeanings": "Significati alternativi",
      "usageNotes": "Note sull'utilizzo",
      "noSynonyms": "Nessun dato sui sinonimi ancora.",
      "stats": "Statistiche",
      "encountersAndLastMode": "Incontri: {{encounters}} | Ultima modalità: {{mode}}",
      "nextReminder": "Prossimo promemoria",
      "currentPlan": "Piano attuale: {{due}}",
      "reviewHint": "Dimenticavo: +10 min, Difficile: +1 ora, Buono: cresce da +1 giorno.",
      "runAdvanced": "Esegui analisi avanzate",
      "reviewForgot": "Dimenticato",
      "reviewHard": "Difficile",
      "reviewGood": "Bene",
      "reviewOptionAccessibility": "{{title}} selezionato. Prossima revisione tra {{delay}}.",
      "repeatUnscheduled": "Non programmato",
      "repeatNow": "Ora",
      "repeatAfterMinutes": "{{count}} min",
      "repeatAfterHours": "{{count}} ora",
      "repeatAfterDays": "{{count}} giorno",
      "repeatAfterWeeks": "{{count}} settimana",
      "repeatInMinutes": "tra {{count}} min",
      "repeatInHours": "tra {{count}} ora",
      "repeatInDays": "tra {{count}} giorno",
      "repeatInWeeks": "tra {{count}} settimana",
      "repeatNotificationTitle": "Tempo di revisione: {{word}}",
      "repeatNotificationBody": "Rivedi la parola {{word}}.",
      "reportIssue": "Segnala significato sbagliato",
      "reportIssueAccessibility": "Segnala significato sbagliato per {{word}}",
      "deleteWord": "Elimina parola",
      "deleteWordAccessibility": "Eliminazione temporanea {{word}}",
      "deleteConfirmTitle": "Eliminare questa parola?",
      "deleteConfirmBody": "\"{{word}}\" verrà rimosso dal tuo elenco. Puoi aggiungerlo di nuovo in seguito.",
      "deleteConfirmCancel": "Annulla",
      "deleteConfirmAction": "Sì, cancella"
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
      "title": "Segnala significato",
      "subtitle": "Se \"{{word}}\" sembra sbagliato in questo contesto, dicci cosa c'è che non va.",
      "messageLabel": "Cosa sembra sbagliato?",
      "messagePlaceholder": "Esempio: questo significato non si adatta alla frase. Dovrebbe descrivere la comunicazione, non la posizione.",
      "charactersLeft": "{{count}} caratteri rimasti",
      "submit": "Invia rapporto",
      "successTitle": "Rapporto inviato",
      "successBody": "Grazie per il feedback Esamineremo questo articolo.",
      "backToDetail": "Torniamo ai dettagli della parola",
      "errors": {
        "unauthorized": "La tua sessione è scaduta. Per favore accedi di nuovo.",
        "cannotConnect": "Impossibile raggiungere il server. Controlla la connessione e riprova.",
        "itemNotFound": "Impossibile trovare l'elemento Word.",
        "submitFailed": "Impossibile inviare il rapporto. Per favore riprova."
      },
      "accessibility": {
        "goBack": "Torna indietro",
        "submit": "Invia rapporto sul problema",
        "backToDetail": "Torniamo ai dettagli della parola"
      }
    },
    "capture": {
      "backButton": "Biblioteca",
      "headerTitle": "Aggiungi parola",
      "headerBody": "Incolla una frase e scegli la parola che vuoi salvare.",
      "seedWordLabel": "In cerca di: {{word}}",
      "pasteHero": {
        "title": "Incolla il testo copiato",
        "body": "Copia una frase o un paragrafo, quindi incollalo per aprire il selettore.",
        "bodyWithWord": "Copia una frase che includa \"{{word}}\", quindi incollala per aprire il selettore.",
        "hint": "Il selettore si apre automaticamente dopo aver incollato."
      },
      "picker": {
        "title": "Scegli la parola nel testo",
        "body": "Fai clic sulla parola esatta qui sotto. Incolla di nuovo se hai copiato una frase diversa.",
        "badge": "Selettore di parole",
        "hint": "VocOrbit crea automaticamente la scheda parola da questa ricerca."
      },
      "status": {
        "pasteFirst": "Incolla il testo copiato per iniziare.",
        "selectedWord": "Parola selezionata: {{word}}",
        "seedWordMissing": "Incolla una frase con \"{{word}}\" o seleziona un'altra parola qui sotto.",
        "selectWord": "Fare clic sulla parola esatta qui sotto per continuare."
      },
      "actions": {
        "pasteCopiedText": "Incolla il testo copiato",
        "pasteAgain": "Incolla di nuovo",
        "clear": "Chiaro",
        "readingClipboard": "Lettura degli appunti...",
        "reading": "Lettura...",
        "analyzeAndSave": "Analizza e salva",
        "loadingMeaning": "Ottenere il significato di base...",
        "openSavedWord": "Apri la parola salvata",
        "backToLibrary": "Ritorno in biblioteca",
        "pickAnotherWord": "Scegli un'altra parola"
      },
      "loading": {
        "title": "Esecuzione di informazioni di base",
        "body": "VocOrbit sta abbinando la parola selezionata a questa frase."
      },
      "result": {
        "title": "Significato di base",
        "savedFallback": "Salvato nella tua libreria.",
        "contextMeaning": "Significato contestuale",
        "whyThisMeaning": "Perché questo significato"
      },
      "problems": {
        "clipboardUnavailableTitle": "Appunti non disponibili",
        "clipboardUnavailableBody": "L'accesso agli appunti è bloccato in questo contesto del browser. Incolla la frase manualmente.",
        "contextRequiredTitle": "Contesto richiesto",
        "contextRequiredBody": "Incolla una frase o un breve paragrafo prima di selezionare una parola.",
        "selectWordTitle": "Seleziona una parola nel testo",
        "selectWordBody": "Fare clic sulla parola esatta all'interno del blocco di testo prima di eseguire la ricerca.",
        "signInRequiredTitle": "È richiesto l'accesso",
        "signInRequiredBody": "La tua sessione è scaduta. Apri di nuovo VocOrbit e accedi prima di riprovare questa ricerca.",
        "basicCreditsRequiredTitle": "Crediti base richiesti",
        "basicCreditsRequiredBody": "Il tuo account non può eseguire una ricerca di base in questo momento.",
        "requestTimedOutTitle": "Richiesta scaduta",
        "requestTimedOutBody": "La ricerca ha richiesto troppo tempo. Riprova con la stessa frase.",
        "connectionProblemTitle": "Problema di connessione",
        "connectionProblemBody": "VocOrbit non è riuscito a raggiungere il server. Controlla la connessione e riprova.",
        "lookupFailedTitle": "Ricerca non riuscita",
        "lookupFailedBody": "VocOrbit non è riuscito a completare questa richiesta di informazioni dettagliate.",
        "lookupIncompleteTitle": "Ricerca incompleta",
        "lookupIncompleteBody": "VocOrbit ha restituito una risposta inaspettata. Riprovare ancora una volta."
      }
    }
  }
}

export default it
