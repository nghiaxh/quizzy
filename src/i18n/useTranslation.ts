import { useQuizStore } from "../store/quizStore";
import { t as translate } from "./translations";

export function useTranslation() {
  const lang = useQuizStore((s) => s.language);
  return {
    t: (key: string) => translate(lang, key),
    lang,
  };
}
