import { describe, it, expect } from "vitest";
import { parseQuestions } from "../utils/parser";

describe("parseQuestions", () => {
  it("parses a single question with 4 options", () => {
    const input = "1. What is 2+2?\n*A. 4\nB. 3\nC. 5\nD. 6";
    const result = parseQuestions(input);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("What is 2+2?");
    expect(result[0].options).toEqual(["4", "3", "5", "6"]);
    expect(result[0].correctIndex).toBe(0);
  });

  it("parses multiple questions separated by blank lines", () => {
    const input = "1. First question\n*A. Yes\nB. No\n\n2. Second question\nA. Maybe\n*B. Always";
    const result = parseQuestions(input);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(0);
    expect(result[1].id).toBe(1);
    expect(result[1].correctIndex).toBe(1);
  });

  it("handles multi-line question text", () => {
    const input = "1. First line\nsecond line\n*A. Option A\nB. Option B";
    const result = parseQuestions(input);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("First line\nsecond line");
  });

  it("handles multi-line option text", () => {
    const input = "1. Question\n*A. Line one\nline two\nB. Option B";
    const result = parseQuestions(input);
    expect(result).toHaveLength(1);
    expect(result[0].options[0]).toBe("Line one\nline two");
  });

  it("supports questions with 2 options", () => {
    const input = "1. True or false?\n*A. True\nB. False";
    const result = parseQuestions(input);
    expect(result).toHaveLength(1);
    expect(result[0].options).toHaveLength(2);
    expect(result[0].correctIndex).toBe(0);
  });

  it("supports questions with 3 options", () => {
    const input = "1. Pick one\n*A. First\nB. Second\nC. Third";
    const result = parseQuestions(input);
    expect(result).toHaveLength(1);
    expect(result[0].options).toHaveLength(3);
  });

  it("marks correct index based on asterisk", () => {
    const input = "1. Test\nA. Wrong\n*B. Correct\nC. Also wrong";
    const result = parseQuestions(input);
    expect(result[0].correctIndex).toBe(1);
  });

  it("re-numbers questions on every parse", () => {
    const input = "5. Fifth question\n*A. Alpha\nB. Beta\n\n3. Third question\nA. Gamma\n*B. Delta";
    const result = parseQuestions(input);
    expect(result[0].id).toBe(0);
    expect(result[0].text).toBe("Fifth question");
    expect(result[1].id).toBe(1);
    expect(result[1].text).toBe("Third question");
  });

  it("discards blocks without a valid question pattern", () => {
    const input = "Just some text\nnot a question\n\n1. Real question\n*A. Yes\nB. No";
    const result = parseQuestions(input);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Real question");
  });

  it("discards blocks with fewer than 2 options", () => {
    const input = "1. Question\n*A. Only one";
    const result = parseQuestions(input);
    expect(result).toHaveLength(0);
  });

  it("discards blocks without a correct answer", () => {
    const input = "1. Question\nA. Option 1\nB. Option 2";
    const result = parseQuestions(input);
    expect(result).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(parseQuestions("")).toEqual([]);
  });

  it("returns empty array for whitespace-only input", () => {
    expect(parseQuestions("   \n\n  ")).toEqual([]);
  });
});
