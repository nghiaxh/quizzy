# Design — Quizzy

Quizzy is a **browser-only** multiple choice exam tool. No backend, no database — everything runs in the browser with Zustand + `localStorage`.

## App flow (5 tabs, no router)

```
Exams page → select exam → Editor → Quiz → Result → Review
```

Tab navigation is just `zustand` state (`tab: "exams" | "editor" | "quiz" | "result" | "review"`), switched via `setTab()`.

| Tab | What it does |
|---|---|
| **exams** | List/create/import/delete/duplicate exams |
| **editor** | Raw text textarea + live parse preview; auto-saves to active exam |
| **quiz** | One question at a time, instant feedback, optional timer |
| **result** | Score ring chart, confetti, retry/review/edit buttons |
| **review** | Scroll through all questions with correct/wrong indicators |

## Component tree

```
App
├── NavTabs (exams | editor | quiz)
├── ExamsPage
│   ├── NewExamModal
│   └── ExamCard → ExamDetailModal (rename, delete, duplicate, edit, practice)
├── Editor (textarea + preview, synced scroll)
├── Quiz (progress bar, timer, question card, prev/check/next)
├── Result (ring chart, stats, action buttons)
├── Review (question list with correct/wrong labels)
└── SettingsModal (theme, shuffle, sound, effects, timer, language)
```

## State (Zustand — `src/store/quizStore.ts`)

Single store, persist middleware partializes to `localStorage` key `quizzy-storage`.

**Persisted** (survive reload):
`exams`, `shuffleQuestions`, `soundEnabled`, `effectsEnabled`, `timerEnabled`, `timerMinutes`, `language`

**Ephemeral** (reset on reload):
`tab`, `activeExamId`, `rawText`, `questions`, `originalQuestions`, `currentIndex`, `answers`, `submitted`, `quizEndTime`

### Key store interactions

- `selectExam(id)` — parses `rawText` via `parseQuestions()`, sets `questions` + `originalQuestions`, switches to editor tab
- `setRawText(text)` — re-parses on every keystroke, auto-saves to active exam
- `setTab("quiz")` — calls `startQuiz()` internally: optionally shuffles, resets answers/timer
- `selectAnswer(qId, optIdx, confirm)` — two-phase: `confirm=false` previews, `confirm=true` submits + plays sound/confetti
- `submitAllAndFinish()` — fills unanswered questions, goes to result (used by timer expiry)

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

- `*` marks correct option, options `A`–`D` (2–4)
- Continuation lines supported (no `X. ` prefix)
- Invalid blocks silently dropped, questions re-numbered 0-indexed on parse

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
8. **Review** lists all questions with correct/wrong labels per option

## Visual design

- DaisyUI 5.5 (buttons, cards, progress, modals, tooltips)
- Tailwind CSS v4 via `@import "tailwindcss"`
- Light/dark theme via `data-theme` attribute + localStorage
- Confetti via `canvas-confetti` (small burst per correct answer, big burst if ≥80%)
- Sound via `HTMLAudioElement` (`./correct.mp3`)

## PWA

- `vite-plugin-pwa` with Workbox `generateSW`
- Precaches: `**/*.{js,css,html,png,svg,mp3}`
- External requests: `NetworkFirst`, 7-day cache
- `autoUpdate` on new deployment
- Standalone manifest, SVG icons 192×192 + 512×512


