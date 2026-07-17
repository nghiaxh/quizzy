import { useQuizStore } from "./store/quizStore";
import Editor from "./components/Editor";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Review from "./components/Review";
import ExamsPage from "./components/ExamsPage";
import SettingsModal from "./components/SettingsModal";
import { PenLine, ClipboardList, Settings, LibraryBig } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "./i18n/useTranslation";
import { AnimatePresence, motion } from "framer-motion";
import { getShareDataFromUrl, clearShareHash } from "./utils/share";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function App() {
  const { tab, setTab, questions, activeExamId, createExam, selectExam } = useQuizStore();
  const [showSettings, setShowSettings] = useState(false);
  const { t } = useTranslation();
  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  const TABS = [
    { key: "exams" as const, label: t("app.tab.exams"), icon: LibraryBig },
    { key: "editor" as const, label: t("app.tab.editor"), icon: PenLine },
    { key: "quiz" as const, label: t("app.tab.quiz"), icon: ClipboardList },
  ] as const;

  const setTheme = (th: "light" | "dark") => {
    setThemeState(th);
    document.documentElement.setAttribute("data-theme", th);
    localStorage.setItem("theme", th);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  useEffect(() => {
    const shareData = getShareDataFromUrl();
    if (shareData) {
      const id = createExam(shareData.name || t("exams.sharedExam"), shareData.rawText);
      selectExam(id);
      clearShareHash();
    }
  }, []);

  const hasQuestions = questions.length > 0;
  const hasActiveExam = activeExamId !== null;

  return (
    <div className="flex flex-col h-dvh bg-base-100 overflow-hidden">
      {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} />}

      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300">
        <div className="flex items-center gap-1 bg-base-300/50 rounded-xl p-1">
          {TABS.map((tabItem) => {
            const disabled = (tabItem.key === "editor" && !hasActiveExam) || (tabItem.key === "quiz" && (!hasActiveExam || !hasQuestions));
            const Icon = tabItem.icon;
            const isActive = tab === tabItem.key;
            return (
              <button key={tabItem.key} onClick={() => !disabled && setTab(tabItem.key)}               disabled={disabled} title={tabItem.key === "editor" && disabled ? t("app.editorDisabled") : tabItem.key === "quiz" && disabled ? t("app.quizDisabled") : undefined} className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${isActive ? "bg-base-100 text-base-content shadow-sm" : disabled ? "text-base-content/20 cursor-not-allowed" : "text-base-content/50 hover:text-base-content hover:bg-base-100/50"}`}>
                <Icon size={13} />
                {tabItem.label}
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
        <AnimatePresence mode="wait">
          {tab === "exams" && (
            <motion.div key="exams" className="flex flex-1" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <ExamsPage />
            </motion.div>
          )}
          {tab === "editor" && (
            <motion.div key="editor" className="flex flex-1" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Editor />
            </motion.div>
          )}
          {tab === "quiz" && (
            <motion.div key="quiz" className="flex flex-1" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Quiz />
            </motion.div>
          )}
          {tab === "result" && (
            <motion.div key="result" className="flex flex-1" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Result />
            </motion.div>
          )}
          {tab === "review" && (
            <motion.div key="review" className="flex flex-1" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Review />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
