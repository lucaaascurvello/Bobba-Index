import { describe, expect, it } from "vitest";
import { DEFAULT_HOTEL, getHotel, isSupportedHotel } from "@/lib/habbo/hotels";

describe("validated hotel selection", () => {
  it.each([
    ["br", "www.habbo.com.br"],
    ["com", "www.habbo.com"],
    ["es", "www.habbo.es"],
    ["de", "www.habbo.de"],
    ["fr", "www.habbo.fr"],
    ["it", "www.habbo.it"],
    ["nl", "www.habbo.nl"],
    ["fi", "www.habbo.fi"],
    ["tr", "www.habbo.com.tr"],
  ])("allows selecting validated hotel %s", (id, domain) => {
    expect(isSupportedHotel(id)).toBe(true);
    expect(getHotel(id)?.domain).toBe(domain);
  });

  it("keeps Brazil as the initial hotel", () => {
    expect(DEFAULT_HOTEL).toBe("br");
  });

  it("rejects unknown hotels", () => {
    expect(isSupportedHotel("unknown")).toBe(false);
  });
});