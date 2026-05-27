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
`exams`, `shuffleQuestions`, `soundEnabled`, `effectsEnabled`, `timerEnabled`, `timerMinutes`, `driveConnected`, `driveEmail`, `lastSyncAt`.
Quiz-in-progress state (`currentIndex`, `answers`, `submitted`, `tab`) is **not** persisted.

## Google Drive Sync

Two-way sync with Google Drive using `appDataFolder` (hidden, not visible in user's Drive).

### Setup

1. Google Cloud Console → create project → enable Drive API
2. OAuth consent screen → External → add test emails
3. Credentials → OAuth 2.0 Client ID → Web application
4. Add `http://localhost:5173` to Authorized JavaScript origins
5. Copy Client ID → `VITE_GOOGLE_CLIENT_ID` in `.env`
6. For GitHub Pages: add `VITE_GOOGLE_CLIENT_ID` as repository secret, referenced in `.github/workflows/deploy.yml`

### Files

- `src/utils/googleDrive.ts` — GIS OAuth, Drive API v3 calls (multipart upload, `drive.appdata` scope)
- `src/utils/syncEngine.ts` — `twoWayMerge()` pure function, last-write-wins by `updatedAt`
- `src/components/SettingsModal.tsx` — Drive login/logout/sync UI in Settings
- `src/App.tsx` — GIS script load, silent sign-in restore, auto-sync subscribe (2s debounce on CRUD)

### Flow

- App mount → load GIS → if `driveConnected`, try silent sign-in
- CRUD → auto-sync subscribe fires → debounce 2s → `orchestrateSync()`
- Manual "Đồng bộ ngay" in Settings → same `orchestrateSync()`
- Sync compares local vs Drive exams by `id`, last-write-wins by `updatedAt`

### Caveats

- There are two distinct `Question` types: `src/types.ts` (`id: string`, `options: Option[]`) and `src/utils/parser.ts` (`id: number`, `options: string[]`). The parser's type is the runtime source of truth.

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
