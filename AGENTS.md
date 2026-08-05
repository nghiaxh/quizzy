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

## Stack

- React 19 + TypeScript (strict, noUnusedLocals, noUnusedParameters)
- Vite 7 + `@vitejs/plugin-react`
- HeroUI v3 (`@heroui/react` + `@heroui/styles`, CSS-first, no provider) + Tailwind CSS 4 (`@import "@heroui/styles"` in `src/index.css`)
- Icons: `@phosphor-icons/react` (no Lucide)
- Fonts: `@fontsource-variable/geist` (sans), `geist-mono` (mono), `newsreader` (serif, + `wght-italic`) — imported in `src/main.tsx`
- State: Zustand 5.12 with `persist` middleware → `localStorage` key `quizzy-storage`
- i18n: simple key-based system in `src/i18n/` (English default, Vietnamese supported)
- PWA: `vite-plugin-pwa` (Workbox-based service worker, precaches static assets incl. `woff2`, offline support)
- CI: GitHub Pages deploy via `.github/workflows/deploy.yml` on push to `main`
- Confetti: `canvas-confetti` (small burst per correct answer, big burst if ≥80%)
- Sound: `HTMLAudioElement` (`./correct.mp3`)
- Share: compact binary format + `fflate` deflate → base64url in URL hash fragment (`#share=`)

## Design system

Warm editorial monochrome. Light + dark themes are HeroUI CSS token overrides in `src/index.css`.

**Tokens** (CSS variables in `:root`/`[data-theme="dark"]`, exposed as Tailwind utilities via `@theme inline` in HeroUI styles):
canvas `--background` `#fbfbfa`, cards `--surface` `#ffffff`, muted fills `--surface-secondary`/`--surface-tertiary`, dividers `--border`/`--separator`, charcoal text `--foreground`, muted `--muted`, primary CTA `--accent` `#111111` (light) / `#f2efea` (dark), status `--success` `--warning` `--danger`, fields `--field-*`, modal `--overlay` + `--backdrop`.

**Typography:** body `font-sans` (Geist), headings/logo/exam titles/verdict `font-serif` (Newsreader), option letters/question numbers/timer/counts/mono metadata `font-mono` (Geist Mono).

**Rules:** flat cards with crisp small radii (`rounded-lg`/`rounded-xl`), no heavy shadows (`shadow-md+`), no gradients/glass, no `rounded-full` on large elements, quiet motion. Use `bg-surface border border-border`, `bg-surface-secondary/tertiary`, `text-muted/foreground`, `bg-accent text-accent-foreground`, `divide-separator`.

**HeroUI specifics:**
- No provider or theme config needed; just `@import "@heroui/styles"` + token overrides.
- Dark mode via `data-theme="dark"` on `<html>` (App sets it from `localStorage["theme"]`).
- Buttons: base class `button` (overridden to `--radius-lg`), variants `primary|secondary|tertiary|ghost|outline|danger|danger-soft`, sizes `lg|md|sm`, props `isIconOnly`, `isDisabled`, `fullWidth`.
- Modals: compound `Modal` with `.Backdrop/.Container/.Dialog/.Header/.Body/.Footer/.Heading/.CloseTrigger`; `Container` accepts `size` + `scroll="inside"`; `CloseTrigger` is already a `CloseButton` (don't nest buttons). Renders into a **portal** — tests must use `screen`, not `container` queries.
  - Programmatic modals: wrap in `AppModal` (`src/components/AppModal.tsx`), which renders `Modal.Root state={useOverlayState({ defaultOpen: true })}` and wires `onOpenChange(false)` → `onClose()`. Don't inject `OverlayTriggerStateContext` by hand or skip `Modal.Root` — that leaves the dialog unpainted behind the dimmed backdrop. `Modal.Root` wraps children in a RAC `DialogTrigger`, so give it a hidden disabled `Button` trigger child to register a pressable; otherwise RAC logs a dev-only "PressResponder without a pressable child" warning.
- Switch: compound `Root/Content/Control/Thumb`, `size="sm"`, controlled via `isSelected` + `onChange` (not `onValueChange`).
- Input: `@heroui/react` `Input` is a bare RAC input (no start/end content); wrap icons in an absolutely-positioned element.
- Color utilities: `bg-accent text-accent-foreground`, `text-muted`, `bg-surface-secondary`, `border-border`, `text-success/warning/danger`, `bg-danger/10` etc.

## Component tree

```
App
├── Header (Quizzy serif logo, pill NavTabs exams | editor | quiz, settings Button)
├── ExamsPage
│   ├── NewExamModal (HeroUI Modal)
│   ├── ExamCard → ExamDetailModal (rename, delete, duplicate, edit, quiz, share)
│   └── ShareModal (HeroUI Modal)
├── Editor (textarea + preview, synced scroll)
├── Quiz (progress bar, timer, question card, prev/check/next, redo badge)
├── Result (ring chart, stats, action buttons)
├── Review (question list with correct/wrong labels)
└── SettingsModal (HeroUI Modal; theme, shuffle, sound, effects, timer, language)
```

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

## Share flow

Sharing uses URL hash fragment (`#share=<compressed>`). No backend needed.

**Encode:** `rawText` → `parseQuestions()` → compact format (`\x00`/`\x01` separated) → `fflate` deflate → base64url

**Decode:** base64url → inflate → compact format → reconstruct rawText → parser produces identical questions

Compact format spec:
```
name\x01text\x00correctIdx\x00opt1\x00opt2[\x00opt3[\x00opt4]]\x01...
```

Implementation: `src/utils/share.ts`. External API unchanged: `createShareUrl()`, `getShareDataFromUrl()`, `clearShareHash()`.

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
