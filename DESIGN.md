# Design — Quizzy

## App flow

```
                    ┌──────────┐
                    │  Exams   │ ← Browse saved exams, select one to take
                    └────┬─────┘
                         │
              ┌──────────▼──────────┐
              │  Editor              │ ← Create/edit exam questions (plain text)
              │  (raw text input)    │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  Quiz                │ ← Take the quiz: answer questions one by one
              │  (progress tracked)  │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  Result              │ ← Score, correct/wrong breakdown, confetti
              └─────────────────────┘
```

Tab navigation at top: `exams | editor | quiz | result | review`. Only one tab active at a time.

## Component tree

```
App
├── NavTabs (exams | editor | quiz | result | review)
├── ExamsPage         — List saved exams, start/delete
├── Editor            — Raw text area + parse preview
├── Quiz              — Question-by-question: option buttons, progress bar, timer
│   └── QuestionCard  — Single question with A/B/C/D options
├── Result            — Score summary + confetti animation
├── Review            — Review answers after submission
└── SettingsModal     — Shuffle questions, sound, effects, timer
```

## State (Zustand — `src/store/quizStore.ts`)

| Slice | Persisted? | Description |
|---|---|---|
| `exams` | ✅ | Saved exam list (name + questions) |
| `currentIndex` | ❌ | Current question index in quiz |
| `answers` | ❌ | User's answers for current quiz |
| `submitted` | ❌ | Whether quiz is submitted |
| `tab` | ❌ | Active tab |
| `shuffleQuestions` | ✅ | Toggle for shuffling question order |
| `soundEnabled` | ✅ | Toggle for sound effects |
| `effectsEnabled` | ✅ | Toggle for confetti effect |
| `timerEnabled` | ✅ | Toggle for quiz timer |
| `timerMinutes` | ✅ | Timer duration in minutes |


Persist middleware via `partialize` → `localStorage` key `quizzy-storage`.
Quiz-in-progress state (`currentExam`, `currentIndex`, `answers`, `submitted`, `tab`) is **not** persisted.

## Question format

Plain text, questions separated by blank lines:

```
1. What is 2+2?
*A. 4
B. 3
C. 5
D. 6

2. Which planet is closest to the sun?
*A. Mercury
B. Venus
C. Earth
D. Mars
```

- `*` prefix marks the correct answer
- Options labeled `A.` through `D.` (2-4 options supported)
- Multi-line question text and multi-line options supported
- Invalid blocks (fewer than 2 options, missing correct answer) silently dropped
- Questions re-numbered (0-indexed) on every parse

## Data types

There are two `Question` types — the parser's type is the runtime source of truth:

| Location | `id` type | `options` type |
|---|---|---|
| `src/types.ts` | `string` | `Option[]` (object with label + text) |
| `src/utils/parser.ts` | `number` | `string[]` (flat strings) |

## Quiz flow

1. User selects an exam → tab switches to `quiz`
2. Questions displayed one at a time (or shuffled)
3. User picks answer → moves to next question
4. Can review answers before submitting
5. On submit → tab switches to `result`
6. Result shows: score ×/total, per-question correctness, confetti if passing

## Visual design

- DaisyUI 5.5 components (buttons, cards, progress bars, modals)
- Tailwind CSS v4 via `@import "tailwindcss"`
- Clean, minimal layout centered on page
- Confetti animation on quiz completion (`canvas-confetti`)


