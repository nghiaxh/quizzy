import { describe, it, expect } from "vitest";
import { t, en, vi } from "../i18n/translations";

describe("t()", () => {
  it("returns English translation for 'en'", () => {
    expect(t("en", "app.tab.exams")).toBe("Exams");
  });

  it("returns Vietnamese translation for 'vi'", () => {
    expect(t("vi", "app.tab.exams")).toBe("Đề thi");
  });

  it("falls back to English when key missing in Vietnamese", () => {
    const allKeys = Object.keys(en);
    const missingInVi = allKeys.filter((k) => !(k in vi));
    for (const key of missingInVi) {
      expect(t("vi", key)).toBe(t("en", key));
    }
  });

  it("returns the key itself when not found in any language", () => {
    expect(t("en", "nonexistent.key")).toBe("nonexistent.key");
    expect(t("vi", "nonexistent.key")).toBe("nonexistent.key");
  });

  it("all English keys exist", () => {
    const keys = Object.keys(en);
    expect(keys.length).toBeGreaterThan(50);
    expect(keys).toContain("app.tab.exams");
    expect(keys).toContain("settings.title");
    expect(keys).toContain("result.excellent");
  });
});
