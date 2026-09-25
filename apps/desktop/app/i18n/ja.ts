import { Translations } from "./en"

const ja: Translations = {
  "common": {
    "ok": "OK",
    "cancel": "キャンセル",
    "back": "戻る",
    "logOut": "ログアウト"
  },
  "welcomeScreen": {
    "postscript": "注目！ — このアプリはお好みの見た目では無いかもしれません(デザイナーがこのスクリーンを送ってこない限りは。もしそうなら公開しちゃいましょう！)",
    "readyForLaunch": "このアプリはもう少しで公開できます！",
    "exciting": "(楽しみですね！)",
    "letsGo": "レッツゴー！"
  },
  "errorScreen": {
    "title": "問題が発生しました",
    "friendlySubtitle": "本番では、エラーが投げられた時にこのページが表示されます。もし使うならこのメッセージに変更を加えてください(`app/i18n/jp.ts`)レイアウトはこちらで変更できます(`app/screens/ErrorScreen`)。もしこのスクリーンを取り除きたい場合は、`app/app.tsx`にある<ErrorBoundary>コンポーネントをチェックしてください",
    "reset": "リセット",
    "traceTitle": "エラーのスタック: %{name}"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "静かだ...悲しい。",
      "content": "データが見つかりません。ボタンを押してアプリをリロード、またはリフレッシュしてください。",
      "button": "もう一度やってみよう"
    }
  },
  "errors": {
    "invalidEmail": "有効なメールアドレスを入力してください."
  },
  "loginScreen": {
    "logIn": "ログイン",
    "subtitle": "ボキャブラリーの進捗状況にアクセスするには、ソーシャルアカウントを続行してください。",
    "continueWith": "次を続行:",
    "regionTitle": "地域",
    "regionSubtitle": "現在：{{region}}",
    "regionNotSelected": "選択されていません",
    "changeRegion": "変更",
    "signingIn": "サインインしています...",
    "googleButton": "グーグル",
    "appleButton": "Apple",
    "moreProvidersSoon": "まもなく、より多くのプロバイダーが利用可能になります。",
    "accessibility": {
      "openRegionSelection": "領域選択を開く"
    },
    "errors": {
      "unauthorized": "認証に失敗しました。もう一度サインインしてください。",
      "cannotConnect": "サーバーに接続できませんでした。もう一度お試しください。",
      "server": "サーバーの検証に失敗しました。しばらくしてからもう一度お試しください。",
      "rejected": "サインイン要求が拒否されました。認証設定を確認してください。",
      "badData": "サーバーから予期しない応答が返されました",
      "generic": "サインインを完了できませんでした。もう一度お試しください。",
      "googleCancelled": "Googleサインインがキャンセルされました。",
      "googleUnavailable": "Googleサインインはこのデバイスでは利用できません。",
      "googleFailed": "Googleサインインに失敗しました。もう一度お試しください。"
    }
  },
  "languagePreferences": {
    "titleOnboarding": "言語を選択してください",
    "titleSettings": "言語設定",
    "subtitleOnboarding": "国旗と国を含むグローバルリストから、母国語とターゲット言語を選択します。",
    "subtitleSettings": "母語と言語学習の対象言語を、国旗と国情報付きでここから更新します。",
    "currentPair": "現在のペア",
    "availableOptionsCount": "{{count}} 件の言語/国オプションがあります",
    "nativeLanguageTitle": "母語",
    "nativeLanguageBody": "翻訳と説明はこの言語で表示されます。",
    "learningLanguageTitle": "学習言語",
    "learningLanguageBody": "定義と文脈はこの言語で生成されます。",
    "selectedLabel": "選択中",
    "pickerTitleL1": "母語を選択",
    "pickerTitleL2": "学習言語を選択",
    "searchPlaceholder": "言語または国を検索",
    "noResults": "結果が見つかりません。",
    "saving": "保存中...",
    "continue": "続行",
    "save": "保存",
    "accessibility": {
      "goBack": "戻る",
      "selectNativeLanguage": "母国語を選択",
      "selectLearningLanguage": "学習言語を選択",
      "continueWithSelectedLanguages": "選択した言語で続行",
      "saveLanguages": "言語の保存",
      "closeLanguagePicker": "言語ピッカーを閉じる",
      "closePicker": "ピッカーを閉じる",
      "selectLanguageItem": "{{language}}{{country}}を選択"
    },
    "errors": {
      "cannotConnect": "サーバーに接続できませんでした。もう一度お試しください。",
      "unauthorized": "セッションが無効です。もう一度サインインしてください。",
      "validation": "言語設定を保存できませんでした。入力内容を確認してください。",
      "server": "サーバーエラーが発生しました。しばらくしてからもう一度お試しください。",
      "saveFailed": "言語設定を保存できませんでした。もう一度お試しください。",
      "noSession": "アクティブなセッションが見つかりません。もう一度サインインしてください。",
      "selectTwoLanguages": "両方の言語を選択してください。",
      "sameLanguagePair": "母国語と学習言語を同じにすることはできません。"
    }
  },
  "vocabulary": {
    "common": {
      "retry": "再試行",
      "signIn": "ログイン",
      "favoriteLabel": "お気に入り",
      "learnedLabel": "学習済み",
      "detailButton": "詳細を開く"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "VocOrbitの実際の仕組み",
      "subtitle": "実際のフロー：アプリ外の文章を選択し、単語を選択して、VocOrbit内のコンテキストで学習します。",
      "progress": "ステップ{{current}}/{{total}}",
      "progressSingle": "ステップ{{current}}",
      "mock": {
        "contextLabel": "コンテキストセンテンス",
        "selectedWordLabel": "選択した単語",
        "meaningLabel": "基本的な意味",
        "whyLabel": "このコンテンツ中: "
      },
      "flowTitle": "3つの簡単なステップでフローを学ぶ",
      "highlightsTitle": "特長",
      "actions": {
        "previous": "前へ",
        "next": "次のステップ",
        "enterApp": "学習を始める",
        "showExample": "実際の例を表示する",
        "hideExample": "例を非表示"
      },
      "steps": {
        "step1": {
          "step": "ステップ1 •文章を共有する",
          "title": "単語が表示されている文章を選択してください",
          "body": "ブラウザ、メモ、または任意のアプリでテキストを長押しして、VocOrbit Share Extensionに送信します。",
          "source": "振り返ると、文学の生命力に再び感銘を受けます。",
          "word": "国語",
          "meaning": "書かれた作品、特に芸術的と見なされるもの",
          "why": "この文では、話者に強い影響を与える本や書物を指します。",
          "hint": "ヒント： 1つの単語だけでなく、常に文章全体を共有してください。",
          "bullets": {
            "one": "ブラウザ、メモ、および多くの読書アプリで動作します",
            "two": "元の文章のコンテキストを維持します",
            "three": "手動コピーペーストフローは必要ありません"
          }
        },
        "step2": {
          "step": "ステップ2 •正確な単語を選ぶ",
          "title": "1つの単語をタップすると、すぐに基本的な意味が得られます",
          "body": "共有ビュー内では、単語をタップできます。ターゲットワードを1つ選択し、基本的なインサイトを実行します。",
          "source": "読書は、雑用や義務として子供たちに提示すべきではありません。",
          "word": "仕事",
          "meaning": "日常的なタスク、通常は不愉快な",
          "why": "ここでの「雑用」は、読書が強制労働のように感じてはならないことを強調しています。",
          "hint": "ヒント：わからない場合は、Basicから始めましょう。次に、アプリで[詳細設定]を実行します。",
          "bullets": {
            "one": "この正確な文の意味が生成されます",
            "two": "この感覚が選ばれる理由もわかります",
            "three": "選択した言語ペアをサポート"
          }
        },
        "step3": {
          "step": "ステップ3 •保存して整理する",
          "title": "あなたの個人的なシステムに役立つ言葉を移動する",
          "body": "単語がVocOrbitに到達したら、お気に入りにマークするか、リピートリストに追加してアクティブラーニングを行います。",
          "source": "エキスパートの経験を活かして、プロジェクトを成功に導きましょう。",
          "word": "専門家",
          "meaning": "特別なスキルまたは知識を持つ人",
          "why": "このプロジェクトのコンテキストでは、この経験は非常に信頼性が高く、熟練していると説明しています。",
          "hint": "ヒント：リピートリストを集中させましょう。10個のアクティブな単語を使用すると、より良い記憶力が得られます。",
          "bullets": {
            "one": "重要な単語のお気に入りリスト",
            "two": "アクティブな暗記のためにリストを繰り返します",
            "three": "学習された状態により、進行状況がきれいに保たれます"
          }
        },
        "step4": {
          "step": "ステップ4 •練習ループ",
          "title": "復習、練習、学習済みとしてマークする",
          "body": "リコールが強くなるまで練習モードとリマインダーを使用し、単語を学習済みとしてマークします。",
          "source": "ほかにもご不明な点がございましたら、お気軽にお問い合わせください。",
          "word": "今すぐお問い合わせください。",
          "meaning": "誰かに連絡する",
          "why": "この文脈では、それは物理的な到達ではなく、コミュニケーションを意味する句動詞です。",
          "hint": "ヒント：リマインダーと短いセッションを毎日使用して、安定した進捗を維持しましょう。",
          "bullets": {
            "one": "練習カードは自分の言葉で作られています",
            "two": "毎週の分析は弱点を示しています",
            "three": "学習した単語は自動的に繰り返しキューから離れる"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "セッションの有効期限が切れました。もう一度サインインしてください。",
      "cannotConnect": "サーバーに到達できませんでした。接続を確認して、もう一度お試しください。",
      "listLoadFailed": "単語リストを読み込めませんでした。もう一度お試しください。",
      "searchLoadFailed": "検索結果を読み込めませんでした。もう一度お試しください。",
      "itemNotFound": "レコードが見つかりません",
      "reloginRequired": "続行するにはサインインしてください。",
      "favoriteActionFailed": "お気に入りのアクションに失敗しました。もう一度やり直してください。",
      "detailLoadFailed": "単語の詳細を読み込めませんでした。",
      "stateUpdateFailed": "状態を更新できませんでした。もう一度お試しください。",
      "analysisRequestFailed": "分析リクエストを送信できませんでした。",
      "invalidModelOutput": "モデル応答の形式が無効です。もう一度お試しください。",
      "analysisTimeout": "分析がタイムアウトしました。もう一度やり直してください。",
      "advancedCreditInsufficient": "アドバンスクレジットが不足しています。",
      "basicCreditInsufficient": "基本クレジットが不足しています。",
      "advancedAnalysisFailed": "高度な分析を完了できませんでした。",
      "basicAnalysisFailed": "基本的な分析を完了できませんでした。",
      "repeatProgressUpdateFailed": "繰り返しの進行状況を更新できませんでした。もう一度お試しください。",
      "missingContext": "分析に必要なコンテキストがありません。",
      "selectedWordNotInSentence": "選択した単語は文脈文に見つかりません。",
      "analysisFailedGeneric": "分析を完了できませんでした。もう一度お試しください。",
      "unexpected": "予期しないエラーが発生しました"
    },
    "search": {
      "title": "検索",
      "placeholder": "単語・意味・説明で検索",
      "loading": "単語を読み込み中...",
      "emptyResult": "検索に一致する単語がありません。",
      "emptyHint": "検索するには上で入力を始めてください。"
    },
    "showroom": {
      "loading": "単語リストを読み込んでいます...",
      "emptyTitle": "まだ単語がありません",
      "emptyBody": "Word Insightで単語を追加すると、このリストが自動的に表示されます。",
      "emptyCta": "お知らせを開く",
      "updateAvailableTitle": "新しいバージョンが利用可能です",
      "updateAvailableBody": "タップしてアップデートし、最新の改善を継続しましょう。",
      "updateNow": "今すぐ更新",
      "repeatAdded": "{{word}}がリピートリストに追加されました（{{count}}/{{limit}}）。",
      "repeatRemoved": "{{word}}がリピートリストから削除されました（{{count}}/{{limit}}）。",
      "repeatLimitReached": "リピートリストの上限（ 10/10 ）に達しました。",
      "repeatPermissionRequired": "リマインダーには通知権限が必要です。通知を有効にして単語を追加します。",
      "favoriteAdded": "{{word}}がお気に入りに追加されました。",
      "favoriteRemoved": "{{word}}がお気に入りから削除されました。",
      "repeatCleared": "リピートリストをクリアしました。",
      "repeatListTitle": "復習リスト",
      "repeatCount": "{{count}}/{{limit}} 語",
      "repeatEmpty": "復習リストは空です。下のベルボタンで単語を追加してください。",
      "clearAll": "すべて削除",
      "done": "完了",
      "practice": "練習",
      "accessibility": {
        "showDetails": "詳細を表示",
        "favoriteWord": "お気に入りの単語",
        "repeatWordLater": "後でこの単語を繰り返す",
        "openProfile": "プロフィールを開く",
        "openRepeatList": "繰り返し単語リストを開く",
        "openAnnouncements": "お知らせを開く",
        "openUpdate": "ページを更新",
        "dismissUpdate": "更新通知を閉じる",
        "searchWords": "検索ワード",
        "switchToCard": "カードビューに切り替える",
        "switchToList": "リスト表示に切り替え",
        "retryShowroom": "ショールームを再度読み込んでみてください",
        "closeRepeatList": "リピートリストを閉じる",
        "clearRepeatList": "リピートリストをクリア",
        "removeFromRepeat": "リピートリストから{{word}}を削除する",
        "practiceWord": "この単語を練習してください",
        "addWord": "単語を追加"
      },
      "quickAdd": {
        "eyebrow": "クイック追加",
        "title": "文脈から単語を追加",
        "body": "文を貼り付けて、正しい単語を選んで保存します。",
        "action": "単語を追加",
        "actionHint": "貼り付けて選択"
      }
    },
    "practiceHub": {
      "title": "練習",
      "sectionLabel": "練習",
      "selectAnswer": "答えを選択",
      "modeBasic": "基本",
      "modeAdvanced": "高度",
      "loadingTitle": "カタログを読み込み中",
      "loadingMessage": "利用可能な練習タイプを確認しています。",
      "loadingQuestionsTitle": "練習問題を準備中...",
      "loadingQuestionsMessage": "利用可能な語彙データに基づいて問題を生成しています。",
      "instructions": {
        "matchSynonyms": "最も近い類義語を選んでください。"
      },
      "resultCta": {
        "backToPractice": "練習に戻る",
        "seeResult": "結果を見る",
        "nextWord": "次の単語"
      },
      "result": {
        "correctTitle": "正解です！",
        "incorrectTitle": "不正解です！",
        "correctAnswerLabel": "正解:",
        "usedInSentenceLabel": "文での使用:",
        "sessionResultLabel": "セッション結果"
      },
      "leavePrompt": {
        "title": "もう終了しますか？",
        "keepPlaying": "続ける",
        "leave": "離れる",
        "closePromptAccessibility": "終了確認を閉じる",
        "leavePracticeAccessibility": "練習を終了する"
      },
      "hints": {
        "availableCount": "{{count}} 語が利用可能",
        "missingSynonyms": "類義語データがありません",
        "minActiveWords": "少なくとも2語のアクティブ単語が必要です"
      },
      "tiles": {
        "meaningMatch": "意味マッチ",
        "fillInGap": "穴埋め",
        "guessWord": "単語を当てる",
        "matchSynonyms": "類義語マッチ"
      },
      "accessibility": {
        "goBack": "戻る",
        "useMode": "{{mode}} モードを使う",
        "closePractice": "練習を閉じる"
      },
      "loadState": {
        "noQuestions": {
          "title": "まだ練習問題がありません",
          "message": "練習を始めるには少なくとも2語のアクティブ単語が必要です。",
          "actionLabel": "単語を追加"
        },
        "unauthorized": {
          "title": "ログインが必要です",
          "message": "セッションの有効期限が切れた可能性があります。再度ログインしてください。",
          "actionLabel": "ログイン"
        },
        "forbidden": {
          "title": "この機能は現在利用できません",
          "message": "プランまたはクレジットを確認して続行してください。",
          "actionLabel": "クレジットを取得"
        },
        "rejected": {
          "title": "このモードにはデータが不足しています",
          "message": "単語を追加してもう一度お試しください。",
          "actionLabel": "単語を追加"
        },
        "server": {
          "title": "サーバーに接続できませんでした",
          "message": "接続を確認して再試行してください。",
          "actionLabel": "再試行"
        },
        "generic": {
          "title": "練習を開始できませんでした",
          "message": "予期しないエラーが発生しました。もう一度お試しください。",
          "actionLabel": "再試行"
        }
      }
    },
    "announcements": {
      "title": "お知らせ",
      "unreadCount": "{{count}}件の未読",
      "markAllRead": "すべて既読にする",
      "loading": "お知らせを読み込み中...",
      "empty": "現在お知らせはありません。",
      "openLink": "リンクを開く",
      "openAnnouncement": "お知らせを開く: {{title}}",
      "levelInfo": "情報",
      "levelWarning": "警告",
      "levelCritical": "重要",
      "loadFailed": "お知らせを読み込めませんでした。もう一度お試しください。",
      "claimFailed": "報酬の受け取りに失敗しました。もう一度お試しください。",
      "requirementNotMet": "条件を満たしていません。まずはお友達を招待しましょう。",
      "referralCodeMissing": "このアカウントには紹介コードがありません。",
      "referralProgress": "紹介の進捗状況：{{current}}/{{required}}",
      "shareInvite": "友達に紹介",
      "referralShareMessage": "VocOrbitに参加してください。\n次のリンクを開いてください:\n{{link}}",
      "rewardText": "報酬： +{{amount}}{{creditType}}クレジット",
      "creditBasic": "基本",
      "creditAdvanced": "高度な",
      "claimReward": "獲得",
      "claimingReward": "主張",
      "rewardClaimed": "獲得済み"
    },
    "forceUpdate": {
      "title": "更新が必要@item::intable",
      "body": "VocOrbitを引き続き使用するには、新しいバージョンが必要です。",
      "updateNow": "今すぐ更新",
      "checkAgain": "再検査"
    },
    "profile": {
      "title": "プロフィール",
      "accountDetailsTitle": "アカウント詳細",
      "accountDetailsSubtitle": "メールアドレスとアカウント情報を表示します。",
      "settingsTitle": "設定",
      "settingsSubtitle": "文字サイズとアクションボタンの順序をカスタマイズします。",
      "favoriteWordsTitle": "お気に入り単語",
      "favoriteWordsSubtitle": "お気に入りに追加した単語を表示します。",
      "learnedWordsTitle": "学習済み単語",
      "learnedWordsSubtitle": "学習済みにした単語を表示します。",
      "weeklyAnalyticsTitle": "週間分析",
      "weeklyAnalyticsSubtitle": "過去7日間の練習パフォーマンスを表示します。",
      "regionTitle": "地域",
      "regionSubtitle": "現在: {{region}}",
      "regionNotSelected": "未選択",
      "emptyFavorites": "お気に入りの単語はまだありません。",
      "emptyLearned": "学習済みの単語はまだありません。",
      "loadingList": "リストを読み込み中...",
      "logOut": "ログアウト",
      "accessibility": {
        "goBack": "戻る",
        "openAccountDetails": "アカウント情報",
        "openSettings": "設定を開く",
        "openFavoriteWords": "お気に入りの単語を開く",
        "openLearnedWords": "学習した単語を開く",
        "openWeeklyAnalytics": "週ごとの分析を開く",
        "openRegion": "地域設定を開く",
        "logOut": "ログアウト",
        "playPronunciation": "{{word}}の発音を再生",
        "openDetailForWord": "{{word}}の詳細を開く",
        "removeWord": "{{word}}を削除"
      }
    },
    "settings": {
      "title": "設定",
      "languagePairTitle": "言語ペア",
      "languagePairSubtitle": "母語と学習言語を変更します。",
      "billingCreditsTitle": "課金とクレジット",
      "billingCreditsSubtitle": "基本意味クレジットとIAPパッケージをここで管理します。",
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
      "themeModeTitle": "テーマ",
      "themeModeSubtitle": "明るい、暗い、またはシステム設定に従うを選択します。",
      "themeModeSystem": "システム",
      "themeModeLight": "ライト",
      "themeModeDark": "ダーク",
      "textSizeTitle": "文字サイズ",
      "textSizeSubtitle": "語彙カードの文字サイズを調整します。",
      "actionOrderTitle": "アクション順序",
      "actionOrderSubtitle": "詳細/お気に入り/復習ボタンの順序を設定します。",
      "actionDetail": "詳細",
      "actionFavorite": "お気に入り",
      "actionRepeat": "復習",
      "resetToDefaults": "デフォルトにリセット",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "戻る",
        "openLanguagePreferences": "言語設定を開く",
        "openBillingCredits": "課金とクレジットを開く",
        "useSystemTheme": "システムのテーマ",
        "useLightTheme": "ライトテーマ",
        "useDarkTheme": "ダークテーマ",
        "decreaseTextSize": "文字サイズを小さくする",
        "increaseTextSize": "文字サイズを大きくする",
        "moveActionLeft": "{{action}} を左へ移動",
        "moveActionRight": "{{action}} を右へ移動",
        "resetSettings": "語彙設定をリセット"
      }
    },
    "accountDetails": {
      "title": "アカウント詳細",
      "emailLabel": "メール",
      "userIdLabel": "ユーザーID",
      "regionLabel": "ホーム地域",
      "regionEndpointLabel": "地域エンドポイント",
      "appVersionLabel": "アプリバージョン",
      "buildLabel": "ビルド番号",
      "platformLabel": "プラットフォーム",
      "osVersionLabel": "OSバージョン",
      "accessibility": {
        "goBack": "戻る",
        "deleteAccount": "アカウントを完全に削除する"
      },
      "deleteAccount": {
        "sectionTitle": "アカウントを削除する",
        "sectionBody": "VocOrbit アカウントとそれにリンクされているアプリ データを完全に削除します。この操作は元に戻すことができません。",
        "action": "アカウントを完全に削除する",
        "deleting": "アカウントを削除しています...",
        "confirmTitle": "アカウントを削除しますか?",
        "confirmBody": "これにより、VocOrbit アカウントとリンクされたアプリのデータが完全に削除されます。この操作は元に戻すことができません。",
        "successTitle": "アカウントが削除されました",
        "successBody": "VocOrbit アカウントは完全に削除されました。",
        "missingUser": "アカウント ID が見つかりませんでした。再度サインインしてください。",
        "cannotConnect": "サーバーに到達できませんでした。接続を確認して、もう一度試してください。",
        "sessionExpired": "セッションの有効期限が切れました。再度サインインしてください。",
        "failed": "現在、アカウントを削除できませんでした。もう一度試してください。"
      }
    },
    "iap": {
      "title": "課金とクレジット",
      "loading": "課金情報を読み込み中...",
      "currentSubscription": "現在のサブスクリプション",
      "currentStatus": "状態: {{status}}",
      "currentPlan": "現在のプラン: {{plan}}",
      "noActivePlan": "有効なプランはありません",
      "refresh": "課金情報を更新",
      "basicCreditsTitle": "基本インサイトクレジット",
      "basicCreditsBody": "共有画面での基本意味分析でこのクレジットを消費します。",
      "plansTitle": "プラン",
      "plansBody": "プランを選択し、ストアアカウントで支払いを完了してください。",
      "noPlans": "このプラットフォームで購入可能なプランが見つかりません。",
      "planTopup": "月次追加: +{{basic}} 基本 · +{{advanced}} 高度",
      "planCaps": "上限: {{basicCap}} 基本 · {{advancedCap}} 高度",
      "priceLabel": "価格: {{price}}",
      "buyNow": "今すぐ購入",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "購入を処理中...",
      "purchaseCanceled": "購入がキャンセルされました。",
      "purchaseApplied": "{{sku}}が正常に有効化されました。",
      "alreadyOwnedRestoring": "このアイテムはすでに所有されています。購入を復元しています...",
      "restorePurchases": "購入を復元",
      "restoring": "購入を復元中...",
      "restoreNoPurchases": "復元する以前の購入はありません",
      "restoreNoApplicablePurchases": "修復可能な購入は適用できませんでした。",
      "restoreApplied": "{{count}}購入が復元され、確認されました。",
      "status": {
        "none": "未購読",
        "pending": "保留中",
        "active": "有効",
        "expired": "期限切れ",
        "canceled": "キャンセル済み",
        "refunded": "返金済み"
      },
      "errors": {
        "unauthorized": "セッションの有効期限が切れました。もう一度サインインしてください。",
        "cannotConnect": "サーバーに到達できませんでした。接続を確認して、もう一度お試しください。",
        "forbidden": "この購入はアカウントに適用できませんでした。",
        "generic": "要求に失敗しました。もう一度お試しください。",
        "purchaseFailed": "購入に失敗しました。もう一度お試しください。",
        "alreadyOwned": "このアイテムはすでにこのアカウントで所有されています。",
        "invalidReceipt": "店舗領収書を検証できませんでした。",
        "iapUnavailable": "ストア購入サービスは現在このデバイスでは利用できません。"
      },
      "accessibility": {
        "goBack": "戻る",
        "buyPlan": "{{plan}}プランを購入",
        "restorePurchases": "以前の購入を復元する",
        "refresh": "請求とサブスクリプションの状態を更新する"
      },
      "desktop": {
        "subtitle": "現在の残高はこちらでご確認ください。新規購入や定期購入の変更はモバイルでも継続できます。",
        "desktopBadge": "デスクトップビュー",
        "phoneOnlyBadge": "購入用の電話",
        "balanceTitle": "現在の残高",
        "balanceBody": "デスクトップでは利用可能なクレジットとサブスクリプションの状態が常に表示されるため、学習フローを続行する前にアカウントを確認できます。",
        "basicAvailable": "基本クレジット",
        "advancedAvailable": "アドバンストクレジット",
        "freeCredits": "無料",
        "paidCredits": "有料",
        "noPlanBody": "現在、このアカウントには有効なモバイル料金プランがありません。ここですでに利用可能なクレジットは引き続き使用できます。",
        "mobileTitle": "携帯電話で購入を続ける",
        "mobileBody": "クレジットの購入とサブスクリプションの変更は、App Store または Google Play アカウントを使用してモバイル アプリ内で完了します。",
        "storeLabel": "ストア: {{store}}",
        "renewsOn": "{{date}} で更新",
        "expiresOn": "{{date}} に終了しました",
        "updatedOn": "最終同期: {{date}}",
        "stepOpenPhone": "同じアカウントを使用して携帯電話で VocOrbit を開きます。",
        "stepOpenBilling": "[プロフィール] > [請求とクレジット] に移動します。",
        "stepFinishPurchase": "そこでクレジットを購入したり、サブスクリプションを管理したりしてから、ここに戻って更新してください。",
        "mobileHint": "モバイル購入が同じアカウントに適用されると、クレジット残高がここで更新されます。"
      }
    },
    "weeklyAnalytics": {
      "title": "週間分析",
      "modeAll": "すべて",
      "modeBasic": "基本",
      "modeAdvanced": "高度",
      "loading": "週間分析を読み込み中...",
      "summaryTitle": "サマリー (7日)",
      "sessions": "セッション",
      "completed": "完了",
      "answered": "回答数",
      "accuracy": "正答率",
      "activeDays": "活動日数",
      "streak": "連続日数",
      "dailyTrend": "日次トレンド",
      "byQuestionType": "問題タイプ別",
      "byMode": "モード別",
      "weakItems": "苦手項目",
      "noWeakItems": "今週は目立った苦手な単語は見つかりませんでした。",
      "weakItemMeta": "誤答: {{wrongAnswers}} · 正答率: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "意味マッチ",
      "questionTypeGuessWord": "単語推測",
      "questionTypeFillInGap": "穴埋め",
      "questionTypeMatchSynonym": "類義語マッチ",
      "errors": {
        "unauthorized": "セッションの有効期限が切れた可能性があります。再度ログインしてください。",
        "cannotConnect": "サーバーに接続できませんでした。接続を確認して再試行してください。",
        "loadFailed": "週間分析を読み込めませんでした。もう一度お試しください。"
      },
      "accessibility": {
        "goBack": "戻る",
        "filterByMode": "{{mode}} で絞り込む",
        "retry": "分析の読み込みを再試行"
      }
    },
    "detail": {
      "closeDetails": "単語詳細を閉じる",
      "loadingDetail": "単語詳細を読み込み中...",
      "detailLoadFailedTitle": "詳細を読み込めませんでした",
      "statusLearned": "学習済み",
      "statusActive": "アクティブ",
      "markAsLearned": "学習済みにする",
      "moveBackToActive": "アクティブに戻す",
      "buyAdvancedCredits": "高度クレジットを購入",
      "buyBasicCredits": "基本クレジットを購入",
      "buyCredits": "クレジットを購入",
      "whyThisSense": "なぜこの意味か",
      "examples": "例文",
      "synonyms": "同義語",
      "antonyms": "反意語",
      "collocations": "コロケーション",
      "alternativeMeanings": "別の意味",
      "usageNotes": "用法メモ",
      "noSynonyms": "同義語データはまだありません。",
      "stats": "統計",
      "encountersAndLastMode": "出現回数: {{encounters}} | 最後のモード: {{mode}}",
      "nextReminder": "次のリマインダー",
      "currentPlan": "現在のプラン: {{due}}",
      "reviewHint": "忘れた: +10分、難しい: +1時間、良い: +1日から増加。",
      "runAdvanced": "高度な分析を実行",
      "reviewForgot": "忘れた",
      "reviewHard": "難しい",
      "reviewGood": "良い",
      "reviewOptionAccessibility": "{{title}}を選択。次回の復習は{{delay}}後。",
      "repeatUnscheduled": "未設定",
      "repeatNow": "今すぐ",
      "repeatAfterMinutes": "{{count}}分",
      "repeatAfterHours": "{{count}}時間",
      "repeatAfterDays": "{{count}}日",
      "repeatAfterWeeks": "{{count}}週",
      "repeatInMinutes": "{{count}}分後",
      "repeatInHours": "{{count}}時間後",
      "repeatInDays": "{{count}}日後",
      "repeatInWeeks": "{{count}}週後",
      "repeatNotificationTitle": "復習の時間: {{word}}",
      "repeatNotificationBody": "{{word}}を復習しましょう。",
      "reportIssue": "誤った意味を報告",
      "reportIssueAccessibility": "{{word}}の誤った意味を報告",
      "deleteWord": "単語を削除",
      "deleteWordAccessibility": "{{word}}をソフト削除",
      "deleteConfirmTitle": "この単語を削除しますか？",
      "deleteConfirmBody": "「{{word}}」はリストから削除されます。あとで再追加できます。",
      "deleteConfirmCancel": "キャンセル",
      "deleteConfirmAction": "はい、削除"
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
      "title": "レポートの意味",
      "subtitle": "「{{word}}」がこの文脈で間違っていると思われる場合は、何が間違っているかをお知らせください。",
      "messageLabel": "何が問題だと思われますか？",
      "messagePlaceholder": "例：この意味は文章に合わない。場所ではなく、コミュニケーションを記述する必要があります。",
      "charactersLeft": "{{count}}残り文字数",
      "submit": "報告の送信",
      "successTitle": "通報しました",
      "successBody": "フィードバックをお寄せいただきありがとうございます。この項目を確認します。",
      "backToDetail": "単語の詳細に戻る",
      "errors": {
        "unauthorized": "セッションの有効期限が切れました。もう一度サインインしてください。",
        "cannotConnect": "サーバーに到達できませんでした。接続を確認して、もう一度お試しください。",
        "itemNotFound": "見つかりません",
        "submitFailed": "レポートを送信できませんでした。もう一度お試しください。"
      },
      "accessibility": {
        "goBack": "戻る",
        "submit": "イシューレポートを送信",
        "backToDetail": "単語の詳細に戻る"
      }
    },
    "capture": {
      "backButton": "図書館",
      "headerTitle": "単語を追加",
      "headerBody": "文章を貼り付けて、保存したい単語を選択します。",
      "seedWordLabel": "探しています: {{word}}",
      "pasteHero": {
        "title": "コピーしたテキストを貼り付ける",
        "body": "文または段落をコピーし、貼り付けてピッカーを開きます。",
        "bodyWithWord": "「{{word}}」を含む文をコピーし、貼り付けてピッカーを開きます。",
        "hint": "貼り付け後、ピッカーが自動的に開きます。"
      },
      "picker": {
        "title": "本文中の単語を選択してください",
        "body": "以下の正確な単語をクリックしてください。別の文をコピーした場合は、もう一度貼り付けます。",
        "badge": "ワードピッカー",
        "hint": "VocOrbit は、この検索から単語カードを自動的に作成します。"
      },
      "status": {
        "pasteFirst": "コピーしたテキストを貼り付けて開始します。",
        "selectedWord": "選択された単語: {{word}}",
        "seedWordMissing": "「{{word}}」を含む文を貼り付けるか、下の別の単語を選択してください。",
        "selectWord": "続行するには、下の正確な単語をクリックしてください。"
      },
      "actions": {
        "pasteCopiedText": "コピーしたテキストを貼り付ける",
        "pasteAgain": "もう一度貼り付けます",
        "clear": "クリア",
        "readingClipboard": "クリップボードを読み取り中...",
        "reading": "読む...",
        "analyzeAndSave": "分析して保存する",
        "loadingMeaning": "基本的な意味を理解する...",
        "openSavedWord": "保存した単語を開く",
        "backToLibrary": "ライブラリに戻る",
        "pickAnotherWord": "別の言葉を選んでください"
      },
      "loading": {
        "title": "ランニングの基本的な洞察",
        "body": "VocOrbit は、選択した単語をこの文と照合しています。"
      },
      "result": {
        "title": "基本的な意味",
        "savedFallback": "ライブラリに保存されました。",
        "contextMeaning": "文脈の意味",
        "whyThisMeaning": "なぜこの意味になるのか"
      },
      "problems": {
        "clipboardUnavailableTitle": "クリップボードは使用できません",
        "clipboardUnavailableBody": "このブラウザコンテキストでは、クリップボードへのアクセスがブロックされます。文章を手動で貼り付けます。",
        "contextRequiredTitle": "コンテキストが必要です",
        "contextRequiredBody": "単語を選択する前に、文または短い段落を貼り付けます。",
        "selectWordTitle": "テキスト内の単語を選択します",
        "selectWordBody": "ルックアップを実行する前に、テキスト ブロック内の正確な単語をクリックします。",
        "signInRequiredTitle": "サインインが必要です",
        "signInRequiredBody": "セッションの有効期限が切れました。この検索を再試行する前に、VocOrbit を再度開き、サインインします。",
        "basicCreditsRequiredTitle": "基本単位が必要です",
        "basicCreditsRequiredBody": "現在、あなたのアカウントでは基本的な検索を実行できません。",
        "requestTimedOutTitle": "リクエストがタイムアウトしました",
        "requestTimedOutBody": "検索に時間がかかりすぎました。同じ文でもう一度試してください。",
        "connectionProblemTitle": "接続の問題",
        "connectionProblemBody": "VocOrbit はサーバーに到達できませんでした。接続を確認して再試行してください。",
        "lookupFailedTitle": "ルックアップに失敗しました",
        "lookupFailedBody": "VocOrbit はこの洞察リクエストを完了できませんでした。",
        "lookupIncompleteTitle": "ルックアップが不完全",
        "lookupIncompleteBody": "VocOrbit が予期しない応答を返しました。もう一度やり直してください。"
      }
    }
  }
}

export default ja
