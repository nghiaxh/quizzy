# Quizzy — AGENTS.md

## Quick start

```bash
npm install            # install JS deps
npm run dev            # Vite dev server on port 1420
npm run build          # tsc && vite build (type-check first, then bundle)
npm run tauri dev      # Tauri desktop app (also runs `npm run dev`)
npm run preview        # Vite preview of built dist/
```

No linter, no test framework, no typecheck script. `npm run build` = the only CI gate.

## Stack

- React 19 + TypeScript (strict, noUnusedLocals, noUnusedParameters)
- Vite 7 + `@vitejs/plugin-react`
- Tailwind CSS 4 (`@import "tailwindcss"` in `index.css`) + DaisyUI 5 (`@plugin "daisyui"`)
- State: Zustand 5 with `persist` middleware → `localStorage` key `quizzy-storage`
- Desktop: Tauri 2 (Rust backend—minimal, only `tauri` + `tauri-plugin-opener`)
- CI: GitHub Pages deploy via `npm run build` on push to `main`

## Architecture

Single-page app with 4 tabs (`exams | editor | quiz | result`), all backed by one Zustand store at `src/store/quizStore.ts`.

| Directory | Purpose |
|-----------|---------|
| `src/components/` | 5 components: `ExamsPage`, `Editor`, `Quiz`, `Result`, `SettingsModal` |
| `src/store/quizStore.ts` | All state (exams, questions, quiz progress, settings) |
| `src/utils/parser.ts` | Custom question parser + its own `Question` type (`id: number`) |
| `src/utils/confetti.ts` | `canvas-confetti` helpers |
| `src-tauri/` | Tauri shell; `tauri.conf.json` lives here |

## Question format (parser)

Questions are parsed from raw text by blank-line separation. Each block:

```
1. Question text
*A. Correct answer
B. Wrong answer
C. Wrong answer
D. Wrong answer
```

- Asterisk `*` marks the correct option
- Options are `A`–`D` (2–4 supported)
- Multi-line question text and multi-line options are supported (continuation lines without the `X. ` prefix)
- Invalid blocks (fewer than 2 options, no correct answer) are silently dropped
- Questions are re-numbered (0-indexed `id`) on every parse

## Vite / Tauri quirks

- Dev server **must** run on port 1420 (Tauri hard-coded `devUrl`)
- HMR on port 1421 when `TAURI_DEV_HOST` is set
- Vite ignores `src-tauri/` in file watcher
- `beforeDevCommand: "npm run dev"`, `beforeBuildCommand: "npm run build"`
- `tsconfig.node.json` is a project reference for `vite.config.ts` only
- `tsc` must succeed before Vite bundles (no separate type-check command)

## Persistence

Only these store fields survive page reload (via `zustand/middleware` `partialize`):
`exams`, `shuffleQuestions`, `soundEnabled`, `effectsEnabled`.
Quiz-in-progress state (`currentIndex`, `answers`, `submitted`, `tab`) is **not** persisted.

## Caveats

- There are two distinct `Question` types: `src/types.ts` (`id: string`, `options: Option[]`) and `src/utils/parser.ts` (`id: number`, `options: string[]`). The parser's type is the runtime source of truth.
- Tauri build requires Rust toolchain + MSVC Buildtools (Windows). For headless/CI web builds, `npm run build` alone suffices.
