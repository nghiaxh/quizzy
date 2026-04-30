import { useQuizStore } from "../store/quizStore";
import { ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";

const LABELS = ["A", "B", "C", "D"];

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-base-content/30">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      </svg>
      <p className="text-sm font-medium">Chưa có câu hỏi</p>
      <p className="text-xs">Soạn đề trong tab Editor trước nhé</p>
    </div>
  );
}

export default function Quiz() {
  const { questions, currentIndex, answers, submitted, selectAnswer, nextQuestion, prevQuestion, score } = useQuizStore();

  if (questions.length === 0) return <EmptyState />;

  const q = questions[currentIndex];
  const chosen = answers[q.id];
  const isSubmitted = submitted[q.id];
  const hasChosen = chosen !== undefined;
  const answeredCount = Object.keys(submitted).length;
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
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-base-300 bg-base-100">
        <span className="text-xs font-medium text-base-content/40">
          {currentIndex + 1}
          <span className="text-base-content/20"> / {questions.length}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs text-base-content/50">{score()} đúng</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-base-300" />
          <span className="text-xs text-base-content/50">
            {answeredCount}/{questions.length} đã trả lời
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-0.5 bg-base-200">
        <div className="h-0.5 bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-xl">
          <p className="text-[11px] font-semibold text-primary/60 uppercase tracking-widest mb-3 text-center">Câu {currentIndex + 1}</p>
          <p className="text-lg font-semibold leading-relaxed text-base-content mb-8 text-center">{q.text}</p>

          <div className="flex flex-col gap-3">
            {q.options.map((o, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-sm transition-all duration-150 ${isSubmitted ? "" : "cursor-pointer"} ${getOptionStyle(i)}`} onClick={() => !isSubmitted && selectAnswer(q.id, i, false)}>
                <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-all ${getCircleStyle(i)}`}>{LABELS[i]}</span>
                <span className="flex-1 leading-snug">{o}</span>
                {isSubmitted && i === q.correctIndex && <span className="text-success shrink-0 text-lg">✓</span>}
                {isSubmitted && chosen === i && i !== q.correctIndex && <span className="text-error shrink-0 text-lg">✗</span>}
              </div>
            ))}
          </div>

          {/* Feedback */}
          {isSubmitted && <div className={`mt-5 text-sm px-5 py-3 rounded-2xl font-medium border ${chosen === q.correctIndex ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"}`}>{chosen === q.correctIndex ? "🎉 Chính xác!" : `✗ Đáp án đúng: ${LABELS[q.correctIndex]}. ${q.options[q.correctIndex]}`}</div>}
        </div>
      </div>

      {/* Footer – only two buttons: Previous and Main Action */}
      <div className="px-6 py-4 border-t border-base-300 bg-base-100">
        <div className="flex items-center justify-center gap-3">
          {/* Previous button */}
          <button className="flex items-center gap-2 btn btn-md btn-ghost" onClick={prevQuestion} disabled={currentIndex === 0}>
            <ChevronLeft size={18} />
            Trước
          </button>

          {/* Main Action button */}
          {!isSubmitted ? (
            <button className={`flex items-center gap-2 btn btn-md transition-all ${hasChosen ? "btn-primary" : "btn-disabled bg-base-200 text-base-content/25 border-base-200"}`} onClick={() => hasChosen && selectAnswer(q.id, chosen, true)} disabled={!hasChosen}>
              <CheckSquare size={17} />
              Kiểm tra
            </button>
          ) : isLast ? (
            <button className={`flex items-center gap-2 btn btn-md ${allSubmitted ? "btn-primary" : "btn-disabled opacity-40"}`} onClick={nextQuestion} disabled={!allSubmitted}>
              Xem kết quả
              <ChevronRight size={17} />
            </button>
          ) : (
            <button className="flex items-center gap-2 btn btn-md btn-outline btn-success" onClick={nextQuestion}>
              Câu tiếp
              <ChevronRight size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
