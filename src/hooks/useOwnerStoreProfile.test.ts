import { describe, expect, it } from "vitest";
import { isLodgingStoreCategory, normalizeStoreCategory } from "./useOwnerStoreProfile";

describe("lodging store category detection", () => {
  it.each(["Hotel", "Hotels", "Resort", "Resorts", "Guesthouse", "Guest House", "Guesthouse / B&B", "Bed and Breakfast", "B&B", "  b&b  ", "guesthouse_b&b", "BED-AND-BREAKFAST"])("detects %s as lodging", (category) => {
    expect(isLodgingStoreCategory(category)).toBe(true);
  });

  it.each(["restaurant", "grocery", "auto-repair", "spa", "", null, undefined])("rejects %s as non-lodging", (category) => {
    expect(isLodgingStoreCategory(category)).toBe(false);
  });

  it("normalizes spacing, symbols, and casing", () => {
    expect(normalizeStoreCategory(" Guesthouse / B&B ")).toBe("guesthouse bed and breakfast");
  });
});
