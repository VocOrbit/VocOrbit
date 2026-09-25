import { Translations } from "./en"

const fr: Translations = {
  "common": {
    "ok": "OK !",
    "cancel": "Annuler",
    "back": "Retour",
    "logOut": "Déconnexion"
  },
  "welcomeScreen": {
    "postscript": "psst  — Ce n'est probablement pas à quoi ressemble votre application. (À moins que votre designer ne vous ait donné ces écrans, dans ce cas, mettez la en prod !)",
    "readyForLaunch": "Votre application, presque prête pour le lancement !",
    "exciting": "(ohh, c'est excitant !)",
    "letsGo": "Allons-y !"
  },
  "errorScreen": {
    "title": "Quelque chose s'est mal passé !",
    "friendlySubtitle": "C'est l'écran que vos utilisateurs verront en production lorsqu'une erreur sera lancée. Vous voudrez personnaliser ce message (situé dans `app/i18n/fr.ts`) et probablement aussi la mise en page (`app/screens/ErrorScreen`). Si vous voulez le supprimer complètement, vérifiez `app/app.tsx` pour le composant <ErrorBoundary>.",
    "reset": "RÉINITIALISER L'APPLICATION",
    "traceTitle": "Erreur depuis %{name}"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "Si vide... si triste",
      "content": "Aucune donnée trouvée pour le moment. Essayez de cliquer sur le bouton pour rafraîchir ou recharger l'application.",
      "button": "Essayons à nouveau"
    }
  },
  "errors": {
    "invalidEmail": "Adresse e-mail invalide."
  },
  "loginScreen": {
    "logIn": "Se connecter",
    "subtitle": "Continuez avec votre compte social pour accéder à la progression de votre vocabulaire.",
    "continueWith": "CONTINUEZ AVEC",
    "regionTitle": "Région",
    "regionSubtitle": "Actuel : {{region}}",
    "regionNotSelected": "Non sélectionné",
    "changeRegion": "Changer",
    "signingIn": "Connexion...",
    "googleButton": "Google",
    "appleButton": "Apple",
    "moreProvidersSoon": "Plus de fournisseurs seront disponibles bientôt.",
    "accessibility": {
      "openRegionSelection": "Ouvrir la sélection de région"
    },
    "errors": {
      "unauthorized": "L'authentification a échoué. Veuillez vous reconnecter.",
      "cannotConnect": "Impossible de se connecter au serveur. Veuillez réessayer.",
      "server": "La validation du serveur a échoué. Veuillez réessayer sous peu.",
      "rejected": "La demande de connexion a été rejetée. Veuillez vérifier la configuration d'authentification.",
      "badData": "Réponse inattendue reçue du serveur.",
      "generic": "Impossible de terminer la connexion. Veuillez réessayer.",
      "googleCancelled": "La connexion Google a été annulée.",
      "googleUnavailable": "La connexion Google n'est pas disponible sur ce site. appareil.",
      "googleFailed": "La connexion à Google a échoué. Veuillez réessayer."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "Choisissez votre paire de langues",
    "titleSettings": "Préférences de langue",
    "subtitleOnboarding": "Choisissez votre langue maternelle et cible dans une liste globale avec des drapeaux et des pays.",
    "subtitleSettings": "Mettez à jour ici votre langue maternelle et votre langue cible avec le drapeau et le pays.",
    "currentPair": "Paire actuelle",
    "availableOptionsCount": "{{count}} options langue/pays disponibles",
    "nativeLanguageTitle": "Langue maternelle",
    "nativeLanguageBody": "Les traductions et explications seront affichées dans cette langue.",
    "learningLanguageTitle": "Langue d'apprentissage",
    "learningLanguageBody": "Les définitions et contextes seront générés dans cette langue.",
    "selectedLabel": "Sélectionné",
    "pickerTitleL1": "Choisir la langue maternelle",
    "pickerTitleL2": "Choisir la langue d'apprentissage",
    "searchPlaceholder": "Rechercher une langue ou un pays",
    "noResults": "Aucun résultat trouvé.",
    "saving": "Enregistrement...",
    "continue": "Continuer",
    "save": "Enregistrer",
    "accessibility": {
      "goBack": "Revenir en arrière",
      "selectNativeLanguage": "Sélectionner une langue maternelle langue",
      "selectLearningLanguage": "Sélectionner la langue d'apprentissage",
      "continueWithSelectedLanguages": "Continuer avec les langues sélectionnées",
      "saveLanguages": "Enregistrer les langues",
      "closeLanguagePicker": "Fermer le sélecteur de langue",
      "closePicker": "Fermer picker",
      "selectLanguageItem": "Sélectionner{{language}}{{country}}"
    },
    "errors": {
      "cannotConnect": "Impossible de se connecter au serveur. Veuillez réessayer.",
      "unauthorized": "La session n'est pas valide. Veuillez vous reconnecter.",
      "validation": "Les préférences linguistiques n'ont pas pu être enregistrées. Veuillez vérifier vos entrées.",
      "server": "Une erreur de serveur s'est produite. Veuillez réessayer sous peu.",
      "saveFailed": "Les préférences linguistiques n'ont pas pu être enregistrées. Veuillez réessayer.",
      "noSession": "Aucune session active trouvée. Veuillez vous reconnecter.",
      "selectTwoLanguages": "Veuillez sélectionner les deux langues.",
      "sameLanguagePair": "La langue maternelle et la langue d'apprentissage ne peuvent pas être identiques."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "Réessayer",
      "signIn": "Se connecter",
      "favoriteLabel": "Favori",
      "learnedLabel": "Appris",
      "detailButton": "Ouvrir les détails"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "Comment fonctionne réellement VocOrbit",
      "subtitle": "Flux réel : sélectionnez une phrase en dehors de l'application, choisissez un mot, puis apprenez-le avec le contexte dans VocOrbit.",
      "progress": "Étape {{current}} / {{total}}",
      "progressSingle": "Étape {{current}}",
      "mock": {
        "contextLabel": "Phrase contextuelle",
        "selectedWordLabel": "Mot sélectionné",
        "meaningLabel": "Signification de base",
        "whyLabel": "Pourquoi dans ce contexte"
      },
      "flowTitle": "Apprenez le flux en 3 étapes rapides",
      "highlightsTitle": "Ce que vous obtenez",
      "actions": {
        "previous": "Précédent",
        "next": "Étape suivante",
        "enterApp": "Démarrer apprentissage",
        "showExample": "Afficher un exemple réel",
        "hideExample": "Cacher l'exemple"
      },
      "steps": {
        "step1": {
          "step": "ÉTAPE 1 • Partager une phrase",
          "title": "Sélectionner la phrase où le mot apparaît",
          "body": "Appuyez longuement sur le texte dans le navigateur, les notes ou n'importe quelle application et envoyez-le à l'extension de partage VocOrbit.",
          "source": "Quand je regarde en arrière, je suis à nouveau impressionné par le pouvoir vivifiant de littérature.",
          "word": "littérature",
          "meaning": "œuvres écrites, en particulier celles considérées comme artistiques",
          "why": "Dans cette phrase, il fait référence aux livres et aux œuvres d'art écrites qui affectent fortement le locuteur.",
          "hint": "Conseil : partagez toujours la phrase complète, pas seulement le seul mot.",
          "bullets": {
            "one": "Fonctionne avec le navigateur, les notes et de nombreuses applications de lecture",
            "two": "Vous conservez la phrase originale. contexte",
            "three": "Aucun flux de copier-coller manuel n'est nécessaire"
          }
        },
        "step2": {
          "step": "ÉTAPE 2 • Choisissez le mot exact",
          "title": "Appuyez sur un mot et obtenez instantanément une signification de base",
          "body": "Dans la vue de partage, les mots peuvent être tapés. Sélectionnez un mot cible et exécutez un aperçu de base.",
          "source": "La lecture ne doit pas être présentée aux enfants comme une corvée, un devoir.",
          "word": "corvée",
          "meaning": "une tâche de routine, généralement désagréable",
          "why": "Ici, la « corvée » met l'accent que la lecture ne doit pas ressembler à un travail forcé.",
          "hint": "Conseil : Si vous n'êtes pas sûr, commencez par le basique. Ensuite, exécutez avancé dans l'application.",
          "bullets": {
            "one": "Le sens est généré pour cette phrase exacte",
            "two": "Vous voyez également pourquoi ce sens est choisi",
            "three": "Prend en charge la paire de langues sélectionnée"
          }
        },
        "step3": {
          "step": "ÉTAPE 3 • Enregistrez et organise",
          "title": "Déplacez les mots utiles dans votre système personnel",
          "body": "Une fois que le mot atteint VocOrbit, marquez-le comme favori ou ajoutez-le à la liste de répétition pour un apprentissage actif.",
          "source": "Appuyez-vous sur notre expérience d'expert pour préparer votre projet au succès.",
          "word": "expert",
          "meaning": "une personne possédant des compétences ou des connaissances particulières",
          "why": "Il décrit l'expérience comme étant hautement fiable et compétente dans le contexte de ce projet.",
          "hint": "Conseil : Gardez la liste de répétitions ciblée. 10 mots actifs permettent une meilleure rétention.",
          "bullets": {
            "one": "Liste de favoris pour les mots importants",
            "two": "Liste de répétition pour la mémorisation active",
            "three": "L'état appris maintient votre progression propre"
          }
        },
        "step4": {
          "step": "STEP 4 • Entraînement loop",
          "title": "Révisez, pratiquez et marquez comme appris",
          "body": "Utilisez les modes de pratique et les rappels jusqu'à ce que le rappel soit fort, puis marquez le mot comme appris.",
          "source": "Vous voulez en savoir plus sur autre chose ?",
          "word": "Contacte",
          "meaning": "pour contacter quelqu'un",
          "why": "Dans ce contexte, il s'agit d'un verbe à particule signifiant communication, et non contact physique.",
          "hint": "Astuce : utilisez quotidiennement des rappels et des séances courtes pour des progrès constants.",
          "bullets": {
            "one": "Les cartes d'entraînement sont construit à partir de vos propres mots",
            "two": "Les analyses hebdomadaires montrent les points faibles",
            "three": "Les mots appris quittent automatiquement la file d'attente de répétition"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "Votre session a peut-être expiré. Veuillez vous reconnecter.",
      "cannotConnect": "Impossible d'atteindre le serveur. Vérifiez votre connexion et réessayez.",
      "listLoadFailed": "Impossible de charger la liste de mots. Veuillez réessayer.",
      "searchLoadFailed": "Impossible de charger les résultats de la recherche. Veuillez réessayer.",
      "itemNotFound": "Enregistrement Word introuvable.",
      "reloginRequired": "Veuillez vous reconnecter pour continuer.",
      "favoriteActionFailed": "L'action favorite a échoué. Veuillez réessayer.",
      "detailLoadFailed": "Impossible de charger les détails du mot.",
      "stateUpdateFailed": "Impossible de mettre à jour l'état. Veuillez réessayer.",
      "analysisRequestFailed": "Impossible d'envoyer la demande d'analyse.",
      "invalidModelOutput": "Le format de réponse du modèle n'était pas valide. Veuillez réessayer.",
      "analysisTimeout": "L'analyse a expiré. Veuillez réessayer.",
      "advancedCreditInsufficient": "Crédits avancés insuffisants.",
      "basicCreditInsufficient": "Crédits de base insuffisants.",
      "advancedAnalysisFailed": "L'analyse avancée n'a pas pu être effectuée.",
      "basicAnalysisFailed": "L'analyse de base n'a pas pu être effectuée. terminé.",
      "repeatProgressUpdateFailed": "Impossible de mettre à jour la progression de la répétition. Veuillez réessayer.",
      "missingContext": "Le contexte requis pour l'analyse est manquant.",
      "selectedWordNotInSentence": "Le mot sélectionné n'est pas trouvé dans la phrase contextuelle.",
      "analysisFailedGeneric": "L'analyse n'a pas pu être terminée. Veuillez réessayer.",
      "unexpected": "Une erreur inattendue s'est produite."
    },
    "search": {
      "title": "Recherche",
      "placeholder": "Rechercher par mot, sens ou explication",
      "loading": "Chargement des mots...",
      "emptyResult": "Aucun mot ne correspond à votre recherche.",
      "emptyHint": "Commencez à taper ci-dessus pour rechercher."
    },
    "showroom": {
      "loading": "Chargement de la liste de mots...",
      "emptyTitle": "Aucun mot pour l'instant",
      "emptyBody": "Après avoir ajouté des mots via Word Insight, cette liste se remplira automatiquement.",
      "emptyCta": "Ouvrir les annonces",
      "updateAvailableTitle": "Nouvelle version disponible",
      "updateAvailableBody": "Appuyez pour mettre à jour et continuer à bénéficier des dernières améliorations.",
      "updateNow": "Mise à jour maintenant",
      "repeatAdded": "{{word}} ajouté à la liste de répétition ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}} supprimé de la liste de répétition ({{count}}/{{limit}}).",
      "repeatLimitReached": "Vous avez atteint la limite de votre liste de répétitions (10/10).",
      "repeatPermissionRequired": "Une autorisation de notification est requise pour les rappels. Activer les notifications pour ajouter des mots.",
      "favoriteAdded": "{{word}} ajouté aux favoris.",
      "favoriteRemoved": "{{word}} supprimé des favoris.",
      "repeatCleared": "Répéter la liste effacé.",
      "repeatListTitle": "Liste de répétition",
      "repeatCount": "{{count}}/{{limit}} mots",
      "repeatEmpty": "La liste de répétition est vide. Ajoutez des mots avec le bouton cloche ci-dessous.",
      "clearAll": "Tout effacer",
      "done": "Terminé",
      "practice": "S'entraîner",
      "accessibility": {
        "showDetails": "Afficher les détails",
        "favoriteWord": "Mot préféré",
        "repeatWordLater": "Répétez ce mot plus tard",
        "openProfile": "Ouvrir le profil",
        "openRepeatList": "Ouvrir le mot de répétition list",
        "openAnnouncements": "Ouvrir les annonces",
        "openUpdate": "Ouvrir la page de mise à jour",
        "dismissUpdate": "Ignorer la notification de mise à jour",
        "searchWords": "Mots de recherche",
        "switchToCard": "Passer à la vue carte",
        "switchToList": "Passer à la vue liste",
        "retryShowroom": "Essayer de charger à nouveau la salle d'exposition",
        "closeRepeatList": "Fermer la répétition list",
        "clearRepeatList": "Effacer la liste de répétition",
        "removeFromRepeat": "Supprimer {{word}} de la liste de répétition",
        "practiceWord": "Pratiquez ceci word",
        "addWord": "Ajouter un mot"
      },
      "quickAdd": {
        "eyebrow": "Ajout rapide",
        "title": "Ajouter un mot depuis le contexte",
        "body": "Collez une phrase, choisissez le mot exact et enregistrez-le.",
        "action": "Ajouter un mot",
        "actionHint": "Coller puis choisir"
      }
    },
    "practiceHub": {
      "title": "S'entraîner",
      "sectionLabel": "ENTRAÎNEMENT",
      "selectAnswer": "SÉLECTIONNER LA RÉPONSE",
      "modeBasic": "Basique",
      "modeAdvanced": "Avancé",
      "loadingTitle": "Chargement du catalogue",
      "loadingMessage": "Vérification des types d'exercices disponibles pour vous.",
      "loadingQuestionsTitle": "Préparation des questions d'entraînement...",
      "loadingQuestionsMessage": "Génération de questions à partir de vos données de vocabulaire disponibles.",
      "instructions": {
        "matchSynonyms": "Choisissez le synonyme le plus proche."
      },
      "resultCta": {
        "backToPractice": "Retour à l'entraînement",
        "seeResult": "Voir le résultat",
        "nextWord": "Mot suivant"
      },
      "result": {
        "correctTitle": "Bonne réponse !",
        "incorrectTitle": "Mauvaise réponse !",
        "correctAnswerLabel": "Bonne réponse :",
        "usedInSentenceLabel": "Utilisé dans une phrase :",
        "sessionResultLabel": "Résultat de la session"
      },
      "leavePrompt": {
        "title": "Vous partez déjà ?",
        "keepPlaying": "Continuer",
        "leave": "Quitter",
        "closePromptAccessibility": "Fermer l'invite de sortie",
        "leavePracticeAccessibility": "Quitter l'entraînement"
      },
      "hints": {
        "availableCount": "{{count}} mots disponibles",
        "missingSynonyms": "Données de synonymes indisponibles",
        "minActiveWords": "Au moins 2 mots actifs requis"
      },
      "tiles": {
        "meaningMatch": "Association de sens",
        "fillInGap": "Compléter le blanc",
        "guessWord": "Deviner le mot",
        "matchSynonyms": "Associer les synonymes"
      },
      "accessibility": {
        "goBack": "Retour",
        "useMode": "Utiliser le mode {{mode}}",
        "closePractice": "Fermer l'entraînement"
      },
      "loadState": {
        "noQuestions": {
          "title": "Aucune question d'entraînement pour le moment",
          "message": "Vous avez besoin d'au moins 2 mots actifs pour commencer.",
          "actionLabel": "Ajouter des mots"
        },
        "unauthorized": {
          "title": "Connexion requise",
          "message": "Votre session a peut-être expiré. Reconnectez-vous pour continuer.",
          "actionLabel": "Se connecter"
        },
        "forbidden": {
          "title": "Cette fonctionnalité est indisponible pour le moment",
          "message": "Vérifiez votre forfait ou vos crédits pour continuer.",
          "actionLabel": "Obtenir des crédits"
        },
        "rejected": {
          "title": "Données insuffisantes pour ce mode",
          "message": "Ajoutez plus de mots et réessayez.",
          "actionLabel": "Ajouter des mots"
        },
        "server": {
          "title": "Impossible de joindre le serveur",
          "message": "Vérifiez votre connexion et réessayez.",
          "actionLabel": "Réessayer"
        },
        "generic": {
          "title": "Impossible de démarrer l'entraînement",
          "message": "Une erreur inattendue s'est produite. Veuillez réessayer.",
          "actionLabel": "Réessayer"
        }
      }
    },
    "announcements": {
      "title": "Annonces",
      "unreadCount": "{{count}} non lues",
      "markAllRead": "Tout marquer comme lu",
      "loading": "Chargement des annonces...",
      "empty": "Aucune annonce pour le moment.",
      "openLink": "Ouvrir le lien",
      "openAnnouncement": "Ouvrir l'annonce : {{title}}",
      "levelInfo": "Information",
      "levelWarning": "Avertissement",
      "levelCritical": "Critique",
      "loadFailed": "Impossible de charger les annonces. Réessayez.",
      "claimFailed": "La demande de récompense a échoué. Veuillez réessayer.",
      "requirementNotMet": "La condition n'est pas encore remplie. Invitez d'abord des amis.",
      "referralCodeMissing": "Le code de parrainage est manquant pour ce compte.",
      "referralProgress": "Progression du parrainage : {{current}}/{{required}}",
      "shareInvite": "Inviter un ami",
      "referralShareMessage": "Rejoignez VocOrbit.\nOuvrez ce lien :\n{{link}}",
      "rewardText": "Récompense : +{{amount}} {{creditType}} crédits",
      "creditBasic": "basique",
      "creditAdvanced": "avancé",
      "claimReward": "Réclamation",
      "claimingReward": "Réclamation...",
      "rewardClaimed": "Réclamé"
    },
    "forceUpdate": {
      "title": "Mise à jour requise",
      "body": "Une nouvelle version est requise pour continuer à utiliser VocOrbit.",
      "updateNow": "Mise à jour maintenant",
      "checkAgain": "Vérifiez à nouveau"
    },
    "profile": {
      "title": "Profil",
      "accountDetailsTitle": "Détails du compte",
      "accountDetailsSubtitle": "Voir votre e-mail et les informations du compte.",
      "settingsTitle": "Paramètres",
      "settingsSubtitle": "Personnalisez la taille du texte et l'ordre des boutons d'action.",
      "favoriteWordsTitle": "Mots favoris",
      "favoriteWordsSubtitle": "Voir les mots ajoutés aux favoris.",
      "learnedWordsTitle": "Mots appris",
      "learnedWordsSubtitle": "Voir les mots marqués comme appris.",
      "weeklyAnalyticsTitle": "Analyse hebdomadaire",
      "weeklyAnalyticsSubtitle": "Voir vos performances de pratique des 7 derniers jours.",
      "regionTitle": "Région",
      "regionSubtitle": "Actuelle : {{region}}",
      "regionNotSelected": "Non sélectionnée",
      "emptyFavorites": "Aucun mot favori pour le moment.",
      "emptyLearned": "Aucun mot appris pour le moment.",
      "loadingList": "Chargement de la liste...",
      "logOut": "Déconnexion",
      "accessibility": {
        "goBack": "Revenir en arrière",
        "openAccountDetails": "Ouvrir le compte détails",
        "openSettings": "Ouvrir les paramètres",
        "openFavoriteWords": "Ouvrir les mots favoris",
        "openLearnedWords": "Ouvrir les mots appris",
        "openWeeklyAnalytics": "Ouvrir les analyses hebdomadaires",
        "openRegion": "Ouvrir la région settings",
        "logOut": "Déconnexion",
        "playPronunciation": "Jouer la prononciation pour {{word}}",
        "openDetailForWord": "Ouvrir les détails pour {{word}}",
        "removeWord": "Supprimer {{word}}"
      }
    },
    "settings": {
      "title": "Paramètres",
      "languagePairTitle": "Paire de langues",
      "languagePairSubtitle": "Changez votre langue maternelle et la langue que vous apprenez.",
      "billingCreditsTitle": "Facturation et crédits",
      "billingCreditsSubtitle": "Gérez ici les crédits de signification de base et les packs d'achats intégrés.",
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
      "themeModeTitle": "Thème",
      "themeModeSubtitle": "Choisissez clair, sombre ou suivez votre système paramètre.",
      "themeModeSystem": "Système",
      "themeModeLight": "Éclairage",
      "themeModeDark": "Foncé",
      "textSizeTitle": "Taille du texte",
      "textSizeSubtitle": "Ajustez la taille du texte dans les cartes de vocabulaire.",
      "actionOrderTitle": "Ordre des actions",
      "actionOrderSubtitle": "Définissez l'ordre des boutons détail/favori/répétition.",
      "actionDetail": "Détail",
      "actionFavorite": "Favori",
      "actionRepeat": "Répéter",
      "resetToDefaults": "Réinitialiser par défaut",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "Retour",
        "openLanguagePreferences": "Ouvrir les préférences de langue",
        "openBillingCredits": "Ouvrir facturation et crédits",
        "useSystemTheme": "Utiliser le thème du système",
        "useLightTheme": "Utiliser le thème clair",
        "useDarkTheme": "Utiliser le thème sombre",
        "decreaseTextSize": "Diminuer la taille du texte",
        "increaseTextSize": "Augmenter la taille du texte",
        "moveActionLeft": "Déplacer {{action}} vers la gauche",
        "moveActionRight": "Déplacer {{action}} vers la droite",
        "resetSettings": "Réinitialiser les paramètres du vocabulaire"
      }
    },
    "accountDetails": {
      "title": "Détails du compte",
      "emailLabel": "E-mail",
      "userIdLabel": "ID utilisateur",
      "regionLabel": "Région d'origine",
      "regionEndpointLabel": "Point de terminaison de région",
      "appVersionLabel": "Version de l'app",
      "buildLabel": "Numéro de build",
      "platformLabel": "Plateforme",
      "osVersionLabel": "Version de l'OS",
      "accessibility": {
        "goBack": "Retour",
        "deleteAccount": "Supprimer définitivement le compte"
      },
      "deleteAccount": {
        "sectionTitle": "Supprimer le compte",
        "sectionBody": "Supprimez définitivement votre compte VocOrbit et les données de l'application qui y sont liées. Cette action ne peut pas être annulée.",
        "action": "Supprimer définitivement le compte",
        "deleting": "Suppression du compte...",
        "confirmTitle": "Supprimer le compte ?",
        "confirmBody": "Cela supprime définitivement votre compte VocOrbit et les données de l'application associée. Cette action ne peut pas être annulée.",
        "successTitle": "Compte supprimé",
        "successBody": "Votre compte VocOrbit a été définitivement supprimé.",
        "missingUser": "Votre identifiant de compte est introuvable. Veuillez vous reconnecter.",
        "cannotConnect": "Impossible d'atteindre le serveur. Vérifiez votre connexion et réessayez.",
        "sessionExpired": "Votre session a expiré. Veuillez vous reconnecter.",
        "failed": "Nous n'avons pas pu supprimer votre compte pour le moment. Veuillez réessayer."
      }
    },
    "iap": {
      "title": "Facturation et crédits",
      "loading": "Chargement des détails de facturation...",
      "currentSubscription": "Abonnement actuel",
      "currentStatus": "Statut : {{status}}",
      "currentPlan": "Forfait actuel : {{plan}}",
      "noActivePlan": "Aucun forfait actif",
      "refresh": "Rafraîchir la facturation",
      "basicCreditsTitle": "Crédits d'analyse de base",
      "basicCreditsBody": "L'analyse de sens de base dans l'écran de partage consomme ce crédit.",
      "plansTitle": "Forfaits",
      "plansBody": "Choisissez un forfait et payez via votre compte de la boutique.",
      "noPlans": "Aucun forfait achetable trouvé pour cette plateforme.",
      "planTopup": "Recharge mensuelle : +{{basic}} basique · +{{advanced}} avancé",
      "planCaps": "Plafonds : {{basicCap}} basique · {{advancedCap}} avancé",
      "priceLabel": "Prix : {{price}}",
      "buyNow": "Acheter",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "Achat en cours...",
      "purchaseCanceled": "Achat annulé.",
      "purchaseApplied": "{{sku}} activé avec succès.",
      "alreadyOwnedRestoring": "Cet article appartient déjà. Restauration de vos achats...",
      "restorePurchases": "Restaurer les achats",
      "restoring": "Restauration des achats...",
      "restoreNoPurchases": "Aucun achat trouvé à restaurer.",
      "restoreNoApplicablePurchases": "Aucun achat restaurable n'a pu être appliqué.",
      "restoreApplied": "{{count}} achat(s) restauré(s) et vérifié(s).",
      "status": {
        "none": "Non abonné",
        "pending": "En attente",
        "active": "Actif",
        "expired": "Expiré",
        "canceled": "Annulé",
        "refunded": "Remboursé"
      },
      "errors": {
        "unauthorized": "Votre session expirée. Veuillez vous reconnecter.",
        "cannotConnect": "Impossible d'atteindre le serveur. Vérifiez votre connexion et réessayez.",
        "forbidden": "Cet achat n'a pas pu être appliqué à votre compte.",
        "generic": "La demande de facturation a échoué. Veuillez réessayer.",
        "purchaseFailed": "L'achat a échoué. Veuillez réessayer.",
        "alreadyOwned": "Cet article appartient déjà à ce compte.",
        "invalidReceipt": "Le reçu du magasin n'a pas pu être validé.",
        "iapUnavailable": "Le service d'achat en magasin n'est actuellement pas disponible sur cet appareil."
      },
      "accessibility": {
        "goBack": "Revenir en arrière",
        "buyPlan": "Acheter {{plan}} plan",
        "restorePurchases": "Restaurer les achats précédents",
        "refresh": "Actualiser la facturation et l'état de l'abonnement"
      },
      "desktop": {
        "subtitle": "Consultez votre solde actuel ici. Les nouveaux achats et les modifications d'abonnement se poursuivent sur mobile.",
        "desktopBadge": "Vue du bureau",
        "phoneOnlyBadge": "Téléphone pour les achats",
        "balanceTitle": "Votre solde actuel",
        "balanceBody": "Desktop garde visibles vos crédits disponibles et l’état de votre abonnement, afin que vous puissiez vérifier votre compte avant de poursuivre votre flux d’apprentissage.",
        "basicAvailable": "Crédits de base",
        "advancedAvailable": "Crédits avancés",
        "freeCredits": "Gratuit",
        "paidCredits": "Payé",
        "noPlanBody": "Ce compte ne dispose pas d'un forfait de facturation mobile actif pour le moment. Vous pouvez toujours utiliser les crédits déjà disponibles ici.",
        "mobileTitle": "Continuer vos achats sur votre téléphone",
        "mobileBody": "Les achats de crédits et les modifications d'abonnement s'effectuent dans l'application mobile avec votre compte App Store ou Google Play.",
        "storeLabel": "Magasin: {{store}}",
        "renewsOn": "Renouvelle sur {{date}}",
        "expiresOn": "Terminé le {{date}}",
        "updatedOn": "Dernière synchronisation : {{date}}",
        "stepOpenPhone": "Ouvrez VocOrbit sur votre téléphone avec le même compte.",
        "stepOpenBilling": "Accédez à Profil > Facturation et crédits.",
        "stepFinishPurchase": "Achetez des crédits ou gérez votre abonnement là-bas, puis revenez ici et actualisez.",
        "mobileHint": "Votre solde créditeur est mis à jour ici une fois que l'achat mobile est appliqué au même compte."
      }
    },
    "weeklyAnalytics": {
      "title": "Analyse hebdomadaire",
      "modeAll": "Tout",
      "modeBasic": "Basique",
      "modeAdvanced": "Avancé",
      "loading": "Chargement de l'analyse hebdomadaire...",
      "summaryTitle": "Résumé (7 jours)",
      "sessions": "Sessions",
      "completed": "Terminées",
      "answered": "Répondues",
      "accuracy": "Précision",
      "activeDays": "Jours actifs",
      "streak": "Série",
      "dailyTrend": "Tendance quotidienne",
      "byQuestionType": "Par type de question",
      "byMode": "Par mode",
      "weakItems": "Points faibles",
      "noWeakItems": "Aucun mot faible notable trouvé cette semaine.",
      "weakItemMeta": "Erreurs : {{wrongAnswers}} · Précision : {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "Association de sens",
      "questionTypeGuessWord": "Deviner le mot",
      "questionTypeFillInGap": "Compléter le blanc",
      "questionTypeMatchSynonym": "Associer les synonymes",
      "errors": {
        "unauthorized": "Votre session a peut-être expiré. Reconnectez-vous.",
        "cannotConnect": "Impossible de joindre le serveur. Vérifiez la connexion et réessayez.",
        "loadFailed": "Impossible de charger l'analyse hebdomadaire. Réessayez."
      },
      "accessibility": {
        "goBack": "Retour",
        "filterByMode": "Filtrer par {{mode}}",
        "retry": "Réessayer la requête d'analyse"
      }
    },
    "detail": {
      "closeDetails": "Fermer les détails du mot",
      "loadingDetail": "Chargement des détails du mot...",
      "detailLoadFailedTitle": "Impossible de charger les détails",
      "statusLearned": "appris",
      "statusActive": "actif",
      "markAsLearned": "Marquer comme appris",
      "moveBackToActive": "Remettre en actif",
      "buyAdvancedCredits": "Acheter des crédits avancés",
      "buyBasicCredits": "Acheter des crédits de base",
      "buyCredits": "Acheter des crédits",
      "whyThisSense": "Pourquoi ce sens",
      "examples": "Exemples",
      "synonyms": "Synonymes",
      "antonyms": "Antonymes",
      "collocations": "Collocation",
      "alternativeMeanings": "Sens alternatifs",
      "usageNotes": "Notes d'usage",
      "noSynonyms": "Pas encore de données de synonymes.",
      "stats": "Statistiques",
      "encountersAndLastMode": "Rencontres : {{encounters}} | Dernier mode : {{mode}}",
      "nextReminder": "Prochain rappel",
      "currentPlan": "Plan actuel : {{due}}",
      "reviewHint": "Oublié : +10 min, Difficile : +1 heure, Bien : augmente à partir de +1 jour.",
      "runAdvanced": "Lancer l’analyse avancée",
      "reviewForgot": "Oublié",
      "reviewHard": "Difficile",
      "reviewGood": "Bien",
      "reviewOptionAccessibility": "{{title}} sélectionné. Prochaine révision dans {{delay}}.",
      "repeatUnscheduled": "Non planifié",
      "repeatNow": "Maintenant",
      "repeatAfterMinutes": "{{count}} min",
      "repeatAfterHours": "{{count}} heure",
      "repeatAfterDays": "{{count}} jour",
      "repeatAfterWeeks": "{{count}} semaine",
      "repeatInMinutes": "dans {{count}} min",
      "repeatInHours": "dans {{count}} heure",
      "repeatInDays": "dans {{count}} jour",
      "repeatInWeeks": "dans {{count}} semaine",
      "repeatNotificationTitle": "Heure de révision : {{word}}",
      "repeatNotificationBody": "Révisez le mot {{word}}.",
      "reportIssue": "Signaler un mauvais sens",
      "reportIssueAccessibility": "Signaler un mauvais sens pour {{word}}",
      "deleteWord": "Supprimer le mot",
      "deleteWordAccessibility": "Supprimer en douceur {{word}}",
      "deleteConfirmTitle": "Supprimer ce mot ?",
      "deleteConfirmBody": "\"{{word}}\" sera supprimé de votre liste. Vous pourrez l’ajouter de nouveau plus tard.",
      "deleteConfirmCancel": "Annuler",
      "deleteConfirmAction": "Oui, supprimer"
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
      "title": "Signaler la signification",
      "subtitle": "Si \"{{word}}\" semble incorrect dans ce contexte, dites-nous ce que c'est faux.",
      "messageLabel": "Qu'est-ce qui semble faux ?",
      "messagePlaceholder": "Exemple : Ce sens ne correspond pas à la phrase. Il doit décrire la communication, pas l'emplacement.",
      "charactersLeft": "{{count}} caractères restants",
      "submit": "Envoyer le rapport",
      "successTitle": "Rapport envoyé",
      "successBody": "Merci pour vos commentaires. Nous allons examiner cet élément.",
      "backToDetail": "Retour aux détails du mot",
      "errors": {
        "unauthorized": "Votre session expirée. Veuillez vous reconnecter.",
        "cannotConnect": "Impossible d'atteindre le serveur. Vérifiez votre connexion et réessayez.",
        "itemNotFound": "L'élément Word est introuvable.",
        "submitFailed": "Impossible de soumettre le rapport. Veuillez réessayer."
      },
      "accessibility": {
        "goBack": "Revenir en arrière",
        "submit": "Envoyer le rapport de problème",
        "backToDetail": "Retour aux détails du mot"
      }
    },
    "capture": {
      "backButton": "Bibliothèque",
      "headerTitle": "Ajouter un mot",
      "headerBody": "Collez une phrase et choisissez le mot que vous souhaitez enregistrer.",
      "seedWordLabel": "Recherche : {{word}}",
      "pasteHero": {
        "title": "Coller le texte copié",
        "body": "Copiez une phrase ou un paragraphe, puis collez-le pour ouvrir le sélecteur.",
        "bodyWithWord": "Copiez une phrase contenant « {{word}} », puis collez-la pour ouvrir le sélecteur.",
        "hint": "Le sélecteur s'ouvre automatiquement après le collage."
      },
      "picker": {
        "title": "Choisissez le mot dans le texte",
        "body": "Cliquez sur le mot exact ci-dessous. Collez à nouveau si vous avez copié une phrase différente.",
        "badge": "Sélecteur de mots",
        "hint": "VocOrbit crée automatiquement la carte de mots à partir de cette recherche."
      },
      "status": {
        "pasteFirst": "Collez le texte copié pour commencer.",
        "selectedWord": "Mot sélectionné : {{word}}",
        "seedWordMissing": "Collez une phrase avec « {{word}} » ou sélectionnez un autre mot ci-dessous.",
        "selectWord": "Cliquez sur le mot exact ci-dessous pour continuer."
      },
      "actions": {
        "pasteCopiedText": "Coller le texte copié",
        "pasteAgain": "Coller à nouveau",
        "clear": "Clair",
        "readingClipboard": "Lecture du presse-papiers...",
        "reading": "En lisant...",
        "analyzeAndSave": "Analyser et sauvegarder",
        "loadingMeaning": "Obtenir un sens fondamental...",
        "openSavedWord": "Ouvrir le mot enregistré",
        "backToLibrary": "Retour à la bibliothèque",
        "pickAnotherWord": "Choisissez un autre mot"
      },
      "loading": {
        "title": "Exécution d'informations de base",
        "body": "VocOrbit fait correspondre le mot sélectionné avec cette phrase."
      },
      "result": {
        "title": "Signification fondamentale",
        "savedFallback": "Enregistré dans votre bibliothèque.",
        "contextMeaning": "Signification du contexte",
        "whyThisMeaning": "Pourquoi ce sens"
      },
      "problems": {
        "clipboardUnavailableTitle": "Presse-papiers indisponible",
        "clipboardUnavailableBody": "L'accès au presse-papiers est bloqué dans ce contexte de navigateur. Collez la phrase manuellement.",
        "contextRequiredTitle": "Contexte requis",
        "contextRequiredBody": "Collez une phrase ou un court paragraphe avant de sélectionner un mot.",
        "selectWordTitle": "Sélectionnez un mot dans le texte",
        "selectWordBody": "Cliquez sur le mot exact à l'intérieur du bloc de texte avant d'exécuter la recherche.",
        "signInRequiredTitle": "Connexion requise",
        "signInRequiredBody": "Votre session a expiré. Ouvrez à nouveau VocOrbit et connectez-vous avant de réessayer cette recherche.",
        "basicCreditsRequiredTitle": "Crédits de base requis",
        "basicCreditsRequiredBody": "Votre compte ne peut pas effectuer de recherche de base pour le moment.",
        "requestTimedOutTitle": "La demande a expiré",
        "requestTimedOutBody": "La recherche a pris trop de temps. Réessayez avec la même phrase.",
        "connectionProblemTitle": "Problème de connexion",
        "connectionProblemBody": "VocOrbit n'a pas pu atteindre le serveur. Vérifiez votre connexion et réessayez.",
        "lookupFailedTitle": "La recherche a échoué",
        "lookupFailedBody": "VocOrbit n'a pas pu terminer cette demande d'informations.",
        "lookupIncompleteTitle": "Recherche incomplète",
        "lookupIncompleteBody": "VocOrbit a renvoyé une réponse inattendue. Réessayez une fois de plus."
      }
    }
  }
}

export default fr
