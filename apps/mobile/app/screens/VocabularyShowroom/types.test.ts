import { applyWordInsightToEntryDetail, type VocabularyEntryDetail } from "./types"

function createDetail(): VocabularyEntryDetail {
  return {
    entry: {
      id: "item-1",
      word: "bank",
      pronunciation: "bank",
      partOfSpeech: "",
      definition: "banka",
      example: "I deposited cash at the bank.",
      contextSentence: "I deposited cash at the bank.",
      status: "active",
      lemma: "bank",
      sourceLang: "en",
      targetLang: "tr",
      encounterCount: 1,
      lastSeenMode: "basic",
      lastLookupAt: "2026-01-01T00:00:00.000Z",
      isFavorite: false,
    },
    contextSentence: "I deposited cash at the bank.",
    learningDefinition: "financial institution",
    nativeMeaning: "banka",
    sentence: "I deposited cash at the bank.",
    synonyms: [],
    alternativeMeanings: [],
    antonyms: [],
    usageNotes: [],
    collocations: [],
    confidence: 0.5,
    meaning: "banka",
    shortExplanation: "A place that handles money.",
  }
}

test("applies completed advanced word insight to vocabulary detail", () => {
  const detail = applyWordInsightToEntryDetail(createDetail(), {
    mode: "advanced",
    sentence: "The river bank overflowed after the storm.",
    selectedWord: "bank",
    insight: {
      word: "bank",
      lemma: "bank",
      phonetic: "/baenk/",
      sourceLang: "en",
      targetLang: "tr",
      partOfSpeech: "noun",
      definitionL2: "The land alongside a river.",
      translationL1: "nehir kiyisi",
      whyThisSense: "The sentence mentions a river, so this is the land beside water.",
      exampleSentence: "The river bank was muddy.",
      translatedExample: "Nehir kiyisi camurluydu.",
      synonyms: ["shore", "riverside"],
      confidence: 0.93,
      details: {
        collocations: ["river bank", "steep bank"],
        alternativeMeanings: ["financial institution"],
        antonyms: ["middle of the river"],
        usageNotes: ["Common with river, stream, and canal."],
      },
    },
  })

  expect(detail.entry.lastSeenMode).toBe("advanced")
  expect(detail.entry.partOfSpeech).toBe("noun")
  expect(detail.meaning).toBe("nehir kiyisi")
  expect(detail.shortExplanation).toContain("river")
  expect(detail.synonyms).toEqual(["shore", "riverside"])
  expect(detail.collocations).toEqual(["river bank", "steep bank"])
  expect(detail.alternativeMeanings).toEqual(["financial institution"])
  expect(detail.confidence).toBe(0.93)
})
