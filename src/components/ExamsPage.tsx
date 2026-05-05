import { useQuizStore, Exam } from "../store/quizStore";
import { parseQuestions } from "../utils/parser";
import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Copy, PlayCircle, BookOpen, MoreHorizontal, Check, X, FileText, Clock } from "lucide-react";

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

function ExamCard({ exam, onSelect, onEdit }: { exam: Exam; onSelect: () => void; onEdit: () => void }) {
  const { deleteExam, duplicateExam, renameExam, activeExamId } = useQuizStore();
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(exam.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const qCount = parseQuestions(exam.rawText).length;
  const isActive = activeExamId === exam.id;

  const handleRename = () => {
    renameExam(exam.id, editName);
    setEditing(false);
  };

  const handleEditStart = () => {
    setEditing(true);
    setEditName(exam.name);
    setShowMenu(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className={`group relative bg-base-100 border rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-md ${isActive ? "border-primary shadow-sm shadow-primary/10" : "border-base-300 hover:border-base-content/20"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                ref={inputRef}
                className="input input-xs input-bordered flex-1 text-sm font-semibold"
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
            <p className="font-semibold text-sm text-base-content truncate pr-2">{exam.name}</p>
          )}
        </div>

        {/* Menu */}
        <div className="relative shrink-0">
          <button
            className="btn btn-xs btn-ghost btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}>
            <MoreHorizontal size={14} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-7 z-20 bg-base-100 border border-base-300 rounded-xl shadow-xl overflow-hidden w-36 py-1">
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-base-200 transition-colors"
                  onClick={() => {
                    handleEditStart();
                  }}>
                  <Pencil size={12} /> Đổi tên
                </button>
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-base-200 transition-colors"
                  onClick={() => {
                    duplicateExam(exam.id);
                    setShowMenu(false);
                  }}>
                  <Copy size={12} /> Nhân bản
                </button>
                <div className="h-px bg-base-300 my-1" />
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-error hover:bg-error/10 transition-colors"
                  onClick={() => {
                    deleteExam(exam.id);
                    setShowMenu(false);
                  }}>
                  <Trash2 size={12} /> Xóa
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
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

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button className="flex-1 flex items-center justify-center gap-1.5 btn btn-xs btn-ghost border border-base-300 hover:border-primary hover:text-primary" onClick={onEdit}>
          <BookOpen size={12} />
          Soạn thảo
        </button>
        <button className={`flex-1 flex items-center justify-center gap-1.5 btn btn-xs ${qCount > 0 ? "btn-primary" : "btn-disabled opacity-30"}`} onClick={qCount > 0 ? onSelect : undefined} disabled={qCount === 0}>
          <PlayCircle size={12} />
          Làm bài
        </button>
      </div>

      {/* Active badge */}
      {isActive && (
        <div className="absolute top-3 right-10">
          <span className="badge badge-primary badge-xs">Đang chọn</span>
        </div>
      )}
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
  const { exams, selectExam, setTab } = useQuizStore();
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = exams.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelectForQuiz = (id: string) => {
    selectExam(id);
    setTab("quiz");
  };

  const handleSelectForEditor = (id: string) => {
    selectExam(id);
    setTab("editor");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-base-200">
      {showNew && <NewExamModal onClose={() => setShowNew(false)} />}

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
          <div className="flex flex-col items-center justify-center h-full gap-3 text-base-content/30">
            <FileText size={36} strokeWidth={1.2} />
            <p className="text-sm font-medium">{search ? "Không tìm thấy đề nào" : "Chưa có đề thi nào"}</p>
            {!search && (
              <button className="btn btn-sm btn-primary mt-1" onClick={() => setShowNew(true)}>
                <Plus size={14} /> Tạo đề đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {filtered.map((exam) => (
              <ExamCard key={exam.id} exam={exam} onSelect={() => handleSelectForQuiz(exam.id)} onEdit={() => handleSelectForEditor(exam.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
