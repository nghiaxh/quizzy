import { useQuizStore, Exam } from "../store/quizStore";
import { parseQuestions } from "../utils/parser";
import { useState, useRef, useCallback, ChangeEvent } from "react";
import { Button, EmptyState, Input, Modal } from "@heroui/react";
import { Check, Clock, Copy, DownloadSimple, FileText, MagnifyingGlass, PencilSimple, Play, Plus, ShareNetwork, Trash, UploadSimple, X } from "@phosphor-icons/react";
import { useTranslation } from "../i18n/useTranslation";
import { createShareUrl } from "../utils/share";
import AppModal from "./AppModal";

function formatDate(ts: number, locale: string) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

function ExamCard({ exam, onClick, isActive }: { exam: Exam; onClick: () => void; isActive: boolean }) {
  const qCount = parseQuestions(exam.rawText).length;
  const { t, lang } = useTranslation();

  return (
    <div
      className={`bg-surface border rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-all duration-200 hover:border-foreground/30 ${
        isActive ? "border-accent" : "border-border"
      }`}
      onClick={onClick}
    >
      <p className="font-serif text-lg leading-snug text-foreground truncate">{exam.name}</p>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <FileText size={12} />
          {qCount} {t("exams.questions")}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatDate(exam.updatedAt, lang)}
        </span>
      </div>
    </div>
  );
}

function ExamDetailModal({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const { deleteExam, duplicateExam, renameExam, selectExam, setTab } = useQuizStore();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(exam.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const questions = parseQuestions(exam.rawText);

  const [searchTerm, setSearchTerm] = useState("");
  const [gotoInput, setGotoInput] = useState("");
  const [showShare, setShowShare] = useState(false);

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
    if (confirm(t("exams.deleteConfirm"))) {
      deleteExam(exam.id);
      onClose();
    }
  };

  const handleDuplicate = () => {
    duplicateExam(exam.id);
    onClose();
  };

  const handleDownloadExam = () => {
    const data = {
      name: exam.name,
      rawText: exam.rawText,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {showShare && <ShareModal exam={exam} onClose={() => setShowShare(false)} />}
      <AppModal onClose={onClose}>
        <Modal.Backdrop isDismissable>
          <Modal.Container size="lg" scroll="inside">
            <Modal.Dialog>
              <Modal.Header className="flex-row items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <div className="flex items-center gap-1.5">
                      <Input
                        ref={inputRef}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename();
                          if (e.key === "Escape") setEditing(false);
                        }}
                        className="flex-1 text-sm font-medium"
                      />
                      <Button variant="ghost" size="sm" isIconOnly aria-label={t("exams.editName")} onPress={handleRename}>
                        <Check size={14} weight="bold" />
                      </Button>
                      <Button variant="ghost" size="sm" isIconOnly aria-label={t("exams.cancel")} onPress={() => setEditing(false)}>
                        <X size={14} weight="bold" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Modal.Heading className="font-serif text-xl tracking-tight truncate">{exam.name}</Modal.Heading>
                      <span className="flex items-center gap-1 mt-0.5 text-xs text-muted">
                        <FileText size={11} />
                        {questions.length} {t("exams.questions")}
                      </span>
                    </div>
                  )}
                </div>
                <Modal.CloseTrigger onPress={onClose} />
              </Modal.Header>

              <div className="flex items-center gap-2 px-6 py-3 border-y border-separator bg-surface-secondary/60">
                <div className="relative flex-1 min-w-0">
                  <MagnifyingGlass size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <Input className="pl-8 text-xs" placeholder={t("exams.searchQuestionPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth />
                </div>
                <div className="flex items-center gap-1.5">
                  <Input className="w-24 text-center text-xs" placeholder={t("exams.gotoPlaceholder")} value={gotoInput} onChange={(e) => setGotoInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleGoToQuestion()} />
                  <Button size="sm" variant="secondary" onPress={handleGoToQuestion}>
                    {t("exams.find")}
                  </Button>
                </div>
              </div>

              <Modal.Body className="px-6 py-4">
                {filteredQuestions.length === 0 ? (
                  <EmptyState className="flex flex-col items-center justify-center gap-2 py-16">
                    <MagnifyingGlass size={28} className="text-muted/40" />
                    <span className="text-xs">{searchTerm ? t("exams.noMatch") : t("exams.noQuestions")}</span>
                  </EmptyState>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredQuestions.map((q) => (
                      <div key={q.id} id={`question-${q.id}`} className="bg-surface-secondary/60 border border-border rounded-lg p-3 text-sm scroll-mt-4">
                        <p className="font-medium mb-2 leading-snug text-foreground">
                          <span className="font-mono text-muted mr-1.5">{q.id + 1}.</span>
                          {q.text}
                        </p>
                        <div className="flex flex-col gap-0.5">
                          {q.options.map((o, i) => (
                            <div key={i} className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md ${i === q.correctIndex ? "text-success" : "text-muted"}`}>
                              <span className={`w-4 h-4 rounded-md text-[9px] font-mono flex items-center justify-center shrink-0 font-bold ${i === q.correctIndex ? "bg-success text-white" : "bg-surface-tertiary text-muted"}`}>{"ABCD"[i]}</span>
                              <span className="truncate">{o}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Modal.Body>

              <div className="px-4 py-2 border-t border-separator flex flex-wrap items-center gap-1">
                <Button variant="ghost" size="sm" onPress={handleEditStart}>
                  <PencilSimple size={13} weight="bold" />
                  {t("exams.editName")}
                </Button>
                <Button variant="ghost" size="sm" onPress={handleDuplicate}>
                  <Copy size={13} weight="bold" />
                  {t("exams.duplicate")}
                </Button>
                <Button variant="ghost" size="sm" className="text-danger" onPress={handleDelete}>
                  <Trash size={13} weight="bold" />
                  {t("exams.delete")}
                </Button>
                <Button variant="ghost" size="sm" onPress={handleDownloadExam}>
                  <DownloadSimple size={13} weight="bold" />
                  {t("exams.saveExam")}
                </Button>
                <Button variant="ghost" size="sm" onPress={() => setShowShare(true)}>
                  <ShareNetwork size={13} weight="bold" />
                  {t("exams.share")}
                </Button>
              </div>

              <Modal.Footer>
                <Button variant="outline" size="sm" onPress={handleSelectForEditor}>
                  <PencilSimple size={13} weight="bold" />
                  {t("exams.editExam")}
                </Button>
                <Button variant="primary" size="sm" isDisabled={questions.length === 0} onPress={handleSelectForQuiz}>
                  <Play size={13} weight="fill" />
                  {t("exams.startQuiz")}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </AppModal>
    </>
  );
}

function ShareModal({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const { t } = useTranslation();
  const url = createShareUrl(exam);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppModal onClose={onClose}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header className="flex-row items-center justify-between gap-2">
              <Modal.Heading className="font-serif text-xl tracking-tight">{t("exams.shareTitle")}</Modal.Heading>
              <Modal.CloseTrigger onPress={onClose} />
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col items-center gap-3 py-2">
                <p className="font-mono text-[10px] leading-relaxed text-muted break-all text-center max-w-full">{url}</p>
                <Button variant="outline" size="sm" fullWidth onPress={handleCopy}>
                  {copied ? <Check size={13} weight="bold" /> : <Copy size={13} weight="bold" />}
                  {copied ? t("exams.copied") : t("exams.copyLink")}
                </Button>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </AppModal>
  );
}

function NewExamModal({ onClose }: { onClose: () => void }) {
  const { createExam, selectExam, setTab } = useQuizStore();
  const { t } = useTranslation();
  const [name, setName] = useState("");

  const handleCreate = (openEditor = false) => {
    const id = createExam(name || t("exams.defaultName"));
    if (openEditor) {
      selectExam(id);
      setTab("editor");
    }
    onClose();
  };

  return (
    <AppModal onClose={onClose}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header className="flex-row items-center justify-between gap-2">
              <Modal.Heading className="font-serif text-xl tracking-tight">{t("exams.newExam")}</Modal.Heading>
              <Modal.CloseTrigger onPress={onClose} />
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium text-muted mb-1.5 block">{t("exams.nameLabel")}</label>
                  <Input autoFocus fullWidth placeholder={t("exams.namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate(true)} />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1" onPress={onClose}>
                    {t("exams.cancel")}
                  </Button>
                  <Button variant="primary" size="sm" className="flex-1" onPress={() => handleCreate(true)}>
                    {t("exams.create")}
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </AppModal>
  );
}

export default function ExamsPage() {
  const { exams, activeExamId, createExam } = useQuizStore();
  const { t } = useTranslation();
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");
  const [detailExamId, setDetailExamId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = exams.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  const detailExam = detailExamId ? (exams.find((e) => e.id === detailExamId) ?? null) : null;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const fileName = file.name;

      if (fileName.endsWith(".json")) {
        try {
          const json = JSON.parse(content);
          if (!json.name || !json.rawText) {
            alert(t("exams.invalidJson"));
            return;
          }
          createExam(json.name, json.rawText);
        } catch {
          alert(t("exams.cantReadJson"));
        }
      } else if (fileName.endsWith(".txt")) {
        const name = fileName.replace(/\.txt$/i, "");
        const parsed = parseQuestions(content);
        if (parsed.length === 0) {
          alert(t("exams.invalidTxt"));
          return;
        }
        createExam(name, content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {showNew && <NewExamModal onClose={() => setShowNew(false)} />}
      {detailExam && <ExamDetailModal exam={detailExam} onClose={() => setDetailExamId(null)} />}
      <input type="file" accept=".json,.txt" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <div className="flex items-center gap-3 px-5 py-3 bg-surface border-b border-separator flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <MagnifyingGlass size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <Input className="pl-8 text-xs" placeholder={t("exams.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onPress={handleImportClick}>
            <UploadSimple size={13} weight="bold" />
            {t("exams.importExam")}
          </Button>
          <Button variant="primary" size="sm" onPress={() => setShowNew(true)}>
            <Plus size={13} weight="bold" />
            {t("exams.createNew")}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-1/2 gap-3 text-muted">
            <FileText size={36} className="text-muted/30" />
            <p className="text-sm font-medium">{search ? t("exams.noExamsFound") : t("exams.noExams")}</p>
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
