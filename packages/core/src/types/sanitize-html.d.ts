declare module "sanitize-html" {
  type AllowedAttributes = Record<string, string[]>;

  export type SanitizeHtmlOptions = {
    allowedTags?: string[];
    allowedAttributes?: AllowedAttributes;
    allowedSchemes?: string[];
    allowedSchemesAppliedToAttributes?: string[];
    transformTags?: Record<string, unknown>;
  };

  type SanitizeHtml = {
    (input: string, options?: SanitizeHtmlOptions): string;
    simpleTransform(tagName: string, attribs?: Record<string, string>): unknown;
  };

  const sanitizeHtml: SanitizeHtml;
  export default sanitizeHtml;
}
