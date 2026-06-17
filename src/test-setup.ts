import "@testing-library/jest-dom/vitest";
import { vi, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

HTMLAudioElement.prototype.play = vi.fn().mockResolvedValue(undefined);
HTMLAudioElement.prototype.load = vi.fn();

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

URL.createObjectURL = vi.fn(() => "blob:mock");
URL.revokeObjectURL = vi.fn();

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});
