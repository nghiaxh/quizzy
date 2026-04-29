import { useQuizStore } from "../store/quizStore";
import { parseQuestions } from "../utils/parser";
import { HelpCircle, X, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

const HELP_EXAMPLE = `1. Nội dung câu hỏi
A. Đáp án A
*B. Đáp án đúng   ← dấu * = đúng
C. Đáp án C
D. Đáp án D`;

const HELP_SAMPLE = `1. Thủ đô của Việt Nam?
A. TP. Hồ Chí Minh
*B. Hà Nội
C. Đà Nẵng
D. Huế

2. React do ai phát triển?
A. Google
*B. Meta
C. Microsoft
D. Netflix`;

const RULES = [
  { icon: "✱", text: "Dấu * trước đáp án → đáp án đúng" },
  { icon: "↵", text: "Cách nhau 1 dòng trống giữa các câu" },
  { icon: "#", text: "Số thứ tự câu: 1. 2. 3. ..." },
  { icon: "A", text: "Hỗ trợ 2–4 đáp án mỗi câu (A đến D)" },
];

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-base-100 border border-base-300 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-primary" />
            <span className="font-semibold text-sm">Cách soạn câu hỏi</span>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest mb-2">Cấu trúc</p>
            <pre className="bg-base-200 rounded-xl px-4 py-3 text-xs leading-6 text-base-content whitespace-pre">{HELP_EXAMPLE}</pre>
          </div>
          <div>
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest mb-2">Quy tắc</p>
            <div className="flex flex-col gap-1.5">
              {RULES.map((r) => (
                <div key={r.text} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{r.icon}</span>
                  <span className="text-base-content/70">{r.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest mb-2">Ví dụ</p>
            <pre className="bg-base-200 rounded-xl px-4 py-3 text-xs leading-6 text-base-content/70 whitespace-pre">{HELP_SAMPLE}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Editor() {
  const { rawText, setRawText } = useQuizStore();
  const [showHelp, setShowHelp] = useState(false);
  const preview = parseQuestions(rawText);

  return (
    <>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <div className="flex flex-1 overflow-hidden">
        {/* Editor — flex-1 */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between px-4 py-2.5 bg-base-200 border-b border-base-300">
            <span className="text-xs font-medium text-base-content/50">Soạn câu hỏi</span>
            <button className="btn btn-xs btn-ghost btn-circle" onClick={() => setShowHelp(true)} title="Hướng dẫn">
              <HelpCircle size={15} className="text-base-content/40" />
            </button>
          </div>

          <textarea className="flex-1 p-5 text-sm resize-none bg-base-100 outline-none leading-7 text-base-content placeholder:text-base-content/20" value={rawText} onChange={(e) => setRawText(e.target.value)} spellCheck={false} placeholder={`1. Câu hỏi của bạn\nA. Sai\n*B. Đúng\nC. Sai\nD. Sai`} />
        </div>

        {/* Divider */}
        <div className="w-px bg-base-300 shrink-0" />

        {/* Preview — flex-1 */}
        <div className="flex flex-col flex-1 min-w-0 bg-base-200 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-base-300 flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">Preview</span>
            {preview.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-success font-medium">
                <CheckCircle2 size={12} />
                {preview.length} câu
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {preview.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-base-content/20">
                <Circle size={28} />
                <span className="text-xs text-center">Chưa có câu hỏi hợp lệ</span>
              </div>
            ) : (
              preview.map((q, qi) => (
                <div key={q.id} className="bg-base-100 border border-base-300 rounded-xl p-3 text-xs">
                  <p className="font-semibold mb-2 leading-snug text-base-content">
                    {qi + 1}. {q.text}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {q.options.map((o, i) => (
                      <div key={i} className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg ${i === q.correctIndex ? "bg-success/10 text-success" : "text-base-content/40"}`}>
                        <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center shrink-0 font-bold ${i === q.correctIndex ? "bg-success text-white" : "bg-base-300 text-base-content/40"}`}>{"ABCD"[i]}</span>
                        <span className="truncate">{o}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
