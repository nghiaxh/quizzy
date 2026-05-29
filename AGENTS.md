# Quizzy — AGENTS.md

## Quick start

```bash
npm install            # install JS deps
npm run dev            # Vite dev server on port 5173
npm run build          # tsc && vite build (type-check first, then bundle)
npm run preview        # Vite preview of built dist/
```

No linter, no test framework, no typecheck script. `npm run build` = the only CI gate.

## Stack

- React 19 + TypeScript (strict, noUnusedLocals, noUnusedParameters)
- Vite 7 + `@vitejs/plugin-react`
- Tailwind CSS 4 (`@import "tailwindcss"` in `index.css`) + DaisyUI 5.5 (`@plugin "daisyui"`)
- State: Zustand 5.12 with `persist` middleware → `localStorage` key `quizzy-storage`
- CI: GitHub Pages deploy via `npm run build` on push to `main`

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

## Vite quirks

- Dev server runs on port 5173 (Vite default)
- `tsconfig.node.json` is a project reference for `vite.config.ts` only
- `tsc` must succeed before Vite bundles (no separate type-check command)

## Persistence

Only these store fields survive page reload (via `zustand/middleware` `partialize`):
`exams`, `shuffleQuestions`, `soundEnabled`, `effectsEnabled`, `timerEnabled`, `timerMinutes`.
Quiz-in-progress state (`currentIndex`, `answers`, `submitted`, `tab`) is **not** persisted.

## Git commit convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `style`, `perf`, `test`, `ci`, `build`.

- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation changes
- `refactor` — code refactoring (no behavior change)
- `chore` — maintenance, dependencies, config
- `style` — code formatting, CSS
- `ci` — CI/CD
- `build` — build system

Scope (optional) is the affected file/directory. E.g. `feat(editor):`, `fix(quiz):`, `chore(deps):`.

Write descriptions in English, present tense, lowercase, no trailing period.
