import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { useQuizStore } from "../store/quizStore";

beforeEach(() => {
  localStorage.clear();
  useQuizStore.setState({
    tab: "exams",
    exams: [],
    activeExamId: null,
    rawText: "",
    questions: [],
    originalQuestions: [],
    currentIndex: 0,
    answers: {},
    submitted: {},
    shuffleQuestions: false,
    soundEnabled: true,
    effectsEnabled: true,
    timerEnabled: false,
    timerMinutes: 10,
    quizEndTime: null,
    isRedoMode: false,
    language: "en",
  });
});

it("renders tab bar with Exams, Editor, Quiz tabs", () => {
  render(<App />);
  expect(screen.getByText("Exams")).toBeInTheDocument();
  expect(screen.getByText("Editor")).toBeInTheDocument();
  expect(screen.getByText("Quiz")).toBeInTheDocument();
});

it("shows exams page by default", () => {
  render(<App />);
  expect(screen.getByText("No exams yet")).toBeInTheDocument();
});

it("settings button opens settings modal", async () => {
  const user = userEvent.setup();
  const { container } = render(<App />);
  const settingsBtn = container.querySelector('[class*="btn-circle"]');
  if (settingsBtn) {
    await user.click(settingsBtn);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  }
});

it("editor tab is disabled when no active exam", () => {
  render(<App />);
  const editorBtn = screen.getByText("Editor").closest("button");
  expect(editorBtn).toBeDisabled();
});

it("quiz tab is disabled when no active exam", () => {
  render(<App />);
  const quizBtn = screen.getByText("Quiz").closest("button");
  expect(quizBtn).toBeDisabled();
});

it("enables tabs when exam is active with questions", () => {
  useQuizStore.setState({
    activeExamId: "exam-1",
    questions: [{ id: 0, text: "Q", options: ["A", "B"], correctIndex: 0 }],
  });
  render(<App />);
  const editorBtn = screen.getByText("Editor").closest("button");
  const quizBtn = screen.getByText("Quiz").closest("button");
  expect(editorBtn).not.toBeDisabled();
  expect(quizBtn).not.toBeDisabled();
});

it("switches tab on click", async () => {
  useQuizStore.setState({
    activeExamId: "exam-1",
    questions: [{ id: 0, text: "Q", options: ["A", "B"], correctIndex: 0 }],
  });
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByText("Editor"));
  expect(useQuizStore.getState().tab).toBe("editor");
});
