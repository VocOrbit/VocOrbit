import { Elysia } from "elysia";

type BearerAuthenticator<TSession> = {
  authenticateBearerToken(authorizationHeader: string | undefined): Promise<TSession>;
};

export function createRequireAuthPlugin<TSession>(authenticator: BearerAuthenticator<TSession>) {
  return new Elysia({ name: "api-require-auth" })
    .derive(async ({ headers }) => {
      const auth = await authenticator.authenticateBearerToken(headers.authorization);
      return { auth };
    })
    .as("global");
}
