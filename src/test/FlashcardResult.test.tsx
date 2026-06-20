import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlashcardResult from "../components/FlashcardResult";
import { useQuizStore } from "../store/quizStore";
import type { Language } from "../i18n/translations";

const questions = [
  { id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 },
  { id: 1, text: "Q2", options: ["A", "B"], correctIndex: 0 },
  { id: 2, text: "Q3", options: ["A", "B"], correctIndex: 0 },
];

beforeEach(() => {
  useQuizStore.setState({
    tab: "flashcardResult",
    questions,
    originalQuestions: questions,
    flashcardRatings: { 0: true, 1: false, 2: true } as Record<number, boolean>,
    flashcardRevealed: { 0: true, 1: true, 2: true } as Record<number, boolean>,
    shuffleQuestions: false,
    soundEnabled: false,
    effectsEnabled: false,
    language: "en" as Language,
  });
});

it("renders got it count in stat card", () => {
  render(<FlashcardResult />);
  const twoElements = screen.getAllByText("2");
  expect(twoElements.length).toBeGreaterThanOrEqual(1);
});

it("renders missed count in stat card", () => {
  render(<FlashcardResult />);
  const oneElements = screen.getAllByText("1");
  expect(oneElements.length).toBeGreaterThanOrEqual(1);
});

it("shows session complete title", () => {
  render(<FlashcardResult />);
  expect(screen.getByText("Session complete")).toBeInTheDocument();
});

it("shows Retry all button", () => {
  render(<FlashcardResult />);
  expect(screen.getByText("Retry all")).toBeInTheDocument();
});

it("shows Redo missed button when there are missed cards", () => {
  render(<FlashcardResult />);
  expect(screen.getByText("Redo missed")).toBeInTheDocument();
});

it("hides Redo missed button when all cards are got it", () => {
  useQuizStore.setState({ flashcardRatings: { 0: true, 1: true, 2: true } });
  render(<FlashcardResult />);
  expect(screen.queryByText("Redo missed")).not.toBeInTheDocument();
});

it("shows Review button", () => {
  render(<FlashcardResult />);
  expect(screen.getByText("Review")).toBeInTheDocument();
});

it("shows Edit button", () => {
  render(<FlashcardResult />);
  expect(screen.getByText("Edit")).toBeInTheDocument();
});

it("clicks Retry all resets flashcard state", async () => {
  const user = userEvent.setup();
  render(<FlashcardResult />);
  await user.click(screen.getByText("Retry all"));
  const state = useQuizStore.getState();
  expect(state.flashcardCurrentIndex).toBe(0);
  expect(state.flashcardRatings).toEqual({});
});

it("clicks Redo missed filters to missed cards", async () => {
  const user = userEvent.setup();
  render(<FlashcardResult />);
  await user.click(screen.getByText("Redo missed"));
  const state = useQuizStore.getState();
  expect(state.questions).toHaveLength(1);
  expect(state.questions[0].text).toBe("Q2");
});

it("clicks Review navigates to review tab", async () => {
  const user = userEvent.setup();
  render(<FlashcardResult />);
  await user.click(screen.getByText("Review"));
  expect(useQuizStore.getState().tab).toBe("review");
});

it("clicks Edit navigates to editor tab", async () => {
  const user = userEvent.setup();
  render(<FlashcardResult />);
  await user.click(screen.getByText("Edit"));
  expect(useQuizStore.getState().tab).toBe("editor");
});
