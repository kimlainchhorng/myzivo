import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LANGUAGE_EXPLICIT_KEY,
  LANGUAGE_STORAGE_KEY,
  applyLanguageToDocument,
  browserLanguage,
  cacheLanguage,
  rememberLanguageChoice,
  resolveInitialLanguage,
  syncAccountLanguage,
} from "./languagePreference";

/** `navigator.languages` is read-only; override it for the length of one test. */
function withBrowserLanguages(tags: string[], run: () => void) {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, "languages");
  Object.defineProperty(navigator, "languages", { value: tags, configurable: true });
  try { run(); } finally {
    if (descriptor) Object.defineProperty(navigator, "languages", descriptor);
    else delete (navigator as unknown as Record<string, unknown>).languages;
  }
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("lang");
  document.getElementById("zivo-khmer-font")?.remove();
});

describe("browserLanguage", () => {
  it("matches a regional tag to its base language", () => {
    withBrowserLanguages(["km-KH"], () => expect(browserLanguage()).toBe("km"));
  });

  it("takes the first supported tag, not the first tag", () => {
    withBrowserLanguages(["fr-CA", "km-KH", "en-US"], () => expect(browserLanguage()).toBe("km"));
  });

  it("returns null when nothing the app renders is requested", () => {
    withBrowserLanguages(["fr-CA", "de-DE"], () => expect(browserLanguage()).toBeNull());
  });

  /**
   * Chromium ships no Khmer ICU data, so anything that resolves the locale
   * through Intl reports en-US for a km-KH browser — silently, and for exactly
   * the users this detection exists to serve.
   */
  it("does not depend on Intl locale resolution", () => {
    withBrowserLanguages(["km-KH"], () => {
      const resolved = new Intl.DateTimeFormat().resolvedOptions().locale;
      const detected = browserLanguage();
      expect(detected).toBe("km");
      if (!resolved.startsWith("km")) expect(detected).not.toBe(resolved.split("-")[0]);
    });
  });
});

describe("resolveInitialLanguage", () => {
  it("honours the browser locale on a first ever visit", () => {
    withBrowserLanguages(["km-KH"], () => {
      expect(resolveInitialLanguage()).toEqual({ code: "km", source: "browser" });
    });
  });

  it("falls back to English when the browser asks for nothing we render", () => {
    withBrowserLanguages(["fr-FR"], () => {
      expect(resolveInitialLanguage()).toEqual({ code: "en", source: "fallback" });
    });
  });

  it("lets ?lang= win over everything", () => {
    rememberLanguageChoice("km");
    withBrowserLanguages(["km-KH"], () => {
      expect(resolveInitialLanguage({ query: "en" })).toEqual({ code: "en", source: "query" });
    });
  });

  it("ignores an unsupported ?lang=", () => {
    withBrowserLanguages(["km-KH"], () => {
      expect(resolveInitialLanguage({ query: "zz" }).code).toBe("km");
    });
  });

  /** The whole point of the explicit marker: English on a Khmer phone sticks. */
  it("keeps a chosen language over the browser locale", () => {
    rememberLanguageChoice("en");
    withBrowserLanguages(["km-KH"], () => {
      expect(resolveInitialLanguage()).toEqual({ code: "en", source: "chosen" });
    });
  });

  /**
   * The regression this module was written for: the app cached the language on
   * every boot, so one visit made the default look like a decision and the
   * browser locale was never consulted again.
   */
  it("does not treat a cached language as a decision", () => {
    cacheLanguage("en");
    withBrowserLanguages(["km-KH"], () => {
      expect(resolveInitialLanguage()).toEqual({ code: "km", source: "browser" });
    });
  });

  it("survives storage being unavailable", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
    try {
      withBrowserLanguages(["km-KH"], () => expect(resolveInitialLanguage().code).toBe("km"));
    } finally { getItem.mockRestore(); }
  });
});

describe("rememberLanguageChoice", () => {
  it("records both the language and that it was chosen", () => {
    rememberLanguageChoice("km");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("km");
    expect(localStorage.getItem(LANGUAGE_EXPLICIT_KEY)).toBe("1");
  });

  it("does not throw when storage is denied", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
    try { expect(() => rememberLanguageChoice("km")).not.toThrow(); } finally { setItem.mockRestore(); }
  });
});

describe("applyLanguageToDocument", () => {
  it("sets the lang attribute assistive tech and :lang() rules read", () => {
    applyLanguageToDocument("km");
    expect(document.documentElement.getAttribute("lang")).toBe("km");
  });

  it("loads the Khmer webfont only for Khmer, and only once", () => {
    applyLanguageToDocument("en");
    expect(document.getElementById("zivo-khmer-font")).toBeNull();
    applyLanguageToDocument("km");
    applyLanguageToDocument("km");
    expect(document.querySelectorAll("#zivo-khmer-font")).toHaveLength(1);
  });
});

describe("syncAccountLanguage", () => {
  const base = { supported: ["en", "km"], load: async () => "km" };

  it("applies the account language over a browser guess", async () => {
    const apply = vi.fn();
    await syncAccountLanguage({ ...base, current: "en", source: "browser", apply });
    expect(apply).toHaveBeenCalledWith("km");
  });

  it("never overrides a ?lang= link", async () => {
    const apply = vi.fn();
    await syncAccountLanguage({ ...base, current: "en", source: "query", apply });
    expect(apply).not.toHaveBeenCalled();
  });

  it("never overrides a choice made in this session", async () => {
    const apply = vi.fn();
    await syncAccountLanguage({ ...base, current: "en", source: "chosen", apply });
    expect(apply).not.toHaveBeenCalled();
  });

  it("does not repaint when the account already agrees", async () => {
    const apply = vi.fn();
    await syncAccountLanguage({ ...base, current: "km", source: "browser", apply });
    expect(apply).not.toHaveBeenCalled();
  });

  it("leaves the rendered language alone when the profile read fails", async () => {
    const apply = vi.fn();
    await syncAccountLanguage({ ...base, current: "en", source: "browser", apply, load: async () => { throw new Error("offline"); } });
    expect(apply).not.toHaveBeenCalled();
  });

  it("ignores a language the app cannot render", async () => {
    const apply = vi.fn();
    await syncAccountLanguage({ ...base, current: "en", source: "browser", apply, load: async () => "zz" });
    expect(apply).not.toHaveBeenCalled();
  });
});

describe("migration from before the explicit marker", () => {
  /**
   * The old code seeded `zivo_lang` with the fallback on every boot and never
   * seeded anything else, so a stored non-fallback language is a real choice
   * even though it predates the marker.
   */
  it("honours a pre-existing Khmer preference that has no marker", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "km");
    withBrowserLanguages(["en-US"], () => {
      expect(resolveInitialLanguage()).toEqual({ code: "km", source: "chosen" });
    });
  });

  it("upgrades that preference so it stops being ambiguous", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "km");
    resolveInitialLanguage();
    expect(localStorage.getItem(LANGUAGE_EXPLICIT_KEY)).toBe("1");
  });

  it("still treats a pre-existing English value as the boot default, not a choice", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
    withBrowserLanguages(["km-KH"], () => {
      expect(resolveInitialLanguage()).toEqual({ code: "km", source: "browser" });
    });
  });
});
