# Admin Set Plan By Email Design

## Goal

Allow an admin to promote an existing FantaBrain account to `gold` by email, so trusted testers can use Gold-style AI access without sharing or using passwords.

## Approved Approach

Add a protected admin endpoint, `POST /api/admin/set-plan-by-email`, alongside the existing `POST /api/admin/set-plan`.

The endpoint accepts `{ email, plan }`, validates the email and plan, lowercases and trims the email, updates the matching `users.plan`, and returns a 404 if the account does not exist. It continues to use `ADMIN_SECRET` through the existing `authenticateAdmin` middleware.

## Data Flow

1. Admin sends `x-admin-secret` plus `{ email, plan: "gold" }`.
2. Backend validates input.
3. Backend updates `users.plan` where `LOWER(email)` matches the normalized email.
4. The user logs out and logs back in so `/auth/login` issues a JWT containing `plan: "gold"` and the frontend store reflects Gold.
5. `/api/ai/chat` reads plan fresh from DB, so unlimited access applies immediately for paid AI calls after the DB update.

## Testing

Add pure helper tests for admin input normalization and validation. Keep DB behavior simple and covered by the endpoint implementation pattern already used in `server/routes/admin.js`.

