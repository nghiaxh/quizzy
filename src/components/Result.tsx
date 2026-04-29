import { useEffect } from "react";
import { useQuizStore } from "../store/quizStore";
import { fireBig } from "../utils/confetti";
import { RotateCcw, PenLine, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

export default function Result() {
  const { questions, submitted, score, resetQuiz, setTab } = useQuizStore();

  const total = questions.length;
  const correct = score();
  const wrong = Object.keys(submitted).length - correct;
  const skip = total - Object.keys(submitted).length;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  const verdict = pct >= 80 ? { text: "Xuất sắc! 🎉", cls: "text-success" } : pct >= 60 ? { text: "Tốt!", cls: "text-primary" } : pct >= 40 ? { text: "Cần ôn thêm", cls: "text-warning" } : { text: "Cố gắng hơn nhé", cls: "text-error" };

  const circumference = 2 * Math.PI * 54;
  const ringColor = pct >= 80 ? "text-success" : pct >= 60 ? "text-primary" : pct >= 40 ? "text-warning" : "text-error";

  useEffect(() => {
    if (pct >= 80) fireBig();
  }, []);

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
            {correct}
            <span className="text-2xl text-base-content/30">/{total}</span>
          </div>
          <div className="text-sm text-base-content/40 mt-1">{pct}%</div>
        </div>
      </div>

      <p className={`text-2xl font-semibold ${verdict.cls}`}>{verdict.text}</p>

      {/* Stats */}
      <div className="flex gap-4">
        {[
          { label: "Đúng", value: correct, cls: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
          { label: "Sai", value: wrong, cls: "text-error", bg: "bg-error/10", icon: XCircle },
          { label: "Bỏ qua", value: skip, cls: "text-base-content/40", bg: "bg-base-200", icon: MinusCircle },
        ].map(({ label, value, cls, bg, icon: Icon }) => (
          <div key={label} className={`${bg} rounded-2xl px-8 py-4 text-center`}>
            <Icon size={20} className={`mx-auto mb-1.5 ${cls}`} />
            <div className={`text-3xl font-bold ${cls}`}>{value}</div>
            <div className="text-xs text-base-content/40 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="flex items-center gap-1.5 btn btn-primary"
          onClick={() => {
            resetQuiz();
            setTab("quiz");
          }}>
          <RotateCcw size={14} />
          Làm lại
        </button>
        <button className="flex items-center gap-1.5 btn btn-ghost" onClick={() => setTab("editor")}>
          <PenLine size={14} />
          Sửa đề
        </button>
      </div>
    </div>
  );
}
