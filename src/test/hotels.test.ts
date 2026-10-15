import { describe, expect, it } from "vitest";
import { DEFAULT_HOTEL, getHotel, isSupportedHotel } from "@/lib/habbo/hotels";
import { viaBrowserThenServer } from "@/lib/habbo/queries";

describe("hotel selection", () => {
  it.each(["br", "com", "es", "de", "fr", "it", "nl", "fi", "tr"])("enables hotel %s", (id) => {
    expect(isSupportedHotel(id)).toBe(true);
  });
  it("keeps Brazil as the initial hotel", () => {
    expect(DEFAULT_HOTEL).toBe("br");
    expect(getHotel("br")?.domain).toBe("www.habbo.com.br");
  });
  it("rejects unknown hotels", () => expect(isSupportedHotel("unknown")).toBe(false));
});

describe("browser-first fallback", () => {
  const server = async () => ({ ok: true as const, data: "server" });
  it("falls back to server when blocked", async () => {
    const r = await viaBrowserThenServer(async () => ({ ok: false, error: { kind: "blocked", message: "x" } }), server, true);
    expect(r).toEqual({ ok: true, data: "server" });
  });
  it("does not fall back on not_found", async () => {
    const r = await viaBrowserThenServer<string>(async () => ({ ok: false, error: { kind: "not_found", message: "x" } }), server, true);
    expect(r.ok).toBe(false);
  });
});
