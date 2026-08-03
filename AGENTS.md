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

## Skills (mandatory on every code touch)

Load these **before** reading, writing, or reviewing any code:

| Skill | When | Path |
|---|---|---|
| `shadcn` | Any UI component, styling, or shadcn work | `.agents/skills/shadcn/SKILL.md` |
| `vercel-react-best-practices` | Any React/Next.js code (new, refactor, review) | `.agents/skills/vercel-react-best-practices/SKILL.md` |

The `shadcn` skill enforces project-specific rules: `FieldGroup`+`Field` for forms, `gap-*` not `space-*`, `size-*` for equal dimensions, `data-icon` for button icons, semantic color tokens, and more. Violating these produces code that looks right but breaks shadcn composition.

The `vercel-react-best-practices` skill covers 70 performance rules across waterfalls, bundle size, server-side, re-renders, and rendering. Critical ones: parallelize independent fetches, avoid barrel imports, use `Suspense` boundaries, authenticate Server Actions inside the action.

Full skill registry at `.atl/skill-registry.md`.
