import { useQuizStore } from "../store/quizStore";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";

const LABELS = ["A", "B", "C", "D"];

export default function Review() {
  const { questions, answers, submitted, setTab } = useQuizStore();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-base-300 bg-base-100">
        <button className="flex items-center gap-1.5 btn btn-ghost btn-sm" onClick={() => setTab("result")}>
          <ArrowLeft size={14} />
          {t("review.back")}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {questions.map((q) => {
            const chosen = answers[q.id];
            const isCorrect = submitted[q.id] && chosen === q.correctIndex;
            const Icon = isCorrect ? CheckCircle2 : XCircle;
            return (
              <div key={q.id} className="bg-base-100 border border-base-300 rounded-xl p-4 text-sm">
                <div className="flex items-start gap-2 mb-3">
                  <Icon size={16} className={`shrink-0 mt-0.5 ${isCorrect ? "text-success" : "text-error"}`} />
                  <p className="font-semibold leading-snug text-base-content whitespace-pre-line">
                    {q.id + 1}. {q.text}
                  </p>
                </div>
                <div className="flex flex-col gap-1 ml-6">
                  {q.options.map((o, i) => {
                    const isChosen = chosen === i;
                    const isCorrectOpt = i === q.correctIndex;
                    let rowCls = "";
                    let dotCls = "bg-base-300 text-base-content/40";
                    if (isCorrectOpt) { rowCls = "bg-success/10"; dotCls = "bg-success text-white"; }
                    else if (isChosen) { rowCls = "bg-error/10"; dotCls = "bg-error text-white"; }
                    return (
                      <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${rowCls}`}>
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center shrink-0 font-bold ${dotCls}`}>{LABELS[i]}</span>
                        <span className="flex-1 whitespace-pre-line">{o}</span>
                        {isCorrectOpt && <CheckCircle2 size={12} className="text-success shrink-0" />}
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
