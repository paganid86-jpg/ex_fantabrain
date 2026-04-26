# LLM Wiki Internal Memory Design

Date: 2026-04-26
Status: Draft for review
Scope: Internal project memory for FantaBrain AI

## Summary

FantaBrain needs an internal, repo-native knowledge base that helps maintain continuity across research, product decisions, architecture work, and implementation sessions. The first version will be a Markdown wiki maintained primarily by LLM agents and reviewed by humans when needed.

This is not an end-user feature yet. It is an internal project tool for Codex and collaborators.

The chosen first step is Option B: Markdown wiki plus agentic conventions. The system will avoid database storage, vector search, embeddings, and a dedicated UI in the first version. Those can be added later once the workflow proves useful.

## Goals

- Give agents a stable project memory before making code changes.
- Capture architecture knowledge, codebase maps, decisions, open questions, and health checks.
- Keep the knowledge base readable in GitHub, local editors, Obsidian, and future UI surfaces.
- Make each meaningful session add durable knowledge instead of leaving context only in chat.
- Preserve FantaBrain rules from `AGENTS.md`, including backend-only AI calls, Zustand import conventions, localStorage-only leagues, and Italian UI copy.

## Non-Goals

- No user-facing memory feature in this iteration.
- No RAG pipeline, embeddings, pgvector, or semantic search.
- No browser UI or React route in the first implementation.
- No automated ingestion from the web or external APIs.
- No changes to persisted app state or Zustand store versions.

## Proposed Structure

```text
knowledge/
  AGENTS.md
  raw/
    conversations/
    docs/
    code-notes/
  wiki/
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
      ADR-0001-llm-wiki-internal-memory.md
    health-checks/
      index.md
    open-questions.md
    glossary.md
  outputs/
    reports/
    diagrams/
    specs/
```

## Agent Conventions

`knowledge/AGENTS.md` will define how agents should use the wiki:

- Read `knowledge/wiki/index.md` before significant architecture, product, or codebase work.
- Prefer updating existing wiki pages over creating duplicates.
- Add decisions to `knowledge/wiki/decisions/` as lightweight ADRs.
- Store raw source material under `knowledge/raw/` when a source should be preserved.
- Store generated reports, diagrams, and explorations under `knowledge/outputs/`.
- Keep wiki writing concise, factual, and linked.
- Mark uncertainty explicitly instead of presenting guesses as settled facts.
- Do not store secrets, API keys, local `.env` content, or private user data.

## First Wiki Pages

The first implementation should seed the wiki with:

- `wiki/index.md`: the main navigation and reading order for agents.
- `wiki/project-overview.md`: concise description of FantaBrain, stack, deployment, and product surface.
- `wiki/architecture/backend.md`: Express routes, auth, credits, football proxy, AI routes.
- `wiki/architecture/frontend.md`: React Router, layouts, pages, stores, styling system.
- `wiki/architecture/ai-system.md`: Groq and Anthropic backend-only flow, credit gating, client helpers.
- `wiki/codebase/stores.md`: Zustand stores and critical import rules.
- `wiki/codebase/routes.md`: frontend and backend route map.
- `wiki/decisions/index.md`: ADR index.
- `wiki/decisions/ADR-0001-llm-wiki-internal-memory.md`: records the choice to start with a file-native internal wiki.
- `wiki/open-questions.md`: unresolved product and architecture questions.
- `wiki/glossary.md`: key project terms.

## Data Flow

The first version is intentionally file-native:

1. Raw material is saved or summarized under `knowledge/raw/`.
2. An agent compiles the relevant information into `knowledge/wiki/`.
3. Future agents begin by reading `knowledge/wiki/index.md` and following links to relevant pages.
4. Important outputs are filed under `knowledge/outputs/`.
5. Durable conclusions from outputs are promoted back into the wiki.

## Future UI Direction

The future UI should read the same Markdown-backed structure rather than replacing it. A later iteration can add:

- A local/internal page for browsing the wiki.
- Search across titles, tags, and content.
- A decision timeline.
- Health-check views for stale pages, contradictions, and open questions.
- One-click filing of reports into the wiki.

The UI should remain internal until there is a separate product decision to expose memory features to FantaBrain users.

## Health Checks

Manual or LLM-assisted health checks should eventually look for:

- Outdated code references.
- Contradictions between ADRs and current implementation.
- Duplicate pages or overlapping concepts.
- Missing backlinks from index pages.
- Open questions that have already been answered by later work.
- Claims that need source links or file references.

## Testing And Verification

The first implementation is documentation-only, so verification should focus on:

- Directory and file presence.
- No secrets or `.env` values copied into the wiki.
- Links between index pages and seeded pages.
- Consistency with current repo rules and app architecture.
- `npm run build` is not required for the documentation-only seed, but should be run once implementation touches app or server code.

## Approval Gate

After this design is reviewed, the next step is to write an implementation plan. The plan should create the `knowledge/` tree, seed the first Markdown pages, and define the ongoing maintenance workflow.
