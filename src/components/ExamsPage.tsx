import { useQuizStore, Exam } from "../store/quizStore";
import { parseQuestions } from "../utils/parser";
import { useState, useRef, useCallback } from "react";
import { Plus, Pencil, Trash2, Copy, PlayCircle, BookOpen, Check, X, FileText, Clock, Search } from "lucide-react";

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

function ExamCard({ exam, onClick, isActive }: { exam: Exam; onClick: () => void; isActive: boolean }) {
  const qCount = parseQuestions(exam.rawText).length;

  return (
    <div className={`bg-base-100 border rounded-2xl p-4 flex flex-col gap-2 cursor-pointer transition-all duration-200 hover:shadow-md ${isActive ? "border-primary shadow-sm shadow-primary/10" : "border-base-300 hover:border-base-content/30"}`} onClick={onClick}>
      <p className="font-semibold text-sm text-base-content truncate">{exam.name}</p>
      <div className="flex items-center gap-3 text-xs text-base-content/40">
        <span className="flex items-center gap-1">
          <FileText size={11} />
          {qCount} câu hỏi
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {formatDate(exam.updatedAt)}
        </span>
      </div>
    </div>
  );
}

function ExamDetailModal({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const { deleteExam, duplicateExam, renameExam, selectExam, setTab } = useQuizStore();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(exam.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const questions = parseQuestions(exam.rawText);

  const [searchTerm, setSearchTerm] = useState("");
  const [gotoInput, setGotoInput] = useState("");

  const filteredQuestions = questions.filter((q, idx) => q.text.toLowerCase().includes(searchTerm.toLowerCase()) || (idx + 1).toString().includes(searchTerm));

  const handleGoToQuestion = useCallback(() => {
    const num = parseInt(gotoInput, 10);
    if (!isNaN(num) && num >= 1 && num <= questions.length) {
      const el = document.getElementById(`question-${num - 1}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      setGotoInput("");
    }
  }, [gotoInput, questions.length]);

  const handleRename = () => {
    renameExam(exam.id, editName);
    setEditing(false);
  };

  const handleEditStart = () => {
    setEditing(true);
    setEditName(exam.name);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelectForQuiz = () => {
    selectExam(exam.id);
    setTab("quiz");
    onClose();
  };

  const handleSelectForEditor = () => {
    selectExam(exam.id);
    setTab("editor");
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Xác nhận xóa đề này?")) {
      deleteExam(exam.id);
      onClose();
    }
  };

  const handleDuplicate = () => {
    duplicateExam(exam.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-base-100 border border-base-300 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  className="input input-sm input-bordered flex-1 text-sm font-semibold"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") setEditing(false);
                  }}
                />
                <button className="btn btn-xs btn-ghost btn-circle text-success" onClick={handleRename}>
                  <Check size={12} />
                </button>
                <button className="btn btn-xs btn-ghost btn-circle text-error" onClick={() => setEditing(false)}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div>
                <div className="text-xs space-y-1">
                  <h2 className="font-semibold text-base text-base-content truncate">{exam.name}</h2>
                  <span className="flex items-center gap-1 text-base-content/50">
                    <FileText size={11} />
                    {questions.length} câu hỏi
                  </span>
                </div>
              </div>
            )}
          </div>
          <button className="btn btn-ghost btn-sm btn-circle ml-2 shrink-0" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-b border-base-300 bg-base-100">
          <div className="relative flex-1">
            <input className="input input-sm input-bordered w-full pl-4 pr-2 text-xs" placeholder="Tìm nội dung câu hỏi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-1">
            <input className="input input-sm input-bordered w-24 text-xs text-center" placeholder="Tìm câu" value={gotoInput} onChange={(e) => setGotoInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleGoToQuestion()} />
            <button className="btn btn-sm" onClick={handleGoToQuestion}>
              <span>Tìm</span>
            </button>
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-base-content/30">
              <Search size={28} />
              <span className="text-xs">{searchTerm ? "Không tìm thấy câu hỏi phù hợp" : "Chưa có câu hỏi nào"}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredQuestions.map((q) => (
                <div key={q.id} id={`question-${q.id}`} className="bg-base-200/50 border border-base-300 rounded-xl p-3 text-sm scroll-mt-4">
                  <p className="font-semibold mb-2 leading-snug text-base-content">
                    {q.id + 1}. {q.text}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {q.options.map((o, i) => (
                      <div key={i} className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg ${i === q.correctIndex ? "bg-success/10 text-success" : "text-base-content/50"}`}>
                        <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center shrink-0 font-bold ${i === q.correctIndex ? "bg-success text-white" : "bg-base-300 text-base-content/40"}`}>{"ABCD"[i]}</span>
                        <span className="truncate">{o}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-base-300 flex flex-wrap items-center gap-2">
          <button className="btn btn-sm btn-ghost" onClick={handleEditStart}>
            <Pencil size={12} /> Sửa tên
          </button>
          <button className="btn btn-sm btn-ghost" onClick={handleDuplicate}>
            <Copy size={12} /> Nhân bản
          </button>
          <button className="btn btn-sm btn-ghost text-error" onClick={handleDelete}>
            <Trash2 size={12} /> Xóa
          </button>
          <div className="flex-1" />
          <button className="btn btn-sm btn-outline" onClick={handleSelectForEditor}>
            <BookOpen size={12} /> Soạn đề
          </button>
          <button className={`btn btn-sm ${questions.length > 0 ? "btn-primary" : "btn-disabled opacity-30"}`} onClick={handleSelectForQuiz} disabled={questions.length === 0}>
            <PlayCircle size={12} /> Ôn tập
          </button>
        </div>
      </div>
    </div>
  );
}

function NewExamModal({ onClose }: { onClose: () => void }) {
  const { createExam, selectExam, setTab } = useQuizStore();
  const [name, setName] = useState("");

  const handleCreate = (openEditor = false) => {
    const id = createExam(name || "Đề mới");
    if (openEditor) {
      selectExam(id);
      setTab("editor");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-base-100 border border-base-300 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <span className="font-semibold text-sm">Tạo đề thi mới</span>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Tên đề thi</label>
            <input autoFocus className="input input-bordered w-full text-sm" placeholder="VD: Đề thi Toán HK1..." value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate(true)} />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 btn btn-ghost btn-sm" onClick={() => handleCreate(false)}>
              Tạo
            </button>
            <button className="flex-1 btn btn-primary btn-sm" onClick={() => handleCreate(true)}>
              Tạo &amp; Soạn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExamsPage() {
  const { exams, activeExamId } = useQuizStore();
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");
  const [detailExamId, setDetailExamId] = useState<string | null>(null);

  const filtered = exams.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  const detailExam = detailExamId ? (exams.find((e) => e.id === detailExamId) ?? null) : null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-base-200">
      {showNew && <NewExamModal onClose={() => setShowNew(false)} />}
      {detailExam && <ExamDetailModal exam={detailExam} onClose={() => setDetailExamId(null)} />}

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-base-100 border-b border-base-300">
        <input className="input input-sm input-bordered flex-1 max-w-xs text-xs" placeholder="Tìm đề thi..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-base-content/40">{exams.length} đề</span>
          <button className="flex items-center gap-1.5 btn btn-primary btn-sm" onClick={() => setShowNew(true)}>
            <Plus size={14} />
            Tạo đề mới
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-1/2 gap-3 text-base-content/30">
            <FileText size={36} strokeWidth={1.2} />
            <p className="text-sm font-medium">{search ? "Không tìm thấy đề nào" : "Chưa có đề thi nào"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((exam) => (
              <ExamCard key={exam.id} exam={exam} isActive={activeExamId === exam.id} onClick={() => setDetailExamId(exam.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
