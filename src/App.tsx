import { useQuizStore } from "./store/quizStore";
import Editor from "./components/Editor";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Review from "./components/Review";
import ExamsPage from "./components/ExamsPage";
import SettingsModal from "./components/SettingsModal";
import { Button } from "@heroui/react";
import { Books, ClipboardText, PencilSimple, Gear } from "@phosphor-icons/react";
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
    { key: "exams" as const, label: t("app.tab.exams"), icon: Books },
    { key: "editor" as const, label: t("app.tab.editor"), icon: PencilSimple },
    { key: "quiz" as const, label: t("app.tab.quiz"), icon: ClipboardText },
  ] as const;

  const setTheme = (th: "light" | "dark") => {
    setThemeState(th);
    document.documentElement.setAttribute("data-theme", th);
    localStorage.setItem("theme", th);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const shareData = getShareDataFromUrl();
    if (shareData) {
      const id = createExam(shareData.name || t("exams.sharedExam"), shareData.rawText);
      selectExam(id);
      setTab("quiz");
      clearShareHash();
    }
  }, [createExam, selectExam, setTab, t]);

  const hasQuestions = questions.length > 0;
  const hasActiveExam = activeExamId !== null;

  return (
    <div className="flex flex-col h-dvh bg-background overflow-hidden">
      {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} />}

      {/* Header */}
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 h-14 shrink-0 border-b border-separator bg-surface">
        <span className="text-2xl tracking-tight text-foreground select-none"></span>

        <nav className="flex items-center gap-1 p-1 bg-surface-secondary border border-border rounded-lg">
          {TABS.map((tabItem) => {
            const disabled = (tabItem.key === "editor" && !hasActiveExam) || (tabItem.key === "quiz" && (!hasActiveExam || !hasQuestions));
            const Icon = tabItem.icon;
            const isActive = tab === tabItem.key;
            return (
              <button key={tabItem.key} onClick={() => !disabled && setTab(tabItem.key)} disabled={disabled} title={tabItem.key === "editor" && disabled ? t("app.editorDisabled") : tabItem.key === "quiz" && disabled ? t("app.quizDisabled") : undefined} className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer ${isActive ? "bg-accent text-accent-foreground" : disabled ? "text-muted/40 cursor-not-allowed" : "text-muted hover:text-foreground hover:bg-surface-tertiary"}`}>
                <Icon size={14} weight={isActive ? "fill" : "regular"} />
                {tabItem.label}
              </button>
            );
          })}
        </nav>

        <Button isIconOnly variant="ghost" aria-label="Settings" onPress={() => setShowSettings(true)} className="text-muted hover:text-foreground">
          <Gear size={18} weight="regular" />
        </Button>
      </header>

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
