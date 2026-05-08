import { useQuizStore } from "../store/quizStore";
import { parseQuestions } from "../utils/parser";
import { HelpCircle, X, CheckCircle2, Circle } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

const HELP_EXAMPLE = `1. Nội dung câu hỏi
A. Đáp án A
*B. Đáp án đúng   ← * = đúng
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

// HelpModal nhỏ hơn, responsive, tối ưu mobile
function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-base-100 border border-base-300 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header nhỏ hơn */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-base-300">
          <div className="flex items-center gap-1.5">
            <HelpCircle size={14} className="text-primary" />
            <span className="font-semibold text-xs sm:text-sm">Cách soạn câu hỏi</span>
          </div>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
            <X size={12} />
          </button>
        </div>

        {/* Nội dung cuộn riêng */}
        <div className="overflow-y-auto p-3 sm:p-4 text-xs space-y-3">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-1.5">Cấu trúc</p>
            <pre className="bg-base-200 rounded-lg px-3 py-2 text-xs leading-5 whitespace-pre">{HELP_EXAMPLE}</pre>
          </div>

          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-1.5">Ví dụ</p>
            <pre className="bg-base-200 rounded-lg px-3 py-2 text-xs leading-5 text-base-content/70 whitespace-pre">{HELP_SAMPLE}</pre>
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

  // Refs cho đồng bộ cuộn
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  // Hàm đồng bộ cuộn từ nguồn sang đích
  const syncScroll = useCallback((source: HTMLElement, target: HTMLElement) => {
    const sourceScrollable = source.scrollHeight - source.clientHeight;
    const targetScrollable = target.scrollHeight - target.clientHeight;
    if (sourceScrollable <= 0 || targetScrollable <= 0) return;

    const pct = source.scrollTop / sourceScrollable;
    target.scrollTop = pct * targetScrollable;
  }, []);

  // Xử lý cuộn textarea -> preview
  const onTextareaScroll = useCallback(() => {
    if (syncing.current) return;
    syncing.current = true;
    const src = textareaRef.current;
    const dest = previewRef.current;
    if (src && dest) syncScroll(src, dest);
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  }, [syncScroll]);

  // Xử lý cuộn preview -> textarea
  const onPreviewScroll = useCallback(() => {
    if (syncing.current) return;
    syncing.current = true;
    const src = previewRef.current;
    const dest = textareaRef.current;
    if (src && dest) syncScroll(src, dest);
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  }, [syncScroll]);

  useEffect(() => {
    const ta = textareaRef.current;
    const pr = previewRef.current;
    if (ta) ta.addEventListener("scroll", onTextareaScroll, { passive: true });
    if (pr) pr.addEventListener("scroll", onPreviewScroll, { passive: true });
    return () => {
      if (ta) ta.removeEventListener("scroll", onTextareaScroll);
      if (pr) pr.removeEventListener("scroll", onPreviewScroll);
    };
  }, [onTextareaScroll, onPreviewScroll]);

  return (
    <>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
        {/* Editor */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between px-4 py-2.5 bg-base-200 border-b border-base-300">
            <span className="text-xs font-medium text-base-content/50">Soạn câu hỏi</span>
            <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => setShowHelp(true)} title="Hướng dẫn">
              <span className="text-xs font-medium text-base-content/50 hidden sm:inline">Hướng dẫn</span>
              <HelpCircle size={15} className="text-base-content/40" />
            </div>
          </div>

          <textarea ref={textareaRef} className="flex-1 p-5 text-sm resize-none bg-base-100 outline-none leading-7 text-base-content placeholder:text-base-content/20" value={rawText} onChange={(e) => setRawText(e.target.value)} spellCheck={false} placeholder={`1. Câu hỏi của bạn\nA. Sai\n*B. Đúng\nC. Sai\nD. Sai`} />
        </div>

        {/* Divider */}
        <div className="w-px bg-base-300 shrink-0 hidden sm:block" />

        {/* Preview */}
        <div className="flex flex-col flex-1 min-w-0 bg-base-200 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-base-300 flex items-center justify-between">
            {preview.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-success font-medium">
                <CheckCircle2 size={12} />
                {preview.length} câu
              </span>
            )}
          </div>

          <div ref={previewRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
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
