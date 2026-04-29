import { create } from "zustand";
import { Question, parseQuestions } from "../utils/parser";
import { fireCorrect } from "../utils/confetti";

export type Tab = "editor" | "quiz" | "result";

interface QuizStore {
  tab: Tab;
  setTab: (tab: Tab) => void;

  rawText: string;
  setRawText: (text: string) => void;
  questions: Question[];

  currentIndex: number;
  answers: Record<number, number>;
  submitted: Record<number, boolean>;

  selectAnswer: (questionId: number, optionIndex: number, confirm: boolean) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  resetQuiz: () => void;
  score: () => number;
}

const DEFAULT_TEXT = `1. Thủ đô của Việt Nam là gì?
A. Hồ Chí Minh
*B. Hà Nội
C. Đà Nẵng
D. Huế

2. HTTP là viết tắt của?
A. HyperText Markup Protocol
*B. HyperText Transfer Protocol
C. HyperText Transfer Page
D. High Transfer Protocol

3. React được phát triển bởi?
A. Google
B. Microsoft
*C. Meta (Facebook)
D. Netflix

4. Zustand dùng để làm gì?
A. Routing
*B. State management
C. Styling
D. Build tool

5. Tauri dùng ngôn ngữ backend nào?
A. Go
B. C++
*C. Rust
D. Python`;

export const useQuizStore = create<QuizStore>((set, get) => ({
  tab: "editor",
  setTab: (tab) => set({ tab }),

  rawText: DEFAULT_TEXT,
  questions: parseQuestions(DEFAULT_TEXT),
  setRawText: (text) => set({ rawText: text, questions: parseQuestions(text) }),

  currentIndex: 0,
  answers: {},
  submitted: {},

  selectAnswer: (questionId, optionIndex, confirm) => {
    const { submitted, questions } = get();
    if (submitted[questionId]) return;

    if (!confirm) {
      set((s) => ({ answers: { ...s.answers, [questionId]: optionIndex } }));
      return;
    }

    const q = questions.find((q) => q.id === questionId);
    if (q && optionIndex === q.correctIndex) fireCorrect();

    set((s) => ({
      answers: { ...s.answers, [questionId]: optionIndex },
      submitted: { ...s.submitted, [questionId]: true },
    }));
  },

  nextQuestion: () => {
    const { currentIndex, questions, submitted } = get();
    const isLast = currentIndex === questions.length - 1;

    if (isLast) {
      // Kiểm tra tất cả đã submit chưa
      const allSubmitted = questions.every((q) => submitted[q.id]);
      if (allSubmitted) {
        set({ tab: "result" });
      }
      return;
    }

    set({ currentIndex: currentIndex + 1 });
  },

  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 });
  },

  resetQuiz: () => set({ currentIndex: 0, answers: {}, submitted: {} }),

  score: () => {
    const { questions, answers, submitted } = get();
    return questions.filter((q) => submitted[q.id] && answers[q.id] === q.correctIndex).length;
  },
}));
