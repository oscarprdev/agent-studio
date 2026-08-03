# [PRD.md](http://PRD.md) — AI Agent Studio

## 1. Overview

### Product Name (working title)

**AI Agent Studio**

### Vision

Create the operating system for AI developers to design, generate, manage, share, and execute AI agents, skills, and prompts.

The platform helps developers transform natural language requirements into production-ready AI workflows by combining:

- Prompt engineering
- Agent creation
- Skill generation
- MCP integrations
- Repository-aware context engineering
- Version control
- Collaboration

The goal is to become the place where developers manage their AI infrastructure in the same way they currently manage code with GitHub.

---

# 2. Problem Statement

AI development is becoming increasingly complex.

Developers now manage:

- System prompts
- Agent instructions
- MCP servers
- Tools
- Skills
- Context rules
- Memory
- Model configurations
- Evaluation datasets

However, there is no unified workflow.

Current problems:

## Problem 1 — Prompt creation is manual

Developers write prompts from scratch.

Example:

> "Create an agent that reviews pull requests using GitHub and Linear"

The developer must manually define:

- Role
- Context
- Tools
- Workflow
- Constraints
- Output format

---

## Problem 2 — Context engineering is difficult

A prompt that works in one repository may fail in another.

Agents need:

- Architecture knowledge
- Existing patterns
- Code conventions
- Documentation
- Dependencies

Today developers manually copy context.

---

## Problem 3 — Agents are not reusable

Developers create useful agents but lose them.

There is no:

- Marketplace
- Versioning
- Sharing system
- Discovery mechanism

---

## Problem 4 — No lifecycle management

Agents evolve.

Developers need:

- Version history
- Improvements
- Testing
- Performance comparison

---

# 3. Product Goals

## Primary goals

Create a platform where developers can:

1. Generate high-quality prompts automatically.
2. Create reusable AI skills.
3. Build AI agents.
4. Connect MCP tools.
5. Use repository context.
6. Share and discover agents.
7. Iterate and improve agents.

---

# 4. Target Users

## Primary Persona

### AI Developer

Profile:

- Software engineer
- Uses Cursor, Claude Code, OpenCode
- Builds applications with LLMs
- Uses MCP servers
- Creates automation workflows

Needs:

- Faster agent creation
- Better prompts
- Reusable workflows
- Team collaboration

---

## Secondary Persona

### Engineering Team Lead

Needs:

- Shared AI workflows
- Standardized agents
- Company AI knowledge base

---

# 5. Core Concepts

## Prompt

The instruction given to an AI model.

Example:

"Review this pull request"

---

## Skill

A reusable capability.

Example:

"Analyze backend architecture"

Contains:

- Instructions
- Required tools
- Expected output
- Rules

---

## Agent

An autonomous workflow.

Contains:

- Model
- Skills
- Tools
- Memory
- Instructions

Example:

"Senior Backend Engineer Agent"

---

## MCP Connector

External capability.

Examples:

- GitHub MCP
- Linear MCP
- Slack MCP
- Notion MCP

---

# 6. Main Use Cases

---

# Use Case 1

# AI Prompt Generator

## User Story

As a developer, I want to describe what I need in natural language so the platform generates a professional AI prompt.

---

## Flow

### Step 1

User opens Prompt Generator.

Screen:

```
Create a new AI prompt

What do you want to create?

[ Text Area ]

Example:

"Create a senior backend engineer agent
that reviews pull requests using GitHub
and creates Linear issues."

[Generate Prompt]

```

---

### Step 2

AI analyzes request.

The system extracts:

- Goal
- Role
- Required tools
- Constraints
- Output format

---

### Step 3

Generated prompt:

```
ROLE

You are a senior backend engineer.

OBJECTIVE

Review pull requests and identify
architectural problems.

TOOLS

GitHub MCP
Linear MCP

WORKFLOW

1. Analyze changed files
2. Review architecture
3. Create feedback
4. Generate Linear issue

RULES

- Never modify production code
- Follow repository conventions

OUTPUT

Markdown report

```

Actions:

Buttons:

- Copy
- Save Prompt
- Create Agent
- Create Skill

---

# Use Case 2

# Repository Context Prompt Generator

## User Story

As a developer, I want AI to understand my codebase before creating an agent.

---

## Flow

User connects:

```
Connect Repository

[GitHub]

Select repository:

trip/backend

[Analyze]

```

System collects:

- Repository structure
- README
- Architecture docs
- Dependencies
- Existing patterns

---

Generated context:

```
Project:

Go backend
DDD architecture
PostgreSQL
CQRS

Rules:

- Use domain commands
- Avoid CRUD handlers
- Create tests

```

Then:

```
Generate Agent

```

---

# Use Case 3

# MCP Powered Agent Generator

## User Story

As a developer, I want to create agents that automatically use external tools.

---

Example:

Input:

```
Create an agent that:

- Reviews GitHub PRs
- Creates Linear tasks
- Updates documentation

```

Select:

Tools:

☑ GitHub MCP

☑ Linear MCP

☑ Notion MCP

Generate:

```
Agent:

Code Review Manager

Model:

Claude Sonnet

Tools:

github
linear
notion


Skills:

- Code Review
- Issue Creation
- Documentation Update

```

---

# Use Case 4

# AI Agent Dashboard

Users manage:

```
Dashboard

Agents

├── Backend Reviewer
├── CTO Agent
├── QA Agent


Skills

├── Code Review
├── Generate Tests


Prompts

├── Architecture Review

```

---

# Agent Detail View

Information:

```
Backend Reviewer

Version:
1.2.0

Model:
Claude Sonnet

Tools:
Github MCP
Linear MCP

Skills:
Code Review

Created:
Aug 2026

```

Actions:

Buttons:

- Edit
- Duplicate
- Test
- Share
- Export

---

# Use Case 5

# Agent Marketplace

Future feature.

Users publish:

```
Agent Marketplace


Popular:

⭐ Senior React Reviewer

⭐ CTO Architecture Agent

⭐ Security Auditor

```

Each agent contains:

- Description
- Screenshots
- Required MCPs
- Version
- Reviews

Install:

```
Install Agent

```

---

# 7. User Flows

## First Time User

```
Signup

↓

Create Workspace

↓

Choose:

Developer
Team
Company

↓

Create first Agent

↓

Connect MCP

↓

Generate Agent

↓

Save

```

---

# 8. Application Views

---

# Landing Page

Sections:

Hero:

```
Build production AI agents faster.

Generate prompts, skills and agents
with automatic context engineering.

[Create Agent]

```

---

# Dashboard

Layout:

Sidebar:

```
Home

Agents

Skills

Prompts

MCP Connections

Marketplace

Settings

```

Main:

Cards:

```
12 Agents

24 Skills

48 Prompts

```

---

# Agent Builder

Wizard:

Step 1

Goal

Step 2

Tools

Step 3

Skills

Step 4

Context

Step 5

Generate

---

# Prompt Editor

Features:

- Markdown editor
- Version history
- Compare versions
- Test execution

---

# MCP Manager

View:

```
Connected MCP Servers

Github

Status:
Connected

Linear

Status:
Connected

```

Buttons:

- Add MCP
- Configure
- Test

---

# 9. Backend Architecture Overview

## Frontend

Stack:

- Next.js
- React
- Tailwind
- shadcn/ui

---

## Backend

Possible stack:

- Node.js
- Go
- PostgreSQL

---

## Services

```
Frontend

↓

API Gateway

↓

--------------------------------

User Service

Agent Service

Prompt Service

MCP Service

AI Generation Service

Evaluation Service

--------------------------------

↓

PostgreSQL

```

---

# 10. AI Generation Pipeline

Example:

User request:

"Create PR reviewer agent"

Pipeline:

```
User Input

↓

Intent Extraction

↓

Requirements Analysis

↓

Context Retrieval

↓

Prompt Generation

↓

Validation

↓

Agent Definition

↓

Save

```

---

# 11. Data Model

## User

```
id
email
workspace_id

```

---

## Agent

```
id

name

description

model

system_prompt

skills[]

tools[]

version

```

---

## Skill

```
id

name

instructions

tools[]

created_by

```

---

## Prompt

```
id

content

version

tags[]

```

---

# 12. Roadmap

---

# Phase 1 — MVP

Duration: 6-8 weeks

Features:

✅ Authentication

✅ Dashboard

✅ Prompt Generator

✅ Agent Generator

✅ Skill Generator

✅ Save agents

✅ Export markdown

---

# Phase 2 — Developer Platform

Duration: 3 months

Features:

- GitHub integration
- Repository analysis
- MCP connections
- Context engineering
- Agent testing
- Versioning

---

# Phase 3 — Collaboration

Features:

- Teams
- Sharing
- Permissions
- Private libraries

---

# Phase 4 — Marketplace

Features:

- Public agents
- Ratings
- Installation
- Agent packages

---

# Phase 5 — AI Agent Infrastructure

Long term:

Become:

"The GitHub for AI Agents"

Features:

- Agent registry
- CLI
- MCP server
- Package manager

Example:

```
npm install

becomes

ai install github-review-agent

```

# 13. Product Principles

1. Developers first.
2. Context is everything.
3. Agents are software.
4. Prompts need lifecycle management.
5. AI workflows should be reusable.
6. Open ecosystem over closed platform.

