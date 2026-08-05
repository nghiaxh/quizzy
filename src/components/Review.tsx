import { useQuizStore } from "../store/quizStore";
import { Button } from "@heroui/react";
import { ArrowLeft, CheckCircle, XCircle } from "@phosphor-icons/react";
import { useTranslation } from "../i18n/useTranslation";

const LABELS = ["A", "B", "C", "D"];

export default function Review() {
  const { questions, answers, submitted, setTab } = useQuizStore();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-separator bg-surface">
        <Button variant="ghost" size="sm" onPress={() => setTab("result")}>
          <ArrowLeft size={14} weight="bold" />
          {t("review.back")}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {questions.map((q) => {
            const chosen = answers[q.id];
            const isCorrect = submitted[q.id] && chosen === q.correctIndex;
            const Icon = isCorrect ? CheckCircle : XCircle;
            return (
              <div key={q.id} className="bg-surface border border-border rounded-lg p-4 text-sm">
                <div className="flex items-start gap-2 mb-3">
                  <Icon size={15} weight="fill" className={`shrink-0 mt-0.5 ${isCorrect ? "text-success" : "text-danger"}`} />
                  <p className="font-medium leading-snug text-foreground whitespace-pre-line">
                    <span className="font-mono text-muted mr-1.5">{q.id + 1}.</span>
                    {q.text}
                  </p>
                </div>
                <div className="flex flex-col gap-1 ml-6">
                  {q.options.map((o, i) => {
                    const isChosen = chosen === i;
                    const isCorrectOpt = i === q.correctIndex;
                    let rowCls = "";
                    let dotCls = "bg-surface-tertiary text-muted";
                    if (isCorrectOpt) { rowCls = "bg-success/10 text-success"; dotCls = "bg-success text-white"; }
                    else if (isChosen) { rowCls = "bg-danger/10 text-danger"; dotCls = "bg-danger text-white"; }
                    return (
                      <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${rowCls}`}>
                        <span className={`w-5 h-5 rounded-md text-[10px] font-mono flex items-center justify-center shrink-0 font-bold ${dotCls}`}>{LABELS[i]}</span>
                        <span className="flex-1 whitespace-pre-line">{o}</span>
                        {isCorrectOpt && <CheckCircle size={12} weight="fill" className="text-success shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
