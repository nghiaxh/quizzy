import { useQuizStore } from "./store/quizStore";
import Editor from "./components/Editor";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import ExamsPage from "./components/ExamsPage";
import SettingsModal from "./components/SettingsModal";
import { PenLine, ClipboardList, Settings, Lock, LibraryBig } from "lucide-react";
import { useState, useEffect } from "react";

const TABS = [
  { key: "exams" as const, label: "Đề thi", icon: LibraryBig },
  { key: "editor" as const, label: "Editor", icon: PenLine },
  { key: "quiz" as const, label: "Quiz", icon: ClipboardList },
] as const;

export default function App() {
  const { tab, setTab, questions, activeExamId } = useQuizStore();
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  const setTheme = (t: "light" | "dark") => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  const hasQuestions = questions.length > 0;
  const hasActiveExam = activeExamId !== null;

  return (
    <div className="flex flex-col h-screen bg-base-100 overflow-hidden">
      {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} />}

      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300">
        <div className="flex items-center gap-1 bg-base-300/50 rounded-xl p-1">
          {TABS.map((t) => {
            // editor cần chọn đề, quiz cần câu hỏi
            const disabled = (t.key === "editor" && !hasActiveExam) || (t.key === "quiz" && (!hasActiveExam || !hasQuestions));
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => !disabled && setTab(t.key)} disabled={disabled} title={t.key === "editor" && disabled ? "Chọn đề thi trước" : t.key === "quiz" && disabled ? "Soạn câu hỏi trước" : undefined} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${isActive ? "bg-base-100 text-base-content shadow-sm" : disabled ? "text-base-content/20 cursor-not-allowed" : "text-base-content/50 hover:text-base-content hover:bg-base-100/50"}`}>
                <Icon size={13} />
                {t.label}
                {disabled && <Lock size={11} className="opacity-30" />}
              </button>
            );
          })}
        </div>

        <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowSettings(true)}>
          <Settings size={16} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {tab === "exams" && <ExamsPage />}
        {tab === "editor" && <Editor />}
        {tab === "quiz" && <Quiz />}
        {tab === "result" && <Result />}
      </div>
    </div>
  );
}
