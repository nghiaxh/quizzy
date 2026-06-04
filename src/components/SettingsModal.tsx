import { Settings, X, Sun, Moon } from "lucide-react";
import { useQuizStore } from "../store/quizStore";

interface SettingsModalProps {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  onClose: () => void;
}

export default function SettingsModal({ theme, setTheme, onClose }: SettingsModalProps) {
  const { shuffleQuestions, setShuffleQuestions, soundEnabled, setSoundEnabled, effectsEnabled, setEffectsEnabled, timerEnabled, setTimerEnabled, timerMinutes, setTimerMinutes } = useQuizStore();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-base-100 border border-base-300 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-base-300 sticky top-0 bg-base-100 z-10">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-primary" />
            <span className="font-semibold text-sm">Cài đặt</span>
          </div>
          <button className="btn btn-ghost btn-xs btn-square" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 overscroll-contain">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Giao diện</p>
              <p className="text-xs text-base-content/40">Sáng / Tối</p>
            </div>
            <div className="flex items-center bg-base-200 rounded-lg p-0.5">
              <button onClick={() => setTheme("light")} className={`cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${theme === "light" ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/40 hover:text-base-content"}`}>
                <Sun size={13} /> Sáng
              </button>
              <button onClick={() => setTheme("dark")} className={`cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${theme === "dark" ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/40 hover:text-base-content"}`}>
                <Moon size={13} /> Tối
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Đảo câu hỏi</p>
              <p className="text-xs text-base-content/40">Xáo trộn thứ tự câu hỏi</p>
            </div>
            <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Âm thanh</p>
              <p className="text-xs text-base-content/40">Phát âm thanh khi trả lời đúng</p>
            </div>
            <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Hiệu ứng</p>
              <p className="text-xs text-base-content/40">Hiệu ứng khi trả lời đúng</p>
            </div>
            <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={effectsEnabled} onChange={(e) => setEffectsEnabled(e.target.checked)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Đồng hồ đếm giờ</p>
              <p className="text-xs text-base-content/40">Tự động nộp bài khi hết giờ</p>
            </div>
            <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={timerEnabled} onChange={(e) => setTimerEnabled(e.target.checked)} />
          </div>

          {timerEnabled && (
            <div className="flex items-center justify-between pl-3 border-l-2 border-primary/30">
              <div>
                <p className="text-sm font-medium">Thời gian</p>
                <p className="text-xs text-base-content/40">Số phút làm bài</p>
              </div>
              <div className="flex items-center gap-1">
                <input type="number" className="input input-xs input-bordered w-16 text-center" min={1} max={180} value={timerMinutes} onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))} />
                <span className="text-xs text-base-content/40">phút</span>
              </div>
            </div>
          )}

        </div>

        <div className="flex justify-center text-xs text-base-content/40 py-3">
          <span>Quizzy 0.5.0 by Nghia Hoang</span>
        </div>
      </div>
    </div>
  );
}
