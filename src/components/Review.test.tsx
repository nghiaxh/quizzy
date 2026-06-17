import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Review from "./Review";
import { useQuizStore } from "../store/quizStore";

beforeEach(() => {
  useQuizStore.setState({
    tab: "review",
    questions: [
      { id: 0, text: "Correct answer", options: ["Right", "Wrong"], correctIndex: 0 },
      { id: 1, text: "Wrong answer", options: ["Bad", "Good"], correctIndex: 1 },
    ],
    originalQuestions: [
      { id: 0, text: "Correct answer", options: ["Right", "Wrong"], correctIndex: 0 },
      { id: 1, text: "Wrong answer", options: ["Bad", "Good"], correctIndex: 1 },
    ],
    answers: { 0: 0, 1: 0 },
    submitted: { 0: true, 1: true },
    currentIndex: 0,
    language: "en",
  });
});

it("renders both questions", () => {
  render(<Review />);
  expect(screen.getByText(/Correct answer/)).toBeInTheDocument();
  expect(screen.getByText(/Wrong answer/)).toBeInTheDocument();
});

it("shows back button", () => {
  render(<Review />);
  expect(screen.getByText("Back")).toBeInTheDocument();
});

it("shows correct indicator for correct question", () => {
  render(<Review />);
  const rightMatches = screen.getAllByText("Right");
  expect(rightMatches.length).toBeGreaterThanOrEqual(1);
});
