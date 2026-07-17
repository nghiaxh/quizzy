# Quizzy

A browser-based multiple choice exam tool.

## Workflow

```
Exams --> Editor --> Quiz --> Result --> Review
```

| Step | Description |
|---|---|
| **Exams** | Create, import, duplicate, rename, or delete exam question sets |
| **Editor** | Write questions in plain text with live preview and auto-save |
| **Quiz** | Answer questions sequentially with instant feedback, optional timer |
| **Result** | View score via animated ring chart, confetti, and action buttons |
| **Review** | Scroll through all questions with correct/wrong indicators per option |

## Features

- **Multiple exam management.** Create, delete, rename, duplicate any exam.
- **Plain-text editor** with intuitive syntax and synchronized scroll preview.
- **Instant feedback.** Correct answers trigger sound and confetti; wrong answers show the correct option.
- **Timed mode.** Optional per-quiz countdown with auto-submit on expiry.
- **Redo incorrect.** Retry only the quiz questions you got wrong.
- **Export and Import JSON.** Share exams as portable JSON files.
- **Accessibility.** Keyboard-navigable, screen-reader friendly controls.
- **PWA.** Installable as a standalone app with offline support.
- **Light and Dark** theme via DaisyUI.
- **Multi-language.** English and Vietnamese (Tiếng Việt).
- **Responsive.** Works on mobile and desktop.

## Question format

Questions are separated by blank lines. Prefix the correct option with `*`.

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

2 to 4 options per question. Multi-line question text is supported.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript (strict mode) |
| State | Zustand 5 with `persist` middleware → `localStorage` |
| Styling | Tailwind CSS 4 + DaisyUI 5 |
| Build | Vite 7 |
| PWA | `vite-plugin-pwa` (Workbox, offline caching) |
| CI/CD | GitHub Actions → GitHub Pages |
| Extras | `canvas-confetti`, `HTMLAudioElement` |

## Development

**Prerequisites:** Node.js >= 18

```bash
git clone https://github.com/nghiaxh/quizzy.git
cd quizzy
npm install
npm run dev      # → http://localhost:5173
```

**Build & preview:**

```bash
npm run build    # type-check + bundle
npm run preview  # serve built output locally
```

**Test:**

```bash
npm run test           # watch mode (Vitest)
npm run test:run       # single pass
npm run test:coverage  # with coverage report
```

## License

MIT
