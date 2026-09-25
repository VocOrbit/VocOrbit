import { Translations } from "./en"

const tr: Translations = {
  "common": {
    "ok": "Tamam!",
    "cancel": "İptal",
    "back": "Geri",
    "logOut": "Oturumu Kapat@"
  },
  "welcomeScreen": {
    "postscript": "psst — Uygulamanız muhtemelen bu gibi görünmüyor. (Tasarımcınız size bu ekranları vermediyse, bu durumda gönderin!)",
    "readyForLaunch": "Uygulamanız, lansmana neredeyse hazır!@",
    "exciting": "(ohh, bu çok heyecan verici!)",
    "letsGo": "Haydi başlayalım go!"
  },
  "errorScreen": {
    "title": "Bir şeyler ters gitti!",
    "friendlySubtitle": "Bu, üretimde bir hata oluştuğunda kullanıcılarınızın göreceği ekrandır. Bu mesajı (`app/i18n/en.ts` konumunda) ve muhtemelen düzeni de (`app/screens/ErrorScreen`) özelleştirmek isteyeceksiniz. Bunu tamamen kaldırmak istiyorsanız, <ErrorBoundary> bileşeni için `app/app.tsx` öğesini kontrol edin.",
    "reset": "RESET APP@",
    "traceTitle": "%{name}yığından hata"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "Çok boş... çok üzücü",
      "content": "Henüz veri bulunamadı. Uygulamayı yenilemek veya yeniden yüklemek için düğmeyi tıklamayı deneyin.",
      "button": "Bunu tekrar deneyelim@"
    }
  },
  "errors": {
    "invalidEmail": "Geçersiz e-posta adresi."
  },
  "loginScreen": {
    "logIn": "Giriş yap",
    "subtitle": "Kelime ilerlemeni kullanmak için sosyal hesabınla devam et.",
    "continueWith": "SOSYAL GİRİŞ",
    "regionTitle": "Bölge",
    "regionSubtitle": "Mevcut: {{region}}",
    "regionNotSelected": "Seçilmedi",
    "changeRegion": "Değiştir",
    "signingIn": "Giriş yapılıyor...",
    "googleButton": "Google ile devam et",
    "appleButton": "Apple ile devam et",
    "moreProvidersSoon": "Diğer sağlayıcılar yakında eklenecek.",
    "accessibility": {
      "openRegionSelection": "Bölge seçimini aç"
    },
    "errors": {
      "unauthorized": "Kimlik doğrulama başarısız. Lütfen tekrar giriş yap.",
      "cannotConnect": "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.",
      "server": "Sunucu doğrulama hatası oluştu. Lütfen biraz sonra tekrar deneyin.",
      "rejected": "Giriş isteği reddedildi. Kimlik ayarlarını kontrol edin.",
      "badData": "Sunucudan beklenmeyen yanıt alındı.",
      "generic": "Giriş tamamlanamadı. Lütfen tekrar deneyin.",
      "googleCancelled": "Google girişi iptal edildi.",
      "googleUnavailable": "Google girişi bu cihazda kullanılamıyor.",
      "googleFailed": "Google girişi başarısız oldu. Lütfen tekrar deneyin."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "Dil tercihini seç",
    "titleSettings": "Dil tercihleri",
    "subtitleOnboarding": "Ana dilini ve öğrenmek istediğin dili bayrak ve ülke bilgileriyle seç.",
    "subtitleSettings": "Ana dilini ve öğrenmek istediğin dili buradan bayrak ve ülke bilgisiyle güncelle.",
    "currentPair": "Mevcut çift",
    "availableOptionsCount": "{{count}} dil/ülke seçeneği mevcut",
    "nativeLanguageTitle": "Ana dil",
    "nativeLanguageBody": "Çeviri ve açıklamalar bu dilde gösterilir.",
    "learningLanguageTitle": "Öğrenilecek dil",
    "learningLanguageBody": "Tanımlar ve bağlam bu dilde üretilir.",
    "selectedLabel": "Seçili",
    "pickerTitleL1": "Ana dili seç",
    "pickerTitleL2": "Öğrenilecek dili seç",
    "searchPlaceholder": "Dil veya ülke ara",
    "noResults": "Sonuç bulunamadı.",
    "saving": "Kaydediliyor...",
    "continue": "Devam et",
    "save": "Kaydet",
    "accessibility": {
      "goBack": "Geri dön",
      "selectNativeLanguage": "Ana dili seç",
      "selectLearningLanguage": "Öğrenilecek dili seç",
      "continueWithSelectedLanguages": "Seçili dillerle devam et",
      "saveLanguages": "Dilleri kaydet",
      "closeLanguagePicker": "Dil seçiciyi kapat",
      "closePicker": "Seçiciyi kapat",
      "selectLanguageItem": "{{language}} {{country}} dilini seç"
    },
    "errors": {
      "cannotConnect": "Sunucuya bağlanılamadı. Lütfen tekrar dene.",
      "unauthorized": "Oturum geçersiz. Lütfen tekrar giriş yap.",
      "validation": "Dil tercihleri kaydedilemedi. Girdilerini kontrol et.",
      "server": "Sunucu hatası oluştu. Lütfen biraz sonra tekrar dene.",
      "saveFailed": "Dil tercihleri kaydedilemedi. Lütfen tekrar dene.",
      "noSession": "Aktif oturum bulunamadı. Lütfen tekrar giriş yap.",
      "selectTwoLanguages": "Lütfen iki dili de seç.",
      "sameLanguagePair": "Ana dil ve öğrenilecek dil aynı olamaz."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "Tekrar dene",
      "signIn": "Giriş yap",
      "favoriteLabel": "Favori",
      "learnedLabel": "Öğrenildi",
      "detailButton": "Detayı aç"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "VocOrbit tam olarak nasıl çalışır",
      "subtitle": "Gerçek akış: uygulama dışında cümleyi seç, kelimeyi işaretle, sonra VocOrbit içinde bağlamla öğren.",
      "progress": "Adım {{current}} / {{total}}",
      "progressSingle": "Adım {{current}}",
      "mock": {
        "contextLabel": "Bağlam cümlesi",
        "selectedWordLabel": "Seçilen kelime",
        "meaningLabel": "Temel anlam",
        "whyLabel": "Neden bu anlam"
      },
      "flowTitle": "Akışı 3 hızlı adımda öğren",
      "highlightsTitle": "Kazanımın",
      "actions": {
        "previous": "Geri",
        "next": "Sonraki adım",
        "enterApp": "Öğrenmeye başla",
        "showExample": "Gerçek örneği göster",
        "hideExample": "Örneği gizle"
      },
      "steps": {
        "step1": {
          "step": "ADIM 1 • Cümleyi paylaş",
          "title": "Kelimenin geçtiği cümleyi seç",
          "body": "Tarayıcı, notlar veya başka uygulamada metne basılı tut ve VocOrbit Share Extension'a gönder.",
          "source": "Geriye dönüp baktığımda, Edebiyatın hayat veren gücünden bir kez daha etkilendim.",
          "word": "edebiyat",
          "meaning": "edebiyat, yazılı sanatsal eserler",
          "why": "Bu cümlede konuşan kişiyi etkileyen yazılı sanat birikimini anlatır.",
          "hint": "İpucu: Sadece kelime değil, tam cümle paylaş.",
          "bullets": {
            "one": "Tarayıcı, notlar ve birçok okuma uygulamasında çalışır",
            "two": "Orijinal bağlam korunur",
            "three": "Elle kopyala-yapıştır ihtiyacını azaltır"
          }
        },
        "step2": {
          "step": "ADIM 2 • Tam kelimeyi seç",
          "title": "Kelimeye dokun, anında temel anlamı al",
          "body": "Share ekranında kelimeler tıklanır. Hedef kelimeyi seç ve basic insight çalıştır.",
          "source": "Okuma çocuklara bir angarya, bir görev olarak sunulmamalı.",
          "word": "iş",
          "meaning": "angarya, zorlayıcı rutin iş",
          "why": "Burada okumayı zorunlu ve sıkıcı bir görev gibi göstermemek gerektiğini vurgular.",
          "hint": "İpucu: Emin değilsen basic ile başla, sonra app içinde advanced çalıştır.",
          "bullets": {
            "one": "Anlam bu cümleye göre üretilir",
            "two": "Neden bu sense seçildiğini de görürsün",
            "three": "Seçili dil çiftine göre sonuç gelir"
          }
        },
        "step3": {
          "step": "ADIM 3 • Kaydet ve düzenle",
          "title": "Önemli kelimeleri kendi sistemine al",
          "body": "Kelime VocOrbit'e geldikten sonra favorile veya repeat listesine ekleyip aktif öğren.",
          "source": "Projenizi başarıya hazırlamak için uzman deneyimimizden yararlanın.",
          "word": "bilirkişi",
          "meaning": "uzman, yüksek bilgi ve beceri sahibi kişi",
          "why": "Bu bağlamda deneyimin güvenilir ve uzman seviyede olduğunu anlatır.",
          "hint": "İpucu: Repeat listeni odaklı tut. 10 aktif kelime daha verimli olur.",
          "bullets": {
            "one": "Favori listesi önemli kelimeleri tutar",
            "two": "Repeat listesi aktif ezber akışına girer",
            "three": "Learned işareti ilerlemeyi temiz tutar"
          }
        },
        "step4": {
          "step": "ADIM 4 • Pratik döngüsü",
          "title": "Tekrar et, pratik yap, learned olarak tamamla",
          "body": "Pratik modları ve hatırlatmalarla tekrar et, güçlendiğinde kelimeyi learned yap.",
          "source": "Başka bir konuda bize ulaşmak ister misiniz?@",
          "word": "bize ulaşın",
          "meaning": "iletişime geçmek",
          "why": "Burada fiziksel ulaşmaktan değil, biriyle iletişim kurmaktan bahseder.",
          "hint": "İpucu: Kısa ama düzenli günlük tekrar kalıcılığı artırır.",
          "bullets": {
            "one": "Pratik kartları senin seçimlerinden oluşur",
            "two": "Weekly analytics zayıf noktanı gösterir",
            "three": "Learned olan kelime repeat kuyruundan otomatik çıkar"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "Oturumunuzun süresi dolmuş olabilir. Lütfen tekrar oturum açın.",
      "cannotConnect": "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.",
      "listLoadFailed": "Kelime listesi yüklenemedi. Lütfen tekrar deneyin.",
      "searchLoadFailed": "Arama sonuçları yüklenemedi. Lütfen tekrar deneyin.",
      "itemNotFound": "Word kaydı bulunamadı.",
      "reloginRequired": "Devam etmek için lütfen tekrar oturum açın.",
      "favoriteActionFailed": "Favori ekleme işlemi başarısız oldu. Lütfen tekrar deneyin.",
      "detailLoadFailed": "Kelime ayrıntısı yüklenemedi.",
      "stateUpdateFailed": "Durum güncellenemedi. Lütfen tekrar deneyin.",
      "analysisRequestFailed": "Analiz isteği gönderilemedi.",
      "invalidModelOutput": "Model yanıt biçimi geçersizdi. Lütfen tekrar deneyin.",
      "analysisTimeout": "Analiz zaman aşımına uğradı. Lütfen tekrar deneyin.",
      "advancedCreditInsufficient": "Yetersiz gelişmiş kredi.",
      "basicCreditInsufficient": "Yetersiz temel kredi.",
      "advancedAnalysisFailed": "Gelişmiş analiz tamamlanamadı.",
      "basicAnalysisFailed": "Temel analiz tamamlanamadı.",
      "repeatProgressUpdateFailed": "Tekrar ilerlemesi güncellenemedi. Lütfen tekrar deneyin.",
      "missingContext": "Analiz için gerekli içerik eksik.",
      "selectedWordNotInSentence": "Seçilen kelime bağlam cümlesinde bulunamadı.",
      "analysisFailedGeneric": "Analiz tamamlanamadı. Lütfen tekrar deneyin.",
      "unexpected": "Beklenmeyen bir hata oluştu."
    },
    "search": {
      "title": "Ara",
      "placeholder": "Kelime, anlam veya açıklamaya göre ara",
      "loading": "Kelimeler yükleniyor...",
      "emptyResult": "Aramana uyan kelime bulunamadı.",
      "emptyHint": "Aramak için yukarıda yazmaya başla."
    },
    "capture": {
      "backButton": "Kütüphane",
      "headerTitle": "Kelime ekle",
      "headerBody": "Bir cümle yapıştır, sonra kaydetmek istediğin kelimeyi seç.",
      "seedWordLabel": "Aranan kelime: {{word}}",
      "pasteHero": {
        "title": "Kopyalanan metni yapıştır",
        "body": "Bir cümle veya paragraf kopyala, sonra seçiciyi açmak için yapıştır.",
        "bodyWithWord": "\"{{word}}\" geçen bir cümle kopyala, sonra seçiciyi açmak için yapıştır.",
        "hint": "Metin yapıştığında seçici otomatik açılır."
      },
      "picker": {
        "title": "Metindeki kelimeyi seç",
        "body": "Aşağıdan tam kelimeye tıkla. Farklı bir cümle kopyaladıysan yeniden yapıştır.",
        "badge": "Kelime seçici",
        "hint": "VocOrbit bu analizden kelime kartını otomatik oluşturur."
      },
      "status": {
        "pasteFirst": "Başlamak için kopyaladığın metni yapıştır.",
        "selectedWord": "Seçilen kelime: {{word}}",
        "seedWordMissing": "\"{{word}}\" geçen bir cümle yapıştır ya da aşağıdan başka bir kelime seç.",
        "selectWord": "Devam etmek için aşağıdan tam kelimeyi seç."
      },
      "actions": {
        "pasteCopiedText": "Kopyalanan metni yapıştır",
        "pasteAgain": "Yeniden yapıştır",
        "clear": "Temizle",
        "readingClipboard": "Pano okunuyor...",
        "reading": "Okunuyor...",
        "analyzeAndSave": "Analiz et ve kaydet",
        "loadingMeaning": "Temel anlam alınıyor...",
        "openSavedWord": "Kaydedilen kelimeyi aç",
        "backToLibrary": "Kütüphaneye dön",
        "pickAnotherWord": "Başka bir kelime seç"
      },
      "loading": {
        "title": "Temel analiz çalışıyor",
        "body": "VocOrbit seçtiğin kelimeyi bu cümleye göre eşleştiriyor."
      },
      "result": {
        "title": "Temel anlam",
        "savedFallback": "Kütüphanene kaydedildi.",
        "contextMeaning": "Bağlamdaki anlam",
        "whyThisMeaning": "Neden bu anlam"
      },
      "problems": {
        "clipboardUnavailableTitle": "Pano kullanılamıyor",
        "clipboardUnavailableBody": "Bu tarayıcı bağlamında pano erişimi engellenmiş. Cümleyi manuel olarak yapıştır.",
        "contextRequiredTitle": "Bağlam gerekli",
        "contextRequiredBody": "Kelimeyi seçmeden önce bir cümle veya kısa paragraf yapıştır.",
        "selectWordTitle": "Metinden bir kelime seç",
        "selectWordBody": "Analizi çalıştırmadan önce metin bloğundaki tam kelimeye tıkla.",
        "signInRequiredTitle": "Giriş gerekli",
        "signInRequiredBody": "Oturumun süresi doldu. Bu analizi tekrar denemeden önce VocOrbit'te yeniden giriş yap.",
        "basicCreditsRequiredTitle": "Temel kredi gerekli",
        "basicCreditsRequiredBody": "Hesabın şu anda temel analiz çalıştıramıyor.",
        "requestTimedOutTitle": "İstek zaman aşımına uğradı",
        "requestTimedOutBody": "Analiz çok uzun sürdü. Aynı cümleyle tekrar dene.",
        "connectionProblemTitle": "Bağlantı sorunu",
        "connectionProblemBody": "VocOrbit sunucuya ulaşamadı. Bağlantını kontrol edip tekrar dene.",
        "lookupFailedTitle": "Analiz tamamlanamadı",
        "lookupFailedBody": "VocOrbit bu insight isteğini tamamlayamadı.",
        "lookupIncompleteTitle": "Analiz eksik döndü",
        "lookupIncompleteBody": "VocOrbit beklenmeyen bir yanıt verdi. Bir kez daha dene."
      }
    },
    "showroom": {
      "loading": "Kelime listesi yükleniyor...",
      "emptyTitle": "Henüz eklediğin kelime yok",
      "emptyBody": "İlk kelimeni eklediğinde bu alan otomatik olarak dolacak. Nasıl kullanacağını öğrenmek için duyurular sayfasına göz at.",
      "emptyCta": "Nasıl kullanılır?",
      "updateAvailableTitle": "Yeni sürüm mevcut",
      "updateAvailableBody": "Güncellemek ve en son iyileştirmeleri almaya devam etmek için dokunun.",
      "updateNow": "Güncelleme şimdi",
      "repeatAdded": "{{word}} tekrar listesine eklendi ({{count}}/{{limit}}).@",
      "repeatRemoved": "{{word}} tekrar listesinden kaldırıldı ({{count}}/{{limit}}).",
      "repeatLimitReached": "Tekrar listesi sınırınıza ulaştınız (10/10).@",
      "repeatPermissionRequired": "Hatırlatma için bildirim izni gerekli. Kelime eklemek için bildirimleri aç.",
      "favoriteAdded": "{{word}} eklendi favoriler.",
      "favoriteRemoved": "{{word}} favorilerden kaldırıldı.",
      "repeatCleared": "Tekrar listesi temizlendi.@",
      "repeatListTitle": "Tekrar listesi",
      "repeatCount": "{{count}}/{{limit}} kelime",
      "repeatEmpty": "Tekrar listesi boş. Aşağıdaki zil butonuyla kelime ekle.",
      "clearAll": "Tümünü temizle",
      "done": "Tamam",
      "practice": "Pratik",
      "accessibility": {
        "showDetails": "Ayrıntıları göster",
        "favoriteWord": "Favori word",
        "repeatWordLater": "Bu kelimeyi daha sonra tekrarla",
        "openProfile": "Profili aç",
        "openRepeatList": "Tekrarlanan kelime listesini aç",
        "openAnnouncements": "Duyuruları aç",
        "openUpdate": "Güncelleme sayfasını aç",
        "dismissUpdate": "Güncelleme bildirimini kapat",
        "searchWords": "Kelimeleri ara",
        "switchToCard": "Kart görünümüne geç",
        "switchToList": "Listeye geç view",
        "retryShowroom": "Showroom'u tekrar yüklemeyi deneyin",
        "closeRepeatList": "Tekrar listesini kapat",
        "clearRepeatList": "Tekrar listesini temizle",
        "removeFromRepeat": "Tekrardan {{word}} kaldır list",
        "practiceWord": "Bu kelimeyi uygulayın",
        "addWord": "Kelime ekle"
      },
      "quickAdd": {
        "eyebrow": "Hızlı Ekle",
        "title": "Bağlamdan kelime ekle",
        "body": "Bir cümle yapıştır, doğru kelimeyi seç ve kaydet.",
        "action": "Kelime Ekle",
        "actionHint": "Yapıştır ve seç"
      }
    },
    "practiceHub": {
      "title": "Pratik",
      "sectionLabel": "PRATİK",
      "selectAnswer": "CEVABI SEÇ",
      "modeBasic": "Temel",
      "modeAdvanced": "Gelişmiş",
      "loadingTitle": "Katalog yükleniyor",
      "loadingMessage": "Sana uygun egzersiz tipleri backend tarafından kontrol ediliyor.",
      "loadingQuestionsTitle": "Pratik soruları hazırlanıyor...",
      "loadingQuestionsMessage": "Backend verilerine göre sana uygun sorular oluşturuluyor.",
      "instructions": {
        "matchSynonyms": "En yakın eş anlamı seç."
      },
      "resultCta": {
        "backToPractice": "Pratiğe dön",
        "seeResult": "Sonucu gör",
        "nextWord": "Sonraki kelime"
      },
      "result": {
        "correctTitle": "Doğru cevap!",
        "incorrectTitle": "Yanlış cevap!",
        "correctAnswerLabel": "Doğru cevap:",
        "usedInSentenceLabel": "Cümlede kullanım:",
        "sessionResultLabel": "Oturum sonucu"
      },
      "leavePrompt": {
        "title": "Çıkmak istiyor musun?",
        "keepPlaying": "Devam et",
        "leave": "Çık",
        "closePromptAccessibility": "Çıkış uyarısını kapat",
        "leavePracticeAccessibility": "Pratikten çık"
      },
      "hints": {
        "availableCount": "{{count}} kelime uygun",
        "missingSynonyms": "Eş anlam verisi eksik",
        "minActiveWords": "En az 2 aktif kelime gerekli"
      },
      "tiles": {
        "meaningMatch": "Anlam eşleştirme",
        "fillInGap": "Boşluğu doldur",
        "guessWord": "Kelimeyi tahmin et",
        "matchSynonyms": "Eş anlamlıları eşleştir"
      },
      "accessibility": {
        "goBack": "Geri dön",
        "useMode": "{{mode}} modunu kullan",
        "closePractice": "Pratiği kapat"
      },
      "loadState": {
        "noQuestions": {
          "title": "Henüz pratik sorusu yok",
          "message": "Pratik başlatmak için en az 2 aktif kelimeye ihtiyacın var.",
          "actionLabel": "Kelime ekle"
        },
        "unauthorized": {
          "title": "Giriş gerekli",
          "message": "Oturum süresi dolmuş olabilir. Devam etmek için tekrar giriş yap.",
          "actionLabel": "Giriş yap"
        },
        "forbidden": {
          "title": "Bu özellik şu an kapalı",
          "message": "Devam etmek için planını veya kredilerini kontrol et.",
          "actionLabel": "Kredi al"
        },
        "rejected": {
          "title": "Bu mod için veri yetersiz",
          "message": "Yeni kelimeler ekledikten sonra tekrar dene.",
          "actionLabel": "Kelime ekle"
        },
        "server": {
          "title": "Sunucuya ulaşılamadı",
          "message": "Bağlantıyı kontrol edip tekrar dene.",
          "actionLabel": "Yeniden dene"
        },
        "generic": {
          "title": "Pratik başlatılamadı",
          "message": "Beklenmeyen bir hata oluştu. Lütfen tekrar dene.",
          "actionLabel": "Yeniden dene"
        }
      }
    },
    "announcements": {
      "title": "Duyurular",
      "unreadCount": "{{count}} okunmamış",
      "markAllRead": "Hepsini okundu işaretle",
      "loading": "Duyurular yükleniyor...",
      "empty": "Şu anda duyuru yok.",
      "openLink": "Bağlantıyı aç",
      "openAnnouncement": "Duyuruyu aç: {{title}}",
      "levelInfo": "Bilgi",
      "levelWarning": "Uyarı",
      "levelCritical": "Kritik",
      "loadFailed": "Duyurular yüklenemedi. Lütfen tekrar dene.",
      "claimFailed": "Ödül talebi başarısız oldu. Lütfen tekrar deneyin.",
      "requirementNotMet": "Gereksinim henüz karşılanmadı. Önce arkadaşlarınızı davet edin.",
      "referralCodeMissing": "Bu hesap için tavsiye kodu eksik.",
      "referralProgress": "Yönlendirme ilerlemesi: {{current}}/{{required}}",
      "shareInvite": "Davet et arkadaşım",
      "referralShareMessage": "VocOrbit'e katılın.\nBu bağlantıyı açın:\n{{link}}",
      "rewardText": "Ödül: +{{amount}} {{creditType}} kredi",
      "creditBasic": "Temel",
      "creditAdvanced": "gelişmiş",
      "claimReward": "Talep",
      "claimingReward": "Hak talebinde bulunuluyor...",
      "rewardClaimed": "Alındı"
    },
    "forceUpdate": {
      "title": "Güncelleme gerekli",
      "body": "VocOrbit'i kullanmaya devam etmek için yeni bir sürüm gerekiyor.",
      "updateNow": "Güncelleme şimdi",
      "checkAgain": "Check tekrar"
    },
    "profile": {
      "title": "Profil",
      "accountDetailsTitle": "Hesap Detayları",
      "accountDetailsSubtitle": "E-posta ve hesap bilgilerini görüntüle.",
      "settingsTitle": "Ayarlar",
      "settingsSubtitle": "Yazı boyutu ve aksiyon butonu sırasını özelleştir.",
      "favoriteWordsTitle": "Favori Kelimeler",
      "favoriteWordsSubtitle": "Favorilere eklenen kelimeleri görüntüle.",
      "learnedWordsTitle": "Öğrenilen Kelimeler",
      "learnedWordsSubtitle": "Öğrenildi olarak işaretlenen kelimeleri görüntüle.",
      "weeklyAnalyticsTitle": "Haftalık Analiz",
      "weeklyAnalyticsSubtitle": "Son 7 günlük pratik performansını görüntüle.",
      "regionTitle": "Bölge",
      "regionSubtitle": "Mevcut: {{region}}",
      "regionNotSelected": "Seçilmedi",
      "emptyFavorites": "Henüz favori kelime yok.",
      "emptyLearned": "Henüz öğrenilen kelime yok.",
      "loadingList": "Liste yükleniyor...",
      "logOut": "Çıkış yap",
      "accessibility": {
        "goBack": "Geri dön",
        "openAccountDetails": "Hesap detaylarını aç",
        "openSettings": "Ayarları aç",
        "openFavoriteWords": "Favori kelimeleri aç",
        "openLearnedWords": "Öğrenilen kelimeleri aç",
        "openWeeklyAnalytics": "Haftalık analizi aç",
        "openRegion": "Bölge ayarlarını aç",
        "logOut": "Çıkış yap",
        "playPronunciation": "{{word}}@",
        "openDetailForWord": " için telaffuzu oynat {{word}}",
        "removeWord": "Kaldır {{word}}"
      }
    },
    "settings": {
      "title": "Ayarlar",
      "languagePairTitle": "Dil çifti",
      "languagePairSubtitle": "Ana dilini ve öğrenme dilini değiştir.",
      "billingCreditsTitle": "Faturalandırma ve krediler",
      "billingCreditsSubtitle": "Temel anlam kredilerini ve uygulama içi satın alma paketlerini buradan yönet.",
      "quickLookupShortcutTitle": "Hızlı anlam kısayolu",
      "quickLookupShortcutSubtitle": "Yüzen hızlı anlam penceresini açan genel kısayolu değiştir.",
      "quickLookupShortcutLoading": "Kısayol yükleniyor...",
      "quickLookupShortcutChange": "Kısayolu değiştir",
      "quickLookupShortcutReset": "Varsayılana dön",
      "quickLookupShortcutListening": "Kısayol dinleniyor...",
      "quickLookupShortcutListeningHint": "Şimdi yeni tuş kombinasyonuna bas. İptal etmek için Esc'e bas.",
      "quickLookupShortcutSaving": "Kısayol kaydediliyor...",
      "quickLookupShortcutUpdated": "Mevcut kısayol: {{shortcut}}",
      "quickLookupShortcutInvalid": "Cmd/Ctrl veya Alt ile birlikte başka bir tuş kullan.",
      "quickLookupShortcutSaveFailed": "VocOrbit şu anda kısayolu güncelleyemedi.",
      "themeModeTitle": "Tema",
      "themeModeSubtitle": "Açık, koyu veya sistem temasını seç.",
      "themeModeSystem": "Sistem",
      "themeModeLight": "Açık",
      "themeModeDark": "Koyu",
      "textSizeTitle": "Yazı boyutu",
      "textSizeSubtitle": "Kelime kartlarında yazı boyutunu ayarla.",
      "actionOrderTitle": "Aksiyon sırası",
      "actionOrderSubtitle": "Detay/favori/tekrar butonlarının sırasını ayarla.",
      "actionDetail": "Detay",
      "actionFavorite": "Favori",
      "actionRepeat": "Tekrar",
      "resetToDefaults": "Varsayılanlara sıfırla",
      "accessibility": {
        "goBack": "Geri dön",
        "openLanguagePreferences": "Dil tercihlerini aç",
        "openBillingCredits": "Faturalandırma ve kredileri aç",
        "changeQuickLookupShortcut": "Hızlı anlam kısayolunu değiştir",
        "resetQuickLookupShortcut": "Hızlı anlam kısayolunu sıfırla",
        "useSystemTheme": "Sistem temasını kullan",
        "useLightTheme": "Açık temayı kullan",
        "useDarkTheme": "Koyu temayı kullan",
        "decreaseTextSize": "Yazı boyutunu azalt",
        "increaseTextSize": "Yazı boyutunu artır",
        "moveActionLeft": "{{action}} aksiyonunu sola taşı",
        "moveActionRight": "{{action}} aksiyonunu sağa taşı",
        "resetSettings": "Kelime ayarlarını sıfırla"
      }
    },
    "accountDetails": {
      "title": "Hesap Detayları",
      "emailLabel": "E-posta",
      "userIdLabel": "Kullanıcı ID",
      "regionLabel": "Ana bölge",
      "regionEndpointLabel": "Bölge endpoint",
      "appVersionLabel": "Uygulama sürümü",
      "buildLabel": "Build numarası",
      "platformLabel": "Platform",
      "osVersionLabel": "OS sürümü",
      "accessibility": {
        "goBack": "Geri dön",
        "deleteAccount": "Hesabı kalıcı olarak sil"
      },
      "deleteAccount": {
        "sectionTitle": "Hesabı sil",
        "sectionBody": "VocOrbit hesabınızı ve ona bağlı uygulama verilerini kalıcı olarak silin. Bu eylem geri alınamaz.",
        "action": "Hesabı kalıcı olarak sil",
        "deleting": "Hesap siliniyor...",
        "confirmTitle": "Hesap silinsin mi?",
        "confirmBody": "Bu, VocOrbit hesabınızı ve bağlı uygulama verilerinizi kalıcı olarak siler. Bu eylem geri alınamaz.",
        "successTitle": "Hesap silindi",
        "successBody": "VocOrbit hesabınız kalıcı olarak silindi.",
        "missingUser": "Hesap kimliğiniz bulunamadı. Lütfen tekrar oturum açın.",
        "cannotConnect": "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.",
        "sessionExpired": "Oturumunuzun süresi doldu. Lütfen tekrar oturum açın.",
        "failed": "Hesabınızı şu anda silemedik. Lütfen tekrar deneyin."
      }
    },
    "iap": {
      "title": "Faturalandırma ve Krediler",
      "loading": "Faturalandırma detayları yükleniyor...",
      "desktop": {
        "subtitle": "Mevcut bakiyeni burada gör. Yeni satın alımlar ve abonelik değişiklikleri mobilden devam eder.",
        "desktopBadge": "Masaüstü görünümü",
        "phoneOnlyBadge": "Satın alma telefonda",
        "balanceTitle": "Mevcut bakiyen",
        "balanceBody": "Masaüstü sürüm mevcut kredilerini ve abonelik durumunu görünür tutar. Böylece öğrenme akışına devam etmeden önce hesabını kontrol edebilirsin.",
        "basicAvailable": "Temel krediler",
        "advancedAvailable": "Gelişmiş krediler",
        "freeCredits": "Ücretsiz",
        "paidCredits": "Ücretli",
        "noPlanBody": "Bu hesapta şu an aktif bir mobil plan görünmüyor. Yine de burada mevcut kredilerini kullanmaya devam edebilirsin.",
        "mobileTitle": "Satın almaya telefondan devam et",
        "mobileBody": "Kredi satın alma ve abonelik değişiklikleri, App Store veya Google Play hesabınla mobil uygulama içinde tamamlanır.",
        "storeLabel": "Mağaza: {{store}}",
        "renewsOn": "Yenileme: {{date}}",
        "expiresOn": "Bitiş: {{date}}",
        "updatedOn": "Son senkron: {{date}}",
        "stepOpenPhone": "Aynı hesapla telefondaki VocOrbit uygulamasını aç.",
        "stepOpenBilling": "Profil > Faturalandırma ve Krediler bölümüne git.",
        "stepFinishPurchase": "Kredi satın alma veya abonelik yönetimini orada tamamla, sonra buraya dönüp yenile.",
        "mobileHint": "Mobil satın alma aynı hesaba işlendiğinde kredi bakiyen burada da güncellenir."
      },
      "currentSubscription": "Mevcut abonelik",
      "currentStatus": "Durum: {{status}}",
      "currentPlan": "Mevcut plan: {{plan}}",
      "noActivePlan": "Aktif plan yok",
      "refresh": "Faturalandırmayı yenile",
      "basicCreditsTitle": "Temel anlam kredileri",
      "basicCreditsBody": "Paylaşım ekranındaki temel anlam analizi bu krediyi tüketir.",
      "plansTitle": "Planlar",
      "plansBody": "Bir plan seç ve ödemeyi mağaza hesabın üzerinden tamamla.",
      "noPlans": "Bu platform için satın alınabilir plan bulunamadı.",
      "planTopup": "Aylık ekleme: +{{basic}} temel · +{{advanced}} gelişmiş",
      "planCaps": "Limitler: {{basicCap}} temel · {{advancedCap}} gelişmiş",
      "priceLabel": "Fiyat: {{price}}",
      "buyNow": "Şimdi satın al",
      "privacyPolicy": "Gizlilik Politikası",
      "termsOfUse": "Kullanım Koşulları",
      "manageSubscription": "Aboneliği yönet",
      "buying": "Satın alma işleniyor...",
      "purchaseCanceled": "Satın alma iptal edildi.",
      "purchaseApplied": "{{sku}} başarıyla etkinleştirildi.",
      "alreadyOwnedRestoring": "Bu ürün zaten bu hesapta var. Satın alımların geri yükleniyor...",
      "restorePurchases": "Satın alımları geri yükle",
      "restoring": "Satın alımlar geri yükleniyor...",
      "restoreNoPurchases": "Geri yüklenecek satın alım bulunamadı.",
      "restoreNoApplicablePurchases": "Uygulanabilir geri yükleme bulunamadı.",
      "restoreApplied": "{{count}} satın alım geri yüklenip doğrulandı.",
      "status": {
        "none": "Abone değil",
        "pending": "Beklemede",
        "active": "Aktif",
        "expired": "Süresi doldu",
        "canceled": "İptal edildi",
        "refunded": "İade edildi"
      },
      "errors": {
        "unauthorized": "Oturum süren dolmuş olabilir. Lütfen tekrar giriş yap.",
        "cannotConnect": "Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.",
        "forbidden": "Bu satın alma hesabına uygulanamadı.",
        "generic": "Faturalandırma isteği başarısız oldu. Lütfen tekrar dene.",
        "purchaseFailed": "Satın alma başarısız oldu. Lütfen tekrar dene.",
        "alreadyOwned": "Bu ürün bu hesapta zaten satın alınmış görünüyor.",
        "invalidReceipt": "Mağaza makbuzu doğrulanamadı.",
        "iapUnavailable": "Bu cihazda mağaza satın alma servisi şu anda kullanılamıyor."
      },
      "accessibility": {
        "goBack": "Geri dön",
        "buyPlan": "{{plan}} planını satın al",
        "restorePurchases": "Önceki satın alımları geri yükle",
        "refresh": "Faturalandırma ve abonelik durumunu yenile"
      }
    },
    "weeklyAnalytics": {
      "title": "Haftalık Analiz",
      "modeAll": "Tüm",
      "modeBasic": "Temel",
      "modeAdvanced": "Gelişmiş",
      "loading": "Haftalık analiz yükleniyor...",
      "summaryTitle": "Özet (7 gün)",
      "sessions": "Oturumlar",
      "completed": "Tamamlanan",
      "answered": "Yanıtlanan",
      "accuracy": "Doğruluk",
      "activeDays": "Aktif gün",
      "streak": "Seri",
      "dailyTrend": "Günlük trend",
      "byQuestionType": "Soru tipine göre",
      "byMode": "Moda göre",
      "weakItems": "Zayıf maddeler",
      "noWeakItems": "Bu hafta belirgin zayıf kelime bulunamadı.",
      "weakItemMeta": "Yanlış: {{wrongAnswers}} · Doğruluk: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "Anlam eşleştirme",
      "questionTypeGuessWord": "Kelime tahmin et",
      "questionTypeFillInGap": "Boşluk doldurma",
      "questionTypeMatchSynonym": "Eş anlam eşleştirme",
      "errors": {
        "unauthorized": "Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yap.",
        "cannotConnect": "Sunucuya bağlanılamadı. Bağlantını kontrol edip tekrar dene.",
        "loadFailed": "Haftalık analiz yüklenemedi. Lütfen tekrar dene."
      },
      "accessibility": {
        "goBack": "Geri dön",
        "filterByMode": "{{mode}} moduna göre filtrele",
        "retry": "Analiz isteğini tekrar dene"
      }
    },
    "detail": {
      "closeDetails": "Kelime detayını kapat",
      "loadingDetail": "Kelime detayı yükleniyor...",
      "detailLoadFailedTitle": "Detay yüklenemedi",
      "statusLearned": "öğrenildi",
      "statusActive": "aktif",
      "markAsLearned": "Öğrenildi olarak işaretle",
      "moveBackToActive": "Aktife geri al",
      "buyAdvancedCredits": "Gelişmiş kredi satın al",
      "buyBasicCredits": "Temel kredi satın al",
      "buyCredits": "Kredi satın al",
      "whyThisSense": "Neden bu anlam",
      "examples": "Örnekler",
      "synonyms": "Eş anlamlılar",
      "antonyms": "Zıt anlamlılar",
      "collocations": "Birlikte kullanımlar",
      "alternativeMeanings": "Alternatif anlamlar",
      "usageNotes": "Kullanım notları",
      "noSynonyms": "Henüz eş anlam verisi yok.",
      "stats": "İstatistikler",
      "encountersAndLastMode": "Karşılaşma: {{encounters}} | Son mod: {{mode}}",
      "nextReminder": "Sonraki hatırlatma",
      "currentPlan": "Mevcut plan: {{due}}",
      "reviewHint": "Unuttum: +10 dk, Zor: +1 saat, İyi: +1 günden başlayarak artar.",
      "runAdvanced": "Gelişmiş analiz çalıştır",
      "reviewForgot": "Unuttum",
      "reviewHard": "Zor",
      "reviewGood": "İyi",
      "reviewOptionAccessibility": "{{title}} seçildi. Sonraki tekrar {{delay}} sonra.",
      "repeatUnscheduled": "Planlanmadı",
      "repeatNow": "Şimdi",
      "repeatAfterMinutes": "{{count}} dk",
      "repeatAfterHours": "{{count}} saat",
      "repeatAfterDays": "{{count}} gün",
      "repeatAfterWeeks": "{{count}} hafta",
      "repeatInMinutes": "{{count}} dk sonra",
      "repeatInHours": "{{count}} saat sonra",
      "repeatInDays": "{{count}} gün sonra",
      "repeatInWeeks": "{{count}} hafta sonra",
      "repeatNotificationTitle": "Tekrar zamanı: {{word}}",
      "repeatNotificationBody": "{{word}} kelimesini tekrar et.",
      "reportIssue": "Anlamı bildir",
      "reportIssueAccessibility": "{{word}} kelimesi için hatalı anlamı bildir",
      "deleteWord": "Kelimeyi sil",
      "deleteWordAccessibility": "{{word}} kelimesini sil",
      "deleteConfirmTitle": "Bu kelime silinsin mi?",
      "deleteConfirmBody": "\"{{word}}\" listenden silinecek. İstersen sonra tekrar ekleyebilirsin.",
      "deleteConfirmCancel": "İptal",
      "deleteConfirmAction": "Evet, sil"
    },
    "quickLookup": {
      "title": "Hızlı anlam",
      "subtitle": "Kullandığın uygulamadan çıkmadan anlamı gör.",
      "shortcutHint": "Kısayol: {{shortcut}}",
      "loadingSession": "VocOrbit oturumu hazırlanıyor...",
      "authRequiredTitle": "Giriş gerekli",
      "authRequiredBody": "VocOrbit'i açıp giriş yap, sonra hızlı anlam kısayolunu tekrar kullan.",
      "inputLabel": "Kopyalanan metin",
      "inputPlaceholder": "Buraya bir cümle veya paragraf yapıştır.",
      "selection": {
        "title": "Hedef kelimeyi seç",
        "empty": "Önce metin yapıştır.",
        "pending": "Metnin içindeki tam kelimeye tıkla.",
        "selected": "Seçilen: {{word}}"
      },
      "resultTitle": "Temel anlam",
      "savedHint": "Bu kelime zaten kütüphanene kaydedildi.",
      "browserHint": "Bu yüzen pencereyi kullanmak için bu sayfayı VocOrbit Desktop içinden aç.",
      "actions": {
        "pasteClipboard": "Panoyu yapıştır",
        "readingClipboard": "Pano okunuyor...",
        "runBasicLookup": "Temel anlamı getir",
        "runningLookup": "Anlam getiriliyor...",
        "openVocOrbit": "VocOrbit'i aç",
        "close": "Kapat"
      },
      "errors": {
        "signInRequiredTitle": "Giriş gerekli",
        "signInRequiredBody": "Oturum hazır değil. VocOrbit'i açıp tekrar giriş yap.",
        "creditsRequiredTitle": "Temel kredi gerekli",
        "creditsRequiredBody": "Hesabın şu an temel anlam isteği çalıştıramıyor.",
        "timeoutTitle": "İstek zaman aşımına uğradı",
        "timeoutBody": "Anlam isteği çok uzun sürdü. Aynı metinle tekrar dene.",
        "connectionTitle": "Bağlantı sorunu",
        "connectionBody": "VocOrbit sunucuya ulaşamadı. Bağlantını kontrol edip tekrar dene.",
        "lookupFailedTitle": "Anlam getirilemedi",
        "lookupFailedBody": "VocOrbit bu anlam isteğini tamamlayamadı.",
        "clipboardUnavailableTitle": "Pano kullanılamıyor",
        "clipboardUnavailableBody": "Önce metni kopyala, sonra hızlı anlamı tekrar aç."
      }
    },
    "report": {
      "title": "Anlamı bildir",
      "subtitle": "\"{{word}}\" bu bağlamda hatalıysa bize yaz.",
      "messageLabel": "Sorun nedir?",
      "messagePlaceholder": "Örnek: Bu anlam cümleye uymuyor. Burada konum değil, iletişim anlamı verilmeli.",
      "charactersLeft": "{{count}} karakter kaldı",
      "submit": "Bildirimi gönder",
      "successTitle": "Bildirimin alındı",
      "successBody": "Teşekkürler. Bu kelimeyi inceleyip düzelteceğiz.",
      "backToDetail": "Kelime detayına dön",
      "errors": {
        "unauthorized": "Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yap.",
        "cannotConnect": "Sunucuya bağlanılamadı. Bağlantını kontrol edip tekrar dene.",
        "itemNotFound": "Kelime kaydı bulunamadı.",
        "submitFailed": "Bildirimi gönderemedik. Lütfen tekrar dene."
      },
      "accessibility": {
        "goBack": "Geri dön",
        "submit": "Hata bildirimini gönder",
        "backToDetail": "Kelime detayına dön"
      }
    }
  }
}

export default tr
