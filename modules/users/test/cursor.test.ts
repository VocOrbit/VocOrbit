import { describe, expect, it } from "bun:test";
import { ValidationError } from "../../../packages/core/src/errors";
import { decodeCursor, encodeCursor } from "../src/mapper";

const cursor = { createdAt: new Date().toISOString(), id: "abc" };

describe("cursor encoding", () => {
  it("round trips cursor", () => {
    const encoded = encodeCursor(cursor);
    const decoded = decodeCursor(encoded);
    expect(decoded).toEqual(cursor);
  });

  it("throws on invalid cursor", () => {
    expect(() => decodeCursor("bad")).toThrow(ValidationError);
  });
});
