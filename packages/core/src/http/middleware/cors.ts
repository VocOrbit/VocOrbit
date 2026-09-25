import cors from "@elysiajs/cors";

export function createCorsPlugin(origins: string[]) {
  return cors({
    origin: (request) => {
      const origin = request.headers.get("origin");
      if (!origin) return false;
      if (origins.length === 0) return false;
      return origins.includes(origin);
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization", "x-request-id"],
    maxAge: 600,
  }).as("global");
}
