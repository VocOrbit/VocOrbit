type MockSpeechOptions = {
  language?: string
  voice?: string
  onStart?: () => void
  onDone?: () => void
  onStopped?: () => void
  onError?: (error: Error) => void
}

let mockGetAvailableVoicesAsync: jest.Mock
let mockSpeak: jest.Mock
let mockStop: jest.Mock
let mockSetAudioModeAsync: jest.Mock

function configureExpoSpeechMock() {
  jest.doMock("expo-speech", () => ({
    VoiceQuality: {
      Default: "Default",
      Enhanced: "Enhanced",
    },
    getAvailableVoicesAsync: mockGetAvailableVoicesAsync,
    speak: mockSpeak,
    stop: mockStop,
    maxSpeechInputLength: 4000,
  }))
  jest.doMock("expo-audio", () => ({
    setAudioModeAsync: mockSetAudioModeAsync,
  }))
}

function loadPronunciationService(): typeof import("./pronunciationService") {
  return require("./pronunciationService")
}

beforeEach(() => {
  jest.resetModules()
  mockGetAvailableVoicesAsync = jest.fn()
  mockSpeak = jest.fn()
  mockStop = jest.fn().mockResolvedValue(undefined)
  mockSetAudioModeAsync = jest.fn().mockResolvedValue(undefined)
  configureExpoSpeechMock()
})

test("retries voice fetch and succeeds on second attempt", async () => {
  mockGetAvailableVoicesAsync
    .mockRejectedValueOnce(new Error("temporary voice fetch failure"))
    .mockResolvedValueOnce([
      {
        identifier: "en-us-enhanced",
        name: "Samantha",
        quality: "Enhanced",
        language: "en-US",
      },
    ])
  mockSpeak.mockImplementation((_word: string, options: MockSpeechOptions) => {
    options.onStart?.()
  })

  const { speakWord } = loadPronunciationService()
  const result = await speakWord({ word: "hello", sourceLang: "en-us" })

  expect(result).toBe("started")
  expect(mockGetAvailableVoicesAsync).toHaveBeenCalledTimes(2)
})

test("prefers enhanced voice when locale match is equal", async () => {
  mockGetAvailableVoicesAsync.mockResolvedValue([
    {
      identifier: "en-us-default",
      name: "Ava",
      quality: "Default",
      language: "en-US",
    },
    {
      identifier: "en-us-enhanced",
      name: "Ava Premium",
      quality: "Enhanced",
      language: "en-US",
    },
  ])
  mockSpeak.mockImplementation((_word: string, options: MockSpeechOptions) => {
    options.onStart?.()
  })

  const { speakWord } = loadPronunciationService()
  await speakWord({ word: "orbit", sourceLang: "en-us" })

  const firstSpeakOptions = mockSpeak.mock.calls[0]?.[1] as MockSpeechOptions | undefined
  expect(firstSpeakOptions?.voice).toBe("en-us-enhanced")
})

test("does not use fallback language when strict fallback mode is active", async () => {
  mockGetAvailableVoicesAsync.mockResolvedValue([
    {
      identifier: "tr-tr-default",
      name: "Yelda",
      quality: "Default",
      language: "tr-TR",
    },
  ])
  mockSpeak.mockImplementation((_word: string, options: MockSpeechOptions) => {
    if (options.language === "tr-tr") {
      options.onStart?.()
      return
    }
    options.onError?.(new Error("unsupported locale"))
  })

  const { speakWord } = loadPronunciationService()
  const result = await speakWord({
    word: "hello",
    sourceLang: "en-us",
    fallbackLang: "tr-tr",
  })

  const attemptedLanguages = mockSpeak.mock.calls.map(
    (_call: unknown[]) => (_call[1] as MockSpeechOptions | undefined)?.language,
  )
  expect(result).toBe("failed")
  expect(attemptedLanguages).toContain("en-us")
  expect(attemptedLanguages).toContain("en")
  expect(attemptedLanguages).not.toContain("tr-tr")
})

test("uses fallback language only when explicitly enabled", async () => {
  mockGetAvailableVoicesAsync.mockResolvedValue([
    {
      identifier: "tr-tr-default",
      name: "Yelda",
      quality: "Default",
      language: "tr-TR",
    },
  ])
  mockSpeak.mockImplementation((_word: string, options: MockSpeechOptions) => {
    const normalizedLanguage = options.language?.toLocaleLowerCase("en-US")
    if (normalizedLanguage === "tr-tr") {
      options.onStart?.()
      return
    }
    options.onError?.(new Error("unsupported locale"))
  })

  const { speakWord } = loadPronunciationService()
  const result = await speakWord({
    word: "hello",
    sourceLang: "en-us",
    fallbackLang: "tr-tr",
    allowLanguageFallback: true,
  })

  const attemptedLanguages = mockSpeak.mock.calls.map((_call: unknown[]) =>
    (_call[1] as MockSpeechOptions | undefined)?.language?.toLocaleLowerCase("en-US"),
  )
  expect(result).toBe("started")
  expect(attemptedLanguages).toContain("tr-tr")
})

test("clears cached voices when requested", async () => {
  mockGetAvailableVoicesAsync.mockResolvedValue([
    {
      identifier: "en-us-default",
      name: "Ava",
      quality: "Default",
      language: "en-US",
    },
  ])
  mockSpeak.mockImplementation((_word: string, options: MockSpeechOptions) => {
    options.onStart?.()
  })

  const { speakWord, clearPronunciationVoiceCache } = loadPronunciationService()

  await speakWord({ word: "hello", sourceLang: "en-us" })
  await speakWord({ word: "world", sourceLang: "en-us" })
  expect(mockGetAvailableVoicesAsync).toHaveBeenCalledTimes(1)

  clearPronunciationVoiceCache()
  await speakWord({ word: "again", sourceLang: "en-us" })
  expect(mockGetAvailableVoicesAsync).toHaveBeenCalledTimes(2)
})
