import { Translations } from "./en"

const es: Translations = {
  "common": {
    "ok": "OK",
    "cancel": "Cancelar",
    "back": "Volver",
    "logOut": "Cerrar sesión"
  },
  "welcomeScreen": {
    "postscript": "psst — Esto probablemente no es cómo se va a ver tu app. (A menos que tu diseñador te haya enviado estas pantallas, y en ese caso, ¡lánzalas en producción!)",
    "readyForLaunch": "Tu app, casi lista para su lanzamiento",
    "exciting": "(¡ohh, esto es emocionante!)",
    "letsGo": "¡Vamos!"
  },
  "errorScreen": {
    "title": "¡Algo salió mal!",
    "friendlySubtitle": "Esta es la pantalla que verán tus usuarios en producción cuando haya un error. Vas a querer personalizar este mensaje (que está ubicado en `app/i18n/es.ts`) y probablemente también su diseño (`app/screens/ErrorScreen`). Si quieres eliminarlo completamente, revisa `app/app.tsx` y el componente <ErrorBoundary>.",
    "reset": "REINICIA LA APP",
    "traceTitle": "Error desde %{name}"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "Muy vacío... muy triste",
      "content": "No se han encontrado datos por el momento. Intenta darle clic en el botón para refrescar o recargar la app.",
      "button": "Intentemos de nuevo"
    }
  },
  "errors": {
    "invalidEmail": "Email inválido."
  },
  "loginScreen": {
    "logIn": "Iniciar sesión",
    "subtitle": "Continúe con su cuenta social para acceder a su progreso de vocabulario.",
    "continueWith": "CONTINUAR CON",
    "regionTitle": "Región",
    "regionSubtitle": "Actual: {{region}}",
    "regionNotSelected": "Not seleccionado",
    "changeRegion": "Cambiar",
    "signingIn": "Iniciando sesión...",
    "googleButton": "google",
    "appleButton": "Apple",
    "moreProvidersSoon": "Habrá más proveedores disponibles pronto.",
    "accessibility": {
      "openRegionSelection": "Selección de región abierta"
    },
    "errors": {
      "unauthorized": "Error de autenticación. Inicie sesión nuevamente.",
      "cannotConnect": "No se pudo conectar al servidor. Inténtelo de nuevo.",
      "server": "Error en la validación del servidor. Inténtelo de nuevo en breve.",
      "rejected": "La solicitud de inicio de sesión fue rechazada. Verifique la configuración de autenticación.",
      "badData": "Se recibió respuesta inesperada del servidor.",
      "generic": "No se pudo completar el inicio de sesión. Inténtelo de nuevo.",
      "googleCancelled": "El inicio de sesión de Google fue cancelado.",
      "googleUnavailable": "El inicio de sesión de Google es no disponible en este dispositivo.",
      "googleFailed": "Error al iniciar sesión en Google. Por favor inténtalo de nuevo."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "Elija su par de idiomas",
    "titleSettings": "Preferencias de idioma",
    "subtitleOnboarding": "Elija su idioma nativo y de destino de una lista global con banderas y países.",
    "subtitleSettings": "Actualiza aquí tu idioma nativo y el idioma objetivo con bandera e información del país.",
    "currentPair": "Par actual",
    "availableOptionsCount": "{{count}} opciones de idioma/país disponibles",
    "nativeLanguageTitle": "Idioma nativo",
    "nativeLanguageBody": "Las traducciones y explicaciones se mostrarán en este idioma.",
    "learningLanguageTitle": "Idioma de aprendizaje",
    "learningLanguageBody": "Las definiciones y contextos se generarán en este idioma.",
    "selectedLabel": "Seleccionado",
    "pickerTitleL1": "Elegir idioma nativo",
    "pickerTitleL2": "Elegir idioma de aprendizaje",
    "searchPlaceholder": "Buscar idioma o país",
    "noResults": "No se encontraron resultados.",
    "saving": "Guardando...",
    "continue": "Continuar",
    "save": "Guardar",
    "accessibility": {
      "goBack": "Regresar",
      "selectNativeLanguage": "Seleccione nativo idioma",
      "selectLearningLanguage": "Seleccionar idioma de aprendizaje",
      "continueWithSelectedLanguages": "Continuar con los idiomas seleccionados",
      "saveLanguages": "Guardar idiomas",
      "closeLanguagePicker": "Cerrar idioma picker",
      "closePicker": "Cerrar selector",
      "selectLanguageItem": "Seleccione {{language}} {{country}}@"
    },
    "errors": {
      "cannotConnect": "No se pudo conectar al servidor. Inténtelo de nuevo.",
      "unauthorized": "La sesión no es válida. Inicie sesión nuevamente.",
      "validation": "No se pudieron guardar las preferencias de idioma. Por favor verifique sus entradas.",
      "server": "Se produjo un error en el servidor. Inténtelo de nuevo en breve.",
      "saveFailed": "No se pudieron guardar las preferencias de idioma. Inténtelo de nuevo.",
      "noSession": "No se encontró ninguna sesión activa. Inicie sesión nuevamente.",
      "selectTwoLanguages": "Seleccione ambos idiomas.",
      "sameLanguagePair": "El idioma nativo y el idioma de aprendizaje no pueden ser los mismos."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "Reintentar",
      "signIn": "Iniciar sesión",
      "favoriteLabel": "Favorito",
      "learnedLabel": "Aprendido",
      "detailButton": "Abrir detalles"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "Cómo funciona realmente VocOrbit",
      "subtitle": "Flujo real: seleccione una oración fuera de la aplicación, elija una palabra y luego aprenda con contexto dentro de VocOrbit.",
      "progress": "Paso {{current}} / {{total}}",
      "progressSingle": "Paso {{current}}",
      "mock": {
        "contextLabel": "Oración de contexto",
        "selectedWordLabel": "Palabra seleccionada",
        "meaningLabel": "Significado básico",
        "whyLabel": "Por qué en esto contexto"
      },
      "flowTitle": "Aprende el flujo en 3 pasos rápidos",
      "highlightsTitle": "Lo que obtienes",
      "actions": {
        "previous": "Anterior",
        "next": "Siguiente step",
        "enterApp": "Empezar a aprender",
        "showExample": "Mostrar un ejemplo real",
        "hideExample": "Ocultar ejemplo"
      },
      "steps": {
        "step1": {
          "step": "PASO 1 • Compartir un frase",
          "title": "Seleccione la frase donde aparece la palabra",
          "body": "Mantenga presionado el texto en el navegador, notas o cualquier aplicación y envíelo a VocOrbit Share Extension.",
          "source": "Cuando miro hacia atrás, quedo impresionado nuevamente con el poder vivificante de literatura.",
          "word": "literatura",
          "meaning": "obras escritas, especialmente aquellas consideradas artísticas",
          "why": "En esta oración se refiere a libros y arte escrito que afectan fuertemente al hablante.",
          "hint": "Consejo: comparta siempre la oración completa, no solo la palabra.",
          "bullets": {
            "one": "Funciona con el navegador, notas y muchas aplicaciones de lectura",
            "two": "Mantienes la oración original contexto",
            "three": "No se necesita flujo manual de copiar y pegar"
          }
        },
        "step2": {
          "step": "PASO 2 • Elija la palabra exacta",
          "title": "Toque una palabra y obtenga un significado básico instantáneo",
          "body": "Dentro de la vista para compartir, las palabras se pueden tocar. Seleccione una palabra objetivo y ejecute una visión básica.",
          "source": "La lectura no debe presentarse a los niños como una tarea, un deber.",
          "word": "cometido",
          "meaning": "una tarea rutinaria, generalmente desagradable",
          "why": "Aquí 'tarea' enfatiza que leer no debe parecer un trabajo forzado.",
          "hint": "Consejo: si no estás seguro, comienza con lo básico. Luego ejecute avanzado en la aplicación.",
          "bullets": {
            "one": "El significado se genera para esta oración exacta",
            "two": "También ve por qué se elige este sentido",
            "three": "Admite el par de idiomas seleccionado"
          }
        },
        "step3": {
          "step": "PASO 3 • Guarde y organice",
          "title": "Mueva palabras útiles a su sistema personal",
          "body": "Después de que la palabra llegue a VocOrbit, márquela como favorita o agréguela a la lista de repetición para un aprendizaje activo.",
          "source": "Apóyese en nuestra experiencia experta para preparar su proyecto para el éxito.",
          "word": "experto",
          "meaning": "una persona con habilidades o conocimientos especiales",
          "why": "Describe la experiencia como altamente confiable y calificada en el contexto de este proyecto.",
          "hint": "Consejo: Mantenga enfocada la lista repetida. 10 palabras activas brindan una mejor retención.",
          "bullets": {
            "one": "Lista favorita de palabras importantes",
            "two": "Lista repetida para memorización activa",
            "three": "El estado aprendido mantiene limpio tu progreso"
          }
        },
        "step4": {
          "step": "PASO 4 • Bucle de práctica",
          "title": "Revisar, practicar y marcar como aprendido",
          "body": "Usar modos de práctica y recordatorios hasta que recuerdes bien, luego marcar la palabra como aprendida.",
          "source": "Quieres comunicarte con alguien sobre algo ¿otra cosa?",
          "word": "comunicarse",
          "meaning": "para contactar a alguien",
          "why": "En este contexto es un verbo compuesto que significa comunicación, no contacto físico.",
          "hint": "Consejo: use recordatorios y sesiones cortas diariamente para mantenerse estable. progreso.",
          "bullets": {
            "one": "Las tarjetas de práctica se crean a partir de sus propias palabras",
            "two": "Los análisis semanales muestran puntos débiles",
            "three": "Las palabras aprendidas salen de la cola de repetición automáticamente"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "Es posible que su sesión haya expirado. Inicie sesión nuevamente.",
      "cannotConnect": "No se pudo acceder al servidor. Comprueba tu conexión y vuelve a intentarlo.",
      "listLoadFailed": "No se pudo cargar la lista de palabras. Inténtelo de nuevo.",
      "searchLoadFailed": "No se pudieron cargar los resultados de la búsqueda. Inténtelo de nuevo.",
      "itemNotFound": "Registro de palabras no encontrado.",
      "reloginRequired": "Inicie sesión nuevamente para continuar.",
      "favoriteActionFailed": "Error en la acción favorita. Inténtelo de nuevo.",
      "detailLoadFailed": "No se pudieron cargar los detalles de la palabra.",
      "stateUpdateFailed": "No se pudo actualizar el estado. Inténtelo de nuevo.",
      "analysisRequestFailed": "No se pudo enviar la solicitud de análisis.",
      "invalidModelOutput": "El formato de respuesta del modelo no era válido. Inténtelo de nuevo.",
      "analysisTimeout": "Se agotó el tiempo de espera del análisis. Inténtelo de nuevo.",
      "advancedCreditInsufficient": "Créditos avanzados insuficientes.",
      "basicCreditInsufficient": "Créditos básicos insuficientes.",
      "advancedAnalysisFailed": "No se pudo completar el análisis avanzado.",
      "basicAnalysisFailed": "No se pudo completar el análisis básico. completado.",
      "repeatProgressUpdateFailed": "No se pudo actualizar el progreso de repetición. Inténtelo de nuevo.",
      "missingContext": "Falta el contexto requerido para el análisis.",
      "selectedWordNotInSentence": "La palabra seleccionada no se encuentra en la oración contextual.",
      "analysisFailedGeneric": "No se pudo completar el análisis. Inténtelo de nuevo.",
      "unexpected": "Se produjo un error inesperado."
    },
    "search": {
      "title": "Buscar",
      "placeholder": "Buscar por palabra, significado o explicación",
      "loading": "Cargando palabras...",
      "emptyResult": "No hay palabras que coincidan con tu búsqueda.",
      "emptyHint": "Empieza a escribir arriba para buscar."
    },
    "showroom": {
      "loading": "Cargando lista de palabras...",
      "emptyTitle": "Aún no hay palabras",
      "emptyBody": "Después de agregar palabras a través de Word Insight, esta lista se completará automáticamente.",
      "emptyCta": "Abrir anuncios",
      "updateAvailableTitle": "Nueva versión disponible",
      "updateAvailableBody": "Toque para actualizar y seguir recibiendo las últimas mejoras.",
      "updateNow": "Actualizar now",
      "repeatAdded": "{{word}} agregado a la lista de repetición ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}} eliminado de la lista de repetición ({{count}}/{{limit}}).",
      "repeatLimitReached": "Has alcanzado el límite de repetición de tu lista (10/10).",
      "repeatPermissionRequired": "Se requiere permiso de notificación para los recordatorios. Habilite notificaciones para agregar palabras.",
      "favoriteAdded": "{{word}} agregado a favoritos.",
      "favoriteRemoved": "{{word}} eliminado de favoritos.",
      "repeatCleared": "Repetir lista borrado.",
      "repeatListTitle": "Lista de repetición",
      "repeatCount": "{{count}}/{{limit}} palabras",
      "repeatEmpty": "La lista de repetición está vacía. Agrega palabras con el botón de campana.",
      "clearAll": "Borrar todo",
      "done": "Listo",
      "practice": "Practicar",
      "accessibility": {
        "showDetails": "Mostrar detalles",
        "favoriteWord": "Palabra favorita",
        "repeatWordLater": "Repetir esta palabra más tarde",
        "openProfile": "Abrir perfil",
        "openRepeatList": "Abrir lista de palabras repetidas",
        "openAnnouncements": "Abrir anuncios",
        "openUpdate": "Abrir página de actualización",
        "dismissUpdate": "Descartar notificación de actualización",
        "searchWords": "Palabras de búsqueda",
        "switchToCard": "Cambiar a vista de tarjeta",
        "switchToList": "Cambiar a vista de lista",
        "retryShowroom": "Intente cargar la sala de exposición nuevamente",
        "closeRepeatList": "Cerrar lista de repetición",
        "clearRepeatList": "Borrar lista de repetición",
        "removeFromRepeat": "Eliminar {{word}} de la lista de repeticiones",
        "practiceWord": "practica esta palabra",
        "addWord": "Añadir palabra"
      },
      "quickAdd": {
        "eyebrow": "Añadir rápido",
        "title": "Añade una palabra desde el contexto",
        "body": "Pega una frase, elige la palabra exacta y guárdala.",
        "action": "Añadir palabra",
        "actionHint": "Pega y elige"
      }
    },
    "practiceHub": {
      "title": "Practicar",
      "sectionLabel": "PRACTICAR",
      "selectAnswer": "SELECCIONA LA RESPUESTA",
      "modeBasic": "Básico",
      "modeAdvanced": "Avanzado",
      "loadingTitle": "Cargando catálogo",
      "loadingMessage": "Comprobando qué tipos de ejercicios están disponibles para ti.",
      "loadingQuestionsTitle": "Preparando preguntas de práctica...",
      "loadingQuestionsMessage": "Generando preguntas según los datos de vocabulario disponibles.",
      "instructions": {
        "matchSynonyms": "Elige el sinónimo más cercano."
      },
      "resultCta": {
        "backToPractice": "Volver a practicar",
        "seeResult": "Ver resultado",
        "nextWord": "Siguiente palabra"
      },
      "result": {
        "correctTitle": "¡Correcto!",
        "incorrectTitle": "¡Incorrecto!",
        "correctAnswerLabel": "Respuesta correcta:",
        "usedInSentenceLabel": "Usado en una oración:",
        "sessionResultLabel": "Resultado de la sesión"
      },
      "leavePrompt": {
        "title": "¿Ya te vas?",
        "keepPlaying": "Seguir jugando",
        "leave": "Salir",
        "closePromptAccessibility": "Cerrar aviso de salida",
        "leavePracticeAccessibility": "Salir de la práctica"
      },
      "hints": {
        "availableCount": "{{count}} palabras disponibles",
        "missingSynonyms": "Datos de sinónimos no disponibles",
        "minActiveWords": "Se requieren al menos 2 palabras activas"
      },
      "tiles": {
        "meaningMatch": "Emparejar significado",
        "fillInGap": "Rellenar el hueco",
        "guessWord": "Adivinar la palabra",
        "matchSynonyms": "Emparejar sinónimos"
      },
      "accessibility": {
        "goBack": "Volver",
        "useMode": "Usar modo {{mode}}",
        "closePractice": "Cerrar práctica"
      },
      "loadState": {
        "noQuestions": {
          "title": "Aún no hay preguntas de práctica",
          "message": "Necesitas al menos 2 palabras activas para empezar.",
          "actionLabel": "Agregar palabras"
        },
        "unauthorized": {
          "title": "Se requiere iniciar sesión",
          "message": "Tu sesión puede haber expirado. Inicia sesión de nuevo para continuar.",
          "actionLabel": "Iniciar sesión"
        },
        "forbidden": {
          "title": "Esta función no está disponible actualmente",
          "message": "Revisa tu plan o créditos para continuar.",
          "actionLabel": "Obtener créditos"
        },
        "rejected": {
          "title": "No hay datos suficientes para este modo",
          "message": "Agrega más palabras e inténtalo de nuevo.",
          "actionLabel": "Agregar palabras"
        },
        "server": {
          "title": "No se pudo conectar al servidor",
          "message": "Revisa tu conexión e inténtalo otra vez.",
          "actionLabel": "Reintentar"
        },
        "generic": {
          "title": "No se pudo iniciar la práctica",
          "message": "Ocurrió un error inesperado. Inténtalo de nuevo.",
          "actionLabel": "Reintentar"
        }
      }
    },
    "announcements": {
      "title": "Anuncios",
      "unreadCount": "{{count}} sin leer",
      "markAllRead": "Marcar todo como leído",
      "loading": "Cargando anuncios...",
      "empty": "No hay anuncios por ahora.",
      "openLink": "Abrir enlace",
      "openAnnouncement": "Abrir anuncio: {{title}}",
      "levelInfo": "Información",
      "levelWarning": "Advertencia",
      "levelCritical": "Crítico",
      "loadFailed": "No se pudieron cargar los anuncios. Inténtalo de nuevo.",
      "claimFailed": "El reclamo de recompensa falló. Por favor inténtalo de nuevo.",
      "requirementNotMet": "El requisito aún no se cumple. Invita a tus amigos primero.",
      "referralCodeMissing": "Falta el código de referencia para esta cuenta.",
      "referralProgress": "Progreso de la referencia: {{current}}/{{required}}",
      "shareInvite": "invitar a un amigo",
      "referralShareMessage": "Únase a VocOrbit.\nAbra este enlace:\n{{link}}",
      "rewardText": "Recompensa: +{{amount}} {{creditType}} créditos",
      "creditBasic": "básico",
      "creditAdvanced": "avanzado",
      "claimReward": "Afirmar",
      "claimingReward": "Reclamando...",
      "rewardClaimed": "Reclamado"
    },
    "forceUpdate": {
      "title": "Actualización requerida",
      "body": "Se requiere una nueva versión para continuar usando VocOrbit.",
      "updateNow": "Actualizar now",
      "checkAgain": "Verificar nuevamente"
    },
    "profile": {
      "title": "Perfil",
      "accountDetailsTitle": "Detalles de la cuenta",
      "accountDetailsSubtitle": "Ver tu correo y la información de tu cuenta.",
      "settingsTitle": "Ajustes",
      "settingsSubtitle": "Personaliza el tamaño del texto y el orden de los botones de acción.",
      "favoriteWordsTitle": "Palabras favoritas",
      "favoriteWordsSubtitle": "Ver palabras añadidas a favoritos.",
      "learnedWordsTitle": "Palabras aprendidas",
      "learnedWordsSubtitle": "Ver palabras marcadas como aprendidas.",
      "weeklyAnalyticsTitle": "Análisis semanal",
      "weeklyAnalyticsSubtitle": "Ver tu rendimiento de práctica de los últimos 7 días.",
      "regionTitle": "Región",
      "regionSubtitle": "Actual: {{region}}",
      "regionNotSelected": "No seleccionado",
      "emptyFavorites": "Aún no hay palabras favoritas.",
      "emptyLearned": "Aún no hay palabras aprendidas.",
      "loadingList": "Cargando lista...",
      "logOut": "Cerrar sesión",
      "accessibility": {
        "goBack": "Regresar",
        "openAccountDetails": "Abrir detalles de la cuenta",
        "openSettings": "Abrir configuración",
        "openFavoriteWords": "Abrir palabras favoritas",
        "openLearnedWords": "Abrir palabras aprendidas",
        "openWeeklyAnalytics": "Abrir análisis semanales",
        "openRegion": "Abrir región settings",
        "logOut": "Cerrar sesión",
        "playPronunciation": "Reproducir pronunciación para {{word}}",
        "openDetailForWord": "Abrir detalle para {{word}}@",
        "removeWord": "Quitar {{word}}"
      }
    },
    "settings": {
      "title": "Ajustes",
      "languagePairTitle": "Par de idiomas",
      "languagePairSubtitle": "Cambia tu idioma nativo y el idioma que estás aprendiendo.",
      "billingCreditsTitle": "Facturación y créditos",
      "billingCreditsSubtitle": "Administra aquí créditos de significado básico y paquetes IAP.",
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
      "themeModeSubtitle": "Elige claro, oscuro o sigue tu sistema configuración.",
      "themeModeSystem": "Sistema",
      "themeModeLight": "Claro",
      "themeModeDark": "Oscuro",
      "textSizeTitle": "Tamaño del texto",
      "textSizeSubtitle": "Ajusta el tamaño del texto en las tarjetas de vocabulario.",
      "actionOrderTitle": "Orden de acciones",
      "actionOrderSubtitle": "Define el orden de los botones detalle/favorito/repetir.",
      "actionDetail": "Detalle",
      "actionFavorite": "Favorito",
      "actionRepeat": "Repetir",
      "resetToDefaults": "Restablecer valores predeterminados",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "Volver",
        "openLanguagePreferences": "Abrir preferencias de idioma",
        "openBillingCredits": "Abrir facturación y créditos",
        "useSystemTheme": "Usar tema del sistema",
        "useLightTheme": "Usar tema claro",
        "useDarkTheme": "Usar tema oscuro",
        "decreaseTextSize": "Reducir tamaño del texto",
        "increaseTextSize": "Aumentar tamaño del texto",
        "moveActionLeft": "Mover {{action}} a la izquierda",
        "moveActionRight": "Mover {{action}} a la derecha",
        "resetSettings": "Restablecer configuración de vocabulario"
      }
    },
    "accountDetails": {
      "title": "Detalles de la cuenta",
      "emailLabel": "Correo electrónico",
      "userIdLabel": "ID de usuario",
      "regionLabel": "Región principal",
      "regionEndpointLabel": "Endpoint de región",
      "appVersionLabel": "Versión de la app",
      "buildLabel": "Número de compilación",
      "platformLabel": "Plataforma",
      "osVersionLabel": "Versión del SO",
      "accessibility": {
        "goBack": "Volver",
        "deleteAccount": "Eliminar cuenta permanentemente"
      },
      "deleteAccount": {
        "sectionTitle": "Eliminar cuenta",
        "sectionBody": "Elimine permanentemente su cuenta VocOrbit y los datos de la aplicación vinculados a ella. Esta acción no se puede deshacer.",
        "action": "Eliminar cuenta permanentemente",
        "deleting": "Eliminando cuenta...",
        "confirmTitle": "¿Eliminar cuenta?",
        "confirmBody": "Esto elimina permanentemente su cuenta VocOrbit y los datos de la aplicación vinculada. Esta acción no se puede deshacer.",
        "successTitle": "Cuenta eliminada",
        "successBody": "Su cuenta VocOrbit ha sido eliminada permanentemente.",
        "missingUser": "No se pudo encontrar su ID de cuenta. Por favor inicia sesión nuevamente.",
        "cannotConnect": "No se pudo llegar al servidor. Comprueba tu conexión y vuelve a intentarlo.",
        "sessionExpired": "Tu sesión expiró. Por favor inicia sesión nuevamente.",
        "failed": "No pudimos eliminar su cuenta en este momento. Por favor inténtalo de nuevo."
      }
    },
    "iap": {
      "title": "Facturación y créditos",
      "loading": "Cargando detalles de facturación...",
      "currentSubscription": "Suscripción actual",
      "currentStatus": "Estado: {{status}}",
      "currentPlan": "Plan actual: {{plan}}",
      "noActivePlan": "No hay plan activo",
      "refresh": "Actualizar facturación",
      "basicCreditsTitle": "Créditos de insight básico",
      "basicCreditsBody": "El análisis de significado básico en la pantalla de compartir consume este crédito.",
      "plansTitle": "Planes",
      "plansBody": "Elige un plan y completa el pago con tu cuenta de la tienda.",
      "noPlans": "No se encontraron planes comprables para esta plataforma.",
      "planTopup": "Recarga mensual: +{{basic}} básico · +{{advanced}} avanzado",
      "planCaps": "Límites: {{basicCap}} básico · {{advancedCap}} avanzado",
      "priceLabel": "Precio: {{price}}",
      "buyNow": "Comprar ahora",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "Procesando compra...",
      "purchaseCanceled": "Compra cancelada.",
      "purchaseApplied": "{{sku}} activado exitosamente.",
      "alreadyOwnedRestoring": "Este artículo ya es propiedad. Restaurando sus compras...",
      "restorePurchases": "Restaurar compras",
      "restoring": "Restaurando compras...",
      "restoreNoPurchases": "No se encontraron compras para restaurar.",
      "restoreNoApplicablePurchases": "No se pudieron aplicar compras restaurables.",
      "restoreApplied": "{{count}} compras restauradas y verificado.",
      "status": {
        "none": "No suscrito",
        "pending": "Pendiente",
        "active": "Activo",
        "expired": "Expirado",
        "canceled": "Cancelado",
        "refunded": "Reembolsado"
      },
      "errors": {
        "unauthorized": "Su sesión expiró. Inicie sesión nuevamente.",
        "cannotConnect": "No se pudo acceder al servidor. Verifique su conexión e inténtelo nuevamente.",
        "forbidden": "Esta compra no se pudo aplicar a su cuenta.",
        "generic": "La solicitud de facturación falló. Inténtelo de nuevo.",
        "purchaseFailed": "La compra falló. Inténtelo de nuevo.",
        "alreadyOwned": "Este artículo ya pertenece a esta cuenta.",
        "invalidReceipt": "El recibo de la tienda no se pudo validar.",
        "iapUnavailable": "El servicio de compra de la tienda no está disponible actualmente en este dispositivo."
      },
      "accessibility": {
        "goBack": "Regresar",
        "buyPlan": "Comprar {{plan}} plan",
        "restorePurchases": "Restaurar compras anteriores",
        "refresh": "Actualizar estado de facturación y suscripción"
      },
      "desktop": {
        "subtitle": "Vea su saldo actual aquí. Continúan las nuevas compras y cambios de suscripción en dispositivos móviles.",
        "desktopBadge": "Vista de escritorio",
        "phoneOnlyBadge": "Teléfono para compras",
        "balanceTitle": "Tu saldo actual",
        "balanceBody": "Desktop mantiene visibles sus créditos disponibles y el estado de la suscripción, para que pueda verificar su cuenta antes de continuar con su flujo de aprendizaje.",
        "basicAvailable": "Créditos básicos",
        "advancedAvailable": "Créditos avanzados",
        "freeCredits": "Gratis",
        "paidCredits": "Pagado",
        "noPlanBody": "Esta cuenta no tiene un plan de facturación móvil activo en este momento. Aún puedes utilizar los créditos que ya estén disponibles aquí.",
        "mobileTitle": "Continuar compras en tu teléfono",
        "mobileBody": "Las compras de crédito y los cambios de suscripción se completan dentro de la aplicación móvil con su cuenta App Store o Google Play.",
        "storeLabel": "Tienda: {{store}}",
        "renewsOn": "Renueva el {{date}}",
        "expiresOn": "Terminó el {{date}}",
        "updatedOn": "Última sincronización: {{date}}",
        "stepOpenPhone": "Abra VocOrbit en su teléfono con la misma cuenta.",
        "stepOpenBilling": "Vaya a Perfil > Facturación y créditos.",
        "stepFinishPurchase": "Compre créditos o administre su suscripción allí, luego regrese aquí y actualice.",
        "mobileHint": "Su saldo de crédito se actualiza aquí después de que la compra móvil se aplique a la misma cuenta."
      }
    },
    "weeklyAnalytics": {
      "title": "Análisis semanal",
      "modeAll": "Todo",
      "modeBasic": "Básico",
      "modeAdvanced": "Avanzado",
      "loading": "Cargando análisis semanal...",
      "summaryTitle": "Resumen (7 días)",
      "sessions": "Sesiones",
      "completed": "Completadas",
      "answered": "Respondidas",
      "accuracy": "Precisión",
      "activeDays": "Días activos",
      "streak": "Racha",
      "dailyTrend": "Tendencia diaria",
      "byQuestionType": "Por tipo de pregunta",
      "byMode": "Por modo",
      "weakItems": "Elementos débiles",
      "noWeakItems": "No se encontraron palabras débiles destacables esta semana.",
      "weakItemMeta": "Errores: {{wrongAnswers}} · Precisión: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "Emparejar significado",
      "questionTypeGuessWord": "Adivinar palabra",
      "questionTypeFillInGap": "Rellenar el hueco",
      "questionTypeMatchSynonym": "Emparejar sinónimos",
      "errors": {
        "unauthorized": "Tu sesión puede haber expirado. Inicia sesión de nuevo.",
        "cannotConnect": "No se pudo conectar al servidor. Revisa tu conexión e inténtalo otra vez.",
        "loadFailed": "No se pudo cargar el análisis semanal. Inténtalo de nuevo."
      },
      "accessibility": {
        "goBack": "Volver",
        "filterByMode": "Filtrar por {{mode}}",
        "retry": "Reintentar solicitud de análisis"
      }
    },
    "detail": {
      "closeDetails": "Cerrar detalles de la palabra",
      "loadingDetail": "Cargando detalle de la palabra...",
      "detailLoadFailedTitle": "No se pudo cargar el detalle",
      "statusLearned": "aprendido",
      "statusActive": "activo",
      "markAsLearned": "Marcar como aprendido",
      "moveBackToActive": "Volver a activo",
      "buyAdvancedCredits": "Comprar créditos avanzados",
      "buyBasicCredits": "Comprar créditos básicos",
      "buyCredits": "Comprar créditos",
      "whyThisSense": "Por qué este sentido",
      "examples": "Ejemplos",
      "synonyms": "Sinónimos",
      "antonyms": "Antónimos",
      "collocations": "Colocaciones",
      "alternativeMeanings": "Significados alternativos",
      "usageNotes": "Notas de uso",
      "noSynonyms": "Aún no hay datos de sinónimos.",
      "stats": "Estadísticas",
      "encountersAndLastMode": "Encuentros: {{encounters}} | Último modo: {{mode}}",
      "nextReminder": "Siguiente recordatorio",
      "currentPlan": "Plan actual: {{due}}",
      "reviewHint": "Olvidé: +10 min, Difícil: +1 hora, Bien: crece desde +1 día.",
      "runAdvanced": "Ejecutar análisis avanzado",
      "reviewForgot": "Olvidé",
      "reviewHard": "Difícil",
      "reviewGood": "Bien",
      "reviewOptionAccessibility": "{{title}} seleccionado. Próxima revisión en {{delay}}.",
      "repeatUnscheduled": "Sin programar",
      "repeatNow": "Ahora",
      "repeatAfterMinutes": "{{count}} min",
      "repeatAfterHours": "{{count}} h",
      "repeatAfterDays": "{{count}} día",
      "repeatAfterWeeks": "{{count}} semana",
      "repeatInMinutes": "en {{count}} min",
      "repeatInHours": "en {{count}} h",
      "repeatInDays": "en {{count}} día",
      "repeatInWeeks": "en {{count}} semana",
      "repeatNotificationTitle": "Hora de repasar: {{word}}",
      "repeatNotificationBody": "Repasa la palabra {{word}}.",
      "reportIssue": "Reportar significado incorrecto",
      "reportIssueAccessibility": "Reportar significado incorrecto de {{word}}",
      "deleteWord": "Eliminar palabra",
      "deleteWordAccessibility": "Eliminar suavemente {{word}}",
      "deleteConfirmTitle": "¿Eliminar esta palabra?",
      "deleteConfirmBody": "\"{{word}}\" se eliminará de tu lista. Puedes volver a añadirla más tarde.",
      "deleteConfirmCancel": "Cancelar",
      "deleteConfirmAction": "Sí, eliminar"
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
      "title": "Significado del informe",
      "subtitle": "Si \"{{word}}\" parece incorrecto en este contexto, díganos qué está mal.",
      "messageLabel": "¿Qué parece incorrecto?",
      "messagePlaceholder": "Ejemplo: este significado no se ajusta a la oración. Debe describir la comunicación, no la ubicación.",
      "charactersLeft": "{{count}} caracteres restantes",
      "submit": "Enviar informe",
      "successTitle": "Informe enviado",
      "successBody": "Gracias por los comentarios. Revisaremos este elemento.",
      "backToDetail": "Volver al detalle de la palabra",
      "errors": {
        "unauthorized": "Su sesión expiró. Inicie sesión nuevamente.",
        "cannotConnect": "No se pudo acceder al servidor. Verifique su conexión e inténtelo nuevamente.",
        "itemNotFound": "No se pudo encontrar el elemento de la palabra.",
        "submitFailed": "No se pudo enviar el informe. Inténtelo de nuevo."
      },
      "accessibility": {
        "goBack": "Regresar",
        "submit": "Enviar informe de problema",
        "backToDetail": "Volver al detalle de la palabra"
      }
    },
    "capture": {
      "backButton": "Biblioteca",
      "headerTitle": "Agregar palabra",
      "headerBody": "Pega una oración y elige la palabra que deseas guardar.",
      "seedWordLabel": "Buscando: {{word}}",
      "pasteHero": {
        "title": "Pegar texto copiado",
        "body": "Copie una oración o párrafo y luego péguelo para abrir el selector.",
        "bodyWithWord": "Copie una oración que incluya \"{{word}}\" y luego péguela para abrir el selector.",
        "hint": "El selector se abre automáticamente después de pegar."
      },
      "picker": {
        "title": "Elige la palabra en el texto.",
        "body": "Haga clic en la palabra exacta a continuación. Pegue nuevamente si copió una oración diferente.",
        "badge": "selector de palabras",
        "hint": "VocOrbit crea la tarjeta de palabras automáticamente a partir de esta búsqueda."
      },
      "status": {
        "pasteFirst": "Pegue el texto copiado para comenzar.",
        "selectedWord": "Palabra seleccionada: {{word}}",
        "seedWordMissing": "Pegue una oración con \"{{word}}\" o seleccione otra palabra a continuación.",
        "selectWord": "Haga clic en la palabra exacta a continuación para continuar."
      },
      "actions": {
        "pasteCopiedText": "Pegar texto copiado",
        "pasteAgain": "Pegar de nuevo",
        "clear": "Claro",
        "readingClipboard": "Leyendo el portapapeles...",
        "reading": "Lectura...",
        "analyzeAndSave": "Analizar y guardar",
        "loadingMeaning": "Obteniendo significado básico...",
        "openSavedWord": "Abrir palabra guardada",
        "backToLibrary": "volver a la biblioteca",
        "pickAnotherWord": "Elige otra palabra"
      },
      "loading": {
        "title": "Ejecución de información básica",
        "body": "VocOrbit está comparando la palabra seleccionada con esta oración."
      },
      "result": {
        "title": "Significado básico",
        "savedFallback": "Guardado en tu biblioteca.",
        "contextMeaning": "Significado del contexto",
        "whyThisMeaning": "¿Por qué este significado?"
      },
      "problems": {
        "clipboardUnavailableTitle": "Portapapeles no disponible",
        "clipboardUnavailableBody": "El acceso al portapapeles está bloqueado en este contexto del navegador. Pega la oración manualmente.",
        "contextRequiredTitle": "Contexto requerido",
        "contextRequiredBody": "Pegue una oración o un párrafo corto antes de seleccionar una palabra.",
        "selectWordTitle": "Seleccione una palabra en el texto",
        "selectWordBody": "Haga clic en la palabra exacta dentro del bloque de texto antes de ejecutar la búsqueda.",
        "signInRequiredTitle": "Es necesario iniciar sesión",
        "signInRequiredBody": "Tu sesión expiró. Abra VocOrbit nuevamente e inicie sesión antes de volver a intentar esta búsqueda.",
        "basicCreditsRequiredTitle": "Créditos básicos requeridos",
        "basicCreditsRequiredBody": "Su cuenta no puede ejecutar una búsqueda básica en este momento.",
        "requestTimedOutTitle": "Solicitud agotada",
        "requestTimedOutBody": "La búsqueda tomó demasiado tiempo. Inténtalo de nuevo con la misma frase.",
        "connectionProblemTitle": "Problema de conexión",
        "connectionProblemBody": "VocOrbit no pudo comunicarse con el servidor. Verifique su conexión y vuelva a intentarlo.",
        "lookupFailedTitle": "La búsqueda falló",
        "lookupFailedBody": "VocOrbit no pudo finalizar esta solicitud de información.",
        "lookupIncompleteTitle": "Búsqueda incompleta",
        "lookupIncompleteBody": "VocOrbit devolvió una respuesta inesperada. Inténtalo de nuevo una vez más."
      }
    }
  }
}

export default es
