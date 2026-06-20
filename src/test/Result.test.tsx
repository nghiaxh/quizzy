import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Result from "../components/Result";
import { useQuizStore } from "../store/quizStore";

beforeEach(() => {
  useQuizStore.setState({
    tab: "result",
    questions: [
      { id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 },
      { id: 1, text: "Q2", options: ["A", "B"], correctIndex: 1 },
    ],
    originalQuestions: [
      { id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 },
      { id: 1, text: "Q2", options: ["A", "B"], correctIndex: 1 },
    ],
    answers: { 0: 0, 1: 0 },
    submitted: { 0: true, 1: true },
    currentIndex: 0,
    shuffleQuestions: false,
    soundEnabled: false,
    effectsEnabled: false,
    language: "en",
  });
});

it("displays score", () => {
  render(<Result />);
  const ones = screen.getAllByText("1");
  expect(ones.length).toBeGreaterThanOrEqual(2);
  expect(screen.getByText("50%")).toBeInTheDocument();
});

it("displays percentage", () => {
  render(<Result />);
  expect(screen.getByText("50%")).toBeInTheDocument();
});

it("displays correct/wrong counts", () => {
  render(<Result />);
  expect(screen.getByText("Correct")).toBeInTheDocument();
  expect(screen.getByText("Wrong")).toBeInTheDocument();
});

it("shows verdict for score below 60", () => {
  render(<Result />);
  expect(screen.getByText("Needs review")).toBeInTheDocument();
});

it("shows Retry, Review, Edit buttons", () => {
  render(<Result />);
  expect(screen.getByText("Retry")).toBeInTheDocument();
  expect(screen.getByText("Review")).toBeInTheDocument();
  expect(screen.getByText("Edit")).toBeInTheDocument();
});

it("shows Redo incorrect button when wrong > 0", () => {
  render(<Result />);
  expect(screen.getByText("Redo incorrect questions")).toBeInTheDocument();
});

it("hides Redo incorrect button when all correct", () => {
  useQuizStore.setState({ answers: { 0: 0, 1: 1 }, submitted: { 0: true, 1: true } });
  render(<Result />);
  expect(screen.queryByText("Redo incorrect questions")).not.toBeInTheDocument();
});
