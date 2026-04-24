import { describe, expect, it } from "vitest";
import { buildStoreTabUrl, getTabFromSearch, isLodgingTab, resolveStoreTab, resolveStoreTabFromSearch } from "./storeTabRouting";
import { tabQueryFixtures, validBaseTabFixtures, validLodgingTabFixtures } from "@/test/fixtures/lodgingTabFixtures";

describe("store tab routing", () => {
  it("accepts valid lodging deep links for lodging stores", () => {
    validLodgingTabFixtures.forEach((tab) => expect(resolveStoreTab(tab, true)).toBe(tab));
    validLodgingTabFixtures.forEach((tab) => expect(isLodgingTab(tab)).toBe(true));
  });

  it("accepts valid base store tabs", () => {
    validBaseTabFixtures.forEach((tab) => expect(resolveStoreTab(tab, true)).toBe(tab));
  });

  it("falls invalid lodging-store tabs back to overview", () => {
    expect(resolveStoreTab("bad-tab", true)).toBe("lodge-overview");
  });

  it("prevents lodging tabs on non-lodging stores", () => {
    expect(resolveStoreTab("lodge-overview", false)).toBe("profile");
  });

  it("defaults missing tabs safely", () => {
    expect(resolveStoreTab(null, true)).toBe("lodge-overview");
    expect(resolveStoreTab(undefined, false)).toBe("profile");
  });

  it.each(tabQueryFixtures)("resolves query string $search", ({ search, lodging, expected }) => {
    expect(resolveStoreTabFromSearch(search, lodging)).toBe(expected);
  });

  it("parses tab query strings and builds URLs", () => {
    expect(getTabFromSearch("?tab=lodge-overview&x=1")).toBe("lodge-overview");
    expect(buildStoreTabUrl("store 1", "lodge-addons")).toBe("/admin/stores/store%201?tab=lodge-addons");
  });
});
