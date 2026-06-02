import { useQuizStore } from "./store/quizStore";
import Editor from "./components/Editor";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Review from "./components/Review";
import ExamsPage from "./components/ExamsPage";
import SettingsModal from "./components/SettingsModal";
import { PenLine, ClipboardList, Settings, LibraryBig, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { onAuthChange, updatePassword } from "./services/supabase";

const TABS = [
  { key: "exams" as const, label: "Đề thi", icon: LibraryBig },
  { key: "editor" as const, label: "Chỉnh sửa", icon: PenLine },
  { key: "quiz" as const, label: "Ôn tập", icon: ClipboardList },
] as const;

export default function App() {
  const { tab, setTab, questions, activeExamId, setSupabaseUser } = useQuizStore();
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const setTheme = (t: "light" | "dark") => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  useEffect(() => {
    const sub = onAuthChange((user) => {
      setSupabaseUser(user);
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setShowPasswordReset(true);
      window.location.hash = "";
    }
  }, []);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setAuthError("Mật khẩu không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      setAuthError("Mật khẩu ít nhất 6 ký tự.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      await updatePassword(newPassword);
      setShowPasswordReset(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Lỗi");
    }
    setAuthLoading(false);
  };

  const hasQuestions = questions.length > 0;
  const hasActiveExam = activeExamId !== null;

  return (
    <div className="flex flex-col h-screen bg-base-100 overflow-hidden">
      {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} />}

      {showPasswordReset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-base-100 border border-base-300 rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <p className="font-semibold text-sm">Đặt lại mật khẩu</p>
            <div className="relative">
              <input type={showNewPassword ? "text" : "password"} className="input input-sm input-bordered w-full text-sm pr-8" placeholder="Mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-base-content/40 hover:text-base-content" onClick={() => setShowNewPassword(!showNewPassword)} tabIndex={-1}>
                {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} className="input input-sm input-bordered w-full text-sm pr-8" placeholder="Xác nhận mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-base-content/40 hover:text-base-content" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {authError && <p className="text-xs text-error">{authError}</p>}
            <div className="flex gap-2">
              <button className="btn btn-primary btn-xs" onClick={handleUpdatePassword} disabled={authLoading}>
                {authLoading && <span className="loading loading-spinner loading-xs" />} Đặt lại
              </button>
              <button className="btn btn-ghost btn-xs" onClick={() => { setShowPasswordReset(false); setAuthError(""); }}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300">
        <div className="flex items-center gap-1 bg-base-300/50 rounded-xl p-1">
          {TABS.map((t) => {
            const disabled = (t.key === "editor" && !hasActiveExam) || (t.key === "quiz" && (!hasActiveExam || !hasQuestions));
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => !disabled && setTab(t.key)} disabled={disabled} title={t.key === "editor" && disabled ? "Chọn đề thi trước" : t.key === "quiz" && disabled ? "Soạn câu hỏi trước" : undefined} className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${isActive ? "bg-base-100 text-base-content shadow-sm" : disabled ? "text-base-content/20 cursor-not-allowed" : "text-base-content/50 hover:text-base-content hover:bg-base-100/50"}`}>
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowSettings(true)}>
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {tab === "exams" && <ExamsPage />}
        {tab === "editor" && <Editor />}
        {tab === "quiz" && <Quiz />}
        {tab === "result" && <Result />}
        {tab === "review" && <Review />}
      </div>
    </div>
  );
}
