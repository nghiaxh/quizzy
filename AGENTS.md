# Quizzy — AGENTS.md

Quizzy is a **browser-only** multiple-choice exam tool. No backend, no database — everything runs in the browser with Zustand + `localStorage`.

## Quick start

```bash
npm install            # install JS deps
npm run dev            # Vite dev server on port 5173
npm run build          # tsc && vite build (type-check first, then bundle)
npm run preview        # Vite preview of built dist/
npm run test           # vitest (watch mode)
npm run test:run       # vitest run (single pass)
npm run test:coverage  # vitest run with coverage
```

Linting: none. Testing: Vitest (colocated `*.test.ts`/`*.test.tsx`). `npm run build` = the only CI gate.

## App flow (5 tabs, no router)

```
Exams page → select exam → Editor → Quiz → Result → Review
```

Tab navigation is just `zustand` state (`tab: "exams" | "editor" | "quiz" | "result" | "review"`), switched via `setTab()`.

| Tab | What it does |
|---|---|
| **exams** | List/create/import/delete/duplicate exams |
| **editor** | Raw text textarea + live parse preview; auto-saves to active exam |
| **quiz** | One question at a time, instant feedback (sound + confetti on correct), optional timer |
| **result** | Score ring chart, confetti, retry/review/edit/redo-incorrect buttons |
| **review** | Scroll through all questions with correct/wrong indicators |

## Component tree

```
App
├── NavTabs (exams | editor | quiz)
├── ExamsPage
│   ├── NewExamModal
│   └── ExamCard → ExamDetailModal (rename, delete, duplicate, edit, quiz)
├── Editor (textarea + preview, synced scroll)
├── Quiz (progress bar, timer, question card, prev/check/next, redo badge)
├── Result (ring chart, stats, action buttons)
├── Review (question list with correct/wrong labels)
└── SettingsModal (theme, shuffle, sound, effects, timer, language)
```

## Stack

- React 19 + TypeScript (strict, noUnusedLocals, noUnusedParameters)
- Vite 7 + `@vitejs/plugin-react`
- Tailwind CSS 4 (`@import "tailwindcss"` in `index.css`) + DaisyUI 5.5 (`@plugin "daisyui"`)
- State: Zustand 5.12 with `persist` middleware → `localStorage` key `quizzy-storage`
- i18n: simple key-based system in `src/i18n/` (English default, Vietnamese supported)
- PWA: `vite-plugin-pwa` (Workbox-based service worker, precaches static assets, offline support)
- CI: GitHub Pages deploy via `.github/workflows/deploy.yml` on push to `main`
- Confetti: `canvas-confetti` (small burst per correct answer, big burst if ≥80%)
- Sound: `HTMLAudioElement` (`./correct.mp3`)

## State management (Zustand)

Single store in `src/store/quizStore.ts`.

**Persisted** (survive reload):
`exams`, `shuffleQuestions`, `soundEnabled`, `effectsEnabled`, `timerEnabled`, `timerMinutes`, `language`

**Ephemeral** (reset on reload):
`tab`, `activeExamId`, `rawText`, `questions`, `originalQuestions`, `currentIndex`, `answers`, `submitted`, `quizEndTime`, `isRedoMode`

### Key store interactions

- `selectExam(id)` — parses `rawText` via `parseQuestions()`, sets `questions` + `originalQuestions`, switches to editor tab
- `setRawText(text)` — re-parses on every keystroke, auto-saves to active exam
- `setTab("quiz")` — calls `startQuiz()` internally: optionally shuffles, resets answers/timer
- `selectAnswer(qId, optIdx, confirm)` — two-phase: `confirm=false` previews, `confirm=true` submits + plays sound/confetti
- `submitAllAndFinish()` — fills unanswered questions, goes to result (used by timer expiry)
- `redoIncorrect()` — filters questions to only those answered wrong, starts a compact quiz session (timer off, `isRedoMode=true`)

## Question format

Parser at `src/utils/parser.ts`. Questions separated by blank lines:

```
1. Question text
*A. Correct answer
B. Wrong answer

2. Next question
A. Option
*B. Correct
```

- `*` marks correct option, options `A`–`D` (2–4 supported)
- Multi-line text supported (continuation lines without `X. ` prefix)
- Invalid blocks silently dropped, questions re-numbered 0-indexed on every parse

## Data types

Two `Question` types exist. The **parser's** type is the runtime source of truth:

| File | `id` | `options` |
|---|---|---|
| `src/utils/parser.ts` (used) | `number` | `string[]` |
| `src/types.ts` (unused/legacy) | `string` | `Option[]` (objects) |

## Quiz flow details

1. User selects an exam on **ExamsPage** → `selectExam(id)` parses text → switches to **Editor**
2. User optionally edits questions (live preview, auto-save)
3. User clicks **Quiz** tab → `startQuiz()` fires → optionally shuffles, resets answers, sets `quizEndTime` if timer on
4. Each question: select option → press **Check** → instant feedback (correct=green + confetti + sound, wrong=red)
5. **Next** moves to next question; on last question → **View Result** button appears
6. Timer auto-submits when it hits 0 (`submitAllAndFinish()`)
7. **Result** shows: animated ring chart, correct/wrong count, verdict text, action buttons
8. **Redo incorrect**: from Result, click "Redo incorrect questions" → filtered quiz with only wrong questions, no timer, badge indicator in header
9. **Review** lists all questions with correct/wrong labels per option

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
