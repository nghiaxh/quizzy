import { describe, it, expect, vi, beforeEach } from "vitest";
import confetti from "canvas-confetti";
import { fireCorrect, fireBig } from "./confetti";

const mockConfetti = vi.mocked(confetti);

describe("fireCorrect", () => {
  it("fires a single confetti burst with 70 particles", () => {
    fireCorrect();
    expect(mockConfetti).toHaveBeenCalledTimes(1);
    expect(mockConfetti).toHaveBeenCalledWith(
      expect.objectContaining({ particleCount: 70 }),
    );
  });
});

describe("fireBig", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("fires 3 confetti bursts", () => {
    fireBig();
    expect(mockConfetti).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(150);
    expect(mockConfetti).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(200);
    expect(mockConfetti).toHaveBeenCalledTimes(3);
  });
});
