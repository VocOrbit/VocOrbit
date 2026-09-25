import { Elysia } from "elysia";

function isOpenApiPath(pathname: string): boolean {
  return pathname === "/openapi" || pathname.startsWith("/openapi/");
}

export function createSecurityHeadersPlugin(nodeEnv: string) {
  return new Elysia({ name: "security-headers" })
    .onBeforeHandle(({ set, request }) => {
      const pathname = new URL(request.url).pathname;

      set.headers["x-content-type-options"] = "nosniff";
      set.headers["x-frame-options"] = "DENY";
      set.headers["referrer-policy"] = "no-referrer";
      set.headers["permissions-policy"] = "geolocation=(), microphone=(), camera=()";
      if (!isOpenApiPath(pathname)) {
        set.headers["content-security-policy"] = "default-src 'none'";
      }

      if (nodeEnv === "production") {
        set.headers["strict-transport-security"] = "max-age=15552000; includeSubDomains";
      }
    })
    .as("global");
}
