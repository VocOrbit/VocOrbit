import { Elysia } from "elysia";
import { newId } from "../../ids";

export const requestIdPlugin = new Elysia({ name: "request-id" })
  .derive(({ request }) => {
    const incoming = request.headers.get("x-request-id");
    const requestId = incoming && incoming.trim().length > 0 ? incoming.trim() : newId();
    return { requestId };
  })
  .onBeforeHandle(({ set, requestId }) => {
    set.headers["x-request-id"] = requestId;
  })
  .as("global");
