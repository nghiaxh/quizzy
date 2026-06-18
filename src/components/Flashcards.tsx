import { useEffect } from "react";
import { useQuizStore } from "../store/quizStore";
import { ChevronLeft, ChevronRight, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";

const LABELS = ["A", "B", "C", "D"];

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
          // rating is done via buttons only
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
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-base-300 bg-base-100">
        <span className="text-sm font-semibold text-base-content/70">
          {t("flashcard.title")}
        </span>
        <span className="text-sm font-medium text-base-content/40">
          {flashcardCurrentIndex + 1}
          <span className="text-base-content/50"> / {questions.length}</span>
        </span>
        <div />
      </div>

      {/* Progress */}
      <div className="h-0.5 bg-base-200">
        <div className="h-0.5 bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Card area */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl">
          {/* Card */}
          <div
            className={`relative bg-base-100 border-2 rounded-2xl p-8 transition-all duration-300 min-h-64 flex flex-col items-center justify-center cursor-pointer ${isRevealed ? (isRated ? (isCorrect ? "border-success bg-success/5" : "border-error bg-error/5") : "border-primary bg-primary/5") : "border-base-300 hover:border-primary/40 hover:shadow-md"}`}
            onClick={() => !isRevealed && revealCard(q.id)}
          >
            {!isRevealed ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-lg font-semibold leading-relaxed text-base-content whitespace-pre-line">
                  {q.text}
                </p>
                <span className="flex items-center gap-1.5 text-xs text-base-content/30 mt-4">
                  <Eye size={14} />
                  {t("flashcard.tapToReveal")}
                </span>
              </div>
            ) : (
              <div className="w-full text-center">
                <p className="text-lg font-semibold leading-relaxed text-base-content mb-6 whitespace-pre-line">
                  {q.text}
                </p>
                <div className="flex flex-col gap-2 max-w-sm mx-auto">
                  {q.options.map((o, i) => {
                    const isCorrectOpt = i === q.correctIndex;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                          isCorrectOpt
                            ? "border-success bg-success/10 text-success"
                            : "border-base-300 text-base-content/40 opacity-50"
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCorrectOpt
                            ? "bg-success text-white"
                            : "bg-base-300 text-base-content/30"
                        }`}>
                          {LABELS[i]}
                        </span>
                        <span className="flex-1 leading-snug whitespace-pre-line">{o}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Rating buttons (after reveal, before rating) */}
          {isRevealed && !isRated && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                className="flex items-center gap-2 btn btn-lg btn-success px-8"
                onClick={() => rateCard(q.id, true)}
              >
                <ThumbsUp size={18} />
                {t("flashcard.gotIt")}
                <span className="text-xs opacity-60 ml-1">(1)</span>
              </button>
              <button
                className="flex items-center gap-2 btn btn-lg btn-error px-8"
                onClick={() => rateCard(q.id, false)}
              >
                <ThumbsDown size={18} />
                {t("flashcard.stillLearning")}
                <span className="text-xs opacity-60 ml-1">(2)</span>
              </button>
            </div>
          )}

          {/* Post-rating feedback */}
          {isRated && (
            <div className="flex items-center justify-center mt-6">
              <div className={`flex items-center gap-2 text-base font-semibold ${isCorrect ? "text-success" : "text-error"}`}>
                {isCorrect ? (
                  <><ThumbsUp size={20} /> {t("flashcard.gotIt")}</>
                ) : (
                  <><ThumbsDown size={20} /> {t("flashcard.stillLearning")}</>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
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
