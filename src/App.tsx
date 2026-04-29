import { useQuizStore } from "./store/quizStore";
import Editor from "./components/Editor";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import { PenLine, ClipboardList, Settings, X, Sun, Moon, Lock } from "lucide-react";
import { useState, useEffect } from "react";

const TABS = [
  { key: "editor" as const, label: "Editor", icon: PenLine },
  { key: "quiz" as const, label: "Quiz", icon: ClipboardList },
] as const;

function SettingsModal({ theme, setTheme, onClose }: { theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-base-100 border border-base-300 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-primary" />
            <span className="font-semibold text-sm">Cài đặt</span>
          </div>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Giao diện</p>
              <p className="text-xs text-base-content/40 mt-0.5">Chế độ sáng hoặc tối</p>
            </div>
            <div className="flex items-center bg-base-200 rounded-xl p-1 gap-1">
              <button onClick={() => setTheme("light")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === "light" ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/40 hover:text-base-content"}`}>
                <Sun size={13} /> Sáng
              </button>
              <button onClick={() => setTheme("dark")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === "dark" ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/40 hover:text-base-content"}`}>
                <Moon size={13} /> Tối
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} />}

      {/* Titlebar */}
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
                    <Lock size={13}></Lock>
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

      <div className="flex flex-1 overflow-hidden">
        {tab === "editor" && <Editor />}
        {tab === "quiz" && <Quiz />}
        {tab === "result" && <Result />}
      </div>
    </div>
  );
}
