import { useQuizStore } from "./store/quizStore";
import Editor from "./components/Editor";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Review from "./components/Review";
import ExamsPage from "./components/ExamsPage";
import SettingsModal from "./components/SettingsModal";
import { PenLine, ClipboardList, Settings, Lock, LibraryBig, Cloud, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { initDriveClient, signIn, tryRestoreToken, tryRefreshToken, orchestrateSync, isSignedIn } from "./utils/googleDrive";

const TABS = [
  { key: "exams" as const, label: "Đề thi", icon: LibraryBig },
  { key: "editor" as const, label: "Chỉnh sửa", icon: PenLine },
  { key: "quiz" as const, label: "Ôn tập", icon: ClipboardList },
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

  const syncingRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = async () => {
      initDriveClient(clientId);
      const restored = await tryRestoreToken();
      if (!restored) return;

      const s = useQuizStore.getState();
      if (!s.driveConnected) return;
      syncingRef.current = true;
      s.setDriveSyncStatus("syncing");
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const { mergedExams, stats } = await orchestrateSync(s.exams, s.lastSyncAt);
          const st = useQuizStore.getState();
          st.setLastSyncAt(Date.now());
          st.pruneTombstones();
          st.setDriveSyncStatus("success");
          if (stats.uploaded > 0 || stats.downloaded > 0) {
            useQuizStore.setState({ exams: mergedExams });
          }
          break;
        } catch {
          if (attempt < 3) {
            const refreshed = await tryRefreshToken();
            if (!refreshed) {
              await new Promise((r) => setTimeout(r, 2000));
            }
          } else {
            try {
              await signIn();
              const s = useQuizStore.getState();
              if (!s.driveConnected) {
                const res = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {
                  headers: { Authorization: `Bearer ${localStorage.getItem("drive_access_token")}` },
                });
                const data = await res.json();
                s.setDriveState(true, data?.user?.emailAddress);
              }
              const { mergedExams, stats } = await orchestrateSync(s.exams, s.lastSyncAt);
              const st = useQuizStore.getState();
              st.setLastSyncAt(Date.now());
              st.pruneTombstones();
              st.setDriveSyncStatus("success");
              if (stats.uploaded > 0 || stats.downloaded > 0) {
                useQuizStore.setState({ exams: mergedExams });
              }
            } catch {
              useQuizStore.getState().setDriveSyncStatus("error");
            }
          }
        }
      }
      syncingRef.current = false;
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const unsub = useQuizStore.subscribe(async (state, prev) => {
      if (syncingRef.current) return;
      if (!state.driveConnected) return;
      if (!isSignedIn()) return;
      if (state.exams === prev.exams) return;

      syncingRef.current = true;
      state.setDriveSyncStatus("syncing");
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const s = useQuizStore.getState();
          const { mergedExams, stats } = await orchestrateSync(s.exams, s.lastSyncAt);
          const st = useQuizStore.getState();
          st.setLastSyncAt(Date.now());
          st.pruneTombstones();
          st.setDriveSyncStatus("success");
          if (stats.uploaded > 0 || stats.downloaded > 0) {
            useQuizStore.setState({ exams: mergedExams });
          }
          break;
        } catch {
          if (attempt < 3) {
            const refreshed = await tryRefreshToken();
            if (!refreshed) {
              await new Promise((r) => setTimeout(r, 2000));
            }
          } else {
            try {
              await signIn();
              const s = useQuizStore.getState();
              if (!s.driveConnected) {
                const res = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {
                  headers: { Authorization: `Bearer ${localStorage.getItem("drive_access_token")}` },
                });
                const data = await res.json();
                s.setDriveState(true, data?.user?.emailAddress);
              }
              const { mergedExams, stats } = await orchestrateSync(s.exams, s.lastSyncAt);
              const st = useQuizStore.getState();
              st.setLastSyncAt(Date.now());
              st.pruneTombstones();
              st.setDriveSyncStatus("success");
              if (stats.uploaded > 0 || stats.downloaded > 0) {
                useQuizStore.setState({ exams: mergedExams });
              }
            } catch {
              useQuizStore.getState().setDriveSyncStatus("error");
            }
          }
        }
      }
      syncingRef.current = false;
    });

    return () => {
      unsub();
    };
  }, []);

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

        <div className="flex items-center gap-1">
          <SyncIndicator />
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

function SyncIndicator() {
  const { driveConnected, driveSyncStatus } = useQuizStore();

  if (!driveConnected) return null;

  const icon = driveSyncStatus === "syncing" ? (
    <Loader2 size={13} className="animate-spin text-primary" />
  ) : driveSyncStatus === "success" ? (
    <Cloud size={13} className="text-success" />
  ) : driveSyncStatus === "error" ? (
    <Cloud size={13} className="text-error" />
  ) : (
    <Cloud size={13} className="text-base-content/30" />
  );

  return (
    <div className="flex items-center px-2" title={driveSyncStatus === "syncing" ? "Đang đồng bộ..." : "Google Drive"}>
      {icon}
    </div>
  );
}
