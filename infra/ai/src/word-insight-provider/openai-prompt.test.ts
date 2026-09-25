import { describe, expect, it } from "bun:test";
import { buildOpenAiMessages, buildOpenAiResponseFormat } from "./openai-prompt";

describe("openai response format hardening", () => {
  it("uses strict json schema response format for basic mode", () => {
    const format = buildOpenAiResponseFormat("basic");
    expect(format.type).toBe("json_schema");
    expect(format.json_schema.strict).toBe(true);
    expect(Array.isArray(format.json_schema.schema.required)).toBe(true);
    expect(format.json_schema.schema.required).toContain("lemma");
    expect(format.json_schema.schema.required).toContain("meaning");
    expect(format.json_schema.schema.required).not.toContain("sourceMeaning");
    expect(format.json_schema.schema.additionalProperties).toBe(false);

    const properties = format.json_schema.schema.properties as Record<string, unknown>;
    expect(properties.sourceMeaning).toBeUndefined();
    expect(properties.exampleSentence).toBeUndefined();
    expect(properties.synonyms).toBeUndefined();
  });

  it("uses richer schema fields for advanced mode", () => {
    const format = buildOpenAiResponseFormat("advanced");
    expect(format.type).toBe("json_schema");
    expect(format.json_schema.strict).toBe(true);
    expect(format.json_schema.schema.required).toContain("sourceMeaning");
    expect(format.json_schema.schema.required).toContain("exampleSentence");
    expect(format.json_schema.schema.required).toContain("translatedExample");
    expect(format.json_schema.schema.required).toContain("synonyms");
    expect(format.json_schema.schema.required).toContain("antonyms");
    expect(format.json_schema.schema.required).toContain("collocations");
    expect(format.json_schema.schema.required).toContain("alternativeMeanings");
  });

  it("describes supported regional language tags with readable language names", () => {
    const messages = buildOpenAiMessages({
      mode: "advanced",
      sentence: "I read the sign near the station.",
      selectedWord: "sign",
      sourceLang: "zh-cn",
      targetLang: "ar-eg",
      userContext: {
        id: "u1",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      },
    });

    const payload = JSON.parse(messages[1]?.content ?? "{}") as {
      input?: {
        sourceLanguageName?: string;
        targetLanguageName?: string;
      };
    };

    expect(payload.input?.sourceLanguageName).toBe("Chinese (zh)");
    expect(payload.input?.targetLanguageName).toBe("Arabic (ar)");
  });
});
