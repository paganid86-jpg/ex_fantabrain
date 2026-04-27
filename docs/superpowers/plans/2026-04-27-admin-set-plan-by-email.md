# Admin Set Plan By Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a protected admin endpoint that updates a user's plan by email.

**Architecture:** Reuse the existing Express admin router and admin secret middleware. Extract small pure helpers for request validation so behavior can be tested without a database.

**Tech Stack:** Express.js, node:test, node:assert.

---

### Task 1: Validation Helper

**Files:**
- Modify: `server/routes/admin.js`
- Test: `server/tests/admin.test.js`

- [ ] **Step 1: Write failing tests**

Create `server/tests/admin.test.js` with tests for `normalizeEmail` and `validatePlanUpdateByEmail`.

- [ ] **Step 2: Verify red**

Run `node --test server/tests/admin.test.js`. Expected: FAIL because the helpers are not exported yet.

- [ ] **Step 3: Implement helpers**

Export `normalizeEmail` and `validatePlanUpdateByEmail` from `server/routes/admin.js`.

- [ ] **Step 4: Verify green**

Run `node --test server/tests/admin.test.js`. Expected: PASS.

### Task 2: Endpoint

**Files:**
- Modify: `server/routes/admin.js`

- [ ] **Step 1: Add endpoint**

Add `POST /set-plan-by-email`, protected by `authenticateAdmin`, accepting `email` and `plan`.

- [ ] **Step 2: Return clear responses**

Return 400 for invalid body, 404 for no matching user, and JSON `{ ok: true, user: { id, email, plan } }` when updated.

- [ ] **Step 3: Verify project**

Run `node --test server/tests/admin.test.js server/tests/credits.test.js server/tests/auth.test.js` and `npm run build`.

