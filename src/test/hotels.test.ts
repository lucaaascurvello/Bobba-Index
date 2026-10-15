import { describe, expect, it } from "vitest";
import { DEFAULT_HOTEL, getHotel, isSupportedHotel } from "@/lib/habbo/hotels";

describe("Brazil-only hotel selection", () => {
  it("allows the Brazilian hotel", () => {
    expect(isSupportedHotel("br")).toBe(true);
    expect(getHotel("br")?.domain).toBe("www.habbo.com.br");
  });

  it.each(["com", "es", "de", "fr", "it", "nl", "fi", "tr"])("disables hotel %s", (id) => {
    expect(isSupportedHotel(id)).toBe(false);
  });

  it("keeps Brazil as the initial hotel", () => {
    expect(DEFAULT_HOTEL).toBe("br");
  });

  it("rejects unknown hotels", () => {
    expect(isSupportedHotel("unknown")).toBe(false);
  });
});