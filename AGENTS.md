<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- **Next.js 16.2** (App Router, RSC enabled) — check `node_modules/next/dist/docs/` before writing code
- **React 19.2** / **TypeScript 5** (strict mode)
- **Tailwind CSS v4** via PostCSS plugin (`@tailwindcss/postcss`)
- **shadcn/ui** (`base-nova` style) — add components via `npx shadcn add <component>`
- **ESLint 9** flat config (core-web-vitals + typescript presets)

## Commands

```bash
npm run dev        # dev server on :3000
npm run build      # production build
npm run lint       # eslint (no typecheck script exists)
```

**No test runner is configured.** There are no test scripts, test files, or testing dependencies.

## Path alias

`@/*` maps to project root (e.g. `@/components`, `@/lib`). Defined in `tsconfig.json`.

## Project conventions

- UI components go in `components/ui/` (shadcn convention)
- Utility function (`cn`) lives in `lib/utils.ts`
- Global styles and CSS variables in `app/globals.css` — uses `oklch` color space
- No backend, database, or API routes yet — this is a frontend-only scaffold
- PRD with full product spec is at `PRD.md`

## Skills

Two project-local skills in `.agents/skills/`:
- `shadcn` — shadcn component management and debugging
- `vercel-react-best-practices` — React/Next.js perf patterns

Full registry at `.atl/skill-registry.md`.
