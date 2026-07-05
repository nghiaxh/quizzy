import { useQuizStore } from "../store/quizStore";
import { parseQuestions } from "../utils/parser";
import { CheckCircle2, Search, FileText } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "../i18n/useTranslation";

const CORRECT_LABELS = ["A", "B", "C", "D"];

function makeSampleQuestion(n: number, lang: string) {
  const correctIdx = (n - 1) % 4;
  const options = CORRECT_LABELS.map((label, i) =>
    `${i === correctIdx ? "*" : ""}${label}. ${lang === "vi" ? `Đáp án ${label}` : `Answer ${label}`}`
  );
  return `${n}. ${lang === "vi" ? "Nội dung câu hỏi" : `Question content`}\n${options.join("\n")}`;
}

const SAMPLE_EXAM_VI = Array.from({ length: 10 }, (_, i) => makeSampleQuestion(i + 1, "vi")).join("\n\n");
const SAMPLE_EXAM_EN = Array.from({ length: 10 }, (_, i) => makeSampleQuestion(i + 1, "en")).join("\n\n");

export default function Editor() {
  const { rawText, setRawText } = useQuizStore();
  const { t, lang } = useTranslation();
  const preview = parseQuestions(rawText);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  const syncScroll = useCallback((source: HTMLElement, target: HTMLElement) => {
    const sourceScrollable = source.scrollHeight - source.clientHeight;
    const targetScrollable = target.scrollHeight - target.clientHeight;
    if (sourceScrollable <= 0 || targetScrollable <= 0) return;

    const pct = source.scrollTop / sourceScrollable;
    target.scrollTop = pct * targetScrollable;
  }, []);

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

  const [searchPreview, setSearchPreview] = useState("");
  const [gotoPreview, setGotoPreview] = useState("");

  const filteredPreview = preview.filter((q, idx) => q.text.toLowerCase().includes(searchPreview.toLowerCase()) || (idx + 1).toString().includes(searchPreview));

  const handleGoToQuestion = useCallback(() => {
    const num = parseInt(gotoPreview, 10);
    if (!isNaN(num) && num >= 1 && num <= preview.length) {
      const el = document.getElementById(`preview-q-${num - 1}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      setGotoPreview("");
    }
  }, [gotoPreview, preview.length]);

  const handleAddSample = () => {
    const next = preview.length + 1;
    setRawText(rawText ? `${rawText}\n\n${makeSampleQuestion(next, lang)}` : makeSampleQuestion(next, lang));
  };

  const handleLoadSample = () => {
    setRawText(lang === "vi" ? SAMPLE_EXAM_VI : SAMPLE_EXAM_EN);
  };

  return (
    <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
      {/* Editor */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between px-4 py-2.5 bg-base-200 border-b border-base-300">
          <span className="text-xs font-medium text-base-content/50">{t("editor.title")}</span>
          <div className="flex items-center gap-1">
            <button className="btn btn-sm btn-ghost text-secondary flex items-center gap-1" onClick={handleAddSample} title={t("editor.addSample")}>
              <FileText size={13} />
              <span className="text-xs">{t("editor.addSample")}</span>
            </button>
            <button className="btn btn-sm btn-ghost text-primary flex items-center gap-1" onClick={handleLoadSample} title={t("editor.loadSample")}>
              <FileText size={13} />
              <span className="text-xs">{t("editor.loadSample")}</span>
            </button>
          </div>
        </div>

        <textarea ref={textareaRef} className="flex-1 p-5 text-sm font-mono resize-none bg-base-100 outline-none leading-7 text-base-content placeholder:text-base-content/20" value={rawText} onChange={(e) => setRawText(e.target.value)} spellCheck={false} placeholder={t("editor.placeholder")} />
      </div>

      {/* Divider */}
      <div className="w-px bg-base-300 shrink-0 hidden sm:block" />

      {/* Preview */}
      <div className="flex flex-col flex-1 min-w-0 bg-base-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-base-300 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-30">
            <input className="input input-sm input-bordered w-full text-xs" placeholder={t("editor.searchPlaceholder")} value={searchPreview} onChange={(e) => setSearchPreview(e.target.value)} />
          </div>
          <div className="flex items-center gap-1">
            <input className="input input-sm input-bordered w-24 text-xs text-center" placeholder={t("editor.gotoPlaceholder")} value={gotoPreview} onChange={(e) => setGotoPreview(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleGoToQuestion()} />
            <button className="btn btn-sm" onClick={handleGoToQuestion}>
              <span>{t("editor.find")}</span>
            </button>
          </div>
          {preview.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-success font-medium ml-auto">
              <CheckCircle2 size={12} />
              {preview.length} {t("editor.questions")}
            </span>
          )}
        </div>

        <div ref={previewRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {filteredPreview.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-base-content/20">
              <Search size={28} />
              <span className="text-xs text-center">{searchPreview ? t("editor.noMatch") : rawText.trim() === "" ? t("editor.startHint") : t("editor.noValid")}</span>
            </div>
          ) : (
            filteredPreview.map((q) => (
              <div key={q.id} id={`preview-q-${q.id}`} className="bg-base-100 border border-base-300 rounded-xl p-3 text-sm scroll-mt-4">
                <p className="font-semibold mb-2 leading-snug text-base-content whitespace-pre-line">
                  {q.id + 1}. {q.text}
                </p>
                <div className="flex flex-col gap-0.5">
                  {q.options.map((o, i) => (
                    <div key={i} className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg ${i === q.correctIndex ? "bg-success/10 text-success" : "text-base-content/40"}`}>
                      <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center shrink-0 font-bold ${i === q.correctIndex ? "bg-success text-white" : "bg-base-300 text-base-content/40"}`}>{"ABCD"[i]}</span>
                      <span className="whitespace-pre-line">{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
