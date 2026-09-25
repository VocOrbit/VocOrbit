import { Translations } from "./en"

const ko: Translations = {
  "common": {
    "ok": "확인!",
    "cancel": "취소",
    "back": "뒤로",
    "logOut": "로그아웃"
  },
  "welcomeScreen": {
    "postscript": "잠깐! — 지금 보시는 것은 아마도 당신의 앱의 모양새가 아닐겁니다. (디자이너분이 이렇게 건내주셨다면 모를까요. 만약에 그렇다면, 이대로 가져갑시다!) ",
    "readyForLaunch": "출시 준비가 거의 끝난 나만의 앱!",
    "exciting": "(오, 이거 신나는데요!)",
    "letsGo": "가보자구요!"
  },
  "errorScreen": {
    "title": "뭔가 잘못되었습니다!",
    "friendlySubtitle": "이 화면은 오류가 발생할 때 프로덕션에서 사용자에게 표시됩니다. 이 메시지를 커스터마이징 할 수 있고(해당 파일은 `app/i18n/ko.ts` 에 있습니다) 레이아웃도 마찬가지로 수정할 수 있습니다(`app/screens/error`). 만약 이 오류화면을 완전히 없에버리고 싶다면 `app/app.tsx` 파일에서 <ErrorBoundary> 컴포넌트를 확인하기 바랍니다.",
    "reset": "초기화",
    "traceTitle": "%{name} 스택에서의 오류"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "너무 텅 비어서.. 너무 슬퍼요..",
      "content": "데이터가 없습니다. 버튼을 눌러서 리프레쉬 하시거나 앱을 리로드하세요.",
      "button": "다시 시도해봅시다"
    }
  },
  "errors": {
    "invalidEmail": "잘못된 이메일 주소 입니다."
  },
  "loginScreen": {
    "logIn": "로그인",
    "subtitle": "소셜 계정으로 계속 진행하여 어휘 진행 상황에 액세스하세요.",
    "continueWith": "계속하기",
    "regionTitle": "지역",
    "regionSubtitle": "현재:{{region}}",
    "regionNotSelected": "선택안함",
    "changeRegion": "변화",
    "signingIn": "로그인 중...",
    "googleButton": "Google",
    "appleButton": "Apple",
    "moreProvidersSoon": "더 많은 서비스 제공업체가 곧 제공될 예정입니다.",
    "accessibility": {
      "openRegionSelection": "영역 선택"
    },
    "errors": {
      "unauthorized": "인증에 실패했습니다. 다시 로그인하십시오.",
      "cannotConnect": "서버에 연결할 수 없습니다. 다시 시도해주세요.",
      "server": "서버 유효성 검사에 실패했습니다. 잠시 후 다시 시도하십시오.",
      "rejected": "로그인 요청이 거부되었습니다. 인증 구성을 확인하십시오.",
      "badData": "서버에서 예기치 않은 응답을 받았습니다.",
      "generic": "로그인을 완료할 수 없습니다. 다시 시도해주세요.",
      "googleCancelled": "Google 로그인이 취소되었습니다.",
      "googleUnavailable": "이 기기에서는 Google 로그인을 사용할 수 없습니다.",
      "googleFailed": "Google 로그인에 실패했습니다. 다시 시도해주세요."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "언어를 선택하세요",
    "titleSettings": "언어 설정",
    "subtitleOnboarding": "플래그와 국가가 포함된 글로벌 목록에서 모국어와 대상 언어를 선택합니다.",
    "subtitleSettings": "모국어와 학습 언어를 국기 및 국가 정보와 함께 여기서 변경하세요.",
    "currentPair": "현재 언어 쌍",
    "availableOptionsCount": "{{count}}개의 언어/국가 옵션 사용 가능",
    "nativeLanguageTitle": "모국어",
    "nativeLanguageBody": "번역과 설명이 이 언어로 표시됩니다.",
    "learningLanguageTitle": "학습 언어",
    "learningLanguageBody": "정의와 문맥이 이 언어로 생성됩니다.",
    "selectedLabel": "선택됨",
    "pickerTitleL1": "모국어 선택",
    "pickerTitleL2": "학습 언어 선택",
    "searchPlaceholder": "언어 또는 국가 검색",
    "noResults": "결과가 없습니다.",
    "saving": "저장 중...",
    "continue": "계속하기",
    "save": "저장",
    "accessibility": {
      "goBack": "뒤로 가기",
      "selectNativeLanguage": "모국어 선택",
      "selectLearningLanguage": "학습 언어 선택",
      "continueWithSelectedLanguages": "선택한 언어로 계속하기",
      "saveLanguages": "언어 저장",
      "closeLanguagePicker": "언어 선택기 닫기",
      "closePicker": "선택기 닫기",
      "selectLanguageItem": "선택{{language}}{{country}}"
    },
    "errors": {
      "cannotConnect": "서버에 연결할 수 없습니다. 다시 시도해주세요.",
      "unauthorized": "세션이 유효하지 않습니다. 다시 로그인하십시오.",
      "validation": "언어 환경설정을 저장할 수 없습니다. 입력 내용을 확인하세요.",
      "server": "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      "saveFailed": "언어 환경설정을 저장할 수 없습니다. 다시 시도해주세요.",
      "noSession": "활성 세션을 찾을 수 없습니다. 다시 로그인하세요.",
      "selectTwoLanguages": "두 가지 언어를 모두 선택하세요.",
      "sameLanguagePair": "모국어와 학습 언어는 같을 수 없습니다."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "다시 시도",
      "signIn": "로그인",
      "favoriteLabel": "즐겨찾기",
      "learnedLabel": "학습됨",
      "detailButton": "상세 열기"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "VocOrbit의 실제 작동 방식",
      "subtitle": "실제 흐름: 앱 외부에서 문장을 선택하고 단어를 선택한 다음 VocOrbit 내부의 컨텍스트로 학습합니다.",
      "progress": "STEP{{current}}/{{total}}",
      "progressSingle": "STEP{{current}}",
      "mock": {
        "contextLabel": "문맥 문장",
        "selectedWordLabel": "선택한 단어",
        "meaningLabel": "기본 의미",
        "whyLabel": "왜 이런 맥락에서"
      },
      "flowTitle": "3단계를 통해 절차 알아보기",
      "highlightsTitle": "제공 혜택",
      "actions": {
        "previous": "이전",
        "next": "다음 단계",
        "enterApp": "학습 시작",
        "showExample": "실제 예시 보기",
        "hideExample": "예시 숨기기"
      },
      "steps": {
        "step1": {
          "step": "1단계 • 문장 공유하기",
          "title": "단어가 나타나는 문장을 선택하세요.",
          "body": "브라우저, 메모 또는 앱에서 텍스트를 길게 눌러 VocOrbit Share Extension으로 보냅니다.",
          "source": "돌이켜보면 문학이 주는 생명력에 다시 한 번 감명받는다.",
          "word": "문학 ",
          "meaning": "쓰여진 작품, 특히 예술적인 것으로 간주되는 작품",
          "why": "이 문장에서는 화자에게 강한 영향을 미치는 책과 서술된 예술을 지칭합니다.",
          "hint": "팁: 한 단어뿐 아니라 항상 전체 문장을 공유하세요.",
          "bullets": {
            "one": "브라우저, 메모 및 다양한 읽기 앱에서 작동",
            "two": "원래 문장 컨텍스트를 유지합니다",
            "three": "수동으로 복사하여 붙여넣기할 필요 없음"
          }
        },
        "step2": {
          "step": "2단계 • 정확한 단어 선택",
          "title": "한 단어를 누르면 즉각적으로 기본 의미를 파악할 수 있습니다.",
          "body": "내부 공유 보기에서는 단어를 탭할 수 있습니다. 목표 단어 하나를 선택하고 기본 인사이트를 실행합니다.",
          "source": "독서는 아이들에게 집안일, 의무로 제시되어서는 안됩니다.",
          "word": "쵸",
          "meaning": "일상적인 작업, 대개 불쾌함",
          "why": "여기서 '집안일' 은 독서가 강제 노동처럼 느껴져서는 안 된다는 것을 강조한다.",
          "hint": "팁: 잘 모르겠다면 기본으로 시작하세요. 그런 다음 앱에서 고급으로 실행하세요.",
          "bullets": {
            "one": "이 정확한 문장에 대한 의미가 생성됩니다",
            "two": "이 감각이 선택된 이유도 알 수 있습니다.",
            "three": "선택한 언어 쌍을 지원합니다"
          }
        },
        "step3": {
          "step": "3단계 • 저장 및 정리",
          "title": "유용한 단어를 개인 시스템으로 이동",
          "body": "단어가 VocOrbit에 도달하면 즐겨찾기에 표시하거나 활성 학습을 위해 반복 목록에 추가하십시오.",
          "source": "당사의 전문적인 경험을 활용하여 프로젝트를 성공으로 이끌 수 있습니다.",
          "word": "전문",
          "meaning": "특별한 기술이나 지식이 있는 사람",
          "why": "이 프로젝트 맥락에서 경험을 매우 신뢰할 수 있고 숙련된 것으로 설명합니다.",
          "hint": "팁: 반복 목록을 집중적으로 작성하세요. 10개의 활성 단어를 사용하면 더 잘 유지할 수 있습니다.",
          "bullets": {
            "one": "중요한 단어에 대한 즐겨찾기 목록",
            "two": "활성 암기를 위한 반복 목록",
            "three": "분석 완료된 상태는 진행 상황을 깔끔하게 유지합니다"
          }
        },
        "step4": {
          "step": "4단계 • 루프 연습",
          "title": "학습한 내용 검토, 연습 및 표시",
          "body": "리콜이 강해질 때까지 연습 모드와 미리 알림을 사용한 다음 학습한 단어로 표시합니다.",
          "source": "다른 문의 사항이 있으신가요?",
          "word": "연락해요",
          "meaning": "누군가에게 연락하기",
          "why": "이 문맥에서 그것은 신체적 도달이 아닌 의사소통을 의미하는 구문 동사입니다.",
          "hint": "팁: 꾸준한 진행을 위해 매일 미리 알림과 짧은 세션을 사용하세요.",
          "bullets": {
            "one": "연습 카드는 자신의 말로 만들어집니다",
            "two": "주간 분석에 따르면 약점이 있는 것으로 나타났습니다.",
            "three": "학습한 단어는 자동으로 반복 대기열을 나갑니다"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "세션이 만료되었을 수 있습니다. 다시 로그인하세요.",
      "cannotConnect": "서버에 연결할 수 없습니다. 연결을 확인하고 다시 시도하세요.",
      "listLoadFailed": "단어 목록을 로드할 수 없습니다. 다시 시도해주세요.",
      "searchLoadFailed": "검색 결과를 로드할 수 없습니다. 다시 시도해주세요.",
      "itemNotFound": "기록을 찾을 수 없습니다",
      "reloginRequired": "계속하려면 로그인하세요",
      "favoriteActionFailed": "실패하였습니다. 다시 시도해 주시길 바랍니다.",
      "detailLoadFailed": "단어 세부 정보를 로드할 수 없습니다.",
      "stateUpdateFailed": "상태를 업데이트할 수 없습니다. 다시 시도해주세요.",
      "analysisRequestFailed": "분석 요청을 보낼 수 없습니다.",
      "invalidModelOutput": "모델 응답 형식이 유효하지 않습니다. 다시 시도해주세요.",
      "analysisTimeout": "분석 시간이 초과되었습니다. 다시 시도하십시오.",
      "advancedCreditInsufficient": "고급 크레딧이 부족합니다.",
      "basicCreditInsufficient": "기본 크레딧이 부족합니다.",
      "advancedAnalysisFailed": "고급 분석을 완료할 수 없습니다.",
      "basicAnalysisFailed": "기본 분석을 완료할 수 없습니다.",
      "repeatProgressUpdateFailed": "반복 진행 상황을 업데이트할 수 없습니다. 다시 시도해주세요.",
      "missingContext": "분석에 필요한 컨텍스트가 누락되었습니다.",
      "selectedWordNotInSentence": "문맥 문장에서 선택한 단어를 찾을 수 없습니다.",
      "analysisFailedGeneric": "분석을 완료할 수 없습니다. 다시 시도해주세요.",
      "unexpected": "예기치 않은 오류가 발생했습니다."
    },
    "search": {
      "title": "검색",
      "placeholder": "단어, 의미 또는 설명으로 검색",
      "loading": "단어를 불러오는 중...",
      "emptyResult": "검색어와 일치하는 단어가 없습니다.",
      "emptyHint": "검색하려면 위에서 입력을 시작하세요."
    },
    "showroom": {
      "loading": "단어 목록 로드 중...",
      "emptyTitle": "아직 단어 없음",
      "emptyBody": "Word Insight를 통해 단어를 추가하면 이 목록이 자동으로 채워집니다.",
      "emptyCta": "공지사항 열기",
      "updateAvailableTitle": "새 버전 사용 가능",
      "updateAvailableBody": "탭하여 업데이트하고 최신 개선 사항을 계속 받으세요.",
      "updateNow": "지금 업데이트하기",
      "repeatAdded": "{{word}}이 (가) 반복 목록에 추가되었습니다 ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}}이 (가) 반복 목록에서 삭제되었습니다 ({{count}}/{{limit}}).",
      "repeatLimitReached": "반복 목록 한도 (10/10) 에 도달했습니다.",
      "repeatPermissionRequired": "미리 알림에 대한 알림 권한이 필요합니다. 단어를 추가하려면 알림을 활성화하세요.",
      "favoriteAdded": "{{word}}이 (가) 즐겨찾기에 추가되었습니다.",
      "favoriteRemoved": "{{word}}님이 즐겨찾기에서 삭제되었습니다.",
      "repeatCleared": "반복 목록이 지워졌습니다.",
      "repeatListTitle": "반복 목록",
      "repeatCount": "{{count}}/{{limit}}개 단어",
      "repeatEmpty": "반복 목록이 비어 있습니다. 아래 벨 버튼으로 단어를 추가하세요.",
      "clearAll": "모두 지우기",
      "done": "완료",
      "practice": "연습",
      "accessibility": {
        "showDetails": "세부 정보 보기",
        "favoriteWord": "즐겨찾는 단어",
        "repeatWordLater": "나중에 이 단어 반복",
        "openProfile": "공개 프로필",
        "openRepeatList": "반복 단어 목록 열기",
        "openAnnouncements": "공지사항 열기",
        "openUpdate": "페이지 업데이트",
        "dismissUpdate": "업데이트 알림 닫기",
        "searchWords": "검색어",
        "switchToCard": "카드 보기로 전환",
        "switchToList": "리스트 보기로 전환",
        "retryShowroom": "쇼룸 로딩 다시 시도하기",
        "closeRepeatList": "반복 목록 닫기",
        "clearRepeatList": "반복 목록 지우기",
        "removeFromRepeat": "반복 목록에서{{word}}제거",
        "practiceWord": "이 단어 연습하기",
        "addWord": "단어 추가"
      },
      "quickAdd": {
        "eyebrow": "빠른 추가",
        "title": "문맥에서 단어 추가",
        "body": "문장을 붙여넣고 정확한 단어를 선택해 저장하세요.",
        "action": "단어 추가",
        "actionHint": "붙여넣고 선택"
      }
    },
    "practiceHub": {
      "title": "연습",
      "sectionLabel": "연습",
      "selectAnswer": "정답 선택",
      "modeBasic": "기본",
      "modeAdvanced": "고급",
      "loadingTitle": "카탈로그를 불러오는 중",
      "loadingMessage": "사용 가능한 연습 유형을 확인하고 있습니다.",
      "loadingQuestionsTitle": "연습 문제를 준비하는 중...",
      "loadingQuestionsMessage": "사용 가능한 어휘 데이터를 기반으로 문제를 생성하고 있습니다.",
      "instructions": {
        "matchSynonyms": "가장 가까운 유의어를 고르세요."
      },
      "resultCta": {
        "backToPractice": "연습으로 돌아가기",
        "seeResult": "결과 보기",
        "nextWord": "다음 단어"
      },
      "result": {
        "correctTitle": "정답입니다!",
        "incorrectTitle": "틀렸습니다!",
        "correctAnswerLabel": "정답:",
        "usedInSentenceLabel": "문장 사용 예:",
        "sessionResultLabel": "세션 결과"
      },
      "leavePrompt": {
        "title": "벌써 나가시겠어요?",
        "keepPlaying": "계속하기",
        "leave": "나가기",
        "closePromptAccessibility": "나가기 확인창 닫기",
        "leavePracticeAccessibility": "연습 나가기"
      },
      "hints": {
        "availableCount": "{{count}}개 단어 사용 가능",
        "missingSynonyms": "유의어 데이터 없음",
        "minActiveWords": "최소 2개의 활성 단어가 필요합니다"
      },
      "tiles": {
        "meaningMatch": "의미 매칭",
        "fillInGap": "빈칸 채우기",
        "guessWord": "단어 맞추기",
        "matchSynonyms": "유의어 매칭"
      },
      "accessibility": {
        "goBack": "뒤로 가기",
        "useMode": "{{mode}} 모드 사용",
        "closePractice": "연습 닫기"
      },
      "loadState": {
        "noQuestions": {
          "title": "아직 연습 문제가 없습니다",
          "message": "연습을 시작하려면 최소 2개의 활성 단어가 필요합니다.",
          "actionLabel": "단어 추가"
        },
        "unauthorized": {
          "title": "로그인이 필요합니다",
          "message": "세션이 만료되었을 수 있습니다. 계속하려면 다시 로그인하세요.",
          "actionLabel": "로그인"
        },
        "forbidden": {
          "title": "현재 이 기능을 사용할 수 없습니다",
          "message": "계속하려면 플랜 또는 크레딧을 확인하세요.",
          "actionLabel": "크레딧 받기"
        },
        "rejected": {
          "title": "이 모드에 필요한 데이터가 부족합니다",
          "message": "단어를 더 추가한 뒤 다시 시도하세요.",
          "actionLabel": "단어 추가"
        },
        "server": {
          "title": "서버에 연결할 수 없습니다",
          "message": "연결 상태를 확인하고 다시 시도하세요.",
          "actionLabel": "다시 시도"
        },
        "generic": {
          "title": "연습을 시작할 수 없습니다",
          "message": "예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.",
          "actionLabel": "다시 시도"
        }
      }
    },
    "announcements": {
      "title": "공지사항",
      "unreadCount": "{{count}}개 읽지 않음",
      "markAllRead": "모두 읽음으로 표시",
      "loading": "공지사항을 불러오는 중...",
      "empty": "현재 공지사항이 없습니다.",
      "openLink": "링크 열기",
      "openAnnouncement": "공지 열기: {{title}}",
      "levelInfo": "정보",
      "levelWarning": "경고",
      "levelCritical": "중요",
      "loadFailed": "공지사항을 불러올 수 없습니다. 다시 시도해 주세요.",
      "claimFailed": "보상 수령에 실패했습니다. 다시 시도하십시오.",
      "requirementNotMet": "요건이 아직 충족되지 않았습니다. 먼저 친구를 초대하세요.",
      "referralCodeMissing": "이 계정에 대한 추천 코드가 없습니다.",
      "referralProgress": "추천 진행 상황:{{current}}/{{required}}",
      "shareInvite": "친구 초대하기",
      "referralShareMessage": "VocOrbit에 가입하세요.\n이 링크를 여세요:\n{{link}}",
      "rewardText": "보상: +{{amount}}{{creditType}}크레딧",
      "creditBasic": "기본",
      "creditAdvanced": "고급",
      "claimReward": "받기",
      "claimingReward": "주장",
      "rewardClaimed": "요구"
    },
    "forceUpdate": {
      "title": "업데이트 필요@ item:: intable",
      "body": "VocOrbit을 계속 사용하려면 새 버전이 필요합니다.",
      "updateNow": "지금 업데이트하기",
      "checkAgain": "재확인"
    },
    "profile": {
      "title": "프로필",
      "accountDetailsTitle": "계정 정보",
      "accountDetailsSubtitle": "이메일 및 계정 정보를 확인하세요.",
      "settingsTitle": "설정",
      "settingsSubtitle": "텍스트 크기와 액션 버튼 순서를 설정하세요.",
      "favoriteWordsTitle": "즐겨찾기 단어",
      "favoriteWordsSubtitle": "즐겨찾기에 추가한 단어를 확인하세요.",
      "learnedWordsTitle": "학습한 단어",
      "learnedWordsSubtitle": "학습 완료로 표시한 단어를 확인하세요.",
      "weeklyAnalyticsTitle": "주간 분석",
      "weeklyAnalyticsSubtitle": "최근 7일간 연습 성과를 확인하세요.",
      "regionTitle": "지역",
      "regionSubtitle": "현재: {{region}}",
      "regionNotSelected": "선택되지 않음",
      "emptyFavorites": "아직 즐겨찾기 단어가 없습니다.",
      "emptyLearned": "아직 학습한 단어가 없습니다.",
      "loadingList": "목록을 불러오는 중...",
      "logOut": "로그아웃",
      "accessibility": {
        "goBack": "뒤로 가기",
        "openAccountDetails": "계정 상세 정보",
        "openSettings": "설정 열기",
        "openFavoriteWords": "즐겨찾는 단어 열기",
        "openLearnedWords": "학습한 단어 열기",
        "openWeeklyAnalytics": "주간 분석 열기",
        "openRegion": "영역 설정",
        "logOut": "로그아웃",
        "playPronunciation": "{{word}}의 발음 재생",
        "openDetailForWord": "{{word}}에 대한 세부 정보 열기",
        "removeWord": "{{word}}삭제"
      }
    },
    "settings": {
      "title": "설정",
      "languagePairTitle": "언어 쌍",
      "languagePairSubtitle": "모국어와 학습 언어를 변경하세요.",
      "billingCreditsTitle": "결제 및 크레딧",
      "billingCreditsSubtitle": "기본 의미 크레딧과 IAP 패키지를 여기서 관리하세요.",
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
      "themeModeTitle": "테마",
      "themeModeSubtitle": "밝음, 어두움을 선택하거나 시스템 설정을 따르세요.",
      "themeModeSystem": "시스템",
      "themeModeLight": "라이트",
      "themeModeDark": "다크",
      "textSizeTitle": "텍스트 크기",
      "textSizeSubtitle": "어휘 카드의 텍스트 크기를 조정하세요.",
      "actionOrderTitle": "액션 순서",
      "actionOrderSubtitle": "상세/즐겨찾기/반복 버튼 순서를 설정하세요.",
      "actionDetail": "상세",
      "actionFavorite": "즐겨찾기",
      "actionRepeat": "반복",
      "resetToDefaults": "기본값으로 재설정",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "뒤로 가기",
        "openLanguagePreferences": "언어 설정 열기",
        "openBillingCredits": "결제 및 크레딧 열기",
        "useSystemTheme": "시스템 테마 사용",
        "useLightTheme": "밝은 테마",
        "useDarkTheme": "다크 테마",
        "decreaseTextSize": "텍스트 크기 줄이기",
        "increaseTextSize": "텍스트 크기 늘리기",
        "moveActionLeft": "{{action}} 왼쪽으로 이동",
        "moveActionRight": "{{action}} 오른쪽으로 이동",
        "resetSettings": "어휘 설정 재설정"
      }
    },
    "accountDetails": {
      "title": "계정 정보",
      "emailLabel": "이메일",
      "userIdLabel": "사용자 ID",
      "regionLabel": "기본 지역",
      "regionEndpointLabel": "지역 엔드포인트",
      "appVersionLabel": "앱 버전",
      "buildLabel": "빌드 번호",
      "platformLabel": "플랫폼",
      "osVersionLabel": "OS 버전",
      "accessibility": {
        "goBack": "뒤로 가기",
        "deleteAccount": "계정을 영구적으로 삭제"
      },
      "deleteAccount": {
        "sectionTitle": "계정 삭제",
        "sectionBody": "VocOrbit 계정과 이에 연결된 앱 데이터를 영구적으로 삭제합니다. 이 작업은 취소할 수 없습니다.",
        "action": "계정을 영구적으로 삭제",
        "deleting": "계정 삭제 중...",
        "confirmTitle": "계정을 삭제하시겠습니까?",
        "confirmBody": "이렇게 하면 VocOrbit 계정과 연결된 앱 데이터가 영구적으로 삭제됩니다. 이 작업은 취소할 수 없습니다.",
        "successTitle": "계정이 삭제되었습니다",
        "successBody": "귀하의 VocOrbit 계정이 영구적으로 삭제되었습니다.",
        "missingUser": "귀하의 계정 ID를 찾을 수 없습니다. 다시 로그인해 주세요.",
        "cannotConnect": "서버에 연결할 수 없습니다. 연결을 확인하고 다시 시도하세요.",
        "sessionExpired": "세션이 만료되었습니다. 다시 로그인해 주세요.",
        "failed": "지금은 귀하의 계정을 삭제할 수 없습니다. 다시 시도해 주세요."
      }
    },
    "iap": {
      "title": "결제 및 크레딧",
      "loading": "결제 정보를 불러오는 중...",
      "currentSubscription": "현재 구독",
      "currentStatus": "상태: {{status}}",
      "currentPlan": "현재 플랜: {{plan}}",
      "noActivePlan": "활성 플랜 없음",
      "refresh": "결제 새로고침",
      "basicCreditsTitle": "기본 인사이트 크레딧",
      "basicCreditsBody": "공유 화면의 기본 의미 분석에 이 크레딧이 사용됩니다.",
      "plansTitle": "플랜",
      "plansBody": "플랜을 선택하고 스토어 계정으로 결제를 완료하세요.",
      "noPlans": "이 플랫폼에서 구매 가능한 플랜이 없습니다.",
      "planTopup": "월간 추가: +{{basic}} 기본 · +{{advanced}} 고급",
      "planCaps": "한도: {{basicCap}} 기본 · {{advancedCap}} 고급",
      "priceLabel": "가격: {{price}}",
      "buyNow": "지금 구매",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "구매 처리 중...",
      "purchaseCanceled": "구매 취소됨",
      "purchaseApplied": "{{sku}}이 (가) 성공적으로 활성화되었습니다.",
      "alreadyOwnedRestoring": "이 아이템은 이미 소유하고 있습니다. 구매 복원 중...",
      "restorePurchases": "구매 복원",
      "restoring": "구매 복원 중...",
      "restoreNoPurchases": "복원할 구매를 찾을 수 없습니다.",
      "restoreNoApplicablePurchases": "복구 가능한 구매는 적용할 수 없습니다.",
      "restoreApplied": "{{count}}구매가 복원되고 확인되었습니다.",
      "status": {
        "none": "구독 안 함",
        "pending": "대기 중",
        "active": "활성",
        "expired": "만료됨",
        "canceled": "취소됨",
        "refunded": "환불됨"
      },
      "errors": {
        "unauthorized": "세션이 만료되었습니다. 다시 로그인하십시오.",
        "cannotConnect": "서버에 연결할 수 없습니다. 연결을 확인하고 다시 시도하세요.",
        "forbidden": "계정에 이 구매를 적용할 수 없습니다.",
        "generic": "결제 요청에 실패했습니다. 다시 시도하세요.",
        "purchaseFailed": "구매에 실패했습니다. 다시 시도해 주세요.",
        "alreadyOwned": "이 아이템은 이미 이 계정에서 소유하고 있습니다.",
        "invalidReceipt": "매장 영수증을 확인할 수 없습니다.",
        "iapUnavailable": "현재 이 기기에서는 스토어 구매 서비스를 이용할 수 없습니다."
      },
      "accessibility": {
        "goBack": "뒤로 가기",
        "buyPlan": "{{plan}}플랜 구매",
        "restorePurchases": "이전 구매 복원",
        "refresh": "청구 및 구독 상태 새로 고침"
      },
      "desktop": {
        "subtitle": "여기에서 현재 잔액을 확인하세요. 신규 구매 및 구독 변경은 모바일에서도 계속됩니다.",
        "desktopBadge": "데스크톱 보기",
        "phoneOnlyBadge": "구매용 전화",
        "balanceTitle": "현재 잔액",
        "balanceBody": "Desktop에서는 사용 가능한 크레딧과 구독 상태를 계속해서 볼 수 있으므로 학습 흐름을 계속하기 전에 계정을 확인할 수 있습니다.",
        "basicAvailable": "기본 학점",
        "advancedAvailable": "고급 학점",
        "freeCredits": "무료",
        "paidCredits": "유급의",
        "noPlanBody": "이 계정에는 현재 활성화된 모바일 결제 요금제가 없습니다. 여기에서 이미 사용 가능한 크레딧을 계속 사용할 수 있습니다.",
        "mobileTitle": "휴대전화에서 계속 구매하세요",
        "mobileBody": "크레딧 구매 및 구독 변경은 App Store 또는 Google Play 계정을 사용하여 모바일 앱 내에서 완료됩니다.",
        "storeLabel": "상점: {{store}}",
        "renewsOn": "{{date}}에 갱신",
        "expiresOn": "{{date}}에 종료됨",
        "updatedOn": "마지막 동기화: {{date}}",
        "stepOpenPhone": "동일한 계정으로 휴대폰에서 VocOrbit를 엽니다.",
        "stepOpenBilling": "프로필 > 청구 및 크레딧으로 이동합니다.",
        "stepFinishPurchase": "여기에서 크레딧을 구매하거나 구독을 관리한 후 여기로 돌아와서 새로 고치세요.",
        "mobileHint": "모바일 구매가 동일한 계정에 적용된 후 여기에서 크레딧 잔액이 업데이트됩니다."
      }
    },
    "weeklyAnalytics": {
      "title": "주간 분석",
      "modeAll": "전체",
      "modeBasic": "기본",
      "modeAdvanced": "고급",
      "loading": "주간 분석을 불러오는 중...",
      "summaryTitle": "요약 (7일)",
      "sessions": "세션",
      "completed": "완료",
      "answered": "응답",
      "accuracy": "정확도",
      "activeDays": "활성 일수",
      "streak": "연속 일수",
      "dailyTrend": "일일 추세",
      "byQuestionType": "문제 유형별",
      "byMode": "모드별",
      "weakItems": "취약 항목",
      "noWeakItems": "이번 주에는 눈에 띄는 약한 단어가 없습니다.",
      "weakItemMeta": "오답: {{wrongAnswers}} · 정확도: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "의미 매칭",
      "questionTypeGuessWord": "단어 맞추기",
      "questionTypeFillInGap": "빈칸 채우기",
      "questionTypeMatchSynonym": "유의어 매칭",
      "errors": {
        "unauthorized": "세션이 만료되었을 수 있습니다. 다시 로그인해 주세요.",
        "cannotConnect": "서버에 연결할 수 없습니다. 연결을 확인하고 다시 시도하세요.",
        "loadFailed": "주간 분석을 불러올 수 없습니다. 다시 시도해 주세요."
      },
      "accessibility": {
        "goBack": "뒤로 가기",
        "filterByMode": "{{mode}} 기준으로 필터",
        "retry": "분석 요청 다시 시도"
      }
    },
    "detail": {
      "closeDetails": "단어 상세 닫기",
      "loadingDetail": "단어 상세를 불러오는 중...",
      "detailLoadFailedTitle": "상세를 불러올 수 없습니다",
      "statusLearned": "학습됨",
      "statusActive": "활성",
      "markAsLearned": "학습됨으로 표시",
      "moveBackToActive": "활성으로 되돌리기",
      "buyAdvancedCredits": "고급 크레딧 구매",
      "buyBasicCredits": "기본 크레딧 구매",
      "buyCredits": "크레딧 구매",
      "whyThisSense": "왜 이 의미인지",
      "examples": "예문",
      "synonyms": "동의어",
      "antonyms": "반의어",
      "collocations": "연어",
      "alternativeMeanings": "대체 의미",
      "usageNotes": "사용 메모",
      "noSynonyms": "동의어 데이터가 아직 없습니다.",
      "stats": "통계",
      "encountersAndLastMode": "노출: {{encounters}} | 마지막 모드: {{mode}}",
      "nextReminder": "다음 리마인더",
      "currentPlan": "현재 계획: {{due}}",
      "reviewHint": "잊음: +10분, 어려움: +1시간, 좋음: +1일부터 증가.",
      "runAdvanced": "고급 분석 실행",
      "reviewForgot": "잊음",
      "reviewHard": "어려움",
      "reviewGood": "좋음",
      "reviewOptionAccessibility": "{{title}} 선택됨. 다음 복습은 {{delay}} 후.",
      "repeatUnscheduled": "예약되지 않음",
      "repeatNow": "지금",
      "repeatAfterMinutes": "{{count}}분",
      "repeatAfterHours": "{{count}}시간",
      "repeatAfterDays": "{{count}}일",
      "repeatAfterWeeks": "{{count}}주",
      "repeatInMinutes": "{{count}}분 후",
      "repeatInHours": "{{count}}시간 후",
      "repeatInDays": "{{count}}일 후",
      "repeatInWeeks": "{{count}}주 후",
      "repeatNotificationTitle": "복습 시간: {{word}}",
      "repeatNotificationBody": "{{word}} 단어를 복습하세요.",
      "reportIssue": "잘못된 의미 신고",
      "reportIssueAccessibility": "{{word}}의 잘못된 의미 신고",
      "deleteWord": "단어 삭제",
      "deleteWordAccessibility": "{{word}} 소프트 삭제",
      "deleteConfirmTitle": "이 단어를 삭제할까요?",
      "deleteConfirmBody": "\"{{word}}\"가 목록에서 제거됩니다. 나중에 다시 추가할 수 있습니다.",
      "deleteConfirmCancel": "취소",
      "deleteConfirmAction": "예, 삭제"
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
      "title": "의미 신고하기",
      "subtitle": "이 상황에서 '{{word}}' 이 (가) 잘못되었다면, 무엇이 잘못되었는지 알려주세요.",
      "messageLabel": "무엇이 잘못되었나요?",
      "messagePlaceholder": "예: 이 의미는 문장에 맞지 않습니다. 위치가 아닌 커뮤니케이션을 설명해야 합니다.",
      "charactersLeft": "{{count}}자 남음",
      "submit": "신고하기",
      "successTitle": "제출한 신고",
      "successBody": "피드백을 보내주셔서 감사합니다. 이 항목을 검토하겠습니다.",
      "backToDetail": "단어 세부 정보로 돌아가기",
      "errors": {
        "unauthorized": "세션이 만료되었습니다. 다시 로그인하십시오.",
        "cannotConnect": "서버에 연결할 수 없습니다. 연결을 확인하고 다시 시도하세요.",
        "itemNotFound": "단어 항목을 찾을 수 없습니다.",
        "submitFailed": "보고서를 제출할 수 없습니다. 다시 시도해주세요."
      },
      "accessibility": {
        "goBack": "뒤로 가기",
        "submit": "문제 보고서 보내기",
        "backToDetail": "단어 세부 정보로 돌아가기"
      }
    },
    "capture": {
      "backButton": "도서관",
      "headerTitle": "단어 추가",
      "headerBody": "문장을 붙여넣고 저장하고 싶은 단어를 선택하세요.",
      "seedWordLabel": "찾는 사람: {{word}}",
      "pasteHero": {
        "title": "복사한 텍스트 붙여넣기",
        "body": "문장이나 단락을 복사한 다음 붙여넣어 선택기를 엽니다.",
        "bodyWithWord": "\"{{word}}\"가 포함된 문장을 복사한 후 붙여넣어 선택기를 엽니다.",
        "hint": "붙여넣기 후 선택기가 자동으로 열립니다."
      },
      "picker": {
        "title": "텍스트에서 단어를 선택하세요.",
        "body": "아래에서 정확한 단어를 클릭하세요. 다른 문장을 복사했다면 다시 붙여넣으세요.",
        "badge": "단어 선택기",
        "hint": "VocOrbit는 이 조회에서 자동으로 단어 카드를 생성합니다."
      },
      "status": {
        "pasteFirst": "복사한 텍스트를 붙여넣어 시작하세요.",
        "selectedWord": "선택한 단어: {{word}}",
        "seedWordMissing": "\"{{word}}\" 문장을 붙여넣거나 아래에서 다른 단어를 선택하세요.",
        "selectWord": "계속하려면 아래에서 정확한 단어를 클릭하세요."
      },
      "actions": {
        "pasteCopiedText": "복사한 텍스트 붙여넣기",
        "pasteAgain": "다시 붙여넣기",
        "clear": "분명한",
        "readingClipboard": "클립보드를 읽는 중...",
        "reading": "독서...",
        "analyzeAndSave": "분석 및 저장",
        "loadingMeaning": "기본적인 의미를 알아내는 중...",
        "openSavedWord": "저장된 단어 열기",
        "backToLibrary": "도서관으로 돌아가기",
        "pickAnotherWord": "다른 단어를 선택하세요"
      },
      "loading": {
        "title": "기본 통찰력 실행",
        "body": "VocOrbit는 선택한 단어를 이 문장과 일치시킵니다."
      },
      "result": {
        "title": "기본 의미",
        "savedFallback": "라이브러리에 저장되었습니다.",
        "contextMeaning": "문맥상의 의미",
        "whyThisMeaning": "왜 이런 의미가 있지?"
      },
      "problems": {
        "clipboardUnavailableTitle": "클립보드를 사용할 수 없습니다.",
        "clipboardUnavailableBody": "이 브라우저 컨텍스트에서는 클립보드 액세스가 차단됩니다. 문장을 수동으로 붙여넣으세요.",
        "contextRequiredTitle": "상황이 필요합니다",
        "contextRequiredBody": "단어를 선택하기 전에 문장이나 짧은 단락을 붙여넣으세요.",
        "selectWordTitle": "텍스트에서 단어를 선택하세요.",
        "selectWordBody": "조회를 실행하기 전에 텍스트 블록 내부의 정확한 단어를 클릭하세요.",
        "signInRequiredTitle": "로그인이 필요합니다",
        "signInRequiredBody": "세션이 만료되었습니다. 이 조회를 다시 시도하기 전에 VocOrbit를 다시 열고 로그인하세요.",
        "basicCreditsRequiredTitle": "기본학점 필요",
        "basicCreditsRequiredBody": "귀하의 계정은 현재 기본 조회를 실행할 수 없습니다.",
        "requestTimedOutTitle": "요청 시간이 초과되었습니다.",
        "requestTimedOutBody": "조회하는 데 시간이 너무 오래 걸렸습니다. 같은 문장으로 다시 시도해 보세요.",
        "connectionProblemTitle": "연결 문제",
        "connectionProblemBody": "VocOrbit가 서버에 연결할 수 없습니다. 연결을 확인하고 다시 시도하세요.",
        "lookupFailedTitle": "조회 실패",
        "lookupFailedBody": "VocOrbit가 이 통찰력 요청을 완료할 수 없습니다.",
        "lookupIncompleteTitle": "조회가 완료되지 않았습니다.",
        "lookupIncompleteBody": "VocOrbit가 예상치 못한 응답을 반환했습니다. 다시 한번 시도해 보세요."
      }
    }
  }
}

export default ko
