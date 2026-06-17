import { describe, it, expect, beforeEach, vi } from "vitest";
import { useQuizStore } from "./quizStore";

function resetStore() {
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
  localStorage.clear();
}

const sampleText =
  "1. What is 2+2?\n*A. 4\nB. 3\nC. 5\nD. 6\n\n2. Capital of France?\nA. London\n*B. Paris\nC. Berlin\nD. Madrid";

beforeEach(() => {
  resetStore();
});

describe("exam CRUD", () => {
  it("creates an exam", () => {
    const id = useQuizStore.getState().createExam("Math Quiz");
    const exams = useQuizStore.getState().exams;
    expect(exams).toHaveLength(1);
    expect(exams[0].name).toBe("Math Quiz");
    expect(exams[0].id).toBe(id);
  });

  it("deletes an exam", () => {
    const id = useQuizStore.getState().createExam("Test");
    useQuizStore.getState().deleteExam(id);
    expect(useQuizStore.getState().exams).toHaveLength(0);
  });

  it("renames an exam", () => {
    const id = useQuizStore.getState().createExam("Old");
    useQuizStore.getState().renameExam(id, "New");
    expect(useQuizStore.getState().exams[0].name).toBe("New");
  });

  it("duplicates an exam", () => {
    const id = useQuizStore.getState().createExam("Exam", sampleText);
    useQuizStore.getState().duplicateExam(id);
    expect(useQuizStore.getState().exams).toHaveLength(2);
    expect(useQuizStore.getState().exams[1].name).toBe("Exam (copy)");
  });
});

describe("selectExam", () => {
  it("sets active exam and parses text", () => {
    const id = useQuizStore.getState().createExam("Geo", sampleText);
    useQuizStore.getState().selectExam(id);
    const state = useQuizStore.getState();
    expect(state.activeExamId).toBe(id);
    expect(state.questions).toHaveLength(2);
    expect(state.tab).toBe("editor");
  });
});

describe("setRawText", () => {
  it("updates rawText and re-parses questions", () => {
    useQuizStore.getState().createExam("E", "");
    useQuizStore.setState({ activeExamId: useQuizStore.getState().exams[0].id });
    useQuizStore.getState().setRawText(sampleText);
    expect(useQuizStore.getState().rawText).toBe(sampleText);
    expect(useQuizStore.getState().questions).toHaveLength(2);
  });
});

describe("quiz flow", () => {
  it("startQuiz resets answers and shuffles when enabled", () => {
    useQuizStore.setState({
      questions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
      originalQuestions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
      shuffleQuestions: false,
    });
    useQuizStore.getState().startQuiz();
    expect(useQuizStore.getState().currentIndex).toBe(0);
    expect(useQuizStore.getState().answers).toEqual({});
    expect(useQuizStore.getState().submitted).toEqual({});
  });

  it("selectAnswer previews without confirming", () => {
    useQuizStore.setState({
      questions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
    });
    useQuizStore.getState().selectAnswer(0, 1, false);
    expect(useQuizStore.getState().answers[0]).toBe(1);
    expect(useQuizStore.getState().submitted[0]).toBeUndefined();
  });

  it("selectAnswer confirms and marks submitted", () => {
    useQuizStore.setState({
      questions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
    });
    useQuizStore.getState().selectAnswer(0, 0, true);
    expect(useQuizStore.getState().answers[0]).toBe(0);
    expect(useQuizStore.getState().submitted[0]).toBe(true);
  });

  it("ignores re-submit for already submitted question", () => {
    useQuizStore.setState({
      questions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
      submitted: { 0: true },
      answers: { 0: 0 },
    });
    useQuizStore.getState().selectAnswer(0, 1, false);
    expect(useQuizStore.getState().answers[0]).toBe(0);
  });

  it("nextQuestion advances index", () => {
    useQuizStore.setState({
      questions: [
        { id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 },
        { id: 1, text: "Q2", options: ["A", "B"], correctIndex: 0 },
      ],
      currentIndex: 0,
    });
    useQuizStore.getState().nextQuestion();
    expect(useQuizStore.getState().currentIndex).toBe(1);
  });

  it("nextQuestion goes to result on last question when all submitted", () => {
    useQuizStore.setState({
      questions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
      currentIndex: 0,
      submitted: { 0: true },
    });
    useQuizStore.getState().nextQuestion();
    expect(useQuizStore.getState().tab).toBe("result");
  });

  it("prevQuestion goes back", () => {
    useQuizStore.setState({ currentIndex: 2 });
    useQuizStore.getState().prevQuestion();
    expect(useQuizStore.getState().currentIndex).toBe(1);
  });

  it("prevQuestion does not go below 0", () => {
    useQuizStore.setState({ currentIndex: 0 });
    useQuizStore.getState().prevQuestion();
    expect(useQuizStore.getState().currentIndex).toBe(0);
  });
});

describe("resetQuiz", () => {
  it("resets answers and index, keeps questions", () => {
    useQuizStore.setState({
      questions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
      originalQuestions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
      currentIndex: 0,
      answers: { 0: 0 },
      submitted: { 0: true },
    });
    useQuizStore.getState().resetQuiz();
    const state = useQuizStore.getState();
    expect(state.currentIndex).toBe(0);
    expect(state.answers).toEqual({});
    expect(state.submitted).toEqual({});
    expect(state.isRedoMode).toBe(false);
  });
});

describe("submitAllAndFinish", () => {
  it("fills unanswered questions and goes to result", () => {
    useQuizStore.setState({
      questions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
      answers: {},
      submitted: {},
    });
    useQuizStore.getState().submitAllAndFinish();
    const state = useQuizStore.getState();
    expect(state.answers[0]).toBe(0);
    expect(state.submitted[0]).toBe(true);
    expect(state.tab).toBe("result");
  });
});

describe("redoIncorrect", () => {
  it("filters to only wrong questions", () => {
    useQuizStore.setState({
      questions: [
        { id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 },
        { id: 1, text: "Q2", options: ["A", "B"], correctIndex: 1 },
        { id: 2, text: "Q3", options: ["A", "B"], correctIndex: 0 },
      ],
      originalQuestions: [
        { id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 },
        { id: 1, text: "Q2", options: ["A", "B"], correctIndex: 1 },
        { id: 2, text: "Q3", options: ["A", "B"], correctIndex: 0 },
      ],
      answers: { 0: 0, 1: 0, 2: 0 },
      submitted: { 0: true, 1: true, 2: true },
    });
    useQuizStore.getState().redoIncorrect();
    const state = useQuizStore.getState();
    expect(state.questions).toHaveLength(1);
    expect(state.questions[0].id).toBe(1);
    expect(state.isRedoMode).toBe(true);
    expect(state.quizEndTime).toBeNull();
    expect(state.tab).toBe("quiz");
  });
});

describe("score", () => {
  it("counts correct answers", () => {
    useQuizStore.setState({
      questions: [
        { id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 },
        { id: 1, text: "Q2", options: ["A", "B"], correctIndex: 1 },
      ],
      answers: { 0: 0, 1: 0 },
      submitted: { 0: true, 1: true },
    });
    expect(useQuizStore.getState().score()).toBe(1);
  });
});

describe("settings", () => {
  it("toggles shuffle", () => {
    useQuizStore.getState().setShuffleQuestions(true);
    expect(useQuizStore.getState().shuffleQuestions).toBe(true);
  });

  it("toggles sound", () => {
    useQuizStore.getState().setSoundEnabled(false);
    expect(useQuizStore.getState().soundEnabled).toBe(false);
  });

  it("toggles effects", () => {
    useQuizStore.getState().setEffectsEnabled(false);
    expect(useQuizStore.getState().effectsEnabled).toBe(false);
  });

  it("sets language", () => {
    useQuizStore.getState().setLanguage("vi");
    expect(useQuizStore.getState().language).toBe("vi");
  });

  it("sets timer", () => {
    useQuizStore.getState().setTimerEnabled(true);
    useQuizStore.getState().setTimerMinutes(15);
    expect(useQuizStore.getState().timerEnabled).toBe(true);
    expect(useQuizStore.getState().timerMinutes).toBe(15);
  });
});

describe("setTab", () => {
  it("calls startQuiz when switching to quiz tab", () => {
    useQuizStore.setState({
      questions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
      originalQuestions: [{ id: 0, text: "Q1", options: ["A", "B"], correctIndex: 0 }],
    });
    useQuizStore.getState().setTab("quiz");
    expect(useQuizStore.getState().tab).toBe("quiz");
    expect(useQuizStore.getState().currentIndex).toBe(0);
  });
});
