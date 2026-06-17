import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Quiz from "./Quiz";
import { useQuizStore } from "../store/quizStore";

const questions = [
  { id: 0, text: "What is 2+2?", options: ["4", "3", "5", "6"], correctIndex: 0 },
  { id: 1, text: "Capital of France?", options: ["London", "Paris", "Berlin", "Madrid"], correctIndex: 1 },
];

beforeEach(() => {
  useQuizStore.setState({
    tab: "quiz",
    questions,
    originalQuestions: questions,
    currentIndex: 0,
    answers: {},
    submitted: {},
    shuffleQuestions: false,
    soundEnabled: false,
    effectsEnabled: false,
    timerEnabled: false,
    quizEndTime: null,
    isRedoMode: false,
    language: "en",
  });
});

it("shows empty state when no questions", () => {
  useQuizStore.setState({ questions: [] });
  render(<Quiz />);
  expect(screen.getByText("No questions")).toBeInTheDocument();
});

it("renders current question text and options", () => {
  render(<Quiz />);
  expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
  expect(screen.getByText("4")).toBeInTheDocument();
  expect(screen.getByText("6")).toBeInTheDocument();
});

it("shows progress", () => {
  render(<Quiz />);
  expect(screen.getByText("1")).toBeInTheDocument();
  expect(screen.getByText("/ 2")).toBeInTheDocument();
});

it("selects an option on click", async () => {
  const user = userEvent.setup();
  render(<Quiz />);
  const option = screen.getByText("4");
  await user.click(option);
  const state = useQuizStore.getState();
  expect(state.answers[0]).toBe(0);
});

it("Check button is disabled when no option selected", () => {
  render(<Quiz />);
  const checkBtn = screen.getByText("Check").closest("button");
  expect(checkBtn).toBeDisabled();
});

it("enables Check button after selecting option", async () => {
  const user = userEvent.setup();
  render(<Quiz />);
  const option = screen.getByText("4");
  await user.click(option);
  const checkBtn = screen.getByText("Check").closest("button");
  expect(checkBtn).not.toBeDisabled();
});

it("submits answer on Check click", async () => {
  const user = userEvent.setup();
  render(<Quiz />);
  await user.click(screen.getByText("4"));
  await user.click(screen.getByText("Check"));
  const state = useQuizStore.getState();
  expect(state.submitted[0]).toBe(true);
});

it("shows redo badge when in redo mode", () => {
  useQuizStore.setState({ isRedoMode: true });
  render(<Quiz />);
  expect(screen.getByText("Redoing incorrect")).toBeInTheDocument();
});

it("navigates to next question", async () => {
  const user = userEvent.setup();
  render(<Quiz />);
  await user.click(screen.getByText("4"));
  await user.click(screen.getByText("Check"));
  await user.click(screen.getByText("Next"));
  expect(screen.getByText("Capital of France?")).toBeInTheDocument();
});

it("previous button goes back", async () => {
  useQuizStore.setState({ currentIndex: 1 });
  const user = userEvent.setup();
  render(<Quiz />);
  await user.click(screen.getByText("Previous"));
  expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
});

it("disables Previous on first question", () => {
  render(<Quiz />);
  const prevBtn = screen.getByText("Previous").closest("button");
  expect(prevBtn).toBeDisabled();
});
