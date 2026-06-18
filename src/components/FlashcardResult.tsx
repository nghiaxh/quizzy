import { useQuizStore } from "../store/quizStore";
import { RotateCcw, PenLine, Eye, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";

export default function FlashcardResult() {
  const { questions, flashcardRatings, startFlashcards, redoFlashcardMissed, setTab } = useQuizStore();
  const { t } = useTranslation();

  const total = questions.length;
  const gotIt = questions.filter((q) => flashcardRatings[q.id] === true).length;
  const missed = total - gotIt;
  const pct = total ? Math.round((gotIt / total) * 100) : 0;

  const circumference = 2 * Math.PI * 54;
  const ringColor = pct >= 80 ? "text-success" : pct >= 60 ? "text-primary" : pct >= 40 ? "text-warning" : "text-error";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 p-8">
      {/* Ring */}
      <div className="relative flex items-center justify-center w-44 h-44">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="7" className="text-base-300" />
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct / 100)} className={ringColor} style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div className="text-center z-10">
          <div className="text-4xl font-bold text-base-content">
            {gotIt}
            <span className="text-2xl text-base-content/30">/{total}</span>
          </div>
          <div className="text-sm text-base-content/40 mt-1">{pct}%</div>
        </div>
      </div>

      <p className="text-xl font-semibold text-base-content/70">{t("flashcardResult.title")}</p>

      {/* Stats */}
      <div className="flex gap-4">
        {[
          { label: t("flashcardResult.gotIt"), value: gotIt, cls: "text-success", bg: "bg-success/10", icon: ThumbsUp },
          { label: t("flashcardResult.missed"), value: missed, cls: "text-error", bg: "bg-error/10", icon: ThumbsDown },
        ].map(({ label, value, cls, bg, icon: Icon }) => (
          <div key={label} className={`${bg} rounded-2xl px-8 py-4 text-center`}>
            <Icon size={20} className={`mx-auto mb-1.5 ${cls}`} />
            <div className={`text-3xl font-bold ${cls}`}>{value}</div>
            <div className="text-xs text-base-content/40 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 btn btn-primary" onClick={() => { startFlashcards(); setTab("flashcards"); }}>
          <RotateCcw size={14} />
          {t("flashcardResult.retry")}
        </button>
        {missed > 0 && (
          <button className="flex items-center gap-1.5 btn btn-warning" onClick={redoFlashcardMissed}>
            <RefreshCw size={14} />
            {t("flashcardResult.redoMissed")}
          </button>
        )}
        <button className="flex items-center gap-1.5 btn btn-outline" onClick={() => setTab("review")}>
          <Eye size={14} />
          {t("flashcardResult.review")}
        </button>
        <button className="flex items-center gap-1.5 btn btn-ghost" onClick={() => setTab("editor")}>
          <PenLine size={14} />
          {t("flashcardResult.edit")}
        </button>
      </div>
    </div>
  );
}
