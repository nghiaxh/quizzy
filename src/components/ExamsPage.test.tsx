import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExamsPage from "./ExamsPage";
import { useQuizStore } from "../store/quizStore";

beforeEach(() => {
  useQuizStore.setState({
    tab: "exams",
    exams: [],
    activeExamId: null,
    rawText: "",
    questions: [],
    originalQuestions: [],
    language: "en",
  });
});

it("shows empty state when no exams", () => {
  render(<ExamsPage />);
  expect(screen.getByText("No exams yet")).toBeInTheDocument();
});

it("shows exam cards when exams exist", () => {
  useQuizStore.setState({
    exams: [
      { id: "1", name: "Math", rawText: "1. Q\n*A. A\nB. B", createdAt: 0, updatedAt: 0 },
      { id: "2", name: "Science", rawText: "1. Q\n*A. A\nB. B", createdAt: 0, updatedAt: 0 },
    ],
  });
  render(<ExamsPage />);
  expect(screen.getByText("Math")).toBeInTheDocument();
  expect(screen.getByText("Science")).toBeInTheDocument();
});

it("has create and import buttons", () => {
  render(<ExamsPage />);
  expect(screen.getByText("New exam")).toBeInTheDocument();
  expect(screen.getByText("Import")).toBeInTheDocument();
});

it("opens new exam modal on create click", async () => {
  const user = userEvent.setup();
  render(<ExamsPage />);
  await user.click(screen.getByText("New exam"));
  expect(screen.getByText("Exam name")).toBeInTheDocument();
});

it("creates exam from modal", async () => {
  const user = userEvent.setup();
  render(<ExamsPage />);
  await user.click(screen.getByText("New exam"));
  const input = screen.getByPlaceholderText("Enter exam name...");
  await user.type(input, "New Test");
  await user.click(screen.getByText("Create"));
  expect(screen.getByText("New Test")).toBeInTheDocument();
});
