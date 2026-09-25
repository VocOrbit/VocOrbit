import { Translations } from "./en"

const ptBr: Translations = {
  "common": {
    "ok": "Ok!",
    "cancel": "Cancelar",
    "back": "Voltar",
    "logOut": "Sair"
  },
  "welcomeScreen": {
    "postscript": "psst  — Provavelmente não é assim que o seu aplicativo se parece. (A menos que o seu designer lhe tenha entregue estes ecrãs e, nesse caso, envie-os!)",
    "readyForLaunch": "A sua aplicação está quase pronta para ser lançada!",
    "exciting": "(ohh, isso é emocionante!)",
    "letsGo": "Vamos!"
  },
  "errorScreen": {
    "title": "Ocorreu um erro!",
    "friendlySubtitle": "Este é o ecrã que os seus utilizadores verão na produção quando um erro for lançado. Você deve personalizar esta mensagem (localizada em `app/i18n/en.ts`) e, provavelmente, o layout também (`app/screens/ErrorScreen`). Se você quiser remover isso completamente, verifique `app/app.tsx` para o componente <ErrorBoundary>.",
    "reset": "REINICIAR APLICAÇÃO",
    "traceTitle": "Erro da pilha %{name}"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "Tão vazio... tão triste",
      "content": "Nenhum dado encontrado ainda. Tente clicar no botão para atualizar ou recarregar a aplicação.",
      "button": "Vamos tentar novamente"
    }
  },
  "errors": {
    "invalidEmail": "Endereço de e-mail inválido."
  },
  "loginScreen": {
    "logIn": "Entrar",
    "subtitle": "Continue com a sua conta social para aceder ao seu progresso de vocabulário.",
    "continueWith": "CONTINUAR COM",
    "regionTitle": "Região",
    "regionSubtitle": "Atual: {{region}}",
    "regionNotSelected": "Não seleccionado",
    "changeRegion": "Alterar",
    "signingIn": "A iniciar sessão...",
    "googleButton": "Google",
    "appleButton": "Apple (em breve)",
    "moreProvidersSoon": "Mais fornecedores estarão disponíveis em breve.",
    "accessibility": {
      "openRegionSelection": "Selecção de região aberta"
    },
    "errors": {
      "unauthorized": "Falha na autenticação. Inicie sessão novamente.",
      "cannotConnect": "Não foi possível ligar ao servidor. Tente novamente.",
      "server": "Falha na validação do servidor. Tente novamente em breve.",
      "rejected": "O pedido de início de sessão foi rejeitado. Verifique a configuração de autenticação.",
      "badData": "Resposta inesperada recebida do servidor.",
      "generic": "Não foi possível concluir o login. Tente novamente.",
      "googleCancelled": "O login do Google foi cancelado.",
      "googleUnavailable": "O login do Google não está disponível neste dispositivo.",
      "googleFailed": "Falha ao iniciar sessão no Google. Tente novamente."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "Escolha o seu par de idiomas",
    "titleSettings": "Preferências de idioma",
    "subtitleOnboarding": "Escolha o seu idioma nativo e de destino a partir de uma lista global com bandeiras e países.",
    "subtitleSettings": "Atualize o seu idioma nativo e de destino aqui com informações sobre a bandeira e o país.",
    "currentPair": "Par actual",
    "availableOptionsCount": "{{count}} opções de idioma/país disponíveis",
    "nativeLanguageTitle": "Língua materna",
    "nativeLanguageBody": "Traduções e explicações serão mostradas neste idioma.",
    "learningLanguageTitle": "Linguagem de aprendizagem",
    "learningLanguageBody": "Definições e contextos serão gerados nesta linguagem.",
    "selectedLabel": "Seleccionado",
    "pickerTitleL1": "Escolha o idioma nativo",
    "pickerTitleL2": "Escolha o idioma de aprendizagem",
    "searchPlaceholder": "Pesquisar idioma ou país",
    "noResults": "Nenhum resultado encontrado.",
    "saving": "A guardar...",
    "continue": "Continuar",
    "save": "Guardar",
    "accessibility": {
      "goBack": "Voltar",
      "selectNativeLanguage": "Escolha o idioma nativo",
      "selectLearningLanguage": "Selecionar idioma de aprendizagem",
      "continueWithSelectedLanguages": "Continuar com os idiomas selecionados",
      "saveLanguages": "Guardar idiomas",
      "closeLanguagePicker": "Fechar seletor de idioma",
      "closePicker": "Fechar seletor",
      "selectLanguageItem": "Selecionar {{language}} {{country}}"
    },
    "errors": {
      "cannotConnect": "Não foi possível ligar ao servidor. Tente novamente.",
      "unauthorized": "A sessão é inválida. Inicie sessão novamente.",
      "validation": "Não foi possível guardar as preferências de idioma. Por favor, verifique as suas entradas.",
      "server": "Ocorreu um erro no servidor. Tente novamente em breve.",
      "saveFailed": "Não foi possível guardar as preferências de idioma. Tente novamente.",
      "noSession": "Nenhuma sessão ativa encontrada. Inicie sessão novamente.",
      "selectTwoLanguages": "Selecione ambos os idiomas.",
      "sameLanguagePair": "O idioma nativo e o idioma de aprendizagem não podem ser os mesmos."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "Tentar novamente",
      "signIn": "Entrar",
      "favoriteLabel": "Favorito",
      "learnedLabel": "Aprendido",
      "detailButton": "Abrir informações"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "Como o VocOrbit realmente funciona",
      "subtitle": "Fluxo real: selecione uma frase fora do aplicativo, escolha uma palavra e, em seguida, aprenda-a com o contexto dentro do VocOrbit.",
      "progress": "Etapa {{current}} / {{total}}",
      "progressSingle": "Etapa {{current}}",
      "mock": {
        "contextLabel": "Frase de contexto",
        "selectedWordLabel": "Palavra seleccionada",
        "meaningLabel": "Significado básico",
        "whyLabel": "Por que, neste contexto,"
      },
      "flowTitle": "Aprenda o fluxo em 3 passos rápidos",
      "highlightsTitle": "O que recebe",
      "actions": {
        "previous": "Anterior",
        "next": "Próximo passo",
        "enterApp": "Comece a aprender",
        "showExample": "Show example",
        "hideExample": "Ocultar exemplo"
      },
      "steps": {
        "step1": {
          "step": "ETAPA 1 • Compartilhar uma frase",
          "title": "Seleccione a frase onde a palavra aparece",
          "body": "Pressione longamente o texto no navegador, nas notas ou em qualquer aplicativo e envie-o para a VocOrbit Share Extension.",
          "source": "Quando olho para trás, fico novamente impressionado com o poder vivificante da literatura.",
          "word": "literatura",
          "meaning": "obras escritas, especialmente aquelas consideradas artísticas",
          "why": "Nesta frase, refere-se a livros e arte escrita que afetam fortemente o falante.",
          "hint": "Dica: sempre compartilhe a frase completa, não apenas a palavra única.",
          "bullets": {
            "one": "Funciona com navegador, notas e muitos aplicativos de leitura",
            "two": "Você mantém o contexto da frase original",
            "three": "Não é necessário fluxo manual de copiar e colar"
          }
        },
        "step2": {
          "step": "PASSO 2 • Escolha a palavra exacta",
          "title": "Toque numa palavra e obtenha um significado básico instantâneo",
          "body": "Dentro da visualização de compartilhamento, as palavras podem ser tocadas. Selecione uma palavra-alvo e execute o insight básico.",
          "source": "A leitura não deve ser apresentada às crianças como uma tarefa, um dever.",
          "word": "tarefa",
          "meaning": "uma tarefa rotineira, geralmente desagradável",
          "why": "Aqui \"tarefa\" enfatiza que a leitura não deve parecer trabalho forçado.",
          "hint": "Dica: se não tiver certeza, comece com o básico. Em seguida, execute Advanced na aplicação.",
          "bullets": {
            "one": "O significado é gerado para esta frase exata",
            "two": "Você também vê por que esse sentido é escolhido",
            "three": "Suporta o seu par de idiomas selecionado"
          }
        },
        "step3": {
          "step": "ETAPA 3 • Salvar e organizar",
          "title": "Mova palavras úteis para o seu sistema pessoal",
          "body": "Depois que a palavra atingir o VocOrbit, marque como favorito ou adicione à lista de repetição para aprendizagem ativa.",
          "source": "Conte com a nossa experiência especializada para preparar o seu projeto para o sucesso.",
          "word": "especialista",
          "meaning": "uma pessoa com habilidade ou conhecimento especial",
          "why": "Descreve a experiência como altamente confiável e qualificada neste contexto de projeto.",
          "hint": "Dica: Mantenha a lista de repetição focada. 10 palavras ativas proporcionam melhor retenção.",
          "bullets": {
            "one": "Lista de favoritos para palavras importantes",
            "two": "Repetir lista para memorização ativa",
            "three": "O estado aprendido mantém o seu progresso limpo"
          }
        },
        "step4": {
          "step": "ETAPA 4 • Circuito de prática",
          "title": "Revise, pratique e marque como aprendido",
          "body": "Use modos de prática e lembretes até que a lembrança seja forte e, em seguida, marque a palavra como aprendida.",
          "source": "Quer entrar em contacto sobre outra questão?",
          "word": "entrar em contacto",
          "meaning": "contactar alguém",
          "why": "Nesse contexto, é um phrasal verb que significa comunicação, não alcance físico.",
          "hint": "Dica: use lembretes e sessões curtas diariamente para um progresso constante.",
          "bullets": {
            "one": "Os cartões de prática são construídos a partir das suas próprias palavras",
            "two": "Análises semanais mostram pontos fracos",
            "three": "As palavras aprendidas saem da fila de repetição automaticamente"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "A sua sessão pode ter expirado. Inicie sessão novamente.",
      "cannotConnect": "Não foi possível aceder ao servidor. Verifique a sua ligação e tente novamente.",
      "listLoadFailed": "Não foi possível carregar a lista de palavras. Tente novamente.",
      "searchLoadFailed": "Não foi possível carregar os resultados da pesquisa. Tente novamente.",
      "itemNotFound": "Registo do Word não encontrado.",
      "reloginRequired": "Inicie sessão novamente para continuar.",
      "favoriteActionFailed": "A ação favorita falhou. Por favor, tente novamente.",
      "detailLoadFailed": "Não foi possível carregar o detalhe da palavra.",
      "stateUpdateFailed": "Não foi possível atualizar o estado. Tente novamente.",
      "analysisRequestFailed": "Não foi possível enviar a solicitação de análise.",
      "invalidModelOutput": "O formato de resposta do modelo era inválido. Tente novamente.",
      "analysisTimeout": "A análise expirou. Tente novamente.",
      "advancedCreditInsufficient": "Créditos adiantados insuficientes.",
      "basicCreditInsufficient": "Créditos básicos insuficientes.",
      "advancedAnalysisFailed": "Não foi possível concluir a análise avançada.",
      "basicAnalysisFailed": "Não foi possível concluir a análise básica.",
      "repeatProgressUpdateFailed": "Não foi possível atualizar o progresso repetido. Tente novamente.",
      "missingContext": "Falta o contexto necessário para a análise.",
      "selectedWordNotInSentence": "A palavra selecionada não é encontrada na frase de contexto.",
      "analysisFailedGeneric": "Não foi possível concluir a análise. Tente novamente.",
      "unexpected": "Ocorreu um erro inesperado."
    },
    "search": {
      "title": "Pesquisa",
      "placeholder": "Pesquisar por palavra, significado ou explicação",
      "loading": "A carregar palavras...",
      "emptyResult": "Nenhuma palavra corresponde à sua consulta.",
      "emptyHint": "Comece a escrever acima para pesquisar."
    },
    "showroom": {
      "loading": "A carregar lista de palavras...",
      "emptyTitle": "Ainda não há palavras",
      "emptyBody": "Depois de adicionar palavras através do Word Insight, esta lista será preenchida automaticamente.",
      "emptyCta": "Anúncios abertos",
      "updateAvailableTitle": "Nova versão disponível",
      "updateAvailableBody": "Toque para atualizar e continuar a receber as melhorias mais recentes.",
      "updateNow": "Atualizar agora",
      "repeatAdded": "{{word}} adicionado à lista de repetição ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}} removido da lista de repetição ({{count}}/{{limit}}).",
      "repeatLimitReached": "Atingiu o limite da sua lista de repetição (10/10).",
      "repeatPermissionRequired": "A permissão de notificação é necessária para lembretes. Ative as notificações para adicionar palavras.",
      "favoriteAdded": "{{word}} adicionado aos favoritos.",
      "favoriteRemoved": "{{word}} removido dos favoritos.",
      "repeatCleared": "Lista de repetição apagada.",
      "repeatListTitle": "Repetir lista",
      "repeatCount": "{{count}}/{{limit}} palavras",
      "repeatEmpty": "A lista de repetição está vazia. Adicione palavras com o botão de campainha abaixo.",
      "clearAll": "Limpar tudo",
      "done": "Concluído",
      "practice": "Prática",
      "accessibility": {
        "showDetails": "Mostrar informações",
        "favoriteWord": "Palavra favorita",
        "repeatWordLater": "Repita esta palavra mais tarde",
        "openProfile": "Abrir perfil",
        "openRepeatList": "Abrir lista de palavras repetidas",
        "openAnnouncements": "Anúncios abertos",
        "openUpdate": "Abrir página de actualização",
        "dismissUpdate": "Ignorar notificação de atualização",
        "searchWords": "Pesquisar palavras",
        "switchToCard": "Mudar para a visualização do cartão",
        "switchToList": "Mudar para a visualização de lista",
        "retryShowroom": "Tente carregar o showroom novamente",
        "closeRepeatList": "Fechar lista de repetição",
        "clearRepeatList": "Limpar lista de repetição",
        "removeFromRepeat": "Remover {{word}} da lista de repetição",
        "practiceWord": "Pratique esta palavra",
        "addWord": "Adicionar palavra"
      },
      "quickAdd": {
        "eyebrow": "Adição rápida",
        "title": "Adicione uma palavra pelo contexto",
        "body": "Cole uma frase, escolha a palavra certa e salve.",
        "action": "Adicionar palavra",
        "actionHint": "Cole e escolha"
      }
    },
    "practiceHub": {
      "title": "Prática",
      "sectionLabel": "Prática",
      "selectAnswer": "SELECCIONAR RESPOSTA",
      "modeBasic": "Básico",
      "modeAdvanced": "Avançado",
      "loadingTitle": "A carregar catálogo",
      "loadingMessage": "Verificar quais tipos de exercícios estão disponíveis para você.",
      "loadingQuestionsTitle": "A preparar perguntas práticas...",
      "loadingQuestionsMessage": "Gerar perguntas com base nos dados de vocabulário disponíveis.",
      "instructions": {
        "matchSynonyms": "Escolha o sinónimo mais próximo."
      },
      "resultCta": {
        "backToPractice": "Voltar à prática",
        "seeResult": "Ver resultado",
        "nextWord": "Próxima palavra"
      },
      "result": {
        "correctTitle": "Correto!",
        "incorrectTitle": "Está incorreto!",
        "correctAnswerLabel": "Resposta correta:",
        "usedInSentenceLabel": "Usado numa frase:",
        "sessionResultLabel": "Resultado da sessão"
      },
      "leavePrompt": {
        "title": "Já vai embora?",
        "keepPlaying": "Continuar a jogar",
        "leave": "Sair",
        "closePromptAccessibility": "Fechar aviso de saída",
        "leavePracticeAccessibility": "Deixar a prática"
      },
      "hints": {
        "availableCount": "{{count}} palavras disponíveis",
        "missingSynonyms": "Dados sinónimos indisponíveis",
        "minActiveWords": "Pelo menos 2 palavras ativas necessárias"
      },
      "tiles": {
        "meaningMatch": "Correspondência de significado",
        "fillInGap": "Preencher a lacuna",
        "guessWord": "Adivinhe a palavra",
        "matchSynonyms": "Combinar sinónimos"
      },
      "accessibility": {
        "goBack": "Voltar",
        "useMode": "Usar o modo {{mode}}",
        "closePractice": "Prática fechada"
      },
      "loadState": {
        "noQuestions": {
          "title": "Ainda não há perguntas práticas",
          "message": "Você precisa de pelo menos 2 palavras ativas para começar a praticar.",
          "actionLabel": "Adicionar palavras"
        },
        "unauthorized": {
          "title": "É necessário iniciar sessão",
          "message": "A sua sessão pode ter expirado. Inicie sessão novamente para continuar.",
          "actionLabel": "Entrar"
        },
        "forbidden": {
          "title": "Este recurso não está disponível no momento",
          "message": "Verifique o seu plano ou créditos para continuar.",
          "actionLabel": "Obter créditos"
        },
        "rejected": {
          "title": "Não há dados suficientes para este modo",
          "message": "Adicione mais palavras e tente novamente.",
          "actionLabel": "Adicionar palavras"
        },
        "server": {
          "title": "Não foi possível aceder ao servidor",
          "message": "Verifique a sua ligação e tente novamente.",
          "actionLabel": "Tentar novamente"
        },
        "generic": {
          "title": "Não foi possível iniciar a prática",
          "message": "Ocorreu um erro inesperado. Tente novamente.",
          "actionLabel": "Tentar novamente"
        }
      }
    },
    "announcements": {
      "title": "Comunicados",
      "unreadCount": "{{count}} não lido",
      "markAllRead": "Marcar todos como lidos",
      "loading": "A carregar anúncios...",
      "empty": "Sem anúncios no momento.",
      "openLink": "Abrir ligação",
      "openAnnouncement": "Anúncio aberto: {{title}}",
      "levelInfo": "Informações",
      "levelWarning": "Aviso",
      "levelCritical": "Crítico",
      "loadFailed": "Não foi possível carregar os anúncios. Tente novamente.",
      "claimFailed": "Falha ao resgatar a recompensa. Tente novamente.",
      "requirementNotMet": "O requisito ainda não foi cumprido. Convide amigos primeiro.",
      "referralCodeMissing": "Falta o código de indicação para esta conta.",
      "referralProgress": "Progresso da indicação: {{current}}/{{required}}",
      "shareInvite": "Convidar um amigo",
      "referralShareMessage": "Junte-se à VocOrbit.\nAbra este link:\n{{link}}",
      "rewardText": "Recompensa: +{{amount}} {{creditType}} créditos",
      "creditBasic": "básico",
      "creditAdvanced": "avançado",
      "claimReward": "Reivindicar",
      "claimingReward": "A reivindicar...",
      "rewardClaimed": "Reclamado"
    },
    "forceUpdate": {
      "title": "Atualização necessária",
      "body": "Uma nova versão é necessária para continuar usando o VocOrbit.",
      "updateNow": "Atualizar agora",
      "checkAgain": "Verificar novamente"
    },
    "profile": {
      "title": "Perfil",
      "accountDetailsTitle": "Detalhes da conta",
      "accountDetailsSubtitle": "Veja o seu e-mail e as informações da sua conta.",
      "settingsTitle": "Definições",
      "settingsSubtitle": "Personalize o tamanho do texto e a ordem dos botões de ação.",
      "favoriteWordsTitle": "Palavras favoritas",
      "favoriteWordsSubtitle": "Ver palavras adicionadas aos favoritos.",
      "learnedWordsTitle": "Palavras Aprendidas",
      "learnedWordsSubtitle": "Ver palavras marcadas como aprendidas.",
      "weeklyAnalyticsTitle": "Análise semanal",
      "weeklyAnalyticsSubtitle": "Veja o seu desempenho nos últimos 7 dias de prática.",
      "regionTitle": "Região",
      "regionSubtitle": "Atual: {{region}}",
      "regionNotSelected": "Não seleccionado",
      "emptyFavorites": "Ainda não há palavras favoritas.",
      "emptyLearned": "Nenhuma palavra aprendida ainda.",
      "loadingList": "A carregar lista...",
      "logOut": "Sair",
      "accessibility": {
        "goBack": "Voltar",
        "openAccountDetails": "Abrir informações da conta",
        "openSettings": "Abrir definições",
        "openFavoriteWords": "Abrir palavras favoritas",
        "openLearnedWords": "Abrir palavras aprendidas",
        "openWeeklyAnalytics": "Abrir análises semanais",
        "openRegion": "Abrir definições da região",
        "logOut": "Sair",
        "playPronunciation": "Reproduzir pronúncia para {{word}}",
        "openDetailForWord": "Abrir detalhe para {{word}}",
        "removeWord": "Remover {{word}}"
      }
    },
    "settings": {
      "title": "Definições",
      "languagePairTitle": "Par de idiomas",
      "languagePairSubtitle": "Mude o seu idioma nativo e de aprendizagem.",
      "billingCreditsTitle": "Cobrança e créditos",
      "billingCreditsSubtitle": "Gerencie créditos de significado básico e pacotes IAP aqui.",
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
      "themeModeSubtitle": "Escolha claro, escuro ou siga as configurações do seu sistema.",
      "themeModeSystem": "Sistema",
      "themeModeLight": "Luminosidade",
      "themeModeDark": "Escura",
      "textSizeTitle": "Tamanho do texto",
      "textSizeSubtitle": "Ajuste o tamanho do texto nos cartões de vocabulário.",
      "actionOrderTitle": "Ordem DE ação",
      "actionOrderSubtitle": "Defina a ordem dos botões de detalhe/favorito/repetição.",
      "actionDetail": "Detalhe",
      "actionFavorite": "Favorito",
      "actionRepeat": "Repetir",
      "resetToDefaults": "Redefinir para os padrões",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "Voltar",
        "openLanguagePreferences": "Abrir preferências de idioma",
        "openBillingCredits": "Cobrança e créditos em aberto",
        "useSystemTheme": "Tema do Sistema",
        "useLightTheme": "Tema Claro",
        "useDarkTheme": "Use o tema escuro.",
        "decreaseTextSize": "Diminuir o tamanho do texto",
        "increaseTextSize": "Aumentar o tamanho do texto",
        "moveActionLeft": "Mover {{action}} para a esquerda",
        "moveActionRight": "Mover {{action}} para a direita",
        "resetSettings": "Repor definições de vocabulário"
      }
    },
    "accountDetails": {
      "title": "Detalhes da conta",
      "emailLabel": "E-mail",
      "userIdLabel": "ID de utilizador",
      "regionLabel": "Região de origem",
      "regionEndpointLabel": "Desfecho da região",
      "appVersionLabel": "Versão da aplicação",
      "buildLabel": "Número da compilação",
      "platformLabel": "Plataforma",
      "osVersionLabel": "Versão do SO",
      "accessibility": {
        "goBack": "Voltar",
        "deleteAccount": "Excluir conta permanentemente"
      },
      "deleteAccount": {
        "sectionTitle": "Excluir conta",
        "sectionBody": "Exclua permanentemente sua conta VocOrbit e os dados do aplicativo vinculados a ela. Esta ação não pode ser desfeita.",
        "action": "Excluir conta permanentemente",
        "deleting": "Excluindo conta...",
        "confirmTitle": "Excluir conta?",
        "confirmBody": "Isso exclui permanentemente sua conta VocOrbit e os dados do aplicativo vinculado. Esta ação não pode ser desfeita.",
        "successTitle": "Conta excluída",
        "successBody": "Sua conta VocOrbit foi excluída permanentemente.",
        "missingUser": "Não foi possível encontrar o ID da sua conta. Faça login novamente.",
        "cannotConnect": "Não foi possível acessar o servidor. Verifique sua conexão e tente novamente.",
        "sessionExpired": "Sua sessão expirou. Faça login novamente.",
        "failed": "Não foi possível excluir sua conta no momento. Por favor, tente novamente."
      }
    },
    "iap": {
      "title": "Faturamento e créditos",
      "loading": "A carregar detalhes de faturação...",
      "currentSubscription": "Subscrição atual",
      "currentStatus": "Status: ___voco_PH_0___",
      "currentPlan": "Plano atual: {{plan}}",
      "noActivePlan": "Nenhum plano activo",
      "refresh": "Atualizar a faturação",
      "basicCreditsTitle": "Créditos de insight básico",
      "basicCreditsBody": "A análise básica de significado na tela de compartilhamento consome esse crédito.",
      "plansTitle": "Planos",
      "plansBody": "Escolha um plano e conclua o pagamento através da sua conta de loja.",
      "noPlans": "Nenhum plano comprável encontrado para esta plataforma.",
      "planTopup": "Recarga mensal: +{{basic}} Basic · +{{advanced}} Advanced",
      "planCaps": "CAPS: {{basicCap}} Basic · {{advancedCap}} Advanced",
      "priceLabel": "Preço: {{price}}",
      "buyNow": "Comprar agora",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "A processar compra...",
      "purchaseCanceled": "Compra cancelada.",
      "purchaseApplied": "{{sku}} ativado com sucesso.",
      "alreadyOwnedRestoring": "Este artigo já está na sua posse. Restaurando suas compras...",
      "restorePurchases": "Restaurar compras",
      "restoring": "A restaurar compras...",
      "restoreNoPurchases": "Nenhuma compra encontrada para restaurar.",
      "restoreNoApplicablePurchases": "Nenhuma compra restaurável pode ser aplicada.",
      "restoreApplied": "{{count}} compra(s) restaurada (s) e verificada (s).",
      "status": {
        "none": "Não subscrito",
        "pending": "Pendente",
        "active": "Activo",
        "expired": "Expirado",
        "canceled": "Cancelado",
        "refunded": "Reembolsado"
      },
      "errors": {
        "unauthorized": "A sua sessão expirou. Inicie sessão novamente.",
        "cannotConnect": "Não foi possível aceder ao servidor. Verifique a sua ligação e tente novamente.",
        "forbidden": "Não foi possível aplicar esta compra à sua conta.",
        "generic": "O pedido de faturação falhou. Tente novamente.",
        "purchaseFailed": "Falha na compra. Tente novamente.",
        "alreadyOwned": "Este item já está nesta conta.",
        "invalidReceipt": "Não foi possível validar o recibo da loja.",
        "iapUnavailable": "O serviço de compra na loja está indisponível neste dispositivo."
      },
      "accessibility": {
        "goBack": "Voltar",
        "buyPlan": "Compre o plano {{plan}}",
        "restorePurchases": "Restaurar compras anteriores",
        "refresh": "Atualizar o estado da faturação e da subscrição"
      },
      "desktop": {
        "subtitle": "Veja seu saldo atual aqui. Novas compras e alterações de assinatura continuam no celular.",
        "desktopBadge": "Visualização da área de trabalho",
        "phoneOnlyBadge": "Telefone para compras",
        "balanceTitle": "Seu saldo atual",
        "balanceBody": "O Desktop mantém visíveis os créditos disponíveis e o estado da assinatura, para que você possa verificar sua conta antes de continuar seu fluxo de aprendizado.",
        "basicAvailable": "Créditos básicos",
        "advancedAvailable": "Créditos avançados",
        "freeCredits": "Livre",
        "paidCredits": "Pago",
        "noPlanBody": "Esta conta não tem um plano de faturamento móvel ativo no momento. Você ainda pode usar quaisquer créditos já disponíveis aqui.",
        "mobileTitle": "Continue as compras no seu telefone",
        "mobileBody": "As compras de crédito e alterações de assinatura são concluídas dentro do aplicativo móvel com sua conta App Store ou Google Play.",
        "storeLabel": "Loja: {{store}}",
        "renewsOn": "Renova em {{date}}",
        "expiresOn": "Terminou em {{date}}",
        "updatedOn": "Última sincronização: {{date}}",
        "stepOpenPhone": "Abra VocOrbit em seu telefone com a mesma conta.",
        "stepOpenBilling": "Vá para Perfil > Faturamento e Créditos.",
        "stepFinishPurchase": "Compre créditos ou gerencie sua assinatura lá, depois volte aqui e atualize.",
        "mobileHint": "Seu saldo de crédito é atualizado aqui depois que a compra do celular é aplicada à mesma conta."
      }
    },
    "weeklyAnalytics": {
      "title": "Análise semanal",
      "modeAll": "Todos",
      "modeBasic": "Básico",
      "modeAdvanced": "Avançado",
      "loading": "A carregar análises semanais...",
      "summaryTitle": "Resumo (7 dias)",
      "sessions": "Sessões",
      "completed": "Concluído",
      "answered": "Respondido",
      "accuracy": "Precisão",
      "activeDays": "Dias ativos",
      "streak": "Sequência",
      "dailyTrend": "Tendência diária",
      "byQuestionType": "Por tipo de pergunta",
      "byMode": "Por modo",
      "weakItems": "Itens fracos",
      "noWeakItems": "Nenhuma palavra fraca notável encontrada esta semana.",
      "weakItemMeta": "Errado: {{wrongAnswers}} · Precisão: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "Correspondência de significado",
      "questionTypeGuessWord": "Adivinhe a palavra",
      "questionTypeFillInGap": "Preencha a lacuna",
      "questionTypeMatchSynonym": "Sinônimo de correspondência",
      "errors": {
        "unauthorized": "A sua sessão pode ter expirado. Inicie sessão novamente.",
        "cannotConnect": "Não foi possível aceder ao servidor. Verifique a sua ligação e tente novamente.",
        "loadFailed": "Não foi possível carregar as análises semanais. Por favor, tente novamente."
      },
      "accessibility": {
        "goBack": "Voltar",
        "filterByMode": "Filtrar por {{mode}}",
        "retry": "Tentar novamente a solicitação de análise"
      }
    },
    "detail": {
      "closeDetails": "Fechar detalhes da palavra",
      "loadingDetail": "Carregando detalhes da palavra...",
      "detailLoadFailedTitle": "Não foi possível carregar detalhes",
      "statusLearned": "aprendido",
      "statusActive": "ativo",
      "markAsLearned": "Marcar como aprendido",
      "moveBackToActive": "Voltar para ativo",
      "buyAdvancedCredits": "Compre créditos avançados",
      "buyBasicCredits": "Compre créditos básicos",
      "buyCredits": "Comprar créditos",
      "whyThisSense": "Por que esse sentido",
      "examples": "Exemplos",
      "synonyms": "Sinônimos",
      "antonyms": "Antônimos",
      "collocations": "Colocações",
      "alternativeMeanings": "Significados alternativos",
      "usageNotes": "Notas de uso",
      "noSynonyms": "Ainda não há dados de sinônimos.",
      "stats": "Estatísticas",
      "encountersAndLastMode": "Encontros: {{encounters}} | Último modo: {{mode}}",
      "nextReminder": "Próximo lembrete",
      "currentPlan": "Plano atual: {{due}}",
      "reviewHint": "Esqueci: +10 min, Difícil: +1 hora, Bom: cresce a partir de +1 dia.",
      "runAdvanced": "Execute análises avançadas",
      "reviewForgot": "Esquecido",
      "reviewHard": "Duro",
      "reviewGood": "Bom",
      "reviewOptionAccessibility": "{{title}} selecionado. Próxima revisão em {{delay}}.",
      "repeatUnscheduled": "Não agendado",
      "repeatNow": "Agora",
      "repeatAfterMinutes": "{{count}} minutos",
      "repeatAfterHours": "{{count}} hora",
      "repeatAfterDays": "{{count}} dia",
      "repeatAfterWeeks": "{{count}} semana",
      "repeatInMinutes": "em {{count}} minutos",
      "repeatInHours": "em {{count}} hora",
      "repeatInDays": "no dia {{count}}",
      "repeatInWeeks": "na semana {{count}}",
      "repeatNotificationTitle": "Tempo de revisão: {{word}}",
      "repeatNotificationBody": "Revise a palavra {{word}}.",
      "reportIssue": "Informar significado errado",
      "reportIssueAccessibility": "Informar significado incorreto para {{word}}",
      "deleteWord": "Excluir palavra",
      "deleteWordAccessibility": "Exclusão reversível {{word}}",
      "deleteConfirmTitle": "Excluir esta palavra?",
      "deleteConfirmBody": "\"{{word}}\" será removido da sua lista. Você pode adicioná-lo novamente mais tarde.",
      "deleteConfirmCancel": "Cancelar",
      "deleteConfirmAction": "Sim, excluir"
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
      "title": "Significado do relatório",
      "subtitle": "Se \"{{word}}\" parecer errado neste contexto, diga-nos o que está errado.",
      "messageLabel": "O que parece errado?",
      "messagePlaceholder": "Exemplo: Este significado não se ajusta à frase. Deve descrever a comunicação, não a localização.",
      "charactersLeft": "{{count}} caracteres restantes",
      "submit": "Enviar relatório",
      "successTitle": "Relatório enviado",
      "successBody": "Obrigado pelo feedback. Iremos revisar este item.",
      "backToDetail": "Voltar ao detalhe da palavra",
      "errors": {
        "unauthorized": "A sua sessão expirou. Inicie sessão novamente.",
        "cannotConnect": "Não foi possível aceder ao servidor. Verifique a sua ligação e tente novamente.",
        "itemNotFound": "O item do Word não foi encontrado.",
        "submitFailed": "Não foi possível enviar o relatório. Por favor, tente novamente."
      },
      "accessibility": {
        "goBack": "Voltar",
        "submit": "Enviar relatório de problema",
        "backToDetail": "Voltar ao detalhe da palavra"
      }
    },
    "capture": {
      "backButton": "Biblioteca",
      "headerTitle": "Adicionar palavra",
      "headerBody": "Cole uma frase e escolha a palavra que deseja salvar.",
      "seedWordLabel": "Procurando por: {{word}}",
      "pasteHero": {
        "title": "Colar o texto copiado",
        "body": "Copie uma frase ou parágrafo e cole-o para abrir o seletor.",
        "bodyWithWord": "Copie uma frase que inclua \"{{word}}\" e cole-a para abrir o seletor.",
        "hint": "O seletor abre automaticamente após colar."
      },
      "picker": {
        "title": "Escolha a palavra no texto",
        "body": "Clique na palavra exata abaixo. Cole novamente se você copiou uma frase diferente.",
        "badge": "Seletor de palavras",
        "hint": "VocOrbit cria a palavra cartão automaticamente a partir desta pesquisa."
      },
      "status": {
        "pasteFirst": "Cole o texto copiado para começar.",
        "selectedWord": "Palavra selecionada: {{word}}",
        "seedWordMissing": "Cole uma frase com \"{{word}}\" ou selecione outra palavra abaixo.",
        "selectWord": "Clique na palavra exata abaixo para continuar."
      },
      "actions": {
        "pasteCopiedText": "Colar o texto copiado",
        "pasteAgain": "Cole novamente",
        "clear": "Claro",
        "readingClipboard": "Lendo a área de transferência...",
        "reading": "Leitura...",
        "analyzeAndSave": "Analise e salve",
        "loadingMeaning": "Obtendo o significado básico...",
        "openSavedWord": "Abrir palavra salva",
        "backToLibrary": "De volta à biblioteca",
        "pickAnotherWord": "Escolha outra palavra"
      },
      "loading": {
        "title": "Executando insights básicos",
        "body": "VocOrbit está comparando a palavra selecionada com esta frase."
      },
      "result": {
        "title": "Significado básico",
        "savedFallback": "Salvo em sua biblioteca.",
        "contextMeaning": "Significado do contexto",
        "whyThisMeaning": "Por que esse significado"
      },
      "problems": {
        "clipboardUnavailableTitle": "Área de transferência indisponível",
        "clipboardUnavailableBody": "O acesso à área de transferência está bloqueado neste contexto do navegador. Cole a frase manualmente.",
        "contextRequiredTitle": "Contexto necessário",
        "contextRequiredBody": "Cole uma frase ou parágrafo curto antes de selecionar uma palavra.",
        "selectWordTitle": "Selecione uma palavra no texto",
        "selectWordBody": "Clique na palavra exata dentro do bloco de texto antes de executar a pesquisa.",
        "signInRequiredTitle": "É necessário fazer login",
        "signInRequiredBody": "Sua sessão expirou. Abra VocOrbit novamente e faça login antes de tentar novamente esta pesquisa.",
        "basicCreditsRequiredTitle": "Créditos básicos necessários",
        "basicCreditsRequiredBody": "Sua conta não pode executar uma pesquisa básica no momento.",
        "requestTimedOutTitle": "A solicitação expirou",
        "requestTimedOutBody": "A pesquisa demorou muito. Tente novamente com a mesma frase.",
        "connectionProblemTitle": "Problema de conexão",
        "connectionProblemBody": "VocOrbit não conseguiu acessar o servidor. Verifique sua conexão e tente novamente.",
        "lookupFailedTitle": "Falha na pesquisa",
        "lookupFailedBody": "VocOrbit não conseguiu concluir esta solicitação de insight.",
        "lookupIncompleteTitle": "Pesquisa incompleta",
        "lookupIncompleteBody": "VocOrbit retornou uma resposta inesperada. Tente novamente mais uma vez."
      }
    }
  }
}

export default ptBr
