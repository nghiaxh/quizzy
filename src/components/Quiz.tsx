import { useEffect, useState } from "react";
import { useQuizStore } from "../store/quizStore";
import { ChevronLeft, ChevronRight, CheckSquare, Timer, RefreshCw } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";
import { motion } from "framer-motion";

const LABELS = ["A", "B", "C", "D"];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-base-content/30">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      </svg>
      <p className="text-sm font-medium">{t("quiz.emptyTitle")}</p>
      <p className="text-xs">{t("quiz.emptyDesc")}</p>
    </div>
  );
}

export default function Quiz() {
  const { questions, currentIndex, answers, submitted, selectAnswer, nextQuestion, prevQuestion, quizEndTime, submitAllAndFinish, isRedoMode } = useQuizStore();
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!quizEndTime) {
      setTimeLeft(null);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.floor((quizEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) submitAllAndFinish();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [quizEndTime, submitAllAndFinish]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const state = useQuizStore.getState();
      if (state.questions.length === 0) return;
      const q = state.questions[state.currentIndex];
      const chosen = state.answers[q.id];
      const isSubmitted = state.submitted[q.id];
      const hasChosen = chosen !== undefined;

      if (e.key >= "1" && e.key <= "4") {
        const idx = parseInt(e.key) - 1;
        if (idx < q.options.length && !isSubmitted) {
          state.selectAnswer(q.id, idx, false);
        }
        e.preventDefault();
        return;
      }

      if (e.key === "Enter") {
        if (!isSubmitted && hasChosen) {
          state.selectAnswer(q.id, chosen, true);
        } else if (isSubmitted) {
          state.nextQuestion();
        }
        e.preventDefault();
        return;
      }

      if (e.key === "ArrowLeft") {
        state.prevQuestion();
        e.preventDefault();
        return;
      }

      if (e.key === "ArrowRight") {
        if (!isSubmitted && hasChosen) {
          state.selectAnswer(q.id, chosen, true);
        } else if (isSubmitted) {
          state.nextQuestion();
        }
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (questions.length === 0) return <EmptyState />;

  const q = questions[currentIndex];
  const chosen = answers[q.id];
  const isSubmitted = submitted[q.id];
  const hasChosen = chosen !== undefined;
  const isLast = currentIndex === questions.length - 1;
  const allSubmitted = questions.every((q) => submitted[q.id]);
  const progressPct = ((currentIndex + 1) / questions.length) * 100;

  const getOptionStyle = (i: number) => {
    if (!isSubmitted) {
      if (chosen === i) return "border-primary bg-primary/10 text-primary shadow-sm";
      return "border-base-300 hover:border-primary/40 hover:bg-base-200/80";
    }
    if (i === q.correctIndex) return "border-success bg-success/10 text-success";
    if (chosen === i) return "border-error bg-error/10 text-error";
    return "border-base-300 opacity-30 cursor-default";
  };

  const getCircleStyle = (i: number) => {
    if (!isSubmitted) {
      if (chosen === i) return "bg-primary text-white border-primary";
      return "border-base-300 text-base-content/30";
    }
    if (i === q.correctIndex) return "bg-success text-white border-success";
    if (chosen === i) return "bg-error text-white border-error";
    return "border-base-300 text-base-content/20";
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-base-300 bg-base-100">
        <div className="flex items-center gap-2">
          {isRedoMode && (
            <span className="badge badge-warning badge-sm gap-1 text-[10px]">
              <RefreshCw size={10} />
              {t("quiz.redoBadge")}
            </span>
          )}
          {timeLeft !== null && (
            <span className={`flex items-center gap-1 text-sm font-medium ${timeLeft <= 60 ? "text-error" : "text-base-content/60"}`}>
              <Timer size={14} />
              {formatTime(timeLeft)}
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-base-content/40">
          {currentIndex + 1}
          <span className="text-base-content/50"> / {questions.length}</span>
        </span>
        <div />
      </div>

      <div className="h-0.5 bg-base-200">
        <motion.div
          className="h-0.5 bg-primary"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-xl">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-lg font-semibold leading-relaxed text-base-content mb-8 text-center whitespace-pre-line">{q.text}</p>

            <div className="flex flex-col gap-3">
              {q.options.map((o, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-sm transition-colors duration-150 ${isSubmitted ? "" : "cursor-pointer"} ${getOptionStyle(i)}`}
                  onClick={() => !isSubmitted && selectAnswer(q.id, i, false)}
                >
                  <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${getCircleStyle(i)}`}>
                    {LABELS[i]}
                  </span>
                  <span className="flex-1 leading-snug whitespace-pre-line">{o}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-base-300 bg-base-100">
        <div className="flex items-center justify-center gap-3">
          <button className="flex items-center gap-2 btn btn-md btn-ghost" onClick={prevQuestion} disabled={currentIndex === 0}>
            <ChevronLeft size={18} />
            {t("quiz.prev")}
          </button>

          {!isSubmitted ? (
            <button className={`flex items-center gap-2 btn btn-md transition-all ${hasChosen ? "btn-primary" : "btn-disabled bg-base-200 text-base-content/25 border-base-200"}`} onClick={() => hasChosen && selectAnswer(q.id, chosen, true)} disabled={!hasChosen}>
              <CheckSquare size={17} />
              {t("quiz.check")}
            </button>
          ) : isLast ? (
            <button className={`flex items-center gap-2 btn btn-md ${allSubmitted ? "btn-primary" : "btn-disabled opacity-40"}`} onClick={nextQuestion} disabled={!allSubmitted}>
              {t("quiz.viewResult")}
              <ChevronRight size={17} />
            </button>
          ) : (
            <button className="flex items-center gap-2 btn btn-md btn-outline btn-success" onClick={nextQuestion}>
              {t("quiz.next")}
              <ChevronRight size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
