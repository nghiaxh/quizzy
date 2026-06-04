# Quizzy - Multiple choice exam tool

Quizzy is a browser-based tool for creating and practicing multiple choice exams. Create exams, edit questions using a simple plain-text format, take quizzes, and view detailed results.

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

## Tech stack

- [React 19](https://react.dev) + TypeScript (strict mode)
- [Zustand 5](https://zustand-demo.pmnd.rs) (state management, persisted to localStorage)
- [Tailwind CSS 4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com)
- [canvas-confetti](https://github.com/catdad/canvas-confetti) – celebration effect
- [Vite 7](https://vitejs.dev) – build tool
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
