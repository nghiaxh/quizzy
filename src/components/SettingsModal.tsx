import { Settings, X, Sun, Moon } from "lucide-react";

interface SettingsModalProps {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  onClose: () => void;
}

export default function SettingsModal({ theme, setTheme, onClose }: SettingsModalProps) {
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
