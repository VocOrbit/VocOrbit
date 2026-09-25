import { Translations } from "./en"

const vi: Translations = {
  "common": {
    "ok": "ĐƯỢC RỒI!",
    "cancel": "Hủy bỏ",
    "back": "Quay lại",
    "logOut": "Đăng xuất"
  },
  "welcomeScreen": {
    "postscript": "psst — Đây có thể không phải là ứng dụng của bạn. (Trừ khi nhà thiết kế của bạn đưa cho bạn những màn hình này và trong trường hợp đó, hãy gửi nó đi!)",
    "readyForLaunch": "Ứng dụng của bạn gần như đã sẵn sàng để ra mắt!",
    "exciting": "(ồ, điều này thật thú vị!)",
    "letsGo": "Đi thôi!"
  },
  "errorScreen": {
    "title": "Đã xảy ra lỗi!",
    "friendlySubtitle": "Đây là màn hình mà người dùng của bạn sẽ thấy trong quá trình sản xuất khi xảy ra lỗi. Bạn sẽ muốn tùy chỉnh thông báo này (nằm trong `app/i18n/en.ts`) và có thể cả bố cục (`app/screens/ErrorScreen`). Nếu bạn muốn loại bỏ hoàn toàn điều này, hãy kiểm tra `app/app.tsx` để tìm thành phần <ErrorBoundary>.",
    "reset": "ĐẶT LẠI ỨNG DỤNG",
    "traceTitle": "Lỗi từ ngăn xếp %{name}"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "Trống vắng quá...buồn quá",
      "content": "Chưa tìm thấy dữ liệu. Hãy thử nhấp vào nút để làm mới hoặc tải lại ứng dụng.",
      "button": "Hãy thử lại lần nữa"
    }
  },
  "errors": {
    "invalidEmail": "Địa chỉ email không hợp lệ."
  },
  "loginScreen": {
    "logIn": "Đăng nhập",
    "subtitle": "Tiếp tục với tài khoản xã hội của bạn để truy cập vào tiến trình từ vựng của bạn.",
    "continueWith": "TIẾP TỤC VỚI",
    "regionTitle": "Vùng",
    "regionSubtitle": "Hiện tại: {{region}}",
    "regionNotSelected": "Không được chọn",
    "changeRegion": "Thay đổi",
    "signingIn": "Đang đăng nhập...",
    "googleButton": "Google",
    "appleButton": "Táo (sắp có)",
    "moreProvidersSoon": "Nhiều nhà cung cấp sẽ sớm có mặt.",
    "accessibility": {
      "openRegionSelection": "Lựa chọn khu vực mở"
    },
    "errors": {
      "unauthorized": "Xác thực không thành công. Vui lòng đăng nhập lại.",
      "cannotConnect": "Không thể kết nối với máy chủ. Vui lòng thử lại.",
      "server": "Xác thực máy chủ không thành công. Vui lòng thử lại trong thời gian ngắn.",
      "rejected": "Yêu cầu đăng nhập đã bị từ chối. Vui lòng xác minh cấu hình xác thực.",
      "badData": "Đã nhận được phản hồi không mong đợi từ máy chủ.",
      "generic": "Không thể hoàn tất đăng nhập. Vui lòng thử lại.",
      "googleCancelled": "Đăng nhập bằng Google đã bị hủy.",
      "googleUnavailable": "Đăng nhập bằng Google không khả dụng trên thiết bị này.",
      "googleFailed": "Đăng nhập Google không thành công. Vui lòng thử lại."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "Chọn cặp ngôn ngữ của bạn",
    "titleSettings": "Tùy chọn ngôn ngữ",
    "subtitleOnboarding": "Chọn ngôn ngữ mẹ đẻ và ngôn ngữ mục tiêu của bạn từ danh sách toàn cầu có cờ và quốc gia.",
    "subtitleSettings": "Cập nhật ngôn ngữ mẹ đẻ và mục tiêu của bạn tại đây với thông tin về cờ và quốc gia.",
    "currentPair": "Cặp hiện tại",
    "availableOptionsCount": "{{count}} có sẵn tùy chọn ngôn ngữ/quốc gia",
    "nativeLanguageTitle": "Tiếng mẹ đẻ",
    "nativeLanguageBody": "Các bản dịch và giải thích sẽ được hiển thị bằng ngôn ngữ này.",
    "learningLanguageTitle": "Học ngôn ngữ",
    "learningLanguageBody": "Các định nghĩa và ngữ cảnh sẽ được tạo ra bằng ngôn ngữ này.",
    "selectedLabel": "Đã chọn",
    "pickerTitleL1": "Chọn ngôn ngữ bản địa",
    "pickerTitleL2": "Chọn ngôn ngữ học",
    "searchPlaceholder": "Tìm kiếm ngôn ngữ hoặc quốc gia",
    "noResults": "Không tìm thấy kết quả nào.",
    "saving": "Đang lưu...",
    "continue": "Tiếp tục",
    "save": "Lưu",
    "accessibility": {
      "goBack": "Quay lại",
      "selectNativeLanguage": "Chọn ngôn ngữ bản địa",
      "selectLearningLanguage": "Chọn ngôn ngữ học",
      "continueWithSelectedLanguages": "Tiếp tục với các ngôn ngữ đã chọn",
      "saveLanguages": "Lưu ngôn ngữ",
      "closeLanguagePicker": "Đóng bộ chọn ngôn ngữ",
      "closePicker": "Đóng bộ chọn",
      "selectLanguageItem": "Chọn {{language}} {{country}}"
    },
    "errors": {
      "cannotConnect": "Không thể kết nối với máy chủ. Vui lòng thử lại.",
      "unauthorized": "Phiên không hợp lệ. Vui lòng đăng nhập lại.",
      "validation": "Không thể lưu tùy chọn ngôn ngữ. Vui lòng kiểm tra đầu vào của bạn.",
      "server": "Đã xảy ra lỗi máy chủ. Vui lòng thử lại trong thời gian ngắn.",
      "saveFailed": "Không thể lưu tùy chọn ngôn ngữ. Vui lòng thử lại.",
      "noSession": "Không tìm thấy phiên hoạt động nào. Vui lòng đăng nhập lại.",
      "selectTwoLanguages": "Vui lòng chọn cả hai ngôn ngữ.",
      "sameLanguagePair": "Ngôn ngữ mẹ đẻ và ngôn ngữ học tập không thể giống nhau."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "Thử lại",
      "signIn": "Đăng nhập",
      "favoriteLabel": "yêu thích",
      "learnedLabel": "đã học",
      "detailButton": "Mở chi tiết"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "VocOrbit thực sự hoạt động như thế nào",
      "subtitle": "Quy trình thực tế: chọn một câu bên ngoài ứng dụng, chọn một từ, sau đó học từ đó với ngữ cảnh bên trong VocOrbit.",
      "progress": "Bước {{current}} / {{total}}",
      "progressSingle": "Bước {{current}}",
      "mock": {
        "contextLabel": "Câu ngữ cảnh",
        "selectedWordLabel": "Từ đã chọn",
        "meaningLabel": "Ý nghĩa cơ bản",
        "whyLabel": "Tại sao trong bối cảnh này"
      },
      "flowTitle": "Tìm hiểu quy trình trong 3 bước nhanh",
      "highlightsTitle": "Những gì bạn nhận được",
      "actions": {
        "previous": "trước đó",
        "next": "Bước tiếp theo",
        "enterApp": "Bắt đầu học",
        "showExample": "Show example",
        "hideExample": "Ẩn ví dụ"
      },
      "steps": {
        "step1": {
          "step": "BƯỚC 1 • Chia sẻ một câu",
          "title": "Chọn câu có từ xuất hiện",
          "body": "Nhấn và giữ văn bản trong trình duyệt, ghi chú hoặc bất kỳ ứng dụng nào và gửi nó tới Tiện ích mở rộng chia sẻ VocOrbit.",
          "source": "Khi nhìn lại, tôi lại cảm thấy ấn tượng trước sức sống mãnh liệt của văn chương.",
          "word": "văn học",
          "meaning": "tác phẩm viết, đặc biệt là những tác phẩm được coi là nghệ thuật",
          "why": "Trong câu này nó đề cập đến những cuốn sách và tác phẩm nghệ thuật viết có ảnh hưởng mạnh mẽ đến người nói.",
          "hint": "Mẹo: Luôn chia sẻ cả câu chứ không chỉ một từ duy nhất.",
          "bullets": {
            "one": "Hoạt động với trình duyệt, ghi chú và nhiều ứng dụng đọc",
            "two": "Bạn giữ nguyên ngữ cảnh câu gốc",
            "three": "Không cần luồng sao chép-dán thủ công"
          }
        },
        "step2": {
          "step": "BƯỚC 2 • Chọn từ chính xác",
          "title": "Nhấn vào một từ và hiểu ý nghĩa cơ bản ngay lập tức",
          "body": "Bên trong chế độ xem chia sẻ, các từ có thể nhấn được. Chọn một từ mục tiêu và chạy thông tin chi tiết cơ bản.",
          "source": "Không nên coi việc đọc sách đối với trẻ em như một việc vặt, một nghĩa vụ.",
          "word": "việc vặt",
          "meaning": "một công việc thường ngày, thường khó chịu",
          "why": "Ở đây 'việc vặt' nhấn mạnh rằng việc đọc không được có cảm giác như một công việc bị ép buộc.",
          "hint": "Mẹo: Nếu bạn không chắc chắn, hãy bắt đầu với cơ bản. Sau đó chạy nâng cao trong ứng dụng.",
          "bullets": {
            "one": "Ý nghĩa được tạo ra cho câu chính xác này",
            "two": "Bạn cũng thấy tại sao ý nghĩa này được chọn",
            "three": "Hỗ trợ cặp ngôn ngữ bạn đã chọn"
          }
        },
        "step3": {
          "step": "BƯỚC 3 • Lưu và sắp xếp",
          "title": "Di chuyển những từ hữu ích vào hệ thống cá nhân của bạn",
          "body": "Sau khi từ đến VocOrbit, hãy đánh dấu mục yêu thích hoặc thêm vào danh sách lặp lại để học tập tích cực.",
          "source": "Dựa vào kinh nghiệm chuyên môn của chúng tôi để thiết lập dự án của bạn thành công.",
          "word": "chuyên gia",
          "meaning": "một người có kỹ năng hoặc kiến thức đặc biệt",
          "why": "Nó mô tả trải nghiệm là có độ tin cậy cao và có kỹ năng cao trong bối cảnh dự án này.",
          "hint": "Mẹo: Giữ danh sách lặp lại tập trung. 10 từ chủ động giúp ghi nhớ tốt hơn.",
          "bullets": {
            "one": "Danh sách yêu thích cho các từ quan trọng",
            "two": "Danh sách lặp lại để ghi nhớ tích cực",
            "three": "Trạng thái đã học giúp tiến trình của bạn luôn rõ ràng"
          }
        },
        "step4": {
          "step": "BƯỚC 4 • Vòng lặp thực hành",
          "title": "Xem lại, thực hành và đánh dấu là đã học",
          "body": "Sử dụng các chế độ luyện tập và lời nhắc cho đến khi nhớ rõ, sau đó đánh dấu từ đó là đã học.",
          "source": "Bạn muốn tiếp cận về một cái gì đó khác?",
          "word": "tiếp cận",
          "meaning": "liên lạc với ai đó",
          "why": "Trong ngữ cảnh này, nó là một cụm động từ có nghĩa là giao tiếp, không phải là tiếp cận vật lý.",
          "hint": "Mẹo: Sử dụng lời nhắc và các phiên ngắn hàng ngày để có tiến bộ ổn định.",
          "bullets": {
            "one": "Thẻ luyện tập được xây dựng từ chính lời nói của bạn",
            "two": "Phân tích hàng tuần cho thấy điểm yếu",
            "three": "Các từ đã học tự động rời khỏi hàng đợi lặp lại"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "Phiên của bạn có thể đã hết hạn. Vui lòng đăng nhập lại.",
      "cannotConnect": "Không thể truy cập máy chủ. Hãy kiểm tra kết nối của bạn và thử lại.",
      "listLoadFailed": "Không thể tải danh sách từ. Vui lòng thử lại.",
      "searchLoadFailed": "Không thể tải kết quả tìm kiếm. Vui lòng thử lại.",
      "itemNotFound": "Không tìm thấy bản ghi Word.",
      "reloginRequired": "Vui lòng đăng nhập lại để tiếp tục.",
      "favoriteActionFailed": "Hành động yêu thích không thành công. Vui lòng thử lại.",
      "detailLoadFailed": "Không thể tải chi tiết từ.",
      "stateUpdateFailed": "Không thể cập nhật trạng thái. Vui lòng thử lại.",
      "analysisRequestFailed": "Không thể gửi yêu cầu phân tích.",
      "invalidModelOutput": "Định dạng phản hồi của mô hình không hợp lệ. Vui lòng thử lại.",
      "analysisTimeout": "Đã hết thời gian phân tích. Vui lòng thử lại.",
      "advancedCreditInsufficient": "Tín dụng nâng cao không đủ.",
      "basicCreditInsufficient": "Không đủ tín dụng cơ bản",
      "advancedAnalysisFailed": "Phân tích nâng cao không thể hoàn thành.",
      "basicAnalysisFailed": "Phân tích cơ bản không thể được hoàn thành.",
      "repeatProgressUpdateFailed": "Could not update repeat progress. Vui lòng thử lại.",
      "missingContext": "Thiếu bối cảnh cần thiết để phân tích.",
      "selectedWordNotInSentence": "Từ đã chọn không được tìm thấy trong câu ngữ cảnh.",
      "analysisFailedGeneric": "Phân tích không thể được hoàn thành. Vui lòng thử lại.",
      "unexpected": "Đã xảy ra lỗi không mong muốn."
    },
    "search": {
      "title": "Tìm kiếm",
      "placeholder": "Tìm kiếm theo từ, ý nghĩa hoặc giải thích",
      "loading": "Đang tải từ...",
      "emptyResult": "Không có từ nào phù hợp với truy vấn của bạn.",
      "emptyHint": "Bắt đầu gõ ở trên để tìm kiếm."
    },
    "showroom": {
      "loading": "Đang tải danh sách từ...",
      "emptyTitle": "Chưa có lời nào",
      "emptyBody": "Sau khi bạn thêm từ qua Word Insight, danh sách này sẽ tự động được điền.",
      "emptyCta": "Mở thông báo",
      "updateAvailableTitle": "Đã có phiên bản mới",
      "updateAvailableBody": "Nhấn để cập nhật và tiếp tục nhận được những cải tiến mới nhất.",
      "updateNow": "Cập nhật ngay bây giờ",
      "repeatAdded": "{{word}} đã được thêm vào danh sách lặp lại ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}} đã bị xóa khỏi danh sách lặp lại ({{count}}/{{limit}}).",
      "repeatLimitReached": "Bạn đã đạt đến giới hạn danh sách lặp lại của mình (10/10).",
      "repeatPermissionRequired": "Cần có quyền thông báo để nhắc nhở. Bật thông báo để thêm từ.",
      "favoriteAdded": "{{word}} đã thêm vào mục yêu thích.",
      "favoriteRemoved": "{{word}} đã bị xóa khỏi mục yêu thích.",
      "repeatCleared": "Đã xóa danh sách lặp lại.",
      "repeatListTitle": "Danh sách lặp lại",
      "repeatCount": "{{count}}/{{limit}} từ",
      "repeatEmpty": "Danh sách lặp lại trống. Thêm từ bằng nút chuông bên dưới.",
      "clearAll": "Xóa tất cả",
      "done": "Xong",
      "practice": "Thực hành",
      "accessibility": {
        "showDetails": "Hiển thị chi tiết",
        "favoriteWord": "Từ yêu thích",
        "repeatWordLater": "Lặp lại từ này sau",
        "openProfile": "Mở hồ sơ",
        "openRepeatList": "Mở danh sách từ lặp lại",
        "openAnnouncements": "Mở thông báo",
        "openUpdate": "Mở trang cập nhật",
        "dismissUpdate": "Loại bỏ thông báo cập nhật",
        "searchWords": "Tìm kiếm từ",
        "switchToCard": "Chuyển sang chế độ xem thẻ",
        "switchToList": "Chuyển sang chế độ xem danh sách",
        "retryShowroom": "Thử tải lại phòng trưng bày",
        "closeRepeatList": "Đóng danh sách lặp lại",
        "clearRepeatList": "Xóa danh sách lặp lại",
        "removeFromRepeat": "Xóa {{word}} khỏi danh sách lặp lại",
        "practiceWord": "Thực hành từ này",
        "addWord": "Thêm từ"
      },
      "quickAdd": {
        "eyebrow": "Thêm nhanh",
        "title": "Thêm từ theo ngữ cảnh",
        "body": "Dán một câu, chọn đúng từ và lưu lại.",
        "action": "Thêm từ",
        "actionHint": "Dán và chọn"
      }
    },
    "practiceHub": {
      "title": "Thực hành",
      "sectionLabel": "Thực hành",
      "selectAnswer": "CHỌN TRẢ LỜI",
      "modeBasic": "Cơ bản",
      "modeAdvanced": "Nâng cao",
      "loadingTitle": "Đang tải danh mục",
      "loadingMessage": "Kiểm tra loại bài tập nào có sẵn cho bạn.",
      "loadingQuestionsTitle": "Chuẩn bị các câu hỏi ôn tập...",
      "loadingQuestionsMessage": "Tạo câu hỏi dựa trên dữ liệu từ vựng có sẵn của bạn.",
      "instructions": {
        "matchSynonyms": "Chọn từ đồng nghĩa gần nhất."
      },
      "resultCta": {
        "backToPractice": "Trở lại luyện tập",
        "seeResult": "Xem kết quả",
        "nextWord": "Từ tiếp theo"
      },
      "result": {
        "correctTitle": "Đúng rồi!",
        "incorrectTitle": "Điều đó không đúng!",
        "correctAnswerLabel": "Câu trả lời đúng:",
        "usedInSentenceLabel": "Dùng trong câu:",
        "sessionResultLabel": "Kết quả phiên"
      },
      "leavePrompt": {
        "title": "Đã rời đi rồi à?",
        "keepPlaying": "Tiếp tục chơi",
        "leave": "Rời khỏi",
        "closePromptAccessibility": "Đóng lời nhắc nghỉ phép",
        "leavePracticeAccessibility": "Nghỉ tập"
      },
      "hints": {
        "availableCount": "{{count}} từ có sẵn",
        "missingSynonyms": "Dữ liệu từ đồng nghĩa không có sẵn",
        "minActiveWords": "Cần ít nhất 2 từ hoạt động"
      },
      "tiles": {
        "meaningMatch": "Ý nghĩa phù hợp",
        "fillInGap": "Điền vào khoảng trống",
        "guessWord": "Đoán từ",
        "matchSynonyms": "So khớp từ đồng nghĩa"
      },
      "accessibility": {
        "goBack": "Quay lại",
        "useMode": "Sử dụng chế độ {{mode}}",
        "closePractice": "Đóng thực hành"
      },
      "loadState": {
        "noQuestions": {
          "title": "Chưa có câu hỏi luyện tập nào",
          "message": "Bạn cần ít nhất 2 từ chủ động để bắt đầu luyện tập.",
          "actionLabel": "Thêm từ"
        },
        "unauthorized": {
          "title": "Yêu cầu đăng nhập",
          "message": "Phiên của bạn có thể đã hết hạn. Đăng nhập lại để tiếp tục.",
          "actionLabel": "Đăng nhập"
        },
        "forbidden": {
          "title": "Tính năng này hiện không khả dụng",
          "message": "Kiểm tra kế hoạch hoặc tín dụng của bạn để tiếp tục.",
          "actionLabel": "Nhận tín dụng"
        },
        "rejected": {
          "title": "Không đủ dữ liệu cho chế độ này",
          "message": "Thêm nhiều từ hơn và thử lại.",
          "actionLabel": "Thêm từ"
        },
        "server": {
          "title": "Không thể truy cập máy chủ",
          "message": "Hãy kiểm tra kết nối của bạn và thử lại.",
          "actionLabel": "Thử lại"
        },
        "generic": {
          "title": "Không thể bắt đầu luyện tập",
          "message": "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
          "actionLabel": "Thử lại"
        }
      }
    },
    "announcements": {
      "title": "Thông báo",
      "unreadCount": "{{count}} chưa đọc",
      "markAllRead": "Đánh dấu tất cả đã đọc",
      "loading": "Đang tải thông báo...",
      "empty": "Không có thông báo ngay bây giờ.",
      "openLink": "Mở liên kết",
      "openAnnouncement": "Thông báo mở: {{title}}",
      "levelInfo": "Thông tin",
      "levelWarning": "Cảnh báo",
      "levelCritical": "Quan trọng",
      "loadFailed": "Không thể tải thông báo. Vui lòng thử lại.",
      "claimFailed": "Yêu cầu phần thưởng không thành công. Vui lòng thử lại.",
      "requirementNotMet": "Yêu cầu vẫn chưa được đáp ứng. Mời bạn bè trước.",
      "referralCodeMissing": "Mã giới thiệu bị thiếu cho tài khoản này.",
      "referralProgress": "Tiến trình giới thiệu: {{current}}/{{required}}",
      "shareInvite": "Mời một người bạn",
      "referralShareMessage": "Tham gia VocOrbit.\nMở liên kết này:\n{{link}}",
      "rewardText": "Phần thưởng: +{{amount}} {{creditType}} tín dụng",
      "creditBasic": "cơ bản",
      "creditAdvanced": "nâng cao",
      "claimReward": "Yêu cầu",
      "claimingReward": "Đang yêu cầu...",
      "rewardClaimed": "Đã xác nhận quyền sở hữu"
    },
    "forceUpdate": {
      "title": "Yêu cầu cập nhật",
      "body": "Cần có phiên bản mới để tiếp tục sử dụng VocOrbit.",
      "updateNow": "Cập nhật ngay bây giờ",
      "checkAgain": "Kiểm tra lại"
    },
    "profile": {
      "title": "Hồ sơ",
      "accountDetailsTitle": "Chi tiết tài khoản",
      "accountDetailsSubtitle": "Xem thông tin email và tài khoản của bạn.",
      "settingsTitle": "Cài đặt",
      "settingsSubtitle": "Tùy chỉnh kích thước văn bản và thứ tự nút hành động.",
      "favoriteWordsTitle": "Từ yêu thích",
      "favoriteWordsSubtitle": "Xem các từ được thêm vào mục yêu thích.",
      "learnedWordsTitle": "từ đã học",
      "learnedWordsSubtitle": "Xem các từ được đánh dấu là đã học.",
      "weeklyAnalyticsTitle": "Phân tích hàng tuần",
      "weeklyAnalyticsSubtitle": "Xem hiệu suất luyện tập trong 7 ngày qua của bạn.",
      "regionTitle": "Vùng",
      "regionSubtitle": "Hiện tại: {{region}}",
      "regionNotSelected": "Không được chọn",
      "emptyFavorites": "Chưa có từ yêu thích nào.",
      "emptyLearned": "Chưa học được từ nào.",
      "loadingList": "Đang tải danh sách...",
      "logOut": "Đăng xuất",
      "accessibility": {
        "goBack": "Quay lại",
        "openAccountDetails": "Mở chi tiết tài khoản",
        "openSettings": "Mở cài đặt",
        "openFavoriteWords": "Mở từ yêu thích",
        "openLearnedWords": "Mở từ đã học",
        "openWeeklyAnalytics": "Mở phân tích hàng tuần",
        "openRegion": "Mở cài đặt vùng",
        "logOut": "Đăng xuất",
        "playPronunciation": "Chơi phát âm cho {{word}}",
        "openDetailForWord": "Mở chi tiết cho {{word}}",
        "removeWord": "Xóa {{word}}"
      }
    },
    "settings": {
      "title": "Cài đặt",
      "languagePairTitle": "Cặp ngôn ngữ",
      "languagePairSubtitle": "Thay đổi ngôn ngữ mẹ đẻ và học tập của bạn.",
      "billingCreditsTitle": "Thanh toán & tín dụng",
      "billingCreditsSubtitle": "Quản lý các khoản tín dụng ý nghĩa cơ bản và các gói IAP tại đây.",
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
      "themeModeTitle": "Chủ đề",
      "themeModeSubtitle": "Chọn sáng, tối hoặc theo cài đặt hệ thống của bạn.",
      "themeModeSystem": "Hệ thống",
      "themeModeLight": "Hạng nhẹ",
      "themeModeDark": "Tối",
      "textSizeTitle": "Kích thước văn bản",
      "textSizeSubtitle": "Điều chỉnh kích thước văn bản trong thẻ từ vựng.",
      "actionOrderTitle": "Lệnh hành động",
      "actionOrderSubtitle": "Đặt thứ tự các nút chi tiết/yêu thích/lặp lại.",
      "actionDetail": "Chi tiết",
      "actionFavorite": "yêu thích",
      "actionRepeat": "Lặp lại",
      "resetToDefaults": "Đặt lại về mặc định",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "Quay lại",
        "openLanguagePreferences": "Tùy chọn ngôn ngữ mở",
        "openBillingCredits": "Mở thanh toán và tín dụng",
        "useSystemTheme": "Sử dụng kiểu mẫu của hệ thống",
        "useLightTheme": "Chủ đề Sáng",
        "useDarkTheme": "Sử dụng kiểu mẫu tối màu",
        "decreaseTextSize": "Giảm kích thước văn bản",
        "increaseTextSize": "Tăng kích thước văn bản",
        "moveActionLeft": "Di chuyển {{action}} sang trái",
        "moveActionRight": "Di chuyển {{action}} sang phải",
        "resetSettings": "Đặt lại cài đặt từ vựng"
      }
    },
    "accountDetails": {
      "title": "Chi tiết tài khoản",
      "emailLabel": "Thư điện tử",
      "userIdLabel": "ID người dùng",
      "regionLabel": "Vùng quê hương",
      "regionEndpointLabel": "Điểm cuối khu vực",
      "appVersionLabel": "Phiên bản ứng dụng",
      "buildLabel": "Số bản dựng",
      "platformLabel": "Nền tảng",
      "osVersionLabel": "Phiên bản hệ điều hành",
      "accessibility": {
        "goBack": "Quay lại",
        "deleteAccount": "Xóa tài khoản vĩnh viễn"
      },
      "deleteAccount": {
        "sectionTitle": "Xóa tài khoản",
        "sectionBody": "Xóa vĩnh viễn tài khoản VocOrbit của bạn và dữ liệu ứng dụng được liên kết với tài khoản đó. Không thể hoàn tác hành động này.",
        "action": "Xóa tài khoản vĩnh viễn",
        "deleting": "Đang xóa tài khoản...",
        "confirmTitle": "Xóa tài khoản?",
        "confirmBody": "Thao tác này sẽ xóa vĩnh viễn tài khoản VocOrbit và dữ liệu ứng dụng được liên kết của bạn. Không thể hoàn tác hành động này.",
        "successTitle": "Đã xóa tài khoản",
        "successBody": "Tài khoản VocOrbit của bạn đã bị xóa vĩnh viễn.",
        "missingUser": "Không thể tìm thấy ID tài khoản của bạn. Vui lòng đăng nhập lại.",
        "cannotConnect": "Không thể truy cập máy chủ. Hãy kiểm tra kết nối của bạn và thử lại.",
        "sessionExpired": "Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại.",
        "failed": "Chúng tôi không thể xóa tài khoản của bạn ngay bây giờ. Vui lòng thử lại."
      }
    },
    "iap": {
      "title": "Thanh toán & Tín dụng",
      "loading": "Đang tải chi tiết thanh toán...",
      "currentSubscription": "Đăng ký hiện tại",
      "currentStatus": "Trạng thái: {{status}}",
      "currentPlan": "Gói hiện tại: {{plan}}",
      "noActivePlan": "Không có kế hoạch hoạt động",
      "refresh": "Làm mới thanh toán",
      "basicCreditsTitle": "Tín dụng hiểu biết cơ bản",
      "basicCreditsBody": "Phân tích ý nghĩa cơ bản trong màn hình chia sẻ sẽ tiêu tốn tín dụng này.",
      "plansTitle": "kế hoạch",
      "plansBody": "Chọn gói và hoàn tất thanh toán thông qua tài khoản cửa hàng của bạn.",
      "noPlans": "Không tìm thấy gói có thể mua nào cho nền tảng này.",
      "planTopup": "Nạp tiền hàng tháng: +{{basic}} cơ bản · +{{advanced}} nâng cao",
      "planCaps": "Giới hạn: {{basicCap}} cơ bản · {{advancedCap}} nâng cao",
      "priceLabel": "Giá: {{price}}",
      "buyNow": "Mua ngay",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "Đang xử lý việc mua hàng...",
      "purchaseCanceled": "Đã hủy giao dịch mua.",
      "purchaseApplied": "{{sku}} đã kích hoạt thành công.",
      "alreadyOwnedRestoring": "Mục này đã được sở hữu. Đang khôi phục giao dịch mua của bạn...",
      "restorePurchases": "Khôi phục mua hàng",
      "restoring": "Đang khôi phục giao dịch mua...",
      "restoreNoPurchases": "Không tìm thấy giao dịch mua nào để khôi phục.",
      "restoreNoApplicablePurchases": "Không thể áp dụng giao dịch mua có thể khôi phục.",
      "restoreApplied": "{{count}} giao dịch mua đã được khôi phục và xác minh.",
      "status": {
        "none": "Chưa đăng ký",
        "pending": "Đang chờ xử lý",
        "active": "Đang hoạt động",
        "expired": "Đã hết hạn",
        "canceled": "Đã hủy",
        "refunded": "Đã hoàn tiền"
      },
      "errors": {
        "unauthorized": "Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại.",
        "cannotConnect": "Không thể truy cập máy chủ. Hãy kiểm tra kết nối của bạn và thử lại.",
        "forbidden": "Không thể áp dụng giao dịch mua này cho tài khoản của bạn.",
        "generic": "Yêu cầu thanh toán không thành công. Vui lòng thử lại.",
        "purchaseFailed": "Mua hàng không thành công. Vui lòng thử lại.",
        "alreadyOwned": "Mục này đã được sở hữu trên tài khoản này.",
        "invalidReceipt": "Biên nhận của cửa hàng không thể được xác nhận.",
        "iapUnavailable": "Dịch vụ mua hàng tại cửa hàng hiện không khả dụng trên thiết bị này."
      },
      "accessibility": {
        "goBack": "Quay lại",
        "buyPlan": "Mua gói {{plan}}",
        "restorePurchases": "Khôi phục các giao dịch mua trước đó",
        "refresh": "Làm mới trạng thái thanh toán và đăng ký"
      },
      "desktop": {
        "subtitle": "Xem số dư hiện tại của bạn ở đây. Các giao dịch mua mới và thay đổi đăng ký vẫn tiếp tục trên thiết bị di động.",
        "desktopBadge": "Chế độ xem máy tính để bàn",
        "phoneOnlyBadge": "Điện thoại mua hàng",
        "balanceTitle": "Số dư hiện tại của bạn",
        "balanceBody": "Máy tính để bàn luôn hiển thị các khoản tín dụng hiện có và trạng thái đăng ký của bạn, vì vậy bạn có thể kiểm tra tài khoản của mình trước khi tiếp tục quá trình học tập của mình.",
        "basicAvailable": "Tín dụng cơ bản",
        "advancedAvailable": "Tín dụng nâng cao",
        "freeCredits": "Miễn phí",
        "paidCredits": "Trả",
        "noPlanBody": "Tài khoản này hiện không có gói thanh toán di động đang hoạt động. Bạn vẫn có thể sử dụng bất kỳ khoản tín dụng nào đã có sẵn ở đây.",
        "mobileTitle": "Tiếp tục mua hàng trên điện thoại của bạn",
        "mobileBody": "Việc mua tín dụng và thay đổi đăng ký được hoàn tất bên trong ứng dụng di động bằng tài khoản App Store hoặc Google Play của bạn.",
        "storeLabel": "Cửa hàng: {{store}}",
        "renewsOn": "Gia hạn trên {{date}}",
        "expiresOn": "Đã kết thúc vào {{date}}",
        "updatedOn": "Đồng bộ hóa lần cuối: {{date}}",
        "stepOpenPhone": "Mở VocOrbit trên điện thoại của bạn bằng cùng một tài khoản.",
        "stepOpenBilling": "Đi tới Hồ sơ > Thanh toán & Tín dụng.",
        "stepFinishPurchase": "Mua tín dụng hoặc quản lý đăng ký của bạn ở đó, sau đó quay lại đây và làm mới.",
        "mobileHint": "Số dư tín dụng của bạn cập nhật tại đây sau khi giao dịch mua trên thiết bị di động được áp dụng cho cùng một tài khoản."
      }
    },
    "weeklyAnalytics": {
      "title": "Phân tích hàng tuần",
      "modeAll": "Tất cả",
      "modeBasic": "Cơ bản",
      "modeAdvanced": "Nâng cao",
      "loading": "Đang tải phân tích hàng tuần...",
      "summaryTitle": "Tóm tắt (7 ngày)",
      "sessions": "Phiên",
      "completed": "Đã hoàn thành",
      "answered": "Đã trả lời",
      "accuracy": "Độ chính xác",
      "activeDays": "Ngày hoạt động",
      "streak": "Vệt",
      "dailyTrend": "Xu hướng hàng ngày",
      "byQuestionType": "Theo loại câu hỏi",
      "byMode": "Theo chế độ",
      "weakItems": "Vật phẩm yếu",
      "noWeakItems": "Không có từ yếu đáng chú ý nào được tìm thấy trong tuần này.",
      "weakItemMeta": "Sai: {{wrongAnswers}} · Độ chính xác: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "Ý nghĩa phù hợp",
      "questionTypeGuessWord": "Đoán từ",
      "questionTypeFillInGap": "Lấp đầy khoảng trống",
      "questionTypeMatchSynonym": "So khớp từ đồng nghĩa",
      "errors": {
        "unauthorized": "Phiên của bạn có thể đã hết hạn. Vui lòng đăng nhập lại.",
        "cannotConnect": "Không thể truy cập máy chủ. Hãy kiểm tra kết nối của bạn và thử lại.",
        "loadFailed": "Không thể tải phân tích hàng tuần. Vui lòng thử lại."
      },
      "accessibility": {
        "goBack": "Quay lại",
        "filterByMode": "Lọc theo {{mode}}",
        "retry": "Thử lại yêu cầu phân tích"
      }
    },
    "detail": {
      "closeDetails": "Đóng chi tiết từ",
      "loadingDetail": "Đang tải chi tiết từ...",
      "detailLoadFailedTitle": "Không thể tải chi tiết",
      "statusLearned": "đã học",
      "statusActive": "hoạt động",
      "markAsLearned": "Đánh dấu là đã học",
      "moveBackToActive": "Chuyển về trạng thái hoạt động",
      "buyAdvancedCredits": "Mua tín dụng nâng cao",
      "buyBasicCredits": "Mua tín dụng cơ bản",
      "buyCredits": "Mua tín dụng",
      "whyThisSense": "Tại sao lại có cảm giác này",
      "examples": "Ví dụ",
      "synonyms": "từ đồng nghĩa",
      "antonyms": "từ trái nghĩa",
      "collocations": "Collocation",
      "alternativeMeanings": "Ý nghĩa thay thế",
      "usageNotes": "ghi chú sử dụng",
      "noSynonyms": "Chưa có dữ liệu từ đồng nghĩa.",
      "stats": "Thống kê",
      "encountersAndLastMode": "Cuộc gặp gỡ: {{encounters}} | Chế độ cuối cùng: {{mode}}",
      "nextReminder": "Lời nhắc tiếp theo",
      "currentPlan": "Gói hiện tại: {{due}}",
      "reviewHint": "Quên: +10 phút, Khó: +1 giờ, Tốt: tăng từ +1 ngày.",
      "runAdvanced": "Chạy phân tích nâng cao",
      "reviewForgot": "quên",
      "reviewHard": "Cứng",
      "reviewGood": "Tốt",
      "reviewOptionAccessibility": "{{title}} đã chọn. Bài đánh giá tiếp theo trong {{delay}}.",
      "repeatUnscheduled": "Chưa lên lịch",
      "repeatNow": "bây giờ",
      "repeatAfterMinutes": "{{count}} phút",
      "repeatAfterHours": "{{count}} giờ",
      "repeatAfterDays": "{{count}} ngày",
      "repeatAfterWeeks": "{{count}} tuần",
      "repeatInMinutes": "trong {{count}} phút",
      "repeatInHours": "trong {{count}} giờ",
      "repeatInDays": "trong {{count}} ngày",
      "repeatInWeeks": "trong {{count}} tuần",
      "repeatNotificationTitle": "Thời gian xem xét: {{word}}",
      "repeatNotificationBody": "Xem lại từ {{word}}.",
      "reportIssue": "Báo sai ý nghĩa",
      "reportIssueAccessibility": "Báo cáo sai ý nghĩa của {{word}}",
      "deleteWord": "Xóa từ",
      "deleteWordAccessibility": "Xóa mềm {{word}}",
      "deleteConfirmTitle": "Xóa từ này?",
      "deleteConfirmBody": "\"{{word}}\" sẽ bị xóa khỏi danh sách của bạn. Bạn có thể thêm lại nó sau.",
      "deleteConfirmCancel": "Hủy bỏ",
      "deleteConfirmAction": "Có, xóa"
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
      "title": "Ý nghĩa báo cáo",
      "subtitle": "Nếu \"{{word}}\" có vẻ sai trong ngữ cảnh này, hãy cho chúng tôi biết điều gì sai.",
      "messageLabel": "Điều gì có vẻ sai?",
      "messagePlaceholder": "Ví dụ: Ý nghĩa này không phù hợp với câu. Nó nên mô tả thông tin liên lạc, không phải vị trí.",
      "charactersLeft": "{{count}} ký tự còn lại",
      "submit": "Gửi báo cáo",
      "successTitle": "Đã gửi báo cáo",
      "successBody": "Cảm ơn bạn đã phản hồi. Chúng tôi sẽ xem xét mục này.",
      "backToDetail": "Quay lại chi tiết từ",
      "errors": {
        "unauthorized": "Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại.",
        "cannotConnect": "Không thể truy cập máy chủ. Hãy kiểm tra kết nối của bạn và thử lại.",
        "itemNotFound": "Không thể tìm thấy mục từ.",
        "submitFailed": "Không thể gửi báo cáo. Vui lòng thử lại."
      },
      "accessibility": {
        "goBack": "Quay lại",
        "submit": "Gửi báo cáo vấn đề",
        "backToDetail": "Quay lại chi tiết từ"
      }
    },
    "capture": {
      "backButton": "Thư viện",
      "headerTitle": "Thêm từ",
      "headerBody": "Dán một câu và chọn từ bạn muốn lưu.",
      "seedWordLabel": "Đang tìm kiếm: {{word}}",
      "pasteHero": {
        "title": "Dán văn bản đã sao chép",
        "body": "Sao chép một câu hoặc đoạn văn, sau đó dán nó để mở bộ chọn.",
        "bodyWithWord": "Sao chép một câu bao gồm \"{{word}}\", sau đó dán câu đó để mở bộ chọn.",
        "hint": "Bộ chọn sẽ tự động mở sau khi dán."
      },
      "picker": {
        "title": "Chọn từ trong văn bản",
        "body": "Nhấp vào từ chính xác bên dưới. Dán lại nếu bạn sao chép một câu khác.",
        "badge": "Bộ chọn từ",
        "hint": "VocOrbit tự động tạo thẻ từ từ tra cứu này."
      },
      "status": {
        "pasteFirst": "Dán văn bản đã sao chép để bắt đầu.",
        "selectedWord": "Từ đã chọn: {{word}}",
        "seedWordMissing": "Dán một câu có \"{{word}}\" hoặc chọn một từ khác bên dưới.",
        "selectWord": "Nhấp vào từ chính xác bên dưới để tiếp tục."
      },
      "actions": {
        "pasteCopiedText": "Dán văn bản đã sao chép",
        "pasteAgain": "Dán lại",
        "clear": "Thông thoáng",
        "readingClipboard": "Đang đọc bảng nhớ tạm...",
        "reading": "Đọc...",
        "analyzeAndSave": "Phân tích và lưu",
        "loadingMeaning": "Tìm hiểu ý nghĩa cơ bản...",
        "openSavedWord": "Mở từ đã lưu",
        "backToLibrary": "Quay lại thư viện",
        "pickAnotherWord": "Chọn một từ khác"
      },
      "loading": {
        "title": "Chạy thông tin chi tiết cơ bản",
        "body": "VocOrbit đang khớp từ đã chọn với câu này."
      },
      "result": {
        "title": "Ý nghĩa cơ bản",
        "savedFallback": "Đã lưu vào thư viện của bạn.",
        "contextMeaning": "Ý nghĩa ngữ cảnh",
        "whyThisMeaning": "Tại sao ý nghĩa này"
      },
      "problems": {
        "clipboardUnavailableTitle": "Không có bảng nhớ tạm",
        "clipboardUnavailableBody": "Quyền truy cập vào bảng nhớ tạm bị chặn trong ngữ cảnh trình duyệt này. Dán câu bằng tay.",
        "contextRequiredTitle": "Yêu cầu ngữ cảnh",
        "contextRequiredBody": "Dán một câu hoặc đoạn văn ngắn trước khi chọn một từ.",
        "selectWordTitle": "Chọn một từ trong văn bản",
        "selectWordBody": "Nhấp vào từ chính xác bên trong khối văn bản trước khi chạy tra cứu.",
        "signInRequiredTitle": "Yêu cầu đăng nhập",
        "signInRequiredBody": "Phiên của bạn đã hết hạn. Mở lại VocOrbit và đăng nhập trước khi thử lại thao tác tra cứu này.",
        "basicCreditsRequiredTitle": "Yêu cầu tín dụng cơ bản",
        "basicCreditsRequiredBody": "Tài khoản của bạn không thể chạy tra cứu cơ bản ngay bây giờ.",
        "requestTimedOutTitle": "Yêu cầu đã hết thời gian",
        "requestTimedOutBody": "Việc tra cứu mất quá nhiều thời gian. Hãy thử lại với câu tương tự.",
        "connectionProblemTitle": "Sự cố kết nối",
        "connectionProblemBody": "VocOrbit không thể truy cập máy chủ. Kiểm tra kết nối của bạn và thử lại.",
        "lookupFailedTitle": "Tra cứu không thành công",
        "lookupFailedBody": "VocOrbit không thể hoàn thành yêu cầu thông tin chi tiết này.",
        "lookupIncompleteTitle": "Tra cứu chưa hoàn tất",
        "lookupIncompleteBody": "VocOrbit trả về phản hồi không mong muốn. Hãy thử lại một lần nữa."
      }
    }
  }
}

export default vi
