# Product

&lt;!-- impeccable:product-schema 1 --&gt;

# Platform

web

---

# Users

## Primary User

AI developers — software engineers using Cursor, Claude Code, OpenCode, or similar AI development tools.

They build applications with LLMs, create automation workflows, manage MCP servers, and maintain AI-powered development processes.

Needs:

- Faster agent creation

- Better prompts

- Reusable AI workflows

- Repository-aware context

- Agent improvement workflows

- Version control

- Testing and evaluation

- Collaboration

---

## Secondary User

Engineering team leads and AI platform owners.

Needs:

- Shared AI workflows

- Standardized agents

- Company AI knowledge bases

- Quality control

- Governance

- Private agent libraries

---

# Product Purpose

AI Agent Studio is the operating system for AI developers to design, generate, manage, improve, share, and execute AI agents, skills, prompts, and AI workflows.

The platform transforms natural language requirements into production-ready AI systems by combining:

- Prompt engineering

- Agent generation

- Skill generation

- MCP integrations

- Repository-aware context engineering

- Context libraries

- Knowledge management

- Agent versioning

- Agent evaluation

- Continuous improvement

- Collaboration

- Marketplace discovery

Success means developers manage AI infrastructure with the same rigor they manage software with GitHub.

---

# Positioning

AI Agent Studio is the unified lifecycle platform for AI agents.

It owns the complete AI development lifecycle:

```

Idea

↓

Prompt Generation

↓

Agent Creation

↓

Context Injection

↓

Evaluation

↓

Improvement

↓

Versioning

↓

Sharing

↓

Reuse

```

Existing tools solve individual problems:

- Prompt playgrounds

- Agent builders

- MCP directories

- AI chat interfaces

AI Agent Studio combines these capabilities and adds repository-aware context engineering and AI knowledge reuse.

Long-term positioning:

&gt; The GitHub + npm + IDE for AI agents.

---

# Operating Context

Developers work across:

- IDEs (Cursor, Claude Code, OpenCode)

- GitHub repositories

- AI model providers

- MCP ecosystems

- Team knowledge systems

Current workflows are fragmented:

- Manual prompt creation

- Isolated agents

- Lost AI knowledge

- No lifecycle management

- No testing framework

- No reusable patterns

- No standardized improvement process

AI Agent Studio sits at the intersection of:

- Prompt engineering

- Software engineering

- Developer tooling

- AI infrastructure

The platform integrates with:

- GitHub

- Linear

- Notion

- Slack

- MCP-connected tools

- Repository systems

---

# Core Concepts

## Agent

An autonomous AI workflow.

Contains:

- Model

- Instructions

- Skills

- Tools

- Context

- Memory

- Evaluation rules

- Version history

Agents are treated as software artifacts.

---

## Skill

A reusable AI capability.

Examples:

- Code review

- Architecture analysis

- Security auditing

- Documentation generation

- Test generation

Contains:

- Instructions

- Rules

- Required tools

- Expected output

---

## Prompt

A reusable AI instruction.

Supports:

- Versioning

- Testing

- Comparison

- Improvement

- Sharing

---

## Context

Reusable knowledge used to generate and improve AI systems.

Context types:

- Agents

- Skills

- Prompts

- Documents

- Repository analysis

- Architecture guidelines

- Engineering rules

- Evaluation datasets

Context allows AI generation to learn from existing knowledge.

---

## Context Library

The central knowledge system of AI Agent Studio.

The Context Library allows users to upload, organize, reuse, and share AI knowledge.

Supported assets:

- Existing agents

- Skills

- Prompts

- Documentation

- Repository context

- Engineering standards

- Architecture patterns

- Evaluation examples

Users can pin contexts when generating or improving agents.

Example:

Create:

```

Senior Backend Reviewer

```

Using:

```

+ DDD Architecture Guidelines

+ Existing Backend Agent

+ Security Rules

+ Company Coding Standards

+ Backend Repository Context

```

---

## Agent Evolution

Agents are continuously improved instead of being created once.

Lifecycle:

```

Generate

↓

Add Context

↓

Improve

↓

Evaluate

↓

Version

↓

Share

```

Users can improve agents by adding:

- New contexts

- Existing agents as patterns

- Skills

- Rules

- Examples

- Repository knowledge

---

# Improvement System

AI Agent Studio provides predefined improvement strategies.

## Caveman Mode

Goal:

Simplify the agent.

Focus:

- Remove unnecessary complexity

- Reduce tools

- Remove redundant steps

- Reduce context size

- Prefer simple workflows

---

## Clean Architecture Mode

Goal:

Improve agent structure.

Focus:

- Separation of concerns

- Clear responsibilities

- Dependency direction

- Maintainability

- Better system design

---

## Ponytail Mode

Goal:

Improve clarity and maintainability.

Focus:

- Reduce cognitive load

- Remove clever solutions

- Prefer explicit workflows

- Improve readability

---

## Senior Engineer Review Mode

Simulates a staff-level engineering review.

Checks:

- Architecture

- Scalability

- Reliability

- Maintainability

- Long-term impact

---

## Security Mode

Checks:

- Prompt injection risks

- Tool permissions

- Data exposure

- Unsafe workflows

---

## Performance Mode

Optimizes:

- Token usage

- Context size

- Latency

- Tool execution efficiency

---

# Agent Evaluation

Agents require testing like software.

The platform supports:

- Evaluation datasets

- Expected outputs

- Regression tests

- Quality scoring

- Performance comparison

Example:

```

Agent Version 1

Score:

82%

Agent Version 2

Score:

94%

```

---

# Agent Composition

Agents should be built from reusable components instead of becoming large monolithic workflows.

Example:

```

Engineering Manager Agent

    |

----------------------------

Architecture Skill

Code Review Skill

Security Skill

Testing Skill

Documentation Skill

----------------------------

```

---

# Agent Knowledge Graph

Long-term capability.

The platform builds relationships between:

- Agents

- Skills

- Contexts

- Repositories

- Patterns

- Rules

Example:

```

DDD Guidelines

connected with:

Backend Agent

CQRS Skill

Go Repository

Architecture Review Prompt

```

The system learns which contexts work well together.

---

# Capabilities and Constraints

## Phase 1 — MVP (6-8 weeks)

Core creation platform:

- Authentication

- Dashboard

- Prompt Generator

- Agent Generator

- Skill Generator

- Save agents

- Save prompts

- Save skills

- Export markdown

- Basic agent management

---

## Phase 2 — AI Development Platform

Context and lifecycle:

- GitHub integration

- Repository analysis

- Context Library

- Context upload

- Context processing

- Context pinning

- MCP connections

- Agent versioning

- Agent improvement workflows

- Agent testing

- Evaluation datasets

- Quality scoring

---

## Phase 3 — Collaboration Platform

Team features:

- Workspaces

- Teams

- Sharing

- Permissions

- Private libraries

- Organization knowledge bases

- Agent reviews

- Approval workflows

---

## Phase 4 — Marketplace

Public ecosystem:

- Public agents

- Public skills

- Context packages

- Ratings

- Reviews

- Installation

- Agent packages

---

## Phase 5 — AI Infrastructure Platform

Long-term ecosystem:

- Agent registry

- CLI

- MCP server

- Agent runtime

- Package manager

- Agent deployment

- Agent analytics

Example:

Current:

```

npm install package

```

Future:

```

ai install github-review-agent

```

---

# Backend Architecture

Backend stack:

Possible:

- Go

- Node.js

- PostgreSQL

Services:

```

API Gateway

User Service

Workspace Service

Agent Service

Skill Service

Prompt Service

Context Service

MCP Service

AI Generation Service

Evaluation Service

Marketplace Service

PostgreSQL

```

---

# Frontend

Current stack:

- Next.js 16.2

- React 19.2

- TypeScript 5

- Tailwind v4

- shadcn/ui

Current state:

- Frontend scaffold exists

- app/ implemented

- components/ implemented

- lib/ implemented

- Development server works

Current limitations:

- No backend implemented

- No database implemented

- No API routes implemented

- No test runner configured

---

# Product Principles

- Developers first.

- Context is everything.

- Agents are software.

- Prompts need lifecycle management.

- AI workflows should be reusable.

- Knowledge should compound over time.

- Agents should continuously improve.

- Simplicity beats unnecessary complexity.

- Open ecosystem over closed platform.

- AI infrastructure should follow software engineering discipline.

---

# Success Metrics

## Creation

Measure:

- Time required to create an agent

- Number of generated agents

- Prompt generation quality

---

## Reuse

Measure:

- Context reuse frequency

- Agent duplication rate

- Skill reuse rate

---

## Quality

Measure:

- Agent evaluation scores

- Improvement frequency

- Version adoption

---

## Collaboration

Measure:

- Shared agents

- Team libraries

- Marketplace adoption

---

# Long-Term Vision

AI Agent Studio becomes the infrastructure layer for AI development.

The platform where developers:

Create

↓

Store

↓

Improve

↓

Evaluate

↓

Share

↓

Deploy

AI software systems.

Equivalent ecosystem:

```

Software:

GitHub

+

npm

+

VS Code

AI:

AI Agent Studio

+

Agent Registry

+

Context Marketplace

+

Agent Runtime

+

Evaluation Platform

```