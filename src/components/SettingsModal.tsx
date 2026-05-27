import { Settings, X, Sun, Moon, Cloud, LogOut, RefreshCw, Loader2 } from "lucide-react";
import { useQuizStore } from "../store/quizStore";
import { signIn, signOut as driveSignOut, orchestrateSync, isSignedIn } from "../utils/googleDrive";

function formatSyncTime(ts: number | null) {
  if (!ts) return "Chưa đồng bộ";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

interface SettingsModalProps {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  onClose: () => void;
}

export default function SettingsModal({ theme, setTheme, onClose }: SettingsModalProps) {
  const { shuffleQuestions, setShuffleQuestions, soundEnabled, setSoundEnabled, effectsEnabled, setEffectsEnabled, timerEnabled, setTimerEnabled, timerMinutes, setTimerMinutes, driveConnected, driveEmail, lastSyncAt, driveSyncStatus, loginLoading, setDriveState, setLastSyncAt, setDriveSyncStatus, setLoginLoading, pruneTombstones, exams } = useQuizStore();

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

        <div className="p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Giao diện</p>
              <p className="text-xs text-base-content/40 mt-0.5">Chế độ sáng hoặc tối</p>
            </div>
            <div className="flex items-center bg-base-200 rounded-xl p-1 gap-1">
              <button onClick={() => setTheme("light")} className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === "light" ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/40 hover:text-base-content"}`}>
                <Sun size={13} /> Sáng
              </button>
              <button onClick={() => setTheme("dark")} className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === "dark" ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/40 hover:text-base-content"}`}>
                <Moon size={13} /> Tối
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Đảo câu hỏi</p>
                <p className="text-xs text-base-content/40 mt-0.5">Xáo trộn thứ tự câu hỏi khi ôn tập</p>
              </div>
            </div>
            <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Âm thanh</p>
                <p className="text-xs text-base-content/40 mt-0.5">Phát âm thanh khi trả lời đúng</p>
              </div>
            </div>
            <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Hiệu ứng</p>
                <p className="text-xs text-base-content/40 mt-0.5">Hiệu ứng khi trả lời đúng</p>
              </div>
            </div>
            <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={effectsEnabled} onChange={(e) => setEffectsEnabled(e.target.checked)} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Đồng hồ đếm giờ</p>
                <p className="text-xs text-base-content/40 mt-0.5">Tự động nộp bài khi hết giờ</p>
              </div>
            </div>
            <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={timerEnabled} onChange={(e) => setTimerEnabled(e.target.checked)} />
          </div>

          {timerEnabled && (
            <div className="flex items-center justify-between pl-4 border-l-2 border-primary/30">
              <div>
                <p className="text-sm font-medium">Thời gian</p>
                <p className="text-xs text-base-content/40 mt-0.5">Số phút làm bài</p>
              </div>
              <div className="flex items-center gap-1">
                <input type="number" className="input input-sm input-bordered w-20 text-center text-sm" min={1} max={180} value={timerMinutes} onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))} />
                <span className="text-xs text-base-content/40">phút</span>
              </div>
            </div>
          )}

          <div className="border-t border-base-300 pt-4">
            <div className="mb-3">
              <p className="text-sm font-medium">Đồng bộ</p>
              <p className="text-xs text-base-content/40 mt-0.5">Đồng bộ dữ liệu</p>
            </div>

            {!import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div className="text-xs text-base-content/40 leading-relaxed">
                <p className="mb-1">Chưa cấu hình Google Drive</p>
              </div>
            ) : !driveConnected ? (
              <button
                className={`btn btn-sm btn-primary w-full ${loginLoading ? "btn-disabled" : ""}`}
                disabled={loginLoading}
                onClick={async () => {
                  setLoginLoading(true);
                  try {
                    const token = await Promise.race([signIn(), new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000))]);
                    const res = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    const email = data?.user?.emailAddress;
                    setDriveState(true, email);
                    // Initial sync after login
                    setDriveSyncStatus("syncing");
                    const { mergedExams, stats } = await orchestrateSync(exams, lastSyncAt);
                    setLastSyncAt(Date.now());
                    pruneTombstones();
                    setDriveSyncStatus("success");
                    if (stats.uploaded > 0 || stats.downloaded > 0) {
                      useQuizStore.setState({ exams: mergedExams });
                    }
                  } catch {
                    setDriveSyncStatus("error");
                  } finally {
                    setLoginLoading(false);
                  }
                }}>
                {loginLoading ? <Loader2 size={13} className="animate-spin mr-1" /> : <Cloud size={13} className="mr-1" />}
                {loginLoading ? "Đang đăng nhập..." : "Đăng nhập Google Drive"}
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-base-content/60">
                    <span>{driveEmail ?? "Đã kết nối"}</span>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => {
                      driveSignOut();
                      setDriveState(false);
                    }}>
                    <LogOut size={12} className="mr-1" />
                    Đăng xuất
                  </button>
                </div>

                <div className="text-xs text-base-content/40">Lần đồng bộ: {formatSyncTime(lastSyncAt)}</div>

                <div className="flex items-center gap-2">
                  <button
                    className={`btn btn-sm btn-primary flex-1 ${driveSyncStatus === "syncing" ? "btn-disabled" : ""}`}
                    disabled={driveSyncStatus === "syncing"}
                    onClick={async () => {
                      setDriveSyncStatus("syncing");
                      if (!isSignedIn()) {
                        try {
                          setLoginLoading(true);
                          await Promise.race([signIn(), new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000))]);
                        } catch {
                          setDriveSyncStatus("error");
                          return;
                        } finally {
                          setLoginLoading(false);
                        }
                      }
                      try {
                        const { mergedExams, stats } = await orchestrateSync(exams, lastSyncAt);
                        setLastSyncAt(Date.now());
                        pruneTombstones();
                        setDriveSyncStatus("success");
                        if (stats.uploaded > 0 || stats.downloaded > 0) {
                          useQuizStore.setState({ exams: mergedExams });
                        }
                      } catch {
                        setDriveSyncStatus("error");
                      }
                    }}>
                    {driveSyncStatus === "syncing" ? <Loader2 size={13} className="animate-spin mr-1" /> : <RefreshCw size={13} className="mr-1" />}
                    {driveSyncStatus === "syncing" ? "Đang đồng bộ..." : "Đồng bộ ngay"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center text-xs text-base-content/40 my-4">
          <span>Quizzy 0.4.0 by Nghia Hoang</span>
        </div>
      </div>
    </div>
  );
}
