import { describe, expect, it } from "vitest";
import { parseTelegramInitData } from "@/lib/domain/telegram";

describe("parseTelegramInitData", () => {
  it("parses query-string launch data", () => {
    const params = parseTelegramInitData(
      "query_id=abc&user=%7B%22id%22%3A123%7D&hash=test",
    );

    expect(params.get("query_id")).toBe("abc");
    expect(params.get("hash")).toBe("test");
  });
});
