import { useEffect, useState } from "react";
import { useQuizStore } from "../store/quizStore";
import { Button } from "@heroui/react";
import { ArrowsClockwise, CaretLeft, CaretRight, CheckSquare, Timer } from "@phosphor-icons/react";
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
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted/40">
      <Timer size={40} />
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
      if (chosen === i) return "border-accent bg-accent/10";
      return "border-border hover:border-accent/50 hover:bg-surface-secondary";
    }
    if (i === q.correctIndex) return "border-success bg-success/10";
    if (chosen === i) return "border-danger bg-danger/10";
    return "border-border opacity-30 cursor-default";
  };

  const getBadgeStyle = (i: number) => {
    if (!isSubmitted) {
      if (chosen === i) return "bg-accent text-accent-foreground border-accent";
      return "bg-surface-tertiary text-muted border-border";
    }
    if (i === q.correctIndex) return "bg-success text-white border-success";
    if (chosen === i) return "bg-danger text-white border-danger";
    return "bg-surface-tertiary text-muted/40 border-border";
  };

  const getTextStyle = (i: number) => {
    if (!isSubmitted) return "text-foreground";
    if (i === q.correctIndex) return "text-success";
    if (chosen === i) return "text-danger";
    return "text-muted/40";
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-separator bg-surface">
        <div className="flex items-center gap-2">
          {isRedoMode && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-warning/15 text-warning border border-warning/25 px-2 py-0.5 font-mono text-[10px]">
              <ArrowsClockwise size={11} weight="bold" />
              {t("quiz.redoBadge")}
            </span>
          )}
          {timeLeft !== null && (
            <span className={`flex items-center gap-1 font-mono text-sm ${timeLeft <= 60 ? "text-danger" : "text-muted"}`}>
              <Timer size={14} />
              {formatTime(timeLeft)}
            </span>
          )}
        </div>
        <span className="font-mono text-sm text-muted">
          {currentIndex + 1}
          <span className="text-muted/50"> / {questions.length}</span>
        </span>
        <div />
      </div>

      <div className="h-0.5 bg-surface-tertiary">
        <motion.div className="h-0.5 bg-accent" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.3 }} />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-xl">
          <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <p className="text-lg font-serif leading-relaxed text-foreground mb-8 text-center sm:text-left whitespace-pre-line">{q.text}</p>

            <div className="flex flex-col gap-2.5">
              {q.options.map((o, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-150 ${isSubmitted ? "" : "cursor-pointer"} ${getOptionStyle(i)}`}
                  onClick={() => !isSubmitted && selectAnswer(q.id, i, false)}
                >
                  <span className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${getBadgeStyle(i)}`}>{LABELS[i]}</span>
                  <span className={`flex-1 leading-snug whitespace-pre-line ${getTextStyle(i)}`}>{o}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-separator bg-surface">
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="md" isDisabled={currentIndex === 0} onPress={prevQuestion}>
            <CaretLeft size={16} weight="bold" />
            {t("quiz.prev")}
          </Button>

          {!isSubmitted ? (
            <Button variant="primary" size="md" isDisabled={!hasChosen} onPress={() => hasChosen && selectAnswer(q.id, chosen, true)}>
              <CheckSquare size={16} weight="bold" />
              {t("quiz.check")}
            </Button>
          ) : isLast ? (
            <Button variant="primary" size="md" isDisabled={!allSubmitted} onPress={nextQuestion}>
              {t("quiz.viewResult")}
              <CaretRight size={16} weight="bold" />
            </Button>
          ) : (
            <Button variant="secondary" size="md" onPress={nextQuestion}>
              {t("quiz.next")}
              <CaretRight size={16} weight="bold" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
