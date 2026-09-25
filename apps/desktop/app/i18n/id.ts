import { Translations } from "./en"

const id: Translations = {
  "common": {
    "ok": "OKE!",
    "cancel": "Batalkan",
    "back": "Kembali",
    "logOut": "Keluar"
  },
  "welcomeScreen": {
    "postscript": "psst — Ini mungkin bukan tampilan aplikasi Anda. (Kecuali desainer Anda memberikan layar ini kepada Anda, dan dalam hal ini, kirimkan!)",
    "readyForLaunch": "Aplikasi Anda hampir siap diluncurkan!",
    "exciting": "(ohh, ini mengasyikkan!)",
    "letsGo": "Ayo pergi!"
  },
  "errorScreen": {
    "title": "Ada yang tidak beres!",
    "friendlySubtitle": "Ini adalah layar yang akan dilihat pengguna Anda dalam produksi ketika terjadi kesalahan. Anda ingin menyesuaikan pesan ini (terletak di `app/i18n/en.ts`) dan mungkin juga tata letaknya (`app/screens/ErrorScreen`). Jika Anda ingin menghapusnya seluruhnya, centang `app/app.tsx` untuk komponen <ErrorBoundary>.",
    "reset": "SETEL ULANG APLIKASI",
    "traceTitle": "Kesalahan dari tumpukan %{name}"
  },
  "emptyStateComponent": {
    "generic": {
      "heading": "Sangat kosong... sangat menyedihkan",
      "content": "Belum ada data yang ditemukan. Coba klik tombol untuk menyegarkan atau memuat ulang aplikasi.",
      "button": "Mari kita coba lagi"
    }
  },
  "errors": {
    "invalidEmail": "Alamat email tidak valid."
  },
  "loginScreen": {
    "logIn": "Masuk",
    "subtitle": "Lanjutkan dengan akun sosial Anda untuk mengakses kemajuan kosakata Anda.",
    "continueWith": "LANJUTKAN DENGAN",
    "regionTitle": "Wilayah",
    "regionSubtitle": "Saat ini: {{region}}",
    "regionNotSelected": "Tidak dipilih",
    "changeRegion": "Perubahan",
    "signingIn": "Masuk...",
    "googleButton": "Google",
    "appleButton": "apel (segera)",
    "moreProvidersSoon": "Lebih banyak penyedia akan segera tersedia.",
    "accessibility": {
      "openRegionSelection": "Buka pemilihan wilayah"
    },
    "errors": {
      "unauthorized": "Otentikasi gagal. Silakan masuk lagi.",
      "cannotConnect": "Tidak dapat terhubung ke server. Silakan coba lagi.",
      "server": "Validasi server gagal. Silakan coba lagi sebentar lagi.",
      "rejected": "Permintaan masuk ditolak. Harap verifikasi konfigurasi autentikasi.",
      "badData": "Respons tak terduga diterima dari server.",
      "generic": "Tidak dapat menyelesaikan proses masuk. Coba lagi.",
      "googleCancelled": "Masuk dengan Google dibatalkan.",
      "googleUnavailable": "Login dengan Google tidak tersedia di perangkat ini.",
      "googleFailed": "Gagal masuk ke Google. Silakan coba lagi."
    }
  },
  "languagePreferences": {
    "titleOnboarding": "Pilih pasangan bahasa Anda",
    "titleSettings": "Preferensi bahasa",
    "subtitleOnboarding": "Pilih bahasa asli dan bahasa target Anda dari daftar global dengan bendera dan negara.",
    "subtitleSettings": "Perbarui bahasa asli dan bahasa target Anda di sini dengan informasi bendera dan negara.",
    "currentPair": "Pasangan saat ini",
    "availableOptionsCount": "{{count}} opsi bahasa/negara tersedia",
    "nativeLanguageTitle": "Bahasa asli",
    "nativeLanguageBody": "Terjemahan dan penjelasan akan ditampilkan dalam bahasa ini.",
    "learningLanguageTitle": "Belajar bahasa",
    "learningLanguageBody": "Definisi dan konteks akan dihasilkan dalam bahasa ini.",
    "selectedLabel": "Dipilih",
    "pickerTitleL1": "Pilih bahasa ibu",
    "pickerTitleL2": "Pilih bahasa pembelajaran",
    "searchPlaceholder": "Cari bahasa atau negara",
    "noResults": "Tidak ada hasil yang ditemukan.",
    "saving": "Menyimpan...",
    "continue": "Lanjutkan",
    "save": "Simpan",
    "accessibility": {
      "goBack": "Kembali",
      "selectNativeLanguage": "Pilih bahasa asli",
      "selectLearningLanguage": "Pilih bahasa pembelajaran",
      "continueWithSelectedLanguages": "Lanjutkan dengan bahasa yang dipilih",
      "saveLanguages": "Simpan bahasa",
      "closeLanguagePicker": "Tutup pemilih bahasa",
      "closePicker": "Tutup pemilih",
      "selectLanguageItem": "Pilih {{language}} {{country}}"
    },
    "errors": {
      "cannotConnect": "Tidak dapat terhubung ke server. Silakan coba lagi.",
      "unauthorized": "Sesi tidak valid. Silakan masuk lagi.",
      "validation": "Preferensi bahasa tidak dapat disimpan. Silakan periksa masukan Anda.",
      "server": "Terjadi kesalahan server. Silakan coba lagi sebentar lagi.",
      "saveFailed": "Preferensi bahasa tidak dapat disimpan. Silakan coba lagi.",
      "noSession": "Tidak ada sesi aktif yang ditemukan. Silakan masuk lagi.",
      "selectTwoLanguages": "Silakan pilih kedua bahasa.",
      "sameLanguagePair": "Bahasa ibu dan bahasa pembelajaran tidak bisa sama."
    }
  },
  "vocabulary": {
    "common": {
      "retry": "Coba lagi",
      "signIn": "Masuk",
      "favoriteLabel": "Favorit",
      "learnedLabel": "Belajar",
      "detailButton": "Buka detailnya"
    },
    "welcome": {
      "badge": "VOCORBIT",
      "title": "Bagaimana sebenarnya VocOrbit bekerja",
      "subtitle": "Alur nyata: pilih kalimat di luar aplikasi, pilih kata, lalu pelajari dengan konteks di dalam VocOrbit.",
      "progress": "Langkah {{current}} / {{total}}",
      "progressSingle": "Langkah {{current}}",
      "mock": {
        "contextLabel": "Kalimat konteks",
        "selectedWordLabel": "Kata yang dipilih",
        "meaningLabel": "Arti dasar",
        "whyLabel": "Mengapa dalam konteks ini"
      },
      "flowTitle": "Pelajari alurnya dalam 3 langkah cepat",
      "highlightsTitle": "Apa yang Anda dapatkan",
      "actions": {
        "previous": "Sebelumnya",
        "next": "Langkah selanjutnya",
        "enterApp": "Mulailah belajar",
        "showExample": "Show example",
        "hideExample": "Sembunyikan contoh"
      },
      "steps": {
        "step1": {
          "step": "LANGKAH 1 • Bagikan sebuah kalimat",
          "title": "Pilih kalimat di mana kata tersebut muncul",
          "body": "Tekan lama teks di browser, catatan, atau aplikasi apa pun dan kirimkan ke VocOrbit Share Extension.",
          "source": "Ketika saya menengok ke belakang, saya kembali terkesan dengan kekuatan sastra yang memberi kehidupan.",
          "word": "sastra",
          "meaning": "karya tulis, khususnya yang dianggap artistik",
          "why": "Dalam kalimat ini mengacu pada buku dan seni tertulis yang sangat mempengaruhi pembicara.",
          "hint": "Tip: Selalu bagikan kalimat lengkap, bukan hanya satu kata.",
          "bullets": {
            "one": "Bekerja dengan browser, catatan, dan banyak aplikasi membaca",
            "two": "Anda menjaga konteks kalimat aslinya",
            "three": "Tidak diperlukan alur salin-tempel manual"
          }
        },
        "step2": {
          "step": "LANGKAH 2 • Pilih kata yang tepat",
          "title": "Ketuk satu kata dan dapatkan makna dasar instan",
          "body": "Di dalam tampilan berbagi, kata-kata dapat disadap. Pilih satu kata target dan jalankan wawasan dasar.",
          "source": "Membaca hendaknya tidak dianggap sebagai tugas atau kewajiban bagi anak-anak.",
          "word": "tugas",
          "meaning": "tugas rutin, biasanya tidak menyenangkan",
          "why": "Di sini 'tugas' menekankan bahwa membaca tidak boleh terasa seperti kerja paksa.",
          "hint": "Tip: Jika Anda tidak yakin, mulailah dengan dasar. Kemudian jalankan lanjutan di aplikasi.",
          "bullets": {
            "one": "Makna dihasilkan untuk kalimat yang tepat ini",
            "two": "Anda juga melihat mengapa pengertian ini dipilih",
            "three": "Mendukung pasangan bahasa pilihan Anda"
          }
        },
        "step3": {
          "step": "LANGKAH 3 • Simpan dan atur",
          "title": "Pindahkan kata-kata yang berguna ke dalam sistem pribadi Anda",
          "body": "Setelah kata tersebut sampai ke VocOrbit, tandai favorit atau tambahkan ke daftar pengulangan untuk pembelajaran aktif.",
          "source": "Bersandarlah pada pengalaman ahli kami untuk menyiapkan proyek Anda agar sukses.",
          "word": "ahli",
          "meaning": "seseorang dengan keahlian atau pengetahuan khusus",
          "why": "Ini menggambarkan pengalaman tersebut sebagai pengalaman yang sangat andal dan terampil dalam konteks proyek ini.",
          "hint": "Tip: Jaga agar daftar pengulangan tetap fokus. 10 kata aktif memberikan retensi yang lebih baik.",
          "bullets": {
            "one": "Daftar favorit untuk kata-kata penting",
            "two": "Ulangi daftar untuk menghafal aktif",
            "three": "Status yang dipelajari menjaga kemajuan Anda tetap bersih"
          }
        },
        "step4": {
          "step": "LANGKAH 4 • Latihan putaran",
          "title": "Tinjau, praktikkan, dan tandai sebagai yang telah dipelajari",
          "body": "Gunakan mode latihan dan pengingat hingga ingatan Anda kuat, lalu tandai kata tersebut sebagai telah dipelajari.",
          "source": "Ingin menghubungi kami tentang hal lain?",
          "word": "menjangkau",
          "meaning": "untuk menghubungi seseorang",
          "why": "Dalam konteks ini adalah kata kerja phrasal yang berarti komunikasi, bukan pencapaian fisik.",
          "hint": "Tip: Gunakan pengingat dan sesi singkat setiap hari untuk kemajuan yang stabil.",
          "bullets": {
            "one": "Kartu latihan dibuat dari kata-kata Anda sendiri",
            "two": "Analisis mingguan menunjukkan titik lemah",
            "three": "Kata-kata yang dipelajari meninggalkan antrian pengulangan secara otomatis"
          }
        }
      }
    },
    "errors": {
      "sessionExpired": "Sesi Anda mungkin telah kedaluwarsa. Silakan masuk lagi.",
      "cannotConnect": "Tidak dapat menjangkau server. Periksa koneksi Anda dan coba lagi.",
      "listLoadFailed": "Tidak dapat memuat daftar kata. Silakan coba lagi.",
      "searchLoadFailed": "Tidak dapat memuat hasil penelusuran. Silakan coba lagi.",
      "itemNotFound": "Catatan kata tidak ditemukan.",
      "reloginRequired": "Silakan masuk lagi untuk melanjutkan.",
      "favoriteActionFailed": "Tindakan favorit gagal. Silakan coba lagi.",
      "detailLoadFailed": "Tidak dapat memuat detail kata.",
      "stateUpdateFailed": "Tidak dapat memperbarui status. Silakan coba lagi.",
      "analysisRequestFailed": "Tidak dapat mengirim permintaan analisis.",
      "invalidModelOutput": "Format respons model tidak valid. Silakan coba lagi.",
      "analysisTimeout": "Waktu analisis habis. Silakan coba lagi.",
      "advancedCreditInsufficient": "Kredit lanjutan tidak mencukupi.",
      "basicCreditInsufficient": "Kredit dasar tidak mencukupi.",
      "advancedAnalysisFailed": "Analisis lanjutan tidak dapat diselesaikan.",
      "basicAnalysisFailed": "Analisis dasar tidak dapat diselesaikan.",
      "repeatProgressUpdateFailed": "Tidak dapat memperbarui kemajuan yang berulang. Silakan coba lagi.",
      "missingContext": "Konteks yang diperlukan untuk analisis tidak ada.",
      "selectedWordNotInSentence": "Kata yang dipilih tidak ditemukan dalam kalimat konteks.",
      "analysisFailedGeneric": "Analisis tidak dapat diselesaikan. Silakan coba lagi.",
      "unexpected": "Terjadi kesalahan yang tidak terduga."
    },
    "search": {
      "title": "Cari",
      "placeholder": "Cari berdasarkan kata, makna atau penjelasan",
      "loading": "Memuat kata-kata...",
      "emptyResult": "Tidak ada kata yang cocok dengan pertanyaan Anda.",
      "emptyHint": "Mulailah mengetik di atas untuk mencari."
    },
    "showroom": {
      "loading": "Memuat daftar kata...",
      "emptyTitle": "Belum ada kata-kata",
      "emptyBody": "Setelah Anda menambahkan kata melalui Word Insight, daftar ini akan terisi secara otomatis.",
      "emptyCta": "Pengumuman terbuka",
      "updateAvailableTitle": "Versi baru tersedia",
      "updateAvailableBody": "Ketuk untuk memperbarui dan terus mendapatkan peningkatan terkini.",
      "updateNow": "Perbarui sekarang",
      "repeatAdded": "{{word}} ditambahkan ke daftar berulang ({{count}}/{{limit}}).",
      "repeatRemoved": "{{word}} dihapus dari daftar berulang ({{count}}/{{limit}}).",
      "repeatLimitReached": "Anda mencapai batas daftar pengulangan (10/10).",
      "repeatPermissionRequired": "Izin pemberitahuan diperlukan untuk pengingat. Aktifkan notifikasi untuk menambahkan kata.",
      "favoriteAdded": "{{word}} ditambahkan ke favorit.",
      "favoriteRemoved": "{{word}} dihapus dari favorit.",
      "repeatCleared": "Daftar pengulangan dihapus.",
      "repeatListTitle": "Ulangi daftar",
      "repeatCount": "{{count}}/{{limit}} kata",
      "repeatEmpty": "Daftar pengulangan kosong. Tambahkan kata-kata dengan tombol lonceng di bawah.",
      "clearAll": "Hapus semuanya",
      "done": "Selesai",
      "practice": "Praktek",
      "accessibility": {
        "showDetails": "Tampilkan detailnya",
        "favoriteWord": "Kata favorit",
        "repeatWordLater": "Ulangi kata ini nanti",
        "openProfile": "Buka profil",
        "openRepeatList": "Buka daftar kata berulang",
        "openAnnouncements": "Pengumuman terbuka",
        "openUpdate": "Buka halaman pembaruan",
        "dismissUpdate": "Tutup pemberitahuan pembaruan",
        "searchWords": "Cari kata-kata",
        "switchToCard": "Beralih ke tampilan kartu",
        "switchToList": "Beralih ke tampilan daftar",
        "retryShowroom": "Coba muat showroom lagi",
        "closeRepeatList": "Tutup daftar ulangi",
        "clearRepeatList": "Hapus daftar pengulangan",
        "removeFromRepeat": "Hapus {{word}} dari daftar berulang",
        "practiceWord": "Praktekkan kata ini",
        "addWord": "Tambah kata"
      },
      "quickAdd": {
        "eyebrow": "Tambah Cepat",
        "title": "Tambahkan kata dari konteks",
        "body": "Tempel satu kalimat, pilih kata yang tepat, lalu simpan.",
        "action": "Tambah Kata",
        "actionHint": "Tempel dan pilih"
      }
    },
    "practiceHub": {
      "title": "Praktek",
      "sectionLabel": "Praktek",
      "selectAnswer": "PILIH JAWABAN",
      "modeBasic": "Dasar",
      "modeAdvanced": "Lanjutan",
      "loadingTitle": "Memuat katalog",
      "loadingMessage": "Memeriksa jenis latihan mana yang tersedia untuk Anda.",
      "loadingQuestionsTitle": "Mempersiapkan soal latihan...",
      "loadingQuestionsMessage": "Menghasilkan pertanyaan berdasarkan data kosakata Anda yang tersedia.",
      "instructions": {
        "matchSynonyms": "Pilih sinonim yang paling dekat."
      },
      "resultCta": {
        "backToPractice": "Kembali berlatih",
        "seeResult": "Lihat hasilnya",
        "nextWord": "Kata selanjutnya"
      },
      "result": {
        "correctTitle": "Itu benar!",
        "incorrectTitle": "Itu tidak benar!",
        "correctAnswerLabel": "Jawaban yang benar:",
        "usedInSentenceLabel": "Digunakan dalam sebuah kalimat:",
        "sessionResultLabel": "Hasil sesi"
      },
      "leavePrompt": {
        "title": "Sudah berangkat?",
        "keepPlaying": "Teruslah bermain",
        "leave": "Pergi",
        "closePromptAccessibility": "Tutup perintah cuti",
        "leavePracticeAccessibility": "Tinggalkan latihan"
      },
      "hints": {
        "availableCount": "{{count}} kata tersedia",
        "missingSynonyms": "Data sinonim tidak tersedia",
        "minActiveWords": "Diperlukan minimal 2 kata aktif"
      },
      "tiles": {
        "meaningMatch": "Artinya cocok",
        "fillInGap": "Isi celahnya",
        "guessWord": "Tebak kata itu",
        "matchSynonyms": "Cocokkan sinonim"
      },
      "accessibility": {
        "goBack": "Kembali",
        "useMode": "Gunakan mode {{mode}}",
        "closePractice": "Tutup latihan"
      },
      "loadState": {
        "noQuestions": {
          "title": "Belum ada soal latihan",
          "message": "Anda memerlukan minimal 2 kata aktif untuk memulai latihan.",
          "actionLabel": "Tambahkan kata-kata"
        },
        "unauthorized": {
          "title": "Diperlukan masuk",
          "message": "Sesi Anda mungkin telah kedaluwarsa. Masuk lagi untuk melanjutkan.",
          "actionLabel": "Masuk"
        },
        "forbidden": {
          "title": "Fitur ini saat ini tidak tersedia",
          "message": "Periksa paket atau kredit Anda untuk melanjutkan.",
          "actionLabel": "Dapatkan kredit"
        },
        "rejected": {
          "title": "Data tidak cukup untuk mode ini",
          "message": "Tambahkan lebih banyak kata dan coba lagi.",
          "actionLabel": "Tambahkan kata-kata"
        },
        "server": {
          "title": "Tidak dapat menjangkau server",
          "message": "Periksa koneksi Anda dan coba lagi.",
          "actionLabel": "Coba lagi"
        },
        "generic": {
          "title": "Tidak dapat memulai latihan",
          "message": "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
          "actionLabel": "Coba lagi"
        }
      }
    },
    "announcements": {
      "title": "Pengumuman",
      "unreadCount": "{{count}} belum dibaca",
      "markAllRead": "Tandai semua telah dibaca",
      "loading": "Memuat pengumuman...",
      "empty": "Tidak ada pengumuman saat ini.",
      "openLink": "Buka tautan",
      "openAnnouncement": "Pengumuman terbuka: {{title}}",
      "levelInfo": "Informasi",
      "levelWarning": "Peringatan",
      "levelCritical": "Kritis",
      "loadFailed": "Tidak dapat memuat pengumuman. Silakan coba lagi.",
      "claimFailed": "Klaim hadiah gagal. Silakan coba lagi.",
      "requirementNotMet": "Persyaratan belum terpenuhi. Undang teman terlebih dahulu.",
      "referralCodeMissing": "Kode referensi untuk akun ini tidak ada.",
      "referralProgress": "Kemajuan rujukan: {{current}}/{{required}}",
      "shareInvite": "Undang teman",
      "referralShareMessage": "Bergabunglah dengan VocOrbit.\nBuka tautan ini:\n{{link}}",
      "rewardText": "Hadiah: +{{amount}} {{creditType}} kredit",
      "creditBasic": "dasar",
      "creditAdvanced": "maju",
      "claimReward": "Klaim",
      "claimingReward": "Mengklaim...",
      "rewardClaimed": "Diklaim"
    },
    "forceUpdate": {
      "title": "Diperlukan pembaruan",
      "body": "Versi baru diperlukan untuk terus menggunakan VocOrbit.",
      "updateNow": "Perbarui sekarang",
      "checkAgain": "Periksa lagi"
    },
    "profile": {
      "title": "Profil",
      "accountDetailsTitle": "Detail Akun",
      "accountDetailsSubtitle": "Lihat email dan informasi akun Anda.",
      "settingsTitle": "Pengaturan",
      "settingsSubtitle": "Sesuaikan ukuran teks dan urutan tombol tindakan.",
      "favoriteWordsTitle": "Kata-kata Favorit",
      "favoriteWordsSubtitle": "Lihat kata-kata yang ditambahkan ke favorit.",
      "learnedWordsTitle": "Kata-kata yang Dipelajari",
      "learnedWordsSubtitle": "Lihat kata-kata yang ditandai sebagai dipelajari.",
      "weeklyAnalyticsTitle": "Analisis Mingguan",
      "weeklyAnalyticsSubtitle": "Lihat kinerja latihan 7 hari terakhir Anda.",
      "regionTitle": "Wilayah",
      "regionSubtitle": "Saat ini: {{region}}",
      "regionNotSelected": "Tidak dipilih",
      "emptyFavorites": "Belum ada kata favorit.",
      "emptyLearned": "Belum ada kata-kata yang dipelajari.",
      "loadingList": "Memuat daftar...",
      "logOut": "Keluar",
      "accessibility": {
        "goBack": "Kembali",
        "openAccountDetails": "Buka detail akun",
        "openSettings": "Buka pengaturan",
        "openFavoriteWords": "Buka kata-kata favorit",
        "openLearnedWords": "Buka kata-kata yang dipelajari",
        "openWeeklyAnalytics": "Buka analisis mingguan",
        "openRegion": "Buka pengaturan wilayah",
        "logOut": "Keluar",
        "playPronunciation": "Mainkan pengucapan untuk {{word}}",
        "openDetailForWord": "Buka detail untuk {{word}}",
        "removeWord": "Hapus {{word}}"
      }
    },
    "settings": {
      "title": "Pengaturan",
      "languagePairTitle": "Pasangan bahasa",
      "languagePairSubtitle": "Ubah bahasa ibu dan bahasa pembelajaran Anda.",
      "billingCreditsTitle": "Penagihan & kredit",
      "billingCreditsSubtitle": "Kelola kredit makna dasar dan paket IAP di sini.",
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
      "themeModeSubtitle": "Pilih terang, gelap, atau ikuti pengaturan sistem Anda.",
      "themeModeSystem": "Sistem",
      "themeModeLight": "Lampu",
      "themeModeDark": "Gelap",
      "textSizeTitle": "Ukuran teks",
      "textSizeSubtitle": "Sesuaikan ukuran teks di kartu kosakata.",
      "actionOrderTitle": "Perintah tindakan",
      "actionOrderSubtitle": "Atur urutan tombol detail/favorit/ulangi.",
      "actionDetail": "Detil",
      "actionFavorite": "Favorit",
      "actionRepeat": "Ulangi",
      "resetToDefaults": "Atur ulang ke default",
      "accessibility": {
        "changeQuickLookupShortcut": "Change quick lookup shortcut",
        "resetQuickLookupShortcut": "Reset quick lookup shortcut",
        "goBack": "Kembali",
        "openLanguagePreferences": "Buka preferensi bahasa",
        "openBillingCredits": "Buka penagihan dan kredit",
        "useSystemTheme": "Gunakan tema sistem",
        "useLightTheme": "Tema yang cerah",
        "useDarkTheme": "Gunakan tema GTK gelap",
        "decreaseTextSize": "Kurangi ukuran teks",
        "increaseTextSize": "Tingkatkan ukuran teks",
        "moveActionLeft": "Pindahkan {{action}} ke kiri",
        "moveActionRight": "Pindahkan {{action}} ke kanan",
        "resetSettings": "Setel ulang pengaturan kosakata"
      }
    },
    "accountDetails": {
      "title": "Detail Akun",
      "emailLabel": "Surel",
      "userIdLabel": "ID Pengguna",
      "regionLabel": "Wilayah asal",
      "regionEndpointLabel": "Titik akhir wilayah",
      "appVersionLabel": "Versi aplikasi",
      "buildLabel": "Nomor pembuatan",
      "platformLabel": "Peron",
      "osVersionLabel": "versi sistem operasi",
      "accessibility": {
        "goBack": "Kembali",
        "deleteAccount": "Hapus akun secara permanen"
      },
      "deleteAccount": {
        "sectionTitle": "Hapus akun",
        "sectionBody": "Hapus akun VocOrbit Anda secara permanen dan data aplikasi yang tertaut dengannya. Tindakan ini tidak dapat dibatalkan.",
        "action": "Hapus akun secara permanen",
        "deleting": "Menghapus akun...",
        "confirmTitle": "Hapus akun?",
        "confirmBody": "Tindakan ini akan menghapus akun VocOrbit dan data aplikasi tertaut Anda secara permanen. Tindakan ini tidak dapat dibatalkan.",
        "successTitle": "Akun dihapus",
        "successBody": "Akun VocOrbit Anda telah dihapus secara permanen.",
        "missingUser": "ID akun Anda tidak dapat ditemukan. Silakan masuk lagi.",
        "cannotConnect": "Tidak dapat menjangkau server. Periksa koneksi Anda dan coba lagi.",
        "sessionExpired": "Sesi Anda telah berakhir. Silakan masuk lagi.",
        "failed": "Kami tidak dapat menghapus akun Anda saat ini. Silakan coba lagi."
      }
    },
    "iap": {
      "title": "Penagihan & Kredit",
      "loading": "Memuat detail penagihan...",
      "currentSubscription": "Langganan saat ini",
      "currentStatus": "Status:{{status}}",
      "currentPlan": "Paket saat ini: {{plan}}",
      "noActivePlan": "Tidak ada rencana aktif",
      "refresh": "Segarkan penagihan",
      "basicCreditsTitle": "Kredit wawasan dasar",
      "basicCreditsBody": "Analisis makna dasar di layar berbagi menghabiskan kredit ini.",
      "plansTitle": "Rencana",
      "plansBody": "Pilih paket dan selesaikan pembayaran melalui akun toko Anda.",
      "noPlans": "Tidak ditemukan paket yang dapat dibeli untuk platform ini.",
      "planTopup": "Isi ulang bulanan: +{{basic}} dasar · +{{advanced}} lanjutan",
      "planCaps": "Batas: {{basicCap}} dasar · {{advancedCap}} lanjutan",
      "priceLabel": "Harga: {{price}}",
      "buyNow": "Beli sekarang",
      "privacyPolicy": "Privacy Policy",
      "termsOfUse": "Terms of Use",
      "manageSubscription": "Manage Subscription",
      "buying": "Memproses pembelian...",
      "purchaseCanceled": "Pembelian dibatalkan.",
      "purchaseApplied": "{{sku}} berhasil diaktifkan.",
      "alreadyOwnedRestoring": "Item ini sudah dimiliki. Memulihkan pembelian Anda...",
      "restorePurchases": "Pulihkan pembelian",
      "restoring": "Memulihkan pembelian...",
      "restoreNoPurchases": "Tidak ada pembelian yang ditemukan untuk dipulihkan.",
      "restoreNoApplicablePurchases": "Tidak ada pembelian yang dapat dipulihkan yang dapat diterapkan.",
      "restoreApplied": "{{count}} pembelian dipulihkan dan diverifikasi.",
      "status": {
        "none": "Tidak berlangganan",
        "pending": "Tertunda",
        "active": "Aktif",
        "expired": "Kedaluwarsa",
        "canceled": "Dibatalkan",
        "refunded": "Dikembalikan"
      },
      "errors": {
        "unauthorized": "Sesi Anda telah berakhir. Silakan masuk lagi.",
        "cannotConnect": "Tidak dapat menjangkau server. Periksa koneksi Anda dan coba lagi.",
        "forbidden": "Pembelian ini tidak dapat diterapkan untuk akun Anda.",
        "generic": "Permintaan penagihan gagal. Silakan coba lagi.",
        "purchaseFailed": "Pembelian gagal. Silakan coba lagi.",
        "alreadyOwned": "Item ini sudah dimiliki di akun ini.",
        "invalidReceipt": "Resi toko tidak dapat divalidasi.",
        "iapUnavailable": "Layanan pembelian di toko saat ini tidak tersedia di perangkat ini."
      },
      "accessibility": {
        "goBack": "Kembali",
        "buyPlan": "Beli paket {{plan}}",
        "restorePurchases": "Kembalikan pembelian sebelumnya",
        "refresh": "Segarkan status penagihan dan langganan"
      },
      "desktop": {
        "subtitle": "Lihat saldo Anda saat ini di sini. Pembelian baru dan perubahan langganan berlanjut di perangkat seluler.",
        "desktopBadge": "Tampilan desktop",
        "phoneOnlyBadge": "Telepon untuk pembelian",
        "balanceTitle": "Saldo Anda saat ini",
        "balanceBody": "Desktop membuat kredit dan status langganan Anda tetap terlihat, sehingga Anda dapat memeriksa akun Anda sebelum melanjutkan alur pembelajaran.",
        "basicAvailable": "Kredit dasar",
        "advancedAvailable": "Kredit lanjutan",
        "freeCredits": "Bebas",
        "paidCredits": "Dibayar",
        "noPlanBody": "Akun ini tidak memiliki paket penagihan seluler yang aktif saat ini. Anda masih dapat menggunakan kredit apa pun yang sudah tersedia di sini.",
        "mobileTitle": "Lanjutkan pembelian di ponsel Anda",
        "mobileBody": "Pembelian kredit dan perubahan langganan diselesaikan di dalam aplikasi seluler dengan akun App Store atau Google Play Anda.",
        "storeLabel": "Toko: {{store}}",
        "renewsOn": "Diperbarui pada {{date}}",
        "expiresOn": "Berakhir pada {{date}}",
        "updatedOn": "Sinkronisasi terakhir: {{date}}",
        "stepOpenPhone": "Buka VocOrbit di ponsel Anda dengan akun yang sama.",
        "stepOpenBilling": "Buka Profil > Penagihan & Kredit.",
        "stepFinishPurchase": "Beli kredit atau kelola langganan Anda di sana, lalu kembali ke sini dan segarkan.",
        "mobileHint": "Saldo kredit Anda diperbarui di sini setelah pembelian seluler diterapkan ke akun yang sama."
      }
    },
    "weeklyAnalytics": {
      "title": "Analisis Mingguan",
      "modeAll": "Semua",
      "modeBasic": "Dasar",
      "modeAdvanced": "Lanjutan",
      "loading": "Memuat analisis mingguan...",
      "summaryTitle": "Ringkasan (7 hari)",
      "sessions": "Sesi",
      "completed": "Selesai",
      "answered": "Dijawab",
      "accuracy": "Akurasi",
      "activeDays": "Hari-hari aktif",
      "streak": "coretan",
      "dailyTrend": "Tren harian",
      "byQuestionType": "Berdasarkan jenis pertanyaan",
      "byMode": "Berdasarkan modus",
      "weakItems": "Barang lemah",
      "noWeakItems": "Tidak ada kata-kata lemah yang ditemukan minggu ini.",
      "weakItemMeta": "Salah: {{wrongAnswers}} · Akurasi: {{accuracyPercent}}%",
      "questionTypeMeaningMatch": "Artinya cocok",
      "questionTypeGuessWord": "Tebak kata",
      "questionTypeFillInGap": "Isi celahnya",
      "questionTypeMatchSynonym": "Sinonim yang cocok",
      "errors": {
        "unauthorized": "Sesi Anda mungkin telah kedaluwarsa. Silakan masuk lagi.",
        "cannotConnect": "Tidak dapat menjangkau server. Periksa koneksi Anda dan coba lagi.",
        "loadFailed": "Tidak dapat memuat analisis mingguan. Silakan coba lagi."
      },
      "accessibility": {
        "goBack": "Kembali",
        "filterByMode": "Filter berdasarkan {{mode}}",
        "retry": "Coba lagi permintaan analitik"
      }
    },
    "detail": {
      "closeDetails": "Tutup detail kata",
      "loadingDetail": "Memuat detail kata...",
      "detailLoadFailedTitle": "Tidak dapat memuat detail",
      "statusLearned": "dipelajari",
      "statusActive": "aktif",
      "markAsLearned": "Tandai sebagai telah dipelajari",
      "moveBackToActive": "Pindah kembali ke aktif",
      "buyAdvancedCredits": "Beli kredit lanjutan",
      "buyBasicCredits": "Beli kredit dasar",
      "buyCredits": "Beli kredit",
      "whyThisSense": "Mengapa perasaan ini",
      "examples": "Contoh",
      "synonyms": "Sinonim",
      "antonyms": "Antonim",
      "collocations": "Kolokasi",
      "alternativeMeanings": "Arti alternatif",
      "usageNotes": "Catatan penggunaan",
      "noSynonyms": "Belum ada data sinonim.",
      "stats": "Statistik",
      "encountersAndLastMode": "Pertemuan: {{encounters}} | Modus terakhir: {{mode}}",
      "nextReminder": "Pengingat berikutnya",
      "currentPlan": "Paket saat ini: {{due}}",
      "reviewHint": "Lupa: +10 menit, Keras: +1 jam, Baik: bertambah dari +1 hari.",
      "runAdvanced": "Jalankan analisis lanjutan",
      "reviewForgot": "Lupa",
      "reviewHard": "Keras",
      "reviewGood": "Bagus",
      "reviewOptionAccessibility": "{{title}} dipilih. Ulasan selanjutnya di {{delay}}.",
      "repeatUnscheduled": "Tidak dijadwalkan",
      "repeatNow": "Sekarang",
      "repeatAfterMinutes": "{{count}} mnt",
      "repeatAfterHours": "{{count}} jam",
      "repeatAfterDays": "{{count}} hari",
      "repeatAfterWeeks": "{{count}} minggu",
      "repeatInMinutes": "dalam {{count}} mnt",
      "repeatInHours": "dalam {{count}} jam",
      "repeatInDays": "dalam {{count}} hari",
      "repeatInWeeks": "dalam {{count}} minggu",
      "repeatNotificationTitle": "Waktu peninjauan: {{word}}",
      "repeatNotificationBody": "Tinjau kata {{word}}.",
      "reportIssue": "Laporkan arti yang salah",
      "reportIssueAccessibility": "Laporkan arti yang salah untuk {{word}}",
      "deleteWord": "Hapus kata",
      "deleteWordAccessibility": "Hapus sementara {{word}}",
      "deleteConfirmTitle": "Hapus kata ini?",
      "deleteConfirmBody": "\"{{word}}\" akan dihapus dari daftar Anda. Anda dapat menambahkannya lagi nanti.",
      "deleteConfirmCancel": "Batalkan",
      "deleteConfirmAction": "Ya, hapus"
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
      "title": "Arti laporan",
      "subtitle": "Jika \"{{word}}\" terlihat salah dalam konteks ini, beri tahu kami apa yang salah.",
      "messageLabel": "Apa yang tampaknya salah?",
      "messagePlaceholder": "Contoh: Makna ini tidak sesuai dengan kalimat. Itu harus menggambarkan komunikasi, bukan lokasi.",
      "charactersLeft": "{{count}} karakter tersisa",
      "submit": "Kirim laporan",
      "successTitle": "Laporan terkirim",
      "successBody": "Terima kasih atas tanggapannya. Kami akan meninjau item ini.",
      "backToDetail": "Kembali ke detail kata",
      "errors": {
        "unauthorized": "Sesi Anda telah berakhir. Silakan masuk lagi.",
        "cannotConnect": "Tidak dapat menjangkau server. Periksa koneksi Anda dan coba lagi.",
        "itemNotFound": "Item kata tidak dapat ditemukan.",
        "submitFailed": "Tidak dapat mengirimkan laporan. Silakan coba lagi."
      },
      "accessibility": {
        "goBack": "Kembali",
        "submit": "Kirim laporan masalah",
        "backToDetail": "Kembali ke detail kata"
      }
    },
    "capture": {
      "backButton": "Perpustakaan",
      "headerTitle": "Tambahkan kata",
      "headerBody": "Tempelkan kalimat dan pilih kata yang ingin Anda simpan.",
      "seedWordLabel": "Mencari: {{word}}",
      "pasteHero": {
        "title": "Tempel teks yang disalin",
        "body": "Salin kalimat atau paragraf, lalu tempelkan untuk membuka alat pilih.",
        "bodyWithWord": "Salin kalimat yang menyertakan \"{{word}}\", lalu tempelkan untuk membuka alat pilih.",
        "hint": "Pemilih terbuka secara otomatis setelah ditempel."
      },
      "picker": {
        "title": "Pilih kata dalam teks",
        "body": "Klik kata persisnya di bawah. Tempel lagi jika Anda menyalin kalimat yang berbeda.",
        "badge": "Pemilih kata",
        "hint": "VocOrbit membuat kartu kata secara otomatis dari pencarian ini."
      },
      "status": {
        "pasteFirst": "Tempel teks yang disalin untuk memulai.",
        "selectedWord": "Kata yang dipilih: {{word}}",
        "seedWordMissing": "Tempelkan kalimat dengan \"{{word}}\" atau pilih kata lain di bawah.",
        "selectWord": "Klik kata yang tepat di bawah untuk melanjutkan."
      },
      "actions": {
        "pasteCopiedText": "Tempel teks yang disalin",
        "pasteAgain": "Tempel lagi",
        "clear": "Jernih",
        "readingClipboard": "Membaca papan klip...",
        "reading": "Membaca...",
        "analyzeAndSave": "Analisis dan simpan",
        "loadingMeaning": "Mendapatkan makna dasar...",
        "openSavedWord": "Buka kata yang disimpan",
        "backToLibrary": "Kembali ke perpustakaan",
        "pickAnotherWord": "Pilih kata lain"
      },
      "loading": {
        "title": "Menjalankan wawasan dasar",
        "body": "VocOrbit mencocokkan kata yang dipilih dengan kalimat ini."
      },
      "result": {
        "title": "Arti dasar",
        "savedFallback": "Disimpan ke perpustakaan Anda.",
        "contextMeaning": "Arti konteks",
        "whyThisMeaning": "Mengapa ini berarti"
      },
      "problems": {
        "clipboardUnavailableTitle": "Papan klip tidak tersedia",
        "clipboardUnavailableBody": "Akses papan klip diblokir dalam konteks browser ini. Tempelkan kalimat secara manual.",
        "contextRequiredTitle": "Diperlukan konteks",
        "contextRequiredBody": "Tempelkan kalimat atau paragraf pendek sebelum memilih kata.",
        "selectWordTitle": "Pilih sebuah kata dalam teks",
        "selectWordBody": "Klik kata yang tepat di dalam blok teks sebelum menjalankan pencarian.",
        "signInRequiredTitle": "Diperlukan masuk",
        "signInRequiredBody": "Sesi Anda telah berakhir. Buka VocOrbit lagi dan masuk sebelum mencoba lagi pencarian ini.",
        "basicCreditsRequiredTitle": "Diperlukan kredit dasar",
        "basicCreditsRequiredBody": "Akun Anda tidak dapat menjalankan pencarian dasar saat ini.",
        "requestTimedOutTitle": "Waktu permintaan habis",
        "requestTimedOutBody": "Pencariannya memakan waktu terlalu lama. Coba lagi dengan kalimat yang sama.",
        "connectionProblemTitle": "Masalah koneksi",
        "connectionProblemBody": "VocOrbit tidak dapat menjangkau server. Periksa koneksi Anda dan coba lagi.",
        "lookupFailedTitle": "Pencarian gagal",
        "lookupFailedBody": "VocOrbit tidak dapat menyelesaikan permintaan wawasan ini.",
        "lookupIncompleteTitle": "Pencarian tidak lengkap",
        "lookupIncompleteBody": "VocOrbit mengembalikan respons yang tidak terduga. Coba lagi sekali lagi."
      }
    }
  }
}

export default id
