import { useQuizStore } from "./store/quizStore";
import Editor from "./components/Editor";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import SettingsModal from "./components/SettingsModal";
import Titlebar from "./components/Titlebar";
import { PenLine, ClipboardList, Settings, Lock } from "lucide-react";
import { useState, useEffect } from "react";

const TABS = [
  { key: "editor" as const, label: "Editor", icon: PenLine },
  { key: "quiz" as const, label: "Quiz", icon: ClipboardList },
] as const;

export default function App() {
  const { tab, setTab, questions } = useQuizStore();
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

  return (
    <div className="flex flex-col h-screen bg-base-100 overflow-hidden">
      {/* Custom Tauri Titlebar */}
      <Titlebar />

      {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} />}

      {/* Thanh điều hướng tab */}
      <div className="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300">
        <div className="flex items-center gap-1 bg-base-300/50 rounded-xl p-1">
          {TABS.map((t) => {
            const disabled = t.key === "quiz" && !hasQuestions;
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => !disabled && setTab(t.key)} disabled={disabled} title={disabled ? "Soạn câu hỏi trước" : undefined} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${isActive ? "bg-base-100 text-base-content shadow-sm" : disabled ? "text-base-content/20 cursor-not-allowed" : "text-base-content/50 hover:text-base-content hover:bg-base-100/50"}`}>
                <Icon size={13} />
                {t.label}
                {disabled && (
                  <span className="text-[9px] opacity-40">
                    <Lock size={13} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowSettings(true)}>
          <Settings size={16} />
        </button>
      </div>

      {/* Nội dung chính */}
      <div className="flex flex-1 overflow-hidden">
        {tab === "editor" && <Editor />}
        {tab === "quiz" && <Quiz />}
        {tab === "result" && <Result />}
      </div>
    </div>
  );
}
