# [PRD.md](http://PRD.md) — AI Agent Studio

# 1. Overview

## Product Name

AI Agent Studio

## Vision

Create the operating system for AI developers to design, generate, manage, improve, share, and execute AI agents.

AI Agent Studio enables developers to transform natural language requirements into production-ready AI workflows by combining:

- Prompt engineering

- Agent creation

- Skill generation

- MCP integrations

- Repository-aware context engineering

- Knowledge management

- Version control

- Agent evaluation

- Collaboration

- Marketplace distribution

The goal is to become the place where developers manage AI infrastructure in the same way they currently manage software with GitHub.

---

# 2. Product Evolution

The first generation of AI Agent Studio focuses on:

&gt; Generate AI agents from natural language.

The evolved product becomes:

&gt; A complete AI engineering platform where agents, prompts, skills, and knowledge continuously improve.

AI Agent Studio should become:

```

GitHub + npm + VS Code + Notion

for AI agents

```

The platform manages the complete lifecycle:

```

Create

↓

Contextualize

↓

Generate

↓

Evaluate

↓

Improve

↓

Version

↓

Share

↓

Reuse

```

---

# 3. Problem Statement

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

- Repository knowledge

- Engineering guidelines

However, there is no unified workflow.

---

# Problem 1 — Prompt Creation Is Manual

Developers write prompts from scratch.

Example:

```

Create an agent that reviews pull requests using GitHub and Linear.

```

The developer manually defines:

- Role

- Context

- Tools

- Workflow

- Constraints

- Output format

- Rules

---

# Problem 2 — Context Engineering Is Difficult

Agents require context.

A prompt that works in one repository may fail in another.

Agents need:

- Architecture knowledge

- Existing patterns

- Documentation

- Dependencies

- Coding conventions

- Business rules

Today developers manually copy context.

---

# Problem 3 — Agents Are Not Reusable

Developers create useful agents but lose them.

Missing:

- Agent marketplace

- Versioning

- Sharing

- Discovery

- Knowledge reuse

---

# Problem 4 — Agents Do Not Improve

Agents evolve.

Developers need:

- Version history

- Testing

- Evaluation

- Performance comparison

- Improvement workflows

---

# Problem 5 — Knowledge Is Lost

Companies accumulate AI knowledge:

- Best prompts

- Agent patterns

- Coding rules

- Architecture decisions

- Successful workflows

But there is no system to preserve and reuse it.

---

# 4. Product Goals

## Primary Goals

Enable developers to:

- Generate high-quality prompts automatically

- Create reusable AI skills

- Build AI agents

- Connect MCP tools

- Inject repository context

- Store AI knowledge

- Learn from existing agents

- Improve agents continuously

- Test agent quality

- Share AI workflows

---

# 5. Target Users

# Primary Persona

## AI Developer

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

- Context management

- Team collaboration

---

# Secondary Persona

## Engineering Team Lead

Needs:

- Shared AI workflows

- Standardized agents

- Company AI knowledge base

- Quality control

---

# 6. Core Concepts

# Prompt

Instruction given to an AI model.

Example:

```

Review this pull request

```

Contains:

- Instructions

- Context

- Expected output

- Constraints

---

# Skill

A reusable AI capability.

Example:

```

Analyze backend architecture

```

Contains:

- Instructions

- Rules

- Required tools

- Expected output

---

# Agent

An autonomous AI workflow.

Contains:

- Model

- Skills

- Tools

- Memory

- Instructions

- Context

- Evaluation rules

Example:

```

Senior Backend Engineer Agent

```

---

# MCP Connector

External capability.

Examples:

- GitHub MCP

- Linear MCP

- Slack MCP

- Notion MCP

---

# Context

Reusable knowledge used to improve generation.

Context can be:

- Agent

- Skill

- Prompt

- Document

- Repository

- Rule set

- Architecture guideline

- Evaluation dataset

---

# 7. Context Library

## Overview

The Context Library is the knowledge system of AI Agent Studio.

It allows users to upload, store, organize, and reuse AI knowledge.

Instead of generating isolated agents:

```

Context Library

+

AI Generation

=

Better Agents

```

---

# Context Types

## Agent Context

Existing agents used as references.

Example:

```

Senior Backend Reviewer Agent

```

Contains:

- System prompt

- Skills

- Tools

- Workflow

- Rules

- Examples

Used as:

"Create a new agent following this pattern."

---

## Skill Context

Reusable capabilities.

Example:

```

Clean Architecture Reviewer

```

Contains:

```

Rules:

- Respect dependency inversion

- Avoid framework coupling

- Prefer domain models

```

---

## Prompt Context

Reusable prompts.

Example:

```

Production Code Review Prompt

```

---

## Documentation Context

Uploaded knowledge:

- Markdown

- PDFs

- Text files

- ADRs

- Engineering guides

Examples:

```

[architecture.md](http://architecture.md)

[coding-standards.md](http://coding-standards.md)

security-guidelines.pdf

```

---

## Repository Context

Connected repositories.

Example:

```

github.com/company/backend

```

Extracts:

- Architecture

- Folder structure

- Dependencies

- Patterns

- Coding style

---

# Context Upload Flow

User:

```

+ Add Context

```

Options:

```

Upload Document

Import Agent

Import Skill

Connect Repository

Create Knowledge Document

```

---

AI analyzes:

Example:

Input:

```

[backend-agent.md](http://backend-agent.md)

```

Output:

```

Category:

Backend Engineering

Patterns:

DDD

CQRS

Hexagonal Architecture

Style:

Explicit interfaces

Domain driven design

```

---

# Context Card

Example:

```

Senior Backend Agent

Type:

Agent Pattern

Tags:

Go

DDD

Backend

Quality Score:

94%

Actions:

Use Context

Improve

Duplicate

Share

```

---

# 8. Context Pinning

Generated agents can reference multiple contexts.

Example:

Create:

```

Senior Backend Reviewer

```

Pinned contexts:

```

✓ DDD Guidelines

✓ Backend Repository Context

✓ Security Rules

✓ Existing Reviewer Agent

✓ Company Coding Standards

```

Generation:

```

User Requirement

+

Pinned Contexts

+

Repository Context

+

AI Generation

=

New Agent

```

---

# 9. Agent Evolution System

Agents are living software.

Every agent has:

- Versions

- History

- Improvements

- Context changes

---

# Improve Agent Flow

Existing:

```

Backend Reviewer v1

```

Action:

```

Improve Agent

```

User adds:

```

+ Security Auditor Agent

+ OWASP Rules

+ New Repository Context

```

Result:

```

Backend Reviewer v2

New capabilities:

- Security review

- Vulnerability detection

- Dependency analysis

```

---

# Agent Timeline

```

v1.0

Initial generation

↓

v1.1

Added architecture context

↓

v1.2

Added security rules

↓

v2.0

Major workflow improvement

```

---

# 10. AI Improvement Modes

AI Agent Studio provides predefined improvement strategies.

Users can apply engineering philosophies.

---

# Caveman Mode

Goal:

Simplify the agent.

Checks:

- Remove unnecessary complexity

- Reduce tools

- Remove redundant steps

- Simplify workflow

- Reduce context size

Example:

Before:

```

12 tools

8 skills

complex workflow

```

After:

```

5 tools

3 skills

simple workflow

```

---

# Clean Architecture Mode

Goal:

Improve structure.

Checks:

- Separation of concerns

- Clear responsibilities

- Dependency direction

- Domain boundaries

- Framework isolation

---

# Ponytail Mode

Goal:

Improve maintainability.

Checks:

- Reduce cognitive load

- Avoid clever solutions

- Improve readability

- Make decisions explicit

---

# Senior Engineer Review Mode

Simulates:

```

Staff Engineer Review

```

Checks:

- Scalability

- Reliability

- Architecture

- Maintainability

---

# Security Mode

Checks:

- Prompt injection risks

- Unsafe tools

- Data exposure

- Permission issues

---

# Performance Mode

Optimizes:

- Token usage

- Context size

- Latency

- Tool calls

---

# Minimal Agent Mode

Question:

"What can we remove?"

Goal:

Create the smallest effective agent.

---

# 11. Agent Quality Score

Every agent receives a quality score.

Example:

```

Backend Reviewer

Quality Score: 91%

Prompt Quality:

95%

Context Coverage:

87%

Workflow:

90%

Evaluation:

88%

```

---

Recommendations:

```

Missing:

- Security rules

- Evaluation examples

- Error handling workflow

```

---

# 12. Agent Evaluation Framework

Agents need tests.

Similar to software testing.

---

# Agent Test Cases

Example:

Agent:

```

Code Reviewer

```

Input:

```

Review this pull request

```

Expected:

```

Find bugs

Suggest improvements

Create issues

```

---

# Evaluation Dataset

Stores:

- Good outputs

- Bad outputs

- Expected behavior

- Regression cases

---

# Test Execution

Example:

```

Before:

82%

After:

94%

```

---

# 13. Agent Composition

Avoid giant agents.

Build systems from smaller components.

Example:

```

Engineering Manager Agent

        |

----------------------

Architecture Skill

Code Review Skill

Security Skill

Testing Skill

Documentation Skill

----------------------

```

---

# 14. Agent Graph View

Visual workflow editor.

Example:

```

User Request

↓

Planner Agent

↓

----------------

Architecture Agent

Code Agent

QA Agent

Security Agent

----------------

↓

Final Result

```

---

# 15. Agent Marketplace

Future feature.

AI Agent Registry.

Users publish:

- Agents

- Skills

- Context packs

- Templates

---

Example:

```

Senior React Reviewer

Security Auditor

CTO Architecture Agent

```

Each package contains:

- Description

- Version

- Required MCPs

- Contexts

- Reviews

- Evaluation score

---

Install:

```

Install Agent

```

---

# 16. Agent Package Format

Open standard.

Example:

```

.agent/

 

backend-reviewer/

agent.yaml

prompts/

skills/

contexts/

evaluations/

```

---

Example:

```yaml

name: Backend Reviewer

version: 1.2.0

model:

 claude-sonnet

skills:

 - architecture-review

 - security-review

contexts:

 - ddd-guidelines

 - backend-patterns

tools:

 - github

 - linear

evaluation:

 dataset:

 - pr-review-tests

```

---

# 17. Application Views

# Landing Page

Hero:

```

Build production AI agents faster.

Generate, improve and share AI workflows.

[Create Agent]

```

---

# Dashboard

Sidebar:

```

Home

Agents

Skills

Prompts

Context Library

MCP Connections

Marketplace

Settings

```

---

# Context Library View

Sections:

```

Agents

Skills

Documents

Repositories

Patterns

Rules

```

---

# Agent Builder

Wizard:

```

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

```

---

# Agent Evolution View

Shows:

```

Current Version

v2.1

History:

v1

v2

v2.1

Actions:

Improve

Compare

Rollback

```

---

# Improvement Center

Shows:

```

Recommended Improvements

✓ Apply Clean Architecture

✓ Reduce Complexity

✓ Add Security

✓ Improve Evaluation

```

---

# 18. Backend Architecture Overview

Frontend:

- Next.js

- React

- Tailwind

- shadcn/ui

Backend:

- Go or Node.js

- PostgreSQL

Services:

```

API Gateway

User Service

Agent Service

Prompt Service

Skill Service

Context Service

MCP Service

AI Generation Service

Evaluation Service

PostgreSQL

```

---

# 19. AI Generation Pipeline

Example:

Input:

```

Create PR reviewer agent

```

Pipeline:

```

Intent Extraction

↓

Requirements Analysis

↓

Context Retrieval

↓

Pattern Matching

↓

Prompt Generation

↓

Agent Generation

↓

Validation

↓

Evaluation

↓

Save

```

---

# 20. Long Term Vision

AI Agent Studio becomes:

```

The GitHub for AI Agents

```

Where developers:

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

Future ecosystem:

```

Agent Registry

CLI

Agent Runtime

MCP Server

Package Manager

Evaluation Platform

```

Example:

Today:

```

npm install package

```

Future:

```

ai install github-review-agent

```

---

# Product Principles

- Developers first

- Context is everything

- Agents are software

- Prompts need lifecycle management

- Knowledge must compound

- AI workflows should be reusable

- Open ecosystem over closed platform

- Simplicity beats complexity

- Every agent should continuously improve