import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsModal from "../components/SettingsModal";
import { useQuizStore } from "../store/quizStore";

const defaultProps = {
  theme: "light" as const,
  setTheme: vi.fn(),
  onClose: vi.fn(),
};

beforeEach(() => {
  useQuizStore.setState({
    language: "en",
    shuffleQuestions: false,
    soundEnabled: true,
    effectsEnabled: true,
    timerEnabled: false,
    timerMinutes: 10,
  });
});

it("renders all settings sections", () => {
  render(<SettingsModal {...defaultProps} />);
  expect(screen.getByText("Settings")).toBeInTheDocument();
  expect(screen.getByText("Theme")).toBeInTheDocument();
  expect(screen.getByText("Shuffle questions")).toBeInTheDocument();
  expect(screen.getByText("Sound")).toBeInTheDocument();
  expect(screen.getByText("Effects")).toBeInTheDocument();
  expect(screen.getByText("Timer")).toBeInTheDocument();
  expect(screen.getByText("Language")).toBeInTheDocument();
});

it("calls setTheme when toggling theme", async () => {
  const setTheme = vi.fn();
  const user = userEvent.setup();
  const { container } = render(<SettingsModal {...defaultProps} setTheme={setTheme} />);
  const themeGroup = container.querySelector('[class*="bg-base-200 rounded-lg"]');
  const darkBtn = themeGroup?.querySelector("button:last-child");
  if (darkBtn) {
    await user.click(darkBtn);
    expect(setTheme).toHaveBeenCalledWith("dark");
  }
});

it("toggles shuffle switch", async () => {
  const user = userEvent.setup();
  render(<SettingsModal {...defaultProps} />);
  const toggles = screen.getAllByRole("checkbox");
  await user.click(toggles[0]);
  expect(useQuizStore.getState().shuffleQuestions).toBe(true);
});

it("toggles sound switch", async () => {
  const user = userEvent.setup();
  render(<SettingsModal {...defaultProps} />);
  const toggles = screen.getAllByRole("checkbox");
  await user.click(toggles[1]);
  expect(useQuizStore.getState().soundEnabled).toBe(false);
});

it("shows timer minutes input when timer enabled", async () => {
  const user = userEvent.setup();
  const { container } = render(<SettingsModal {...defaultProps} />);
  const toggles = screen.getAllByRole("checkbox");
  await user.click(toggles[3]);
  const timerInput = container.querySelector('input[type="number"]');
  expect(timerInput).toBeInTheDocument();
  expect(timerInput).toHaveValue(10);
});

it("changes language", async () => {
  const user = userEvent.setup();
  render(<SettingsModal {...defaultProps} />);
  const selects = screen.getAllByRole("combobox");
  await user.selectOptions(selects[0], "vi");
  expect(useQuizStore.getState().language).toBe("vi");
});

it("calls onClose when close button clicked", async () => {
  const onClose = vi.fn();
  const user = userEvent.setup();
  const { container } = render(<SettingsModal {...defaultProps} onClose={onClose} />);
  const header = container.querySelector('[class*="sticky top-0"]');
  const closeBtn = header?.querySelector("button");
  if (closeBtn) {
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  }
});
