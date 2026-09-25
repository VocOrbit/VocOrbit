import { describe, expect, it } from "bun:test";
import { toInsight } from "./insight-mapper";

describe("word insight mapper hardening", () => {
  it("pins output surface to selectedWord and sanitizes user-facing fields", () => {
    const insight = toInsight(
      {
        mode: "basic",
        sentence: "I went to the bank yesterday.",
        selectedWord: "bank",
        sourceLang: "en",
        targetLang: "tr",
        userContext: {
          id: "u1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
        },
      },
      {
        surface: "hacked-surface",
        lemma: "<b>bank</b>",
        partOfSpeech: "<i>noun</i>",
        meaning: "<img src=x onerror=alert(1)>banka",
        shortExplanation: "Baglama gore (provider=evil) anlam secimi.",
        exampleSentence: "I went to the <b>bank</b> yesterday.",
        translatedExample: "translated example is not available.",
        synonyms: ["<b>financial institution</b>", "financial institution", "  "],
        confidence: 7,
      },
      "openai",
      "gpt-4o-mini",
    );

    expect(insight.word).toBe("bank");
    expect(insight.surface).toBe("bank");
    expect(insight.lemma).toBe("bank");
    expect(insight.partOfSpeech).toBe("noun");
    expect(insight.meaning).toBe("banka");
    expect(insight.shortExplanation).toBe("Baglama gore anlam secimi.");
    expect(insight.exampleSentence).toBe("I went to the bank yesterday.");
    expect(insight.translatedExample).toBe("");
    expect(insight.synonyms).toEqual(["financial institution"]);
    expect(insight.confidence).toBe(1);
  });

  it("does not backfill source-language definition from target-language translation", () => {
    const insight = toInsight(
      {
        mode: "basic",
        sentence: "It stood firmly with allies.",
        selectedWord: "stood",
        sourceLang: "en",
        targetLang: "tr",
        userContext: {
          id: "u1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
        },
      },
      {
        lemma: "stand",
        partOfSpeech: "verb",
        translationL1: "durmak",
        whyThisSense: "Bu kullanım bağlamda duruş sergilemeyi anlatır.",
      },
      "openai",
      "gpt-4o-mini",
    );

    expect(insight.definitionL2).toBe("stood");
    expect(insight.sourceMeaning).toBe("stood");
    expect(insight.translationL1).toBe("durmak");
  });
});
