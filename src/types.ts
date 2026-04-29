export interface Question {
  id: string;
  originalId?: string;
  text: string;
  options: Option[];
  correctIndex: number;
}

export interface Option {
  label: "A" | "B" | "C" | "D";
  text: string;
}

export interface QuizHistoryEntry {
  id: string;
  timestamp: number;
  mode: string;
  totalQuestions: number;
  correct: number;
  wrongQuestionIds: string[];
  questionsSnapshot: Question[];
}
