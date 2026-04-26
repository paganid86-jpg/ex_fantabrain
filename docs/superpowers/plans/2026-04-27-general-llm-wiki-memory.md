# General LLM Wiki Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, private, Git-backed Markdown memory at `C:\Users\DantePagani\llm-memory` for cross-project LLM knowledge continuity.

**Architecture:** The memory is a file-native Markdown wiki with global knowledge, project namespaces, raw inputs, generated outputs, lightweight ADRs, and agent instructions. It lives outside any single app repo and is backed by a dedicated private Git repository.

**Tech Stack:** Markdown, Git, GitHub private repository, PowerShell, GitHub CLI.

---

## File Structure

Create a new standalone repository at:

```text
C:\Users\DantePagani\llm-memory
```

The first implementation creates:

```text
llm-memory/
  AGENTS.md
  README.md
  raw/
    conversations/.gitkeep
    docs/.gitkeep
    research/.gitkeep
    imported-project-notes/.gitkeep
  wiki/
    index.md
    open-questions.md
    global/
      working-principles.md
      reusable-patterns.md
      tooling.md
      glossary.md
    projects/
      index.md
      fantabrain/
        index.md
        project-overview.md
        architecture/
          backend.md
          frontend.md
          ai-system.md
          data-model.md
          deploy.md
        codebase/
          routes.md
          stores.md
          pages.md
          services.md
          styles.md
        decisions/
          index.md
    decisions/
      index.md
      ADR-0001-general-llm-wiki-memory.md
    health-checks/
      index.md
  outputs/
    reports/.gitkeep
    diagrams/.gitkeep
    specs/.gitkeep
```

## Task 1: Create Standalone Local Repository

**Files:**
- Create directory: `C:\Users\DantePagani\llm-memory`
- Create Git repo: `C:\Users\DantePagani\llm-memory\.git`

- [ ] **Step 1: Verify target does not already contain unrelated work**

Run:

```powershell
Test-Path -LiteralPath "C:\Users\DantePagani\llm-memory"
```

Expected if this is a first setup:

```text
False
```

If the command returns `True`, inspect before writing:

```powershell
Get-ChildItem -LiteralPath "C:\Users\DantePagani\llm-memory" -Force
```

Expected acceptable existing contents:

```text
empty directory, or an existing llm-memory repository that already matches this plan
```

- [ ] **Step 2: Create the local root**

Run:

```powershell
New-Item -ItemType Directory -Path "C:\Users\DantePagani\llm-memory"
```

Expected:

```text
Directory: C:\Users\DantePagani
Name: llm-memory
```

- [ ] **Step 3: Initialize Git**

Run:

```powershell
git init "C:\Users\DantePagani\llm-memory"
```

Expected:

```text
Initialized empty Git repository in C:/Users/DantePagani/llm-memory/.git/
```

- [ ] **Step 4: Set default branch to main**

Run:

```powershell
git -C "C:\Users\DantePagani\llm-memory" branch -M main
```

Expected:

```text
no error output
```

## Task 2: Create Directory Tree And Keep Files

**Files:**
- Create all directories listed in File Structure.
- Create `.gitkeep` files under empty raw and output folders.

- [ ] **Step 1: Create directories**

Run:

```powershell
$root = "C:\Users\DantePagani\llm-memory"
$dirs = @(
  "raw\conversations",
  "raw\docs",
  "raw\research",
  "raw\imported-project-notes",
  "wiki\global",
  "wiki\projects\fantabrain\architecture",
  "wiki\projects\fantabrain\codebase",
  "wiki\projects\fantabrain\decisions",
  "wiki\decisions",
  "wiki\health-checks",
  "outputs\reports",
  "outputs\diagrams",
  "outputs\specs"
)
foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path (Join-Path $root $dir) | Out-Null
}
```

Expected:

```text
no error output
```

- [ ] **Step 2: Add keep files**

Run:

```powershell
$root = "C:\Users\DantePagani\llm-memory"
$keepFiles = @(
  "raw\conversations\.gitkeep",
  "raw\docs\.gitkeep",
  "raw\research\.gitkeep",
  "raw\imported-project-notes\.gitkeep",
  "outputs\reports\.gitkeep",
  "outputs\diagrams\.gitkeep",
  "outputs\specs\.gitkeep"
)
foreach ($file in $keepFiles) {
  New-Item -ItemType File -Force -Path (Join-Path $root $file) | Out-Null
}
```

Expected:

```text
no error output
```

## Task 3: Seed Root Instructions

**Files:**
- Create: `C:\Users\DantePagani\llm-memory\AGENTS.md`
- Create: `C:\Users\DantePagani\llm-memory\README.md`

- [ ] **Step 1: Create `AGENTS.md`**

Write this content to `C:\Users\DantePagani\llm-memory\AGENTS.md`:

```markdown
# LLM Memory Agent Instructions

This repository is the general multi-project memory for Dante and Codex.

## Purpose

Use this memory to preserve durable knowledge across projects, sessions, research threads, architecture decisions, and implementation work.

## Reading Order

Before significant work, read:

1. `wiki/index.md`
2. `wiki/projects/index.md`
3. The active project namespace, if the work belongs to one project
4. `wiki/open-questions.md`

## Writing Rules

- Write concise Markdown.
- Prefer updating existing pages over creating duplicates.
- Put project-specific knowledge under `wiki/projects/<project>/`.
- Put reusable cross-project patterns under `wiki/global/`.
- Put global decisions under `wiki/decisions/`.
- Put project decisions under `wiki/projects/<project>/decisions/`.
- Preserve uncertainty explicitly with phrases such as "Unknown", "Unverified", or "Needs review".
- Do not store secrets, API keys, `.env` values, credentials, private user data, or payment data.
- When copying knowledge from a project repo, keep project-specific rules scoped to that project.

## Maintenance

After meaningful work, update the relevant wiki page or add an output under `outputs/`.
Promote durable conclusions from `outputs/` into `wiki/`.
```

- [ ] **Step 2: Create `README.md`**

Write this content to `C:\Users\DantePagani\llm-memory\README.md`:

```markdown
# LLM Memory

Private Markdown memory for cross-project work with Codex and other LLM agents.

This repository stores:

- Global working principles
- Reusable patterns
- Project-specific architecture notes
- Lightweight decision records
- Open questions
- Raw inputs worth preserving
- Generated reports, diagrams, and specs

Start from `wiki/index.md`.
```

## Task 4: Seed Global Wiki

**Files:**
- Create: `C:\Users\DantePagani\llm-memory\wiki\index.md`
- Create: `C:\Users\DantePagani\llm-memory\wiki\open-questions.md`
- Create: `C:\Users\DantePagani\llm-memory\wiki\global\working-principles.md`
- Create: `C:\Users\DantePagani\llm-memory\wiki\global\reusable-patterns.md`
- Create: `C:\Users\DantePagani\llm-memory\wiki\global\tooling.md`
- Create: `C:\Users\DantePagani\llm-memory\wiki\global\glossary.md`

- [ ] **Step 1: Create `wiki/index.md`**

Write:

```markdown
# LLM Memory Index

This is the entry point for the general multi-project memory.

## Read First

- [Working Principles](global/working-principles.md)
- [Projects](projects/index.md)
- [Open Questions](open-questions.md)
- [Global Decisions](decisions/index.md)

## Global Knowledge

- [Reusable Patterns](global/reusable-patterns.md)
- [Tooling](global/tooling.md)
- [Glossary](global/glossary.md)

## Maintenance

- [Health Checks](health-checks/index.md)
```

- [ ] **Step 2: Create `wiki/open-questions.md`**

Write:

```markdown
# Open Questions

## Memory System

- Which GitHub owner should host the private remote repository?
- Which future UI stack should browse this Markdown wiki?
- When the wiki grows, should search remain text-first or add embeddings?
- Which project should be indexed after FantaBrain?
```

- [ ] **Step 3: Create global pages**

Write `wiki/global/working-principles.md`:

```markdown
# Working Principles

- The memory is general and multi-project.
- Project-specific rules stay inside their project namespace.
- The wiki is maintained mostly by LLM agents and reviewed by humans when needed.
- Markdown files are the source of truth for the first version.
- Prefer transparent notes over hidden memory.
- Prefer small, linked pages over large undifferentiated documents.
```

Write `wiki/global/reusable-patterns.md`:

```markdown
# Reusable Patterns

## File-Native Memory

Use Markdown and Git before adding databases or vector search.

## Lightweight ADRs

Record durable decisions with context, decision, consequences, and status.
```

Write `wiki/global/tooling.md`:

```markdown
# Tooling

## Current

- Markdown files
- Git local history
- Private Git remote
- Obsidian-compatible folder structure

## Later

- Internal browser UI
- Text search
- Health-check scripts
- Optional embeddings if text-first navigation stops being enough
```

Write `wiki/global/glossary.md`:

```markdown
# Glossary

## Compiled Wiki

Markdown pages synthesized from raw material and maintained as durable knowledge.

## Project Namespace

A folder under `wiki/projects/` containing knowledge for one project.

## Raw Material

Source notes, conversations, docs, research, and copied context preserved before synthesis.

## Output

A generated report, diagram, spec, or exploration that may later be promoted into the wiki.
```

## Task 5: Seed Global Decisions

**Files:**
- Create: `C:\Users\DantePagani\llm-memory\wiki\decisions\index.md`
- Create: `C:\Users\DantePagani\llm-memory\wiki\decisions\ADR-0001-general-llm-wiki-memory.md`

- [ ] **Step 1: Create decision index**

Write:

```markdown
# Global Decisions

- [ADR-0001: General LLM Wiki Memory](ADR-0001-general-llm-wiki-memory.md)
```

- [ ] **Step 2: Create ADR-0001**

Write:

```markdown
# ADR-0001: General LLM Wiki Memory

Date: 2026-04-27
Status: Accepted

## Context

We need memory that survives across sessions and projects. The memory should not be hidden inside chat history, embeddings, or one application repository.

## Decision

Create a standalone Markdown wiki at `C:\Users\DantePagani\llm-memory`, initialize it as a Git repository, and connect it to a private remote repository.

The first implementation uses Markdown, directories, indexes, and lightweight decision records. It does not use a database, vector search, or UI.

## Consequences

- The memory can be read by humans and LLM agents.
- FantaBrain can be indexed as the first project without making the system FantaBrain-specific.
- Git history records how the memory changes.
- A future UI can read the Markdown structure instead of replacing it.
```

## Task 6: Seed Project Registry And FantaBrain Namespace

**Files:**
- Create: `C:\Users\DantePagani\llm-memory\wiki\projects\index.md`
- Create: `C:\Users\DantePagani\llm-memory\wiki\projects\fantabrain\index.md`
- Create: `C:\Users\DantePagani\llm-memory\wiki\projects\fantabrain\project-overview.md`

- [ ] **Step 1: Create project registry**

Write:

```markdown
# Projects

## Active Project Namespaces

- [FantaBrain](fantabrain/index.md)
```

- [ ] **Step 2: Create FantaBrain index**

Write:

```markdown
# FantaBrain

Private project namespace for FantaBrain AI.

## Start Here

- [Project Overview](project-overview.md)
- [Backend Architecture](architecture/backend.md)
- [Frontend Architecture](architecture/frontend.md)
- [AI System](architecture/ai-system.md)
- [Data Model](architecture/data-model.md)
- [Deploy](architecture/deploy.md)

## Codebase

- [Routes](codebase/routes.md)
- [Stores](codebase/stores.md)
- [Pages](codebase/pages.md)
- [Services](codebase/services.md)
- [Styles](codebase/styles.md)

## Decisions

- [Project Decisions](decisions/index.md)
```

- [ ] **Step 3: Create FantaBrain overview**

Write:

```markdown
# FantaBrain Project Overview

FantaBrain AI is a private fantasy football assistant for Italian Fantacalcio Mantra.

## Stack

- Frontend: React 19, React Router v6 with HashRouter
- State: Zustand with persist middleware
- Styling: Tailwind CSS v4 and custom CSS properties
- Build: Vite
- Backend: Express.js
- Main AI: Groq through backend `/api/ai/groq`
- Gold chatbot AI: Anthropic through backend `/api/ai/chat`
- Football data: football-data.org through backend `/api/football/`
- Deploy: Render, auto-deploy from `main`

## Critical Rules

- Never push directly to `main`.
- Zustand stores use default exports.
- League MVP remains localStorage-only with `fantabrain-leagues`.
- Client AI calls must go through backend routes.
- Football-data calls must go through `/api/football/`.
- UI copy is Italian.
- Code identifiers are English.
- The user roster starts empty; do not reintroduce mock roster data.
```

## Task 7: Seed FantaBrain Architecture And Codebase Pages

**Files:**
- Create architecture pages under `C:\Users\DantePagani\llm-memory\wiki\projects\fantabrain\architecture\`
- Create codebase pages under `C:\Users\DantePagani\llm-memory\wiki\projects\fantabrain\codebase\`
- Create decision index at `C:\Users\DantePagani\llm-memory\wiki\projects\fantabrain\decisions\index.md`

- [ ] **Step 1: Create architecture pages**

Write `architecture/backend.md`:

```markdown
# Backend Architecture

FantaBrain uses Express.js in `server.js`.

## Main Responsibilities

- Serve built frontend assets.
- Expose auth routes under `/auth`.
- Expose credits under `/api/credits`.
- Proxy football-data.org under `/api/football`.
- Expose AI routes under `/api/ai`.
- Run credit reset and keep-alive cron jobs.

## Key Files

- `server.js`
- `server/routes/auth.js`
- `server/routes/credits.js`
- `server/routes/ai.js`
- `server/routes/admin.js`
- `server/db/schema.sql`
```

Write `architecture/frontend.md`:

```markdown
# Frontend Architecture

FantaBrain uses React 19 with HashRouter.

## Main Areas

- `src/App.jsx` defines authenticated app routes.
- `src/pages/` contains route-level screens.
- `src/components/` contains reusable UI and domain components.
- `src/styles/design-system.css` contains shared visual tokens and classes.

## UI Rules

- UI language is Italian.
- Follow existing design-system classes and CSS custom properties.
- Avoid introducing unrelated style systems.
```

Write `architecture/ai-system.md`:

```markdown
# AI System

All AI calls are backend-only from the client perspective.

## Routes

- `/api/ai/groq`: Groq `llama-3.3-70b-versatile` for tactical tools.
- `/api/ai/chat`: Anthropic `claude-sonnet-4-6` for Gold chatbot flow.

## Client Helper

`src/lib/claudeApi.js` builds system prompts and calls backend AI routes.

## Critical Rule

Never call Groq or Anthropic directly from frontend code.
```

Write `architecture/data-model.md`:

```markdown
# Data Model

## PostgreSQL Tables

- `users`
- `ai_credits`
- `waitlist`
- `ai_conversations`

## Local Storage

League MVP data remains localStorage-only under `fantabrain-leagues`.

## Store Version Rule

If persisted Zustand data structure changes, increment the store version and provide a migration.
```

Write `architecture/deploy.md`:

```markdown
# Deploy

FantaBrain deploys to Render as a Node web service.

## Production

- URL: `https://webapp-fantabrain.onrender.com/`
- Auto-deploy source: `main`
- Start command: `npm start`
- Build command: `npm run build`

## Rule

Do not push directly to `main`; work on `Codex/<description>-<session>` branches.
```

- [ ] **Step 2: Create codebase pages**

Write `codebase/routes.md`:

```markdown
# Routes

## Frontend Routes

- `/`
- `/la-rosa`
- `/schieramento`
- `/classifica`
- `/calendario`
- `/mercato`
- `/scouting`
- `/war-room`
- `/statistiche`
- `/crea-lega`
- `/impostazioni-lega`
- `/ai-analisi`

## Backend Routes

- `/auth`
- `/api/credits`
- `/api/football`
- `/api/ai`
- `/api/admin`
- `/api/waitlist`
```

Write `codebase/stores.md`:

```markdown
# Stores

## Zustand Stores

- `src/store/useAppStore.js`
- `src/stores/useSerieAStore.js`
- `src/stores/useLeagueStore.js`

## Import Rule

All three stores use default exports. Import them without braces.

## Reactivity Rule

Use inline reactive selectors inside components. Do not rely on non-reactive getters outside Zustand for UI state.
```

Write `codebase/pages.md`:

```markdown
# Pages

Route-level screens live under `src/pages/`.

Important pages include Dashboard, AIAnalisi, Schieramento, Classifica, Calendario, Mercato, Scouting, WarRoom, Statistiche, LeagueCreation, and LeagueSettings.
```

Write `codebase/services.md`:

```markdown
# Services

## AI

- `src/lib/claudeApi.js` calls backend AI routes.

## Football Data

- `src/services/footballApi.js` fetches football-data.org through the backend proxy.
```

Write `codebase/styles.md`:

```markdown
# Styles

Shared visual conventions live in `src/styles/design-system.css`.

Use existing classes and CSS custom properties before introducing new ones.
```

- [ ] **Step 3: Create project decision index**

Write `decisions/index.md`:

```markdown
# FantaBrain Decisions

Project-specific FantaBrain decision records go here.
```

## Task 8: Seed Health Checks

**Files:**
- Create: `C:\Users\DantePagani\llm-memory\wiki\health-checks\index.md`

- [ ] **Step 1: Create health-check index**

Write:

```markdown
# Health Checks

Run manual or LLM-assisted checks for:

- Stale project facts
- Contradictions between decisions and current implementation
- Project-specific rules accidentally promoted into global rules
- Duplicate pages
- Missing links from indexes
- Open questions that have been answered
- Claims that need source references
```

## Task 9: Verify Local Wiki

**Files:**
- Read all files under `C:\Users\DantePagani\llm-memory`

- [ ] **Step 1: Verify file count**

Run:

```powershell
Get-ChildItem -LiteralPath "C:\Users\DantePagani\llm-memory" -Recurse -File | Measure-Object
```

Expected:

```text
Count is at least 30
```

- [ ] **Step 2: Scan for forbidden secret markers**

Run:

```powershell
Select-String -Path "C:\Users\DantePagani\llm-memory\**\*" -Pattern "API_KEY|SECRET|DATABASE_URL|password_hash|BEGIN PRIVATE KEY" -CaseSensitive:$false
```

Expected:

```text
no matches containing actual secret values
```

- [ ] **Step 3: Check Git status**

Run:

```powershell
git -C "C:\Users\DantePagani\llm-memory" status --short
```

Expected:

```text
all seeded files listed as untracked
```

## Task 10: Commit Local Memory Seed

**Files:**
- Stage and commit all files under `C:\Users\DantePagani\llm-memory`

- [ ] **Step 1: Stage files**

Run:

```powershell
git -C "C:\Users\DantePagani\llm-memory" add .
```

Expected:

```text
no error output
```

- [ ] **Step 2: Commit**

Run:

```powershell
git -C "C:\Users\DantePagani\llm-memory" commit -m "chore: seed general llm memory"
```

Expected:

```text
[main <hash>] chore: seed general llm memory
```

## Task 11: Create Private GitHub Remote

**Files:**
- Remote repository: private GitHub repo named `llm-memory`

- [ ] **Step 1: Check GitHub CLI availability**

Run:

```powershell
gh --version
```

Expected:

```text
gh version <version>
```

- [ ] **Step 2: Create private remote and push**

Run:

```powershell
gh repo create paganid86-jpg/llm-memory --private --source "C:\Users\DantePagani\llm-memory" --remote origin --push --git-protocol ssh
```

Expected:

```text
Created repository paganid86-jpg/llm-memory on GitHub
To github.com:paganid86-jpg/llm-memory.git
```

- [ ] **Step 3: Verify remote**

Run:

```powershell
git -C "C:\Users\DantePagani\llm-memory" remote -v
```

Expected:

```text
origin  git@github.com:paganid86-jpg/llm-memory.git (fetch)
origin  git@github.com:paganid86-jpg/llm-memory.git (push)
```

If `gh` uses an HTTPS remote, accept HTTPS for this first version and verify that the repository is private in GitHub.

## Task 12: Final Verification

**Files:**
- Verify: `C:\Users\DantePagani\llm-memory`

- [ ] **Step 1: Confirm clean local memory repo**

Run:

```powershell
git -C "C:\Users\DantePagani\llm-memory" status --short
```

Expected:

```text
empty output
```

- [ ] **Step 2: Confirm latest commit**

Run:

```powershell
git -C "C:\Users\DantePagani\llm-memory" log -1 --oneline
```

Expected:

```text
<hash> chore: seed general llm memory
```

- [ ] **Step 3: Confirm core entry files exist**

Run:

```powershell
Test-Path "C:\Users\DantePagani\llm-memory\AGENTS.md"
Test-Path "C:\Users\DantePagani\llm-memory\wiki\index.md"
Test-Path "C:\Users\DantePagani\llm-memory\wiki\projects\fantabrain\index.md"
Test-Path "C:\Users\DantePagani\llm-memory\wiki\decisions\ADR-0001-general-llm-wiki-memory.md"
```

Expected:

```text
True
True
True
True
```
