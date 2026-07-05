import { useEffect } from "react";
import { useQuizStore } from "../store/quizStore";
import { ChevronLeft, ChevronRight, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";
import { motion } from "framer-motion";

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-base-content/30">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      </svg>
      <p className="text-sm font-medium">{t("flashcard.emptyTitle")}</p>
      <p className="text-xs">{t("flashcard.emptyDesc")}</p>
    </div>
  );
}

export default function Flashcards() {
  const { questions, flashcardCurrentIndex, flashcardRatings, flashcardRevealed, revealCard, rateCard, nextFlashcard, prevFlashcard } = useQuizStore();
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const state = useQuizStore.getState();
      if (state.questions.length === 0) return;
      const q = state.questions[state.flashcardCurrentIndex];
      const isRevealed = state.flashcardRevealed[q.id];
      const isRated = state.flashcardRatings[q.id] !== undefined;

      if (e.key === " " || e.key === "Enter") {
        if (!isRevealed) {
          state.revealCard(q.id);
        } else if (isRevealed && !isRated) {
        } else if (isRated) {
          state.nextFlashcard();
        }
        e.preventDefault();
        return;
      }

      if (e.key === "1" && isRevealed && !isRated) {
        state.rateCard(q.id, true);
        e.preventDefault();
        return;
      }

      if (e.key === "2" && isRevealed && !isRated) {
        state.rateCard(q.id, false);
        e.preventDefault();
        return;
      }

      if (e.key === "ArrowLeft") {
        state.prevFlashcard();
        e.preventDefault();
        return;
      }

      if (e.key === "ArrowRight") {
        if (isRated) {
          state.nextFlashcard();
        }
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (questions.length === 0) return <EmptyState />;

  const q = questions[flashcardCurrentIndex];
  const isRevealed = flashcardRevealed[q.id];
  const isRated = flashcardRatings[q.id] !== undefined;
  const isCorrect = flashcardRatings[q.id] === true;
  const isLast = flashcardCurrentIndex === questions.length - 1;
  const allRated = questions.every((q) => flashcardRatings[q.id] !== undefined);
  const progressPct = ((flashcardCurrentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-base-300 bg-base-100">
        <span className="text-sm font-semibold text-base-content/70">
          {t("flashcard.title")}
        </span>
        <span className="text-sm font-medium text-base-content/40">
          {flashcardCurrentIndex + 1}
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

      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl">
          <div className="relative" style={{ perspective: "1000px" }}>
            <motion.div
              className="relative w-full"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: isRevealed ? 180 : 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <div
                className="bg-base-100 border-2 border-primary rounded-2xl p-8 min-h-64 flex flex-col items-center justify-center cursor-pointer"
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => !isRevealed && revealCard(q.id)}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <p className="text-lg font-semibold leading-relaxed text-base-content whitespace-pre-line">
                    {q.text}
                  </p>
                  <span className="flex items-center gap-1.5 text-xs text-base-content/30 mt-4">
                    <Eye size={14} />
                    {t("flashcard.tapToReveal")}
                  </span>
                </div>
              </div>
              <div
                className="absolute inset-0 bg-base-100 border-2 border-primary rounded-2xl p-8 flex flex-col items-center justify-center"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="flex flex-col items-center gap-3 text-center w-full">
                  <p className="text-sm font-medium text-base-content/50 mb-1">
                    {t("flashcard.title")}
                  </p>
                  <p className="text-xl font-bold leading-relaxed text-success whitespace-pre-line">
                    {q.options[q.correctIndex]}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {isRevealed && !isRated && (
            <motion.div
              className="flex items-center justify-center gap-4 mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="flex items-center gap-1.5 btn btn-sm btn-success"
                onClick={() => rateCard(q.id, true)}
              >
                <ThumbsUp size={14} />
                {t("flashcard.gotIt")}
                <span className="text-[10px] opacity-60">(1)</span>
              </button>
              <button
                className="flex items-center gap-1.5 btn btn-sm btn-error"
                onClick={() => rateCard(q.id, false)}
              >
                <ThumbsDown size={14} />
                {t("flashcard.stillLearning")}
                <span className="text-[10px] opacity-60">(2)</span>
              </button>
            </motion.div>
          )}

          {isRated && (
            <motion.div
              className="flex items-center justify-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <div className={`flex items-center gap-2 text-base font-semibold ${isCorrect ? "text-success" : "text-error"}`}>
                {isCorrect ? (
                  <><ThumbsUp size={20} /> {t("flashcard.gotIt")}</>
                ) : (
                  <><ThumbsDown size={20} /> {t("flashcard.stillLearning")}</>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-base-300 bg-base-100">
        <div className="flex items-center justify-center gap-3">
          <button
            className="flex items-center gap-2 btn btn-md btn-ghost"
            onClick={prevFlashcard}
            disabled={flashcardCurrentIndex === 0}
          >
            <ChevronLeft size={18} />
            {t("flashcard.prev")}
          </button>

          {isRated && !isLast && (
            <button
              className="flex items-center gap-2 btn btn-md btn-outline btn-success"
              onClick={nextFlashcard}
            >
              {t("flashcard.next")}
              <ChevronRight size={17} />
            </button>
          )}

          {isRated && isLast && allRated && (
            <button
              className="flex items-center gap-2 btn btn-md btn-primary"
              onClick={nextFlashcard}
            >
              {t("flashcard.viewSummary")}
              <ChevronRight size={17} />
            </button>
          )}

          {!isRated && isRevealed && (
            <span className="text-xs text-base-content/40 italic">
              {t("flashcard.gotIt")} (1) / {t("flashcard.stillLearning")} (2)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
