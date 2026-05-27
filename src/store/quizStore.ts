import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Question, parseQuestions } from "../utils/parser";
import { fireCorrect } from "../utils/confetti";

export type Tab = "exams" | "editor" | "quiz" | "result" | "review";

export interface Exam {
  id: string;
  name: string;
  rawText: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

interface QuizStore {
  tab: Tab;
  setTab: (tab: Tab) => void;

  exams: Exam[];
  activeExamId: string | null;
  createExam: (name: string, rawText?: string) => string;
  deleteExam: (id: string) => void;
  renameExam: (id: string, name: string) => void;
  duplicateExam: (id: string) => void;
  selectExam: (id: string) => void;

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

  shuffleQuestions: boolean;
  setShuffleQuestions: (shuffle: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  effectsEnabled: boolean;
  setEffectsEnabled: (enabled: boolean) => void;

  originalQuestions: Question[];
  startQuiz: () => void;

  timerEnabled: boolean;
  setTimerEnabled: (enabled: boolean) => void;
  timerMinutes: number;
  setTimerMinutes: (minutes: number) => void;
  quizEndTime: number | null;
  submitAllAndFinish: () => void;

  driveConnected: boolean;
  driveEmail: string | null;
  lastSyncAt: number | null;
  driveSyncStatus: "idle" | "syncing" | "success" | "error";
  loginLoading: boolean;
  setDriveState: (connected: boolean, email?: string) => void;
  setLastSyncAt: (ts: number | null) => void;
  setDriveSyncStatus: (status: "idle" | "syncing" | "success" | "error") => void;
  setLoginLoading: (loading: boolean) => void;
  pruneTombstones: () => void;
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

let correctAudio: HTMLAudioElement | null = null;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      tab: "exams",
      setTab: (tab) => {
        if (tab === "quiz") {
          const state = get();
          if (state.questions.length > 0) {
            state.startQuiz();
          }
        }
        set({ tab });
      },

      exams: [],
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
        const now = Date.now();
        set((s) => ({
          exams: s.exams.map((e) =>
            e.id === id ? { ...e, deletedAt: now, updatedAt: now } : e,
          ),
          activeExamId: s.activeExamId === id ? null : s.activeExamId,
        }));
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
          deletedAt: undefined,
        };
        set((s) => ({ exams: [...s.exams, copy] }));
      },

      selectExam: (id) => {
        const exam = get().exams.find((e) => e.id === id);
        if (!exam) return;
        const parsedQuestions = parseQuestions(exam.rawText);
        set({
          activeExamId: id,
          rawText: exam.rawText,
          questions: parsedQuestions,
          originalQuestions: parsedQuestions,
          currentIndex: 0,
          answers: {},
          submitted: {},
          tab: "editor",
        });
      },

      rawText: "",
      questions: parseQuestions(""),
      originalQuestions: parseQuestions(""),

      setRawText: (text) => {
        const { activeExamId } = get();
        const parsedQuestions = parseQuestions(text);
        set((s) => ({
          rawText: text,
          questions: parsedQuestions,
          originalQuestions: parsedQuestions,
          exams: s.exams.map((e) => (e.id === activeExamId ? { ...e, rawText: text, updatedAt: Date.now() } : e)),
        }));
      },

      currentIndex: 0,
      answers: {},
      submitted: {},

      selectAnswer: (questionId, optionIndex, confirm) => {
        const { submitted, questions, soundEnabled, effectsEnabled } = get();
        if (submitted[questionId]) return;

        if (!confirm) {
          set((s) => ({ answers: { ...s.answers, [questionId]: optionIndex } }));
          return;
        }

        const q = questions.find((q) => q.id === questionId);
        const isCorrect = q && optionIndex === q.correctIndex;

        if (isCorrect) {
          if (soundEnabled) {
            if (!correctAudio) {
              correctAudio = new Audio("./correct.mp3");
            }
            correctAudio.currentTime = 0;
            correctAudio.play().catch(() => {});
          }
          if (effectsEnabled) {
            fireCorrect();
          }
        }

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

      resetQuiz: () => {
        const { originalQuestions, shuffleQuestions } = get();
        const questionsToUse = shuffleQuestions ? shuffleArray(originalQuestions) : originalQuestions;
        set({
          currentIndex: 0,
          answers: {},
          submitted: {},
          questions: questionsToUse,
        });
      },

      startQuiz: () => {
        const { originalQuestions, shuffleQuestions, timerEnabled, timerMinutes } = get();
        const questionsToUse = shuffleQuestions ? shuffleArray(originalQuestions) : originalQuestions;
        set({
          currentIndex: 0,
          answers: {},
          submitted: {},
          questions: questionsToUse,
          quizEndTime: timerEnabled ? Date.now() + timerMinutes * 60 * 1000 : null,
        });
      },

      submitAllAndFinish: () => {
        const { questions, answers } = get();
        const newAnswers = { ...answers };
        const newSubmitted: Record<number, boolean> = {};
        for (const q of questions) {
          if (newAnswers[q.id] === undefined) {
            newAnswers[q.id] = 0;
          }
          newSubmitted[q.id] = true;
        }
        set({
          answers: newAnswers,
          submitted: newSubmitted,
          tab: "result",
          quizEndTime: null,
        });
      },

      score: () => {
        const { questions, answers, submitted } = get();
        return questions.filter((q) => submitted[q.id] && answers[q.id] === q.correctIndex).length;
      },

      shuffleQuestions: false,
      setShuffleQuestions: (shuffle) => set({ shuffleQuestions: shuffle }),
      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      effectsEnabled: true,
      setEffectsEnabled: (enabled) => set({ effectsEnabled: enabled }),

      timerEnabled: false,
      setTimerEnabled: (enabled) => set({ timerEnabled: enabled }),
      timerMinutes: 10,
      setTimerMinutes: (minutes) => set({ timerMinutes: minutes }),
      quizEndTime: null,

      driveConnected: (() => {
        try {
          return JSON.parse(localStorage.getItem("quizzy-storage") || "{}")?.state?.driveConnected ?? false;
        } catch { return false; }
      })(),
      driveEmail: (() => {
        try {
          return JSON.parse(localStorage.getItem("quizzy-storage") || "{}")?.state?.driveEmail ?? null;
        } catch { return null; }
      })(),
      lastSyncAt: (() => {
        try {
          return JSON.parse(localStorage.getItem("quizzy-storage") || "{}")?.state?.lastSyncAt ?? null;
        } catch { return null; }
      })(),
      driveSyncStatus: "idle",
      loginLoading: false,
      setDriveState: (connected, email) => set({ driveConnected: connected, driveEmail: email ?? null }),
      setLastSyncAt: (ts: number | null) => set({ lastSyncAt: ts }),
      setDriveSyncStatus: (status) => set({ driveSyncStatus: status }),
      setLoginLoading: (loading) => set({ loginLoading: loading }),
      pruneTombstones: () => {
        set((s) => {
          const active = s.exams.filter((e) => !e.deletedAt);
          if (active.length === s.exams.length) return {};
          return { exams: active };
        });
      },
    }),
    {
      name: "quizzy-storage",
      partialize: (s) => ({
        exams: s.exams,
        shuffleQuestions: s.shuffleQuestions,
        soundEnabled: s.soundEnabled,
        effectsEnabled: s.effectsEnabled,
        timerEnabled: s.timerEnabled,
        timerMinutes: s.timerMinutes,
        driveConnected: s.driveConnected,
        driveEmail: s.driveEmail,
        lastSyncAt: s.lastSyncAt,
      }),
    },
  ),
);
