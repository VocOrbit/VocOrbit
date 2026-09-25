import { describe, expect, it } from "bun:test";
import { parseModelOutput } from "./output-parser";

describe("word insight output parser hardening", () => {
  it("rejects wrapped markdown/json outputs", () => {
    expect(() =>
      parseModelOutput(
        "```json\n{\"lemma\":\"bank\",\"partOfSpeech\":\"noun\",\"meaning\":\"banka\",\"shortExplanation\":\"x\"}\n```",
        { mode: "basic" },
      ),
    ).toThrow("invalid_model_json_output");
  });

  it("rejects schema-incomplete payloads", () => {
    expect(() => parseModelOutput('{"meaning":"banka"}', { mode: "basic" })).toThrow(
      "model_output_schema_violation",
    );
  });

  it("sanitizes html-like model content", () => {
    const parsed = parseModelOutput(
      JSON.stringify({
        lemma: "<b>bank</b>",
        partOfSpeech: "<i>noun</i>",
        definitionL2: "[[SL]] <i>a financial institution</i>",
        meaning: "[[TL]] <img src=x onerror=alert(1)>banka",
        shortExplanation: "[[TL]] <script>alert(1)</script>Bağlama göre finans kurumu.",
        exampleSentence: "[[SL]] I went to the <b>bank</b> yesterday.",
        translatedExample: "[[TL]] Dun <a href='x'>bankaya</a> gittim.",
        synonyms: ["[[SL]] <b>financial institution</b>", "[[SL]] financial institution"],
        antonyms: ["[[SL]] <i>debtor</i>"],
        collocations: ["[[SL]] open a <b>bank</b> account"],
        usageNotes: ["[[TL]] <script>x</script>Formal yazida sik kullanilir."],
        alternativeMeanings: ["[[SL]] nehir kiyisi"],
      }),
      { mode: "advanced" },
    );

    expect(parsed.lemma).toBe("bank");
    expect(parsed.partOfSpeech).toBe("noun");
    expect(parsed.meaning).toBe("banka");
    expect(parsed.shortExplanation).toContain("Bağlama göre");
    expect(parsed.exampleSentence).not.toContain("<");
    expect(parsed.translatedExample).not.toContain("<");
    expect(parsed.synonyms).toEqual(["financial institution"]);
  });

  it("requires richer fields in advanced mode", () => {
    expect(() =>
      parseModelOutput(
        JSON.stringify({
          lemma: "bank",
        partOfSpeech: "noun",
        meaning: "banka",
        shortExplanation: "Bağlamdan çıkarıldı.",
        synonyms: ["bank"],
        exampleSentence: "I went to the bank.",
        translatedExample: "Bankaya gittim.",
      }),
      { mode: "advanced" },
    ),
  ).toThrow("model_output_schema_violation");
  });

  it("accepts advanced payload with alias keys", () => {
    const parsed = parseModelOutput(
      JSON.stringify({
        baseForm: "stand",
        wordType: "verb",
        sourceDefinition: "[[SL]] to keep a stable position in context",
        translation: "[[TL]] durmak",
        explanation: "[[TL]] Bu baglamda bir durus ifade eder.",
        example: "[[SL]] The organization stood united in its response.",
        exampleTranslation: "[[TL]] Kurum yanitinda birlik icinde durdu.",
        similarWords: ["[[SL]] remain", "[[SL]] stay", "[[SL]] persist"],
        opposites: ["[[SL]] fall back", "[[SL]] retreat"],
        commonCollocations: ["[[SL]] stand firm", "[[SL]] stand together"],
        notes: ["[[TL]] Genelde figuratif dayanisma baglaminda kullanilir."],
        otherMeanings: ["[[SL]] ayakta olmak", "[[SL]] resmi olarak konumlanmak"],
      }),
      { mode: "advanced" },
    );

    expect(parsed.lemma).toBe("stand");
    expect(parsed.partOfSpeech).toBe("verb");
    expect(parsed.translationL1).toBe("durmak");
    expect(parsed.shortExplanation).toContain("durus");
    expect(parsed.exampleSentence).toContain("stood united");
    expect(parsed.translatedExample).toContain("birlik");
    expect(parsed.synonyms).toEqual(["remain", "stay", "persist"]);
    expect(parsed.details).toEqual({
      antonyms: ["fall back", "retreat"],
      collocations: ["stand firm", "stand together"],
      usageNotes: ["Genelde figuratif dayanisma baglaminda kullanilir."],
      alternativeMeanings: ["ayakta olmak", "resmi olarak konumlanmak"],
    });
  });

  it("rescues valid json object wrapped in extra plain text", () => {
    const parsed = parseModelOutput(
      `Result:\n{"lemma":"stand","partOfSpeech":"verb","definitionL2":"[[SL]] to keep a stable position in context","meaning":"[[TL]] durmak","shortExplanation":"[[TL]] baglamda dayanisma ifade eder"}\nEnd.`,
      { mode: "basic" },
    );

    expect(parsed.lemma).toBe("stand");
    expect(parsed.partOfSpeech).toBe("verb");
    expect(parsed.meaning).toBe("durmak");
  });

  it("rejects outputs that do not include source-language definition", () => {
    expect(() =>
      parseModelOutput(
        JSON.stringify({
          lemma: "stand",
          partOfSpeech: "verb",
          meaning: "durmak",
          shortExplanation: "Bu baglamda dayanisma anlamindadir.",
        }),
        { mode: "basic" },
      ),
    ).toThrow("model_output_schema_violation");
  });

  it("rejects payloads that miss required language markers", () => {
    expect(() =>
      parseModelOutput(
        JSON.stringify({
          lemma: "stand",
          partOfSpeech: "verb",
          definitionL2: "to keep a stable position",
          meaning: "durmak",
          shortExplanation: "Baglamdan secildi.",
        }),
        { mode: "basic" },
      ),
    ).toThrow("model_output_language_marker_violation");
  });

  it("rejects advanced payloads when source-language fields look like target language", () => {
    expect(() =>
      parseModelOutput(
        JSON.stringify({
          lemma: "bank",
          partOfSpeech: "noun",
          definitionL2: "[[SL]] a financial institution",
          sourceMeaning: "[[SL]] a financial institution",
          meaning: "[[TL]] banka",
          shortExplanation: "[[TL]] Baglamda finans kurumu.",
          exampleSentence: "[[SL]] Bu kurum hayatta kalmak icin kuruldu.",
          translatedExample: "[[TL]] Bu kurum hayatta kalmak icin kuruldu.",
          synonyms: ["[[SL]] canli", "[[SL]] var olan"],
          antonyms: ["[[SL]] olu"],
          collocations: ["[[SL]] canli kalmak"],
          alternativeMeanings: ["[[SL]] nehir kiyisi"],
        }),
        { mode: "advanced", sourceLang: "en", targetLang: "tr" },
      ),
    ).toThrow("model_output_language_violation");
  });

  it("rejects advanced payloads that miss pedagogical detail lists", () => {
    expect(() =>
      parseModelOutput(
        JSON.stringify({
          lemma: "stand",
          partOfSpeech: "verb",
          meaning: "durmak",
          shortExplanation: "Bu baglamda dayanisma anlamindadir.",
          exampleSentence: "They stood with all allies.",
          translatedExample: "Tum muttefiklerin yaninda durdular.",
          synonyms: ["remain", "support"],
        }),
        { mode: "advanced" },
      ),
    ).toThrow("model_output_schema_violation");
  });
});
