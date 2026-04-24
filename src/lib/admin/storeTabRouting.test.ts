import { describe, expect, it } from "vitest";
import { isLodgingTab, resolveStoreTab } from "./storeTabRouting";

describe("store tab routing", () => {
  it("accepts valid lodging deep links for lodging stores", () => {
    expect(resolveStoreTab("lodge-rate-plans", true)).toBe("lodge-rate-plans");
    expect(isLodgingTab("lodge-overview")).toBe(true);
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
});
