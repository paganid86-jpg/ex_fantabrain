# General LLM Wiki Memory Design

Date: 2026-04-26
Status: Draft for review
Scope: General multi-project memory for Codex and collaborators

## Summary

We need a general, file-native knowledge base that helps maintain continuity across every project we work on, not only FantaBrain. The first version will be a Markdown wiki maintained primarily by LLM agents and reviewed by humans when needed.

This is not an end-user feature and should not be coupled to a single application repo. It is an internal knowledge operating system for Codex and collaborators across projects, research threads, product decisions, and implementation sessions.

The chosen first step is Option B: Markdown wiki plus agentic conventions. The system will avoid database storage, vector search, embeddings, and a dedicated UI in the first version. Those can be added later once the workflow proves useful.

FantaBrain can be the first indexed project, but it should be represented as one project namespace inside the general memory, not as the boundary of the system.

## Goals

- Give agents a stable cross-project memory before making code or product changes.
- Capture architecture knowledge, codebase maps, decisions, open questions, and health checks for each project.
- Capture global patterns, reusable decisions, working preferences, research threads, and lessons learned across projects.
- Keep the knowledge base readable in GitHub, local editors, Obsidian, and future UI surfaces.
- Make each meaningful session add durable knowledge instead of leaving context only in chat.
- Preserve per-project rules from files such as `AGENTS.md`, `CLAUDE.md`, repo docs, and project-specific decision records.

## Non-Goals

- No user-facing memory feature in this iteration.
- No RAG pipeline, embeddings, pgvector, or semantic search.
- No browser UI or React route in the first implementation.
- No automated ingestion from the web or external APIs.
- No changes to application code, persisted app state, or project runtime behavior.
- No requirement that the memory live inside the FantaBrain repo.

## Proposed Structure

```text
llm-memory/
  AGENTS.md
  raw/
    conversations/
    docs/
    research/
    imported-project-notes/
  wiki/
    index.md
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
      future-project/
        index.md
    decisions/
      index.md
      ADR-0001-general-llm-wiki-memory.md
    health-checks/
      index.md
    open-questions.md
  outputs/
    reports/
    diagrams/
    specs/
```

The exact filesystem home should be decided before implementation. Reasonable candidates are:

- A standalone repo, for example `C:\Users\DantePagani\llm-memory`.
- A private GitHub repository dedicated to the memory system.
- A temporary prototype folder inside an existing repo only if we explicitly treat it as disposable.

The preferred canonical home is a standalone private repository or top-level workspace folder, because the memory is meant to span multiple projects.

## Agent Conventions

`llm-memory/AGENTS.md` will define how agents should use the wiki:

- Read `llm-memory/wiki/index.md` before significant architecture, product, research, or codebase work.
- Identify the active project namespace before adding project-specific notes.
- Prefer updating existing wiki pages over creating duplicates.
- Add global decisions to `llm-memory/wiki/decisions/` as lightweight ADRs.
- Add project-specific decisions under `llm-memory/wiki/projects/<project>/decisions/`.
- Store raw source material under `llm-memory/raw/` when a source should be preserved.
- Store generated reports, diagrams, and explorations under `llm-memory/outputs/`.
- Keep wiki writing concise, factual, and linked.
- Mark uncertainty explicitly instead of presenting guesses as settled facts.
- Do not store secrets, API keys, local `.env` content, or private user data.
- When a project has its own instructions, preserve them in the project namespace and do not generalize them into global rules unless they truly apply across projects.

## First Wiki Pages

The first implementation should seed the wiki with:

- `wiki/index.md`: the main navigation and reading order for agents.
- `wiki/global/working-principles.md`: general collaboration and memory-maintenance principles.
- `wiki/global/reusable-patterns.md`: cross-project patterns worth reusing.
- `wiki/projects/index.md`: project registry with links to each project namespace.
- `wiki/projects/fantabrain/index.md`: FantaBrain as the first project entry.
- `wiki/projects/fantabrain/project-overview.md`: concise description of FantaBrain, stack, deployment, and product surface.
- `wiki/projects/fantabrain/architecture/backend.md`: Express routes, auth, credits, football proxy, AI routes.
- `wiki/projects/fantabrain/architecture/frontend.md`: React Router, layouts, pages, stores, styling system.
- `wiki/projects/fantabrain/architecture/ai-system.md`: Groq and Anthropic backend-only flow, credit gating, client helpers.
- `wiki/projects/fantabrain/codebase/stores.md`: Zustand stores and critical import rules.
- `wiki/projects/fantabrain/codebase/routes.md`: frontend and backend route map.
- `wiki/decisions/index.md`: global ADR index.
- `wiki/decisions/ADR-0001-general-llm-wiki-memory.md`: records the choice to start with a file-native general wiki.
- `wiki/open-questions.md`: unresolved global memory-system questions.
- `wiki/global/glossary.md`: shared terms.

## Data Flow

The first version is intentionally file-native:

1. Raw material is saved or summarized under `llm-memory/raw/`.
2. An agent compiles the relevant information into `llm-memory/wiki/`.
3. Future agents begin by reading `llm-memory/wiki/index.md` and following links to global or project-specific pages.
4. Important outputs are filed under `llm-memory/outputs/`.
5. Durable conclusions from outputs are promoted back into the wiki.

## Future UI Direction

The future UI should read the same Markdown-backed structure rather than replacing it. A later iteration can add:

- A local/internal page for browsing the wiki.
- Search across titles, tags, and content.
- Project filters and cross-project views.
- A decision timeline.
- Health-check views for stale pages, contradictions, and open questions.
- One-click filing of reports into the wiki.

The UI should remain internal. Any future end-user memory feature for a specific app, including FantaBrain, should be designed separately and should not automatically expose this internal memory.

## Health Checks

Manual or LLM-assisted health checks should eventually look for:

- Outdated code references.
- Contradictions between ADRs and current implementation.
- Project-specific rules accidentally promoted into global rules.
- Duplicate pages or overlapping concepts.
- Missing backlinks from index pages.
- Open questions that have already been answered by later work.
- Claims that need source links or file references.

## Testing And Verification

The first implementation is documentation-only, so verification should focus on:

- Directory and file presence.
- No secrets or `.env` values copied into the wiki.
- Links between index pages and seeded pages.
- Consistency between global rules and project-specific rules.
- Clear separation between the general memory system and FantaBrain-specific content.
- Project build commands are not required for the documentation-only seed, but should be run when implementation touches app or server code in a specific project.

## Approval Gate

After this design is reviewed, the next step is to write an implementation plan. The plan should decide the canonical filesystem home, create the `llm-memory/` tree, seed the first Markdown pages, and define the ongoing maintenance workflow.
