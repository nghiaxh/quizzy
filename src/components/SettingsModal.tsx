import { Input, Modal, Switch } from "@heroui/react";
import { CaretDown, Moon, Sun } from "@phosphor-icons/react";
import { useQuizStore } from "../store/quizStore";
import { useTranslation } from "../i18n/useTranslation";
import AppModal from "./AppModal";
import type { Language } from "../i18n/translations";
import type { ReactNode } from "react";

interface SettingsModalProps {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  onClose: () => void;
}

function SettingRow({ label, desc, children }: { label: string; desc: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted mt-0.5">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsModal({ theme, setTheme, onClose }: SettingsModalProps) {
  const {
    shuffleQuestions,
    setShuffleQuestions,
    soundEnabled,
    setSoundEnabled,
    effectsEnabled,
    setEffectsEnabled,
    timerEnabled,
    setTimerEnabled,
    timerMinutes,
    setTimerMinutes,
    language,
    setLanguage,
  } = useQuizStore();
  const { t } = useTranslation();

  return (
    <AppModal onClose={onClose}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="sm">
          <Modal.Dialog className="max-h-[85vh]">
            <Modal.Header>
              <Modal.Heading className="font-serif text-xl tracking-tight">{t("settings.title")}</Modal.Heading>
              <Modal.CloseTrigger onPress={onClose} />
            </Modal.Header>

            <Modal.Body className="px-6 divide-y divide-separator">
              <SettingRow label={t("settings.theme.label")} desc={t("settings.theme.desc")}>
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-secondary border border-border">
                  <button
                    onClick={() => setTheme("light")}
                    aria-pressed={theme === "light"}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 ${
                      theme === "light" ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Sun size={13} weight={theme === "light" ? "fill" : "regular"} />
                    {t("settings.theme.light")}
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    aria-pressed={theme === "dark"}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 ${
                      theme === "dark" ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Moon size={13} weight={theme === "dark" ? "fill" : "regular"} />
                    {t("settings.theme.dark")}
                  </button>
                </div>
              </SettingRow>

              <SettingRow label={t("settings.shuffle.label")} desc={t("settings.shuffle.desc")}>
                <Switch isSelected={shuffleQuestions} onChange={setShuffleQuestions} size="sm" aria-label={t("settings.shuffle.label")}>
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Content>
                </Switch>
              </SettingRow>

              <SettingRow label={t("settings.sound.label")} desc={t("settings.sound.desc")}>
                <Switch isSelected={soundEnabled} onChange={setSoundEnabled} size="sm" aria-label={t("settings.sound.label")}>
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Content>
                </Switch>
              </SettingRow>

              <SettingRow label={t("settings.effects.label")} desc={t("settings.effects.desc")}>
                <Switch isSelected={effectsEnabled} onChange={setEffectsEnabled} size="sm" aria-label={t("settings.effects.label")}>
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Content>
                </Switch>
              </SettingRow>

              <SettingRow label={t("settings.timer.label")} desc={t("settings.timer.desc")}>
                <Switch isSelected={timerEnabled} onChange={setTimerEnabled} size="sm" aria-label={t("settings.timer.label")}>
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Content>
                </Switch>
              </SettingRow>

              {timerEnabled && (
                <SettingRow label={t("settings.time.label")} desc={t("settings.time.desc")}>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={180}
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      aria-label={t("settings.time.label")}
                      className="w-20 text-center"
                    />
                    <span className="text-xs text-muted">{t("settings.time.unit")}</span>
                  </div>
                </SettingRow>
              )}

              <SettingRow label={t("settings.language.label")} desc={t("settings.language.desc")}>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="h-9 min-w-28 appearance-none rounded-field bg-field pr-8 pl-3 text-sm text-field-foreground border border-field-border outline-none cursor-pointer focus:border-field-border-focus"
                  >
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                  </select>
                  <CaretDown size={12} weight="bold" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </SettingRow>
            </Modal.Body>

            <Modal.Footer className="justify-center">
              <span className="text-xs text-muted">Quizzy 0.5.0 by Nghia Hoang</span>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </AppModal>
  );
}
