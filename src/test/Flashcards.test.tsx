import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Flashcards from "../components/Flashcards";
import { useQuizStore } from "../store/quizStore";
import type { Language } from "../i18n/translations";

const questions = [
  { id: 0, text: "What is 2+2?", options: ["4", "3", "5", "6"], correctIndex: 0 },
  { id: 1, text: "Capital of France?", options: ["London", "Paris", "Berlin", "Madrid"], correctIndex: 1 },
];

function baseState(overrides: Record<string, unknown> = {}) {
  return {
    tab: "flashcards" as const,
    questions,
    originalQuestions: questions,
    flashcardCurrentIndex: 0,
    flashcardRatings: {} as Record<number, boolean>,
    flashcardRevealed: {} as Record<number, boolean>,
    shuffleQuestions: false,
    soundEnabled: false,
    effectsEnabled: false,
    language: "en" as Language,
    ...overrides,
  };
}

beforeEach(() => {
  useQuizStore.setState(baseState());
});

it("shows empty state when no questions", () => {
  useQuizStore.setState({ questions: [] });
  render(<Flashcards />);
  expect(screen.getByText("No questions")).toBeInTheDocument();
});

it("renders current question text", () => {
  render(<Flashcards />);
  expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
});

it("shows progress", () => {
  render(<Flashcards />);
  expect(screen.getByText("1")).toBeInTheDocument();
  expect(screen.getByText("/ 2")).toBeInTheDocument();
});

it("shows tap to reveal hint on card", () => {
  render(<Flashcards />);
  expect(screen.getByText("Tap to reveal answer")).toBeInTheDocument();
});

it("reveals answer on card click", async () => {
  const user = userEvent.setup();
  render(<Flashcards />);
  const card = screen.getByText("Tap to reveal answer").closest("div");
  if (card) await user.click(card);
  expect(useQuizStore.getState().flashcardRevealed[0]).toBe(true);
});

it("shows rating buttons after reveal", () => {
  useQuizStore.setState(baseState({ flashcardRevealed: { 0: true } }));
  render(<Flashcards />);
  expect(screen.getByText("Got it")).toBeInTheDocument();
  expect(screen.getByText("Still learning")).toBeInTheDocument();
});

it("rates card as got it", async () => {
  const user = userEvent.setup();
  useQuizStore.setState(baseState({ flashcardRevealed: { 0: true } }));
  render(<Flashcards />);
  await user.click(screen.getByText("Got it"));
  expect(useQuizStore.getState().flashcardRatings[0]).toBe(true);
});

it("rates card as still learning", async () => {
  const user = userEvent.setup();
  useQuizStore.setState(baseState({ flashcardRevealed: { 0: true } }));
  render(<Flashcards />);
  await user.click(screen.getByText("Still learning"));
  expect(useQuizStore.getState().flashcardRatings[0]).toBe(false);
});

it("shows Next button after rating", () => {
  useQuizStore.setState(baseState({ flashcardRevealed: { 0: true }, flashcardRatings: { 0: true } }));
  render(<Flashcards />);
  expect(screen.getByText("Next")).toBeInTheDocument();
});

it("advances to next question after clicking Next", async () => {
  const user = userEvent.setup();
  useQuizStore.setState(baseState({ flashcardRevealed: { 0: true }, flashcardRatings: { 0: true } }));
  render(<Flashcards />);
  await user.click(screen.getByText("Next"));
  expect(screen.getByText("Capital of France?")).toBeInTheDocument();
});

it("Previous button goes back", async () => {
  const user = userEvent.setup();
  useQuizStore.setState(baseState({ flashcardCurrentIndex: 1 }));
  render(<Flashcards />);
  await user.click(screen.getByText("Previous"));
  expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
});

it("disables Previous on first question", () => {
  render(<Flashcards />);
  const prevBtn = screen.getByText("Previous").closest("button");
  expect(prevBtn).toBeDisabled();
});

it("shows View Summary on last card when all rated", () => {
  useQuizStore.setState(
    baseState({
      questions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
      originalQuestions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
      flashcardRevealed: { 0: true },
      flashcardRatings: { 0: true },
    }),
  );
  render(<Flashcards />);
  expect(screen.getByText("View summary")).toBeInTheDocument();
});
