import { useEffect } from "react";
import { useQuizStore } from "../store/quizStore";
import { fireBig } from "../utils/confetti";
import { Button } from "@heroui/react";
import { ArrowsClockwise, CheckCircle, Eye, PencilSimple, XCircle } from "@phosphor-icons/react";
import { useTranslation } from "../i18n/useTranslation";

export default function Result() {
  const { questions, submitted, score, startQuiz, setTab, effectsEnabled, redoIncorrect } = useQuizStore();
  const { t } = useTranslation();

  const total = questions.length;
  const correct = score();
  const wrong = Object.keys(submitted).length - correct;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  const verdict =
    pct >= 80 ? { text: t("result.excellent"), cls: "text-success" } :
    pct >= 60 ? { text: t("result.good"), cls: "text-accent" } :
    pct >= 40 ? { text: t("result.needReview"), cls: "text-warning" } :
    { text: t("result.tryHarder"), cls: "text-danger" };

  const circumference = 2 * Math.PI * 54;
  const ringColor = pct >= 80 ? "text-success" : pct >= 60 ? "text-accent" : pct >= 40 ? "text-warning" : "text-danger";

  useEffect(() => {
    if (pct >= 80 && effectsEnabled) fireBig();
  }, [effectsEnabled, pct]);

  const handleRetry = () => {
    startQuiz();
    setTab("quiz");
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6 sm:p-8 bg-background">
      <div className="relative flex items-center justify-center w-36 sm:w-44 h-36 sm:h-44">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="7" className="text-surface-tertiary" />
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct / 100)} className={ringColor} style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div className="text-center z-10">
          <div className="text-4xl font-bold font-mono text-foreground">
            {correct}
            <span className="text-2xl text-muted/40">/{total}</span>
          </div>
          <div className="text-sm text-muted mt-1 font-mono">{pct}%</div>
        </div>
      </div>

      <p className={`text-2xl font-serif tracking-tight ${verdict.cls}`}>{verdict.text}</p>

      <div className="flex gap-4">
        {[
          { label: t("result.correct"), value: correct, cls: "text-success", bg: "bg-success/10", icon: CheckCircle },
          { label: t("result.wrong"), value: wrong, cls: "text-danger", bg: "bg-danger/10", icon: XCircle },
        ].map(({ label, value, cls, bg, icon: Icon }) => (
          <div key={label} className={`${bg} rounded-xl px-8 py-4 text-center border border-border/40`}>
            <Icon size={20} weight="fill" className={`mx-auto mb-1.5 ${cls}`} />
            <div className={`text-3xl font-bold font-mono ${cls}`}>{value}</div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="primary" size="md" onPress={handleRetry}>
          <ArrowsClockwise size={14} weight="bold" />
          {t("result.retry")}
        </Button>
        {wrong > 0 && (
          <Button variant="secondary" size="md" onPress={redoIncorrect}>
            <ArrowsClockwise size={14} weight="bold" />
            {t("result.redoIncorrect")}
          </Button>
        )}
        <Button variant="outline" size="md" onPress={() => setTab("review")}>
          <Eye size={14} weight="bold" />
          {t("result.review")}
        </Button>
        <Button variant="ghost" size="md" onPress={() => setTab("editor")}>
          <PencilSimple size={14} weight="bold" />
          {t("result.edit")}
        </Button>
      </div>
    </div>
  );
}
