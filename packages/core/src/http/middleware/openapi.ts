import { openapi } from "@elysiajs/openapi";

type OpenApiPluginOptions = {
  path?: string;
};

export function createOpenApiPlugin(options: OpenApiPluginOptions = {}) {
  return openapi({
    path: options.path ?? "/openapi",
    exclude: {
      paths: ["/metrics"],
    },
    documentation: {
      info: {
        title: "Elysia Moduler Monolith API",
        version: "1.0.0",
        description: "Auto-generated API schema and docs.",
      },
      tags: [
        { name: "System", description: "Health and service endpoints" },
        { name: "Auth", description: "Authentication endpoints" },
        { name: "Users", description: "Users module endpoints" },
        { name: "Billing", description: "In-app purchase and subscription endpoints" },
        { name: "AI", description: "AI-assisted language endpoints" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Local access token issued by /v1/auth/firebase/sign-in",
          },
        },
      },
    },
  });
}
