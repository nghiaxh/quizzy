import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Editor from "./Editor";
import { useQuizStore } from "../store/quizStore";

const sampleText =
  "1. What is 2+2?\n*A. 4\nB. 3\nC. 5\nD. 6";

beforeEach(() => {
  useQuizStore.setState({
    tab: "editor",
    exams: [{ id: "exam-1", name: "Test", rawText: sampleText, createdAt: 0, updatedAt: 0 }],
    activeExamId: "exam-1",
    rawText: sampleText,
    questions: [
      { id: 0, text: "What is 2+2?", options: ["4", "3", "5", "6"], correctIndex: 0 },
    ],
    originalQuestions: [
      { id: 0, text: "What is 2+2?", options: ["4", "3", "5", "6"], correctIndex: 0 },
    ],
    currentIndex: 0,
    answers: {},
    submitted: {},
    language: "en",
  });
});

it("renders textarea with raw text", () => {
  const { container } = render(<Editor />);
  const textarea = container.querySelector("textarea");
  expect(textarea).toBeInTheDocument();
  expect(textarea).toHaveValue(sampleText);
});

it("renders preview with parsed questions", () => {
  render(<Editor />);
  const matches = screen.getAllByText(/What is 2\+2\?/);
  expect(matches.length).toBeGreaterThanOrEqual(1);
});

it("shows question count", () => {
  render(<Editor />);
  expect(screen.getByText(/1 questions/)).toBeInTheDocument();
});

it("updates preview when typing", async () => {
  const user = userEvent.setup();
  const { container } = render(<Editor />);
  const textarea = container.querySelector("textarea")!;
  await user.clear(textarea);
  await user.type(textarea, "1. New question\n*A. Option A\nB. Option B");
  const previewMatches = screen.getAllByText(/New question/);
  expect(previewMatches.length).toBeGreaterThanOrEqual(1);
});

it("adds a sample question on button click", async () => {
  const user = userEvent.setup();
  render(<Editor />);
  await user.click(screen.getByTitle("Add sample"));
  const previewMatches = screen.getAllByText(/Question content/);
  expect(previewMatches.length).toBeGreaterThanOrEqual(1);
});

it("loads sample exam on button click", async () => {
  const user = userEvent.setup();
  const { container } = render(<Editor />);
  await user.click(screen.getByTitle("Load sample exam"));
  const textarea = container.querySelector("textarea")!;
  expect(textarea.value).toContain("Question content");
});

it("shows start hint when rawText is empty", () => {
  useQuizStore.setState({ rawText: "" });
  render(<Editor />);
  expect(screen.getByText(/Write questions or click/)).toBeInTheDocument();
});
