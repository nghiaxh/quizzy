# Quizzy - Multiple choice exam tool

Quizzy is a browser-based tool for creating and practicing multiple choice exams. Create exams, edit questions using a simple plain-text format, take quizzes, and view detailed results.

**No backend, no database** — everything runs in your browser. Your data stays in `localStorage`.

## How it works

```
Exams → Editor → Quiz → Result → Review
```

1. **Exams** – Create or import an exam (a set of questions).
2. **Editor** – Write questions in plain text, see a live preview. Auto-saves as you type.
3. **Quiz** – Answer questions one by one. Get instant feedback (sound + confetti on correct). Optional timer.
4. **Result** – See your score with an animated ring chart. Big confetti if ≥80%.
5. **Review** – Scroll through all questions to see which were right/wrong.

That's it. 5 tabs, no router, no page reloads.

## Features

- **Manage multiple exams** – create, delete, rename, duplicate
- **Question editor** with clear syntax and live preview
- **Synced scrolling** between editor and preview panes
- **Search questions** by content or number
- **Practice mode** – answer one by one, check answers instantly
- **Detailed results** – correct/wrong count, percentage, confetti animation
- **Timer** – optional time limit per quiz
- **Export / Import JSON** – save exams as JSON files for sharing
- **Light / Dark mode**
- **Multi-language** – English and Vietnamese (Tiếng Việt)
- **PWA** – installable as a native app, works offline
- **Responsive** – works on mobile and desktop

## Question format

Questions are separated by blank lines. `*` marks the correct answer.

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

2–4 options supported, multi-line text supported.

## Tech stack

- [React 19](https://react.dev) + TypeScript (strict mode)
- [Zustand 5](https://zustand-demo.pmnd.rs) (state management, persisted to localStorage)
- [Tailwind CSS 4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com)
- [canvas-confetti](https://github.com/catdad/canvas-confetti) – celebration effect
- [Vite 8](https://vitejs.dev) – build tool
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) – service worker, offline support
- CI/CD: GitHub Pages deploy via GitHub Actions

## Development

### Prerequisites

- Node.js >= 18

### Setup

```bash
git clone https://github.com/nghiaxh/quizzy.git
cd quizzy
npm install
npm run dev
```

Open browser at `http://localhost:5173`.

### Build

```bash
npm run build
npm run preview
```
