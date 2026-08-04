# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: AI developers — software engineers using Cursor, Claude Code, or similar tools who build applications with LLMs, create automation workflows, and manage MCP servers. They need faster agent creation, better prompts, reusable workflows, and team collaboration.

Secondary: Engineering team leads — need shared AI workflows, standardized agents, and company-wide AI knowledge bases.

## Product Purpose

AI Agent Studio is the operating system for AI developers to design, generate, manage, share, and execute AI agents, skills, and prompts. It transforms natural language requirements into production-ready AI workflows by combining prompt engineering, agent creation, skill generation, MCP integrations, repository-aware context engineering, version control, and collaboration. Success means developers manage their AI infrastructure with the same rigor they manage code with GitHub.

## Positioning

The unified lifecycle platform for AI agents — from prompt generation through versioning, testing, sharing, and marketplace discovery. Neighboring tools handle one piece (prompt playgrounds, agent builders, MCP directories); this product owns the full chain and adds repository-aware context engineering no single-point tool can replicate.

## Operating Context

Developers work across IDEs (Cursor, Claude Code, OpenCode), repositories, and AI model providers. Current workflow is fragmented: manual prompt authoring, ad-hoc agent creation, no versioning or reuse, no sharing mechanism. The platform sits at the intersection of prompt engineering and software development lifecycle, requiring tight integration with GitHub, Linear, Notion, Slack, and other MCP-connected tools.

## Capabilities and Constraints

- Phase 1 (MVP, 6-8 weeks): authentication, dashboard, prompt generator, agent generator, skill generator, save agents, export markdown
- Phase 2: GitHub integration, repository analysis, MCP connections, context engineering, agent testing, versioning
- Phase 3: teams, sharing, permissions, private libraries
- Phase 4: marketplace (public agents, ratings, installation, agent packages)
- Phase 5: full AI agent infrastructure — agent registry, CLI, MCP server, package manager
- Backend stack undecided (Node.js, Go, PostgreSQL listed as options)
- Frontend: Next.js 16.2, React 19.2, TypeScript 5, Tailwind v4, shadcn/ui
- No backend, database, or API routes implemented yet — frontend-only scaffold
- No test runner configured

## Brand Commitments

None yet. Visual identity to be invented.

## Evidence on Hand

- Full PRD at `PRD.md` with use cases, data model, user flows, and application views
- Frontend scaffold at `app/`, `components/`, `lib/` with shadcn/ui and Tailwind v4
- Working dev server (`npm run dev`)

## Product Principles

1. Developers first.
2. Context is everything.
3. Agents are software.
4. Prompts need lifecycle management.
5. AI workflows should be reusable.
6. Open ecosystem over closed platform.
