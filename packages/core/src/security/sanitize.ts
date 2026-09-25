import sanitizeHtml from "sanitize-html";

const DEFAULT_ALLOWED_TAGS = ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"];

const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "target", "rel"],
};

const DEFAULT_ALLOWED_SCHEMES = ["http", "https", "mailto"];

export function sanitizeRichText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: DEFAULT_ALLOWED_TAGS,
    allowedAttributes: DEFAULT_ALLOWED_ATTRIBUTES,
    allowedSchemes: DEFAULT_ALLOWED_SCHEMES,
    allowedSchemesAppliedToAttributes: ["href"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

export function sanitizePlainText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}
