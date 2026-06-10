# Quizzy — AGENTS.md

Quizzy is a browser-based multiple-choice exam tool. No backend, no database — everything runs in the browser.

## Quick start

```bash
npm install            # install JS deps
npm run dev            # Vite dev server on port 5173
npm run build          # tsc && vite build (type-check first, then bundle)
npm run preview        # Vite preview of built dist/
```

No linter, no test framework, no typecheck script. `npm run build` = the only CI gate.

## App flow (simple)

```
Exams page → select exam → Editor (write questions) → Quiz (take quiz) → Result (score) → Review (answers)
```

5 tabs (`exams | editor | quiz | result | review`), tab-switching is just a Zustand `setTab()` call — no router.

- **ExamsPage** — list/create/import/delete/duplicate exams
- **Editor** — raw text textarea + live parse preview; auto-saves to active exam
- **Quiz** — one question at a time, instant feedback (sound + confetti on correct), optional timer
- **Result** — score ring chart, retry/review/edit buttons, big confetti if ≥80%
- **Review** — scroll through all questions with correct/wrong indicators

## Stack

- React 19 + TypeScript (strict, noUnusedLocals, noUnusedParameters)
- Vite 7 + `@vitejs/plugin-react`
- Tailwind CSS 4 (`@import "tailwindcss"` in `index.css`) + DaisyUI 5.5 (`@plugin "daisyui"`)
- State: Zustand 5.12 with `persist` middleware → `localStorage` key `quizzy-storage`
- i18n: simple key-based system in `src/i18n/` (English default, Vietnamese supported)
- PWA: `vite-plugin-pwa` (Workbox-based service worker, precaches static assets, offline support)
- CI: GitHub Pages deploy via `.github/workflows/deploy.yml` on push to `main`

## State management (Zustand)

Single store in `src/store/quizStore.ts`. Persisted fields (survive reload):
`exams`, `shuffleQuestions`, `soundEnabled`, `effectsEnabled`, `timerEnabled`, `timerMinutes`, `language`.

Everything else (`currentIndex`, `answers`, `submitted`, `tab`, `questions`) resets on page reload.

Key flow: user clicks an exam → `selectExam(id)` parses raw text via `parseQuestions()` → sets `activeExamId` + `questions` + `originalQuestions` → switches to editor tab. When user navigates to quiz → `startQuiz()` optionally shuffles, resets answers, sets timer.

## Question format (parser)

Parser lives in `src/utils/parser.ts`. Questions separated by blank lines:

```
1. Question text
*A. Correct answer
B. Wrong answer
C. Wrong answer
D. Wrong answer
```

- `*` marks correct option, options `A`–`D` (2–4 supported)
- Multi-line text supported (continuation lines without prefix)
- Invalid blocks silently dropped, questions re-numbered 0-indexed on every parse

## Vite quirks

- Dev server on port 5173 (Vite default)
- `tsconfig.node.json` is a project reference for `vite.config.ts` only
- `tsc` must succeed before Vite bundles (no separate type-check command)

## Git commit convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `style`, `perf`, `test`, `ci`, `build`.

Scope (optional) is the affected file/directory. E.g. `feat(editor):`, `fix(quiz):`, `chore(deps):`.

Write descriptions in English, present tense, lowercase, no trailing period.
