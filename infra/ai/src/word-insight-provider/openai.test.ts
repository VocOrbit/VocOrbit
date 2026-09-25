import { afterEach, describe, expect, it } from "bun:test";
import type { WordInsightRequest } from "../../../../modules/word-insight/src/ports/word-insight-provider";
import { createOpenAiWordInsightProvider } from "./openai";
import { resolveWordInsightOutputTokenBudget } from "./token-budget";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("openai provider response format fallback", () => {
  it("does not persist basic response_format downgrade across requests", async () => {
    const seenTypes: string[] = [];

    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const requestPayload = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as {
        response_format?: { type?: string };
      };
      const formatType = requestPayload.response_format?.type ?? "none";
      seenTypes.push(formatType);

      if (formatType === "json_schema") {
        return new Response(
          JSON.stringify({
            error: {
              message: "Unsupported response_format for this model",
            },
          }),
          {
            status: 400,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  lemma: "stand",
                  partOfSpeech: "verb",
                  definitionL2: "[[SL]] to remain upright or keep a position in context",
                  meaning: "[[TL]] durmak",
                  shortExplanation: "[[TL]] Baglama gore dayanisma ifade eder.",
                }),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }) as unknown as typeof fetch;

    const provider = createOpenAiWordInsightProvider({
      apiKey: "test-key",
      model: "gpt-4o-mini",
    });

    const input: WordInsightRequest = {
      mode: "basic",
      sentence: "It stood firmly with all allies.",
      selectedWord: "stood",
      sourceLang: "en",
      targetLang: "tr",
      userContext: {
        id: "u1",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      },
    };

    const first = await provider.explainWord(input);
    expect(first.word).toBe("stood");

    const second = await provider.explainWord(input);
    expect(second.word).toBe("stood");

    expect(seenTypes).toEqual(["json_schema", "json_object", "json_schema", "json_object"]);
  });

  it("retries basic mode when first model output is invalid json", async () => {
    let callCount = 0;

    globalThis.fetch = (async () => {
      callCount += 1;
      if (callCount === 1) {
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: "this is not json",
                },
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  lemma: "stand",
                  partOfSpeech: "verb",
                  definitionL2: "[[SL]] to remain upright or keep a position in context",
                  meaning: "[[TL]] durmak",
                  shortExplanation: "[[TL]] Baglama gore dayanisma ifade eder.",
                }),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }) as unknown as typeof fetch;

    const provider = createOpenAiWordInsightProvider({
      apiKey: "test-key",
      model: "gpt-4o-mini",
    });

    const input: WordInsightRequest = {
      mode: "basic",
      sentence: "It stood firmly with all allies.",
      selectedWord: "stood",
      sourceLang: "en",
      targetLang: "tr",
      userContext: {
        id: "u1",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      },
    };

    const result = await provider.explainWord(input);
    expect(result.word).toBe("stood");
    expect(result.meaning).toBe("durmak");
    expect(callCount).toBe(2);
  });

  it("uses larger output token budgets for multilingual basic and advanced responses", async () => {
    const seenMaxTokens: number[] = [];

    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const requestPayload = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as {
        max_tokens?: number;
      };
      seenMaxTokens.push(requestPayload.max_tokens ?? 0);
      const isAdvanced =
        requestPayload.max_tokens === resolveWordInsightOutputTokenBudget("advanced").initial;

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify(
                  isAdvanced
                    ? {
                        lemma: "bank",
                        partOfSpeech: "noun",
                        definitionL2: "[[SL]] a financial institution that manages money",
                        sourceMeaning: "[[SL]] a financial institution that manages money",
                        meaning: "[[TL]] banka",
                        shortExplanation: "[[TL]] Baglama gore finans kurumu.",
                        exampleSentence: "[[SL]] I went to the bank yesterday.",
                        translatedExample: "[[TL]] Dun bankaya gittim.",
                        synonyms: ["[[SL]] financial institution"],
                        antonyms: ["[[SL]] debtor"],
                        collocations: ["[[SL]] open a bank account"],
                        usageNotes: ["[[TL]] Formal metinlerde bu anlam yaygindir."],
                        alternativeMeanings: ["[[SL]] river bank"],
                      }
                    : {
                        lemma: "stand",
                        partOfSpeech: "verb",
                        definitionL2: "[[SL]] to remain upright or keep a position in context",
                        meaning: "[[TL]] durmak",
                        shortExplanation: "[[TL]] Baglama gore anlam secildi.",
                      },
                ),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }) as unknown as typeof fetch;

    const provider = createOpenAiWordInsightProvider({
      apiKey: "test-key",
      model: "gpt-4o-mini",
    });

    const userContext = {
      id: "u1",
      name: "Test User",
      email: "test@example.com",
      role: "user" as const,
    };

    await provider.explainWord({
      mode: "basic",
      sentence: "It stood firmly with all allies.",
      selectedWord: "stood",
      sourceLang: "en",
      targetLang: "tr",
      userContext,
    });
    await provider.explainWord({
      mode: "advanced",
      sentence: "I went to the bank yesterday.",
      selectedWord: "bank",
      sourceLang: "en",
      targetLang: "tr",
      userContext,
    });

    expect(seenMaxTokens).toEqual([
      resolveWordInsightOutputTokenBudget("basic").initial,
      resolveWordInsightOutputTokenBudget("advanced").initial,
    ]);
  });

  it("retries advanced mode when source-language fields are generated in target language", async () => {
    let callCount = 0;

    globalThis.fetch = (async () => {
      callCount += 1;
      if (callCount === 1) {
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    lemma: "bank",
                    partOfSpeech: "noun",
                    definitionL2: "[[SL]] a financial institution",
                    sourceMeaning: "[[SL]] a financial institution",
                    meaning: "[[TL]] banka",
                    shortExplanation: "[[TL]] Baglama gore finans kurumu.",
                    exampleSentence: "[[SL]] Bu kurum hayatta kalmak icin kuruldu.",
                    translatedExample: "[[TL]] Bu kurum hayatta kalmak icin kuruldu.",
                    synonyms: ["[[SL]] canli", "[[SL]] var olan"],
                    antonyms: ["[[SL]] olu"],
                    collocations: ["[[SL]] canli kalmak"],
                    alternativeMeanings: ["[[SL]] nehir kiyisi"],
                  }),
                },
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  lemma: "bank",
                  partOfSpeech: "noun",
                  definitionL2: "[[SL]] a financial institution that manages money",
                  sourceMeaning: "[[SL]] a financial institution that manages money",
                  meaning: "[[TL]] banka",
                  shortExplanation: "[[TL]] Baglama gore finans kurumu.",
                  exampleSentence: "[[SL]] I went to the bank yesterday.",
                  translatedExample: "[[TL]] Dun bankaya gittim.",
                  synonyms: ["[[SL]] financial institution"],
                  antonyms: ["[[SL]] debtor"],
                  collocations: ["[[SL]] open a bank account"],
                  usageNotes: ["[[TL]] Formal metinlerde bu anlam yaygindir."],
                  alternativeMeanings: ["[[SL]] river bank"],
                }),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }) as unknown as typeof fetch;

    const provider = createOpenAiWordInsightProvider({
      apiKey: "test-key",
      model: "gpt-4o-mini",
    });

    const input: WordInsightRequest = {
      mode: "advanced",
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
    };

    const result = await provider.explainWord(input);
    expect(result.synonyms).toEqual(["financial institution"]);
    expect(callCount).toBe(2);
  });

  it("falls back to json_object when json_schema is rejected with 400", async () => {
    const seenTypes: string[] = [];

    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const requestPayload = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as {
        response_format?: { type?: string };
      };
      const formatType = requestPayload.response_format?.type ?? "none";
      seenTypes.push(formatType);

      if (formatType === "json_schema") {
        return new Response(
          JSON.stringify({
            error: {
              message: "Unsupported response_format for this model",
            },
          }),
          {
            status: 400,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  lemma: "bank",
                  partOfSpeech: "noun",
                  definitionL2: "[[SL]] a financial institution that manages money",
                  sourceMeaning: "[[SL]] a financial institution that manages money",
                  meaning: "[[TL]] banka",
                  shortExplanation: "[[TL]] Baglama gore finans kurumu.",
                  exampleSentence: "[[SL]] I went to the bank yesterday.",
                  translatedExample: "[[TL]] Dun bankaya gittim.",
                  synonyms: ["[[SL]] financial institution"],
                  antonyms: ["[[SL]] debtor"],
                  collocations: ["[[SL]] open a bank account"],
                  usageNotes: ["[[TL]] Formal metinlerde bu anlam yaygindir."],
                  alternativeMeanings: ["[[SL]] river bank"],
                }),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }) as unknown as typeof fetch;

    const provider = createOpenAiWordInsightProvider({
      apiKey: "test-key",
      model: "gpt-4o-mini",
    });

    const input: WordInsightRequest = {
      mode: "advanced",
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
    };

    const result = await provider.explainWord(input);
    expect(result.word).toBe("bank");
    expect(seenTypes).toEqual(["json_schema", "json_object"]);
  });

  it("falls back to no response_format when json_schema and json_object are rejected", async () => {
    const seenTypes: string[] = [];

    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const requestPayload = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as {
        response_format?: { type?: string };
      };
      const formatType = requestPayload.response_format?.type ?? "none";
      seenTypes.push(formatType);

      if (formatType === "json_schema" || formatType === "json_object") {
        return new Response(
          JSON.stringify({
            error: {
              message: "Unsupported response_format for this model",
            },
          }),
          {
            status: 400,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  lemma: "bank",
                  partOfSpeech: "noun",
                  definitionL2: "[[SL]] a financial institution that manages money",
                  sourceMeaning: "[[SL]] a financial institution that manages money",
                  meaning: "[[TL]] banka",
                  shortExplanation: "[[TL]] Baglama gore finans kurumu.",
                  exampleSentence: "[[SL]] I went to the bank yesterday.",
                  translatedExample: "[[TL]] Dun bankaya gittim.",
                  synonyms: ["[[SL]] financial institution"],
                  antonyms: ["[[SL]] debtor"],
                  collocations: ["[[SL]] open a bank account"],
                  usageNotes: ["[[TL]] Formal metinlerde bu anlam yaygindir."],
                  alternativeMeanings: ["[[SL]] river bank"],
                }),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }) as unknown as typeof fetch;

    const provider = createOpenAiWordInsightProvider({
      apiKey: "test-key",
      model: "gpt-4o-mini",
    });

    const input: WordInsightRequest = {
      mode: "advanced",
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
    };

    const result = await provider.explainWord(input);
    expect(result.word).toBe("bank");
    expect(seenTypes).toEqual(["json_schema", "json_object", "none"]);
  });

  it("does not persist advanced response_format downgrade across requests", async () => {
    const seenTypes: string[] = [];

    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const requestPayload = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as {
        response_format?: { type?: string };
      };
      const formatType = requestPayload.response_format?.type ?? "none";
      seenTypes.push(formatType);

      if (formatType === "json_schema") {
        return new Response(
          JSON.stringify({
            error: {
              message: "Unsupported response_format for this model",
            },
          }),
          {
            status: 400,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  lemma: "bank",
                  partOfSpeech: "noun",
                  definitionL2: "[[SL]] a financial institution that manages money",
                  sourceMeaning: "[[SL]] a financial institution that manages money",
                  meaning: "[[TL]] banka",
                  shortExplanation: "[[TL]] Baglama gore finans kurumu.",
                  exampleSentence: "[[SL]] I went to the bank yesterday.",
                  translatedExample: "[[TL]] Dun bankaya gittim.",
                  synonyms: ["[[SL]] financial institution"],
                  antonyms: ["[[SL]] debtor"],
                  collocations: ["[[SL]] open a bank account"],
                  usageNotes: ["[[TL]] Formal metinlerde bu anlam yaygindir."],
                  alternativeMeanings: ["[[SL]] river bank"],
                }),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }) as unknown as typeof fetch;

    const provider = createOpenAiWordInsightProvider({
      apiKey: "test-key",
      model: "gpt-4o-mini",
    });

    const input: WordInsightRequest = {
      mode: "advanced",
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
    };

    const first = await provider.explainWord(input);
    expect(first.word).toBe("bank");

    const second = await provider.explainWord(input);
    expect(second.word).toBe("bank");

    expect(seenTypes).toEqual(["json_schema", "json_object", "json_schema", "json_object"]);
  });
});
