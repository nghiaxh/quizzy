import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Question, parseQuestions } from "../utils/parser";
import { fireCorrect } from "../utils/confetti";
import type { User } from "@supabase/supabase-js";
import { pushToCloud, pullFromCloud, deleteCloudAccount, signOut } from "../services/supabase";

export type Tab = "exams" | "editor" | "quiz" | "result" | "review";

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

  supabaseUser: User | null;
  setSupabaseUser: (user: User | null) => void;
  syncCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  exportToFile: () => void;
  importFromFile: (file: File) => Promise<void>;
  deleteCloudAccount: () => Promise<void>;
  syncStatus: "idle" | "syncing" | "error" | "success";
  setSyncStatus: (status: "idle" | "syncing" | "error" | "success") => void;
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

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleSync() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    const s = useQuizStore.getState();
    if (!s.supabaseUser) return;
    try {
      s.setSyncStatus("syncing");
      await pushToCloud(s.supabaseUser.id, {
        exams: s.exams,
        settings: {
          shuffleQuestions: s.shuffleQuestions,
          soundEnabled: s.soundEnabled,
          effectsEnabled: s.effectsEnabled,
          timerEnabled: s.timerEnabled,
          timerMinutes: s.timerMinutes,
        },
      });
      s.setSyncStatus("success");
    } catch {
      s.setSyncStatus("error");
    }
  }, 1500);
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
        scheduleSync();
        return id;
      },

      deleteExam: (id) => {
        set((s) => ({
          exams: s.exams.filter((e) => e.id !== id),
          activeExamId: s.activeExamId === id ? null : s.activeExamId,
        }));
        scheduleSync();
      },

      renameExam: (id, name) => {
        set((s) => ({
          exams: s.exams.map((e) => (e.id === id ? { ...e, name: name.trim() || e.name, updatedAt: Date.now() } : e)),
        }));
        scheduleSync();
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
        scheduleSync();
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
        scheduleSync();
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
      setShuffleQuestions: (shuffle) => { set({ shuffleQuestions: shuffle }); scheduleSync(); },
      soundEnabled: true,
      setSoundEnabled: (enabled) => { set({ soundEnabled: enabled }); scheduleSync(); },
      effectsEnabled: true,
      setEffectsEnabled: (enabled) => { set({ effectsEnabled: enabled }); scheduleSync(); },

      timerEnabled: false,
      setTimerEnabled: (enabled) => { set({ timerEnabled: enabled }); scheduleSync(); },
      timerMinutes: 10,
      setTimerMinutes: (minutes) => { set({ timerMinutes: minutes }); scheduleSync(); },
      quizEndTime: null,

      supabaseUser: null,
      syncStatus: "idle",

      setSupabaseUser: (user) => set({ supabaseUser: user }),

      setSyncStatus: (status) => set({ syncStatus: status }),

      syncCloud: async () => {
        const s = get();
        if (!s.supabaseUser) return;
        try {
          set({ syncStatus: "syncing" });
          await pushToCloud(s.supabaseUser.id, {
            exams: s.exams,
            settings: {
              shuffleQuestions: s.shuffleQuestions,
              soundEnabled: s.soundEnabled,
              effectsEnabled: s.effectsEnabled,
              timerEnabled: s.timerEnabled,
              timerMinutes: s.timerMinutes,
            },
          });
          set({ syncStatus: "success" });
        } catch {
          set({ syncStatus: "error" });
        }
      },

      loadFromCloud: async () => {
        const s = get();
        if (!s.supabaseUser) return;
        try {
          set({ syncStatus: "syncing" });
          const cloud = await pullFromCloud(s.supabaseUser.id);
          if (cloud) {
            set({
              exams: cloud.exams as Exam[],
              shuffleQuestions: (cloud.settings as Record<string, unknown>).shuffleQuestions as boolean ?? false,
              soundEnabled: (cloud.settings as Record<string, unknown>).soundEnabled as boolean ?? true,
              effectsEnabled: (cloud.settings as Record<string, unknown>).effectsEnabled as boolean ?? true,
              timerEnabled: (cloud.settings as Record<string, unknown>).timerEnabled as boolean ?? false,
              timerMinutes: (cloud.settings as Record<string, unknown>).timerMinutes as number ?? 10,
            });
          }
          set({ syncStatus: "success" });
        } catch {
          set({ syncStatus: "error" });
        }
      },

      exportToFile: () => {
        const s = get();
        const blob = new Blob(
          [JSON.stringify({ exams: s.exams, settings: { shuffleQuestions: s.shuffleQuestions, soundEnabled: s.soundEnabled, effectsEnabled: s.effectsEnabled, timerEnabled: s.timerEnabled, timerMinutes: s.timerMinutes }, exportedAt: Date.now(), version: "0.5.0" }, null, 2)],
          { type: "application/json" },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `quizzy-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      importFromFile: async (file: File) => {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.exams && Array.isArray(data.exams)) {
          set({
            exams: data.exams,
            shuffleQuestions: data.settings?.shuffleQuestions ?? false,
            soundEnabled: data.settings?.soundEnabled ?? true,
            effectsEnabled: data.settings?.effectsEnabled ?? true,
            timerEnabled: data.settings?.timerEnabled ?? false,
            timerMinutes: data.settings?.timerMinutes ?? 10,
          });
          scheduleSync();
        }
      },

      deleteCloudAccount: async () => {
        const s = get();
        if (!s.supabaseUser) return;
        await deleteCloudAccount(s.supabaseUser.id);
        await signOut();
        set({ supabaseUser: null });
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
        supabaseUser: s.supabaseUser,
      }),
    },
  ),
);
