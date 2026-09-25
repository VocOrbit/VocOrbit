import { Elysia } from "elysia";
import { newId } from "../../ids";
import { mapError } from "../errors";
import { fail } from "../response";

export function createErrorHandlerPlugin() {
  return new Elysia({ name: "error-handler" })
    .onError(({ error, code, set, request }) => {
      const appError = mapError(error, typeof code === "string" ? code : undefined);
      const requestId =
        (set.headers["x-request-id"] as string | undefined) ??
        request.headers.get("x-request-id") ??
        newId();
      set.status = appError.status;
      set.headers["x-request-id"] = requestId;
      return fail(appError.code, appError.message, requestId, appError.details);
    })
    .as("global");
}
