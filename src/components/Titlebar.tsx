import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { CopyCheck, Minus, Square, X } from "lucide-react";

const appWindow = getCurrentWindow();

const TitleBar: React.FC = () => {
  const handleMinimize = async () => {
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  };

  const handleClose = async () => {
    await appWindow.close();
  };

  return (
    <div className="h-9 w-full flex items-center justify-between border-b border-base-300 bg-base-200 select-none shrink-0">
      <div data-tauri-drag-region className="flex items-center gap-2 px-3 flex-1 h-full">
        <CopyCheck size={16} />
        <span className="text-sm font-medium text-base-content/70 truncate">Quizzy</span>
      </div>

      <div className="flex items-center h-full">
        <button onClick={handleMinimize} className="h-full w-10 flex items-center justify-center text-base-content/50 hover:text-base-content hover:bg-base-300 transition-colors" title="Thu nhỏ">
          <Minus size={15} strokeWidth={2} />
        </button>
        <button onClick={handleMaximize} className="h-full w-10 flex items-center justify-center text-base-content/50 hover:text-base-content hover:bg-base-300 transition-colors" title="Phóng to / Thu nhỏ">
          <Square size={13} strokeWidth={2} />
        </button>
        <button onClick={handleClose} className="h-full w-10 flex items-center justify-center text-base-content/50 hover:text-white hover:bg-red-500 transition-colors" title="Đóng">
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
