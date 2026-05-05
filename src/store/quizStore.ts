import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Question, parseQuestions } from "../utils/parser";
import { fireCorrect } from "../utils/confetti";

export type Tab = "exams" | "editor" | "quiz" | "result";

export interface Exam {
  id: string;
  name: string;
  rawText: string;
  createdAt: number;
  updatedAt: number;
}

interface QuizStore {
  tab: Tab;
  setTab: (tab: Tab) => void;

  // Multi-exam management
  exams: Exam[];
  activeExamId: string | null;
  createExam: (name: string, rawText?: string) => string;
  deleteExam: (id: string) => void;
  renameExam: (id: string, name: string) => void;
  duplicateExam: (id: string) => void;
  selectExam: (id: string) => void;

  // Active exam
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

const DEFAULT_EXAM: Exam = {
  id: "default",
  name: "Đề mẫu",
  rawText: DEFAULT_TEXT,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      tab: "exams",
      setTab: (tab) => set({ tab }),

      exams: [DEFAULT_EXAM],
      activeExamId: null,

      createExam: (name, rawText = "") => {
        const id = genId();
        const exam: Exam = {
          id,
          name: name.trim() || "Đề mới",
          rawText,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ exams: [...s.exams, exam] }));
        return id;
      },

      deleteExam: (id) => {
        set((s) => {
          const exams = s.exams.filter((e) => e.id !== id);
          const activeExamId = s.activeExamId === id ? null : s.activeExamId;
          return { exams, activeExamId };
        });
      },

      renameExam: (id, name) => {
        set((s) => ({
          exams: s.exams.map((e) => (e.id === id ? { ...e, name: name.trim() || e.name, updatedAt: Date.now() } : e)),
        }));
      },

      duplicateExam: (id) => {
        const exam = get().exams.find((e) => e.id === id);
        if (!exam) return;
        const newId = genId();
        const copy: Exam = {
          ...exam,
          id: newId,
          name: `${exam.name} (bản sao)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ exams: [...s.exams, copy] }));
      },

      selectExam: (id) => {
        const exam = get().exams.find((e) => e.id === id);
        if (!exam) return;
        set({
          activeExamId: id,
          rawText: exam.rawText,
          questions: parseQuestions(exam.rawText),
          currentIndex: 0,
          answers: {},
          submitted: {},
          tab: "editor",
        });
      },

      rawText: DEFAULT_TEXT,
      questions: parseQuestions(DEFAULT_TEXT),

      setRawText: (text) => {
        const { activeExamId } = get();
        set((s) => ({
          rawText: text,
          questions: parseQuestions(text),
          exams: s.exams.map((e) => (e.id === activeExamId ? { ...e, rawText: text, updatedAt: Date.now() } : e)),
        }));
      },

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
          const allSubmitted = questions.every((q) => submitted[q.id]);
          if (allSubmitted) set({ tab: "result" });
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
    }),
    {
      name: "quizzy-storage",
      partialize: (s) => ({ exams: s.exams }),
    },
  ),
);
