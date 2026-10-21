# Abishek Apps & Tools Directory Hub — `apps.abishek.in` & `tools.abishek.in`

The central ecosystem directory and showcase portal for all `*.abishek.in` applications and developer utilities.

## Features
- **Tools Showcase & Context Search:** Fast, context-aware fuzzy search matching user needs ("format json", "base64 image", "html compiler", "markdown diagrams", etc.) across all live tools.
- **Hosted on Both Domains:** Seamlessly operates under both `apps.abishek.in` and `tools.abishek.in`.
- **Public Submissions:**
  - **Request New Tool:** Anyone can submit new tool ideas with descriptions and use cases.
  - **Report a Bug:** Direct bug reporting with tool picker, severity, and email ID.
  - **Contact & Support:** General developer feedback.
  - **Notify on Launch:** 1-click email subscriptions for upcoming tools roadmap.
- **User Authentication:**
  - Sign in & Create account.
  - "My Activity" tracking for submitted requests & reported bugs.
  - **In-product Email Notification Preferences:** Toggle on/off email notifications for newly launched tools and product updates.
- **Admin Management Portal:**
  - Secure admin login (`admin@abishek.in` / `admin`).
  - **Tool Management (Full DB CRUD):** Add new tools, edit existing tools, toggle public visibility (Hide/View), delete tools.
  - **Bug Reports Management:** Review severity, update investigation/fix status, add admin notes.
  - **Tool Requests Management:** Review community ideas, upvote count, update roadmap statuses (Planned, Building, Launched).
  - **Messages Inbox:** View incoming contact messages.
  - **Subscribers List:** Track launch notification subscribers.
- **Database Architecture:**
  - Embedded `node:sqlite` for local development.
  - Direct PostgreSQL support when `DATABASE_URL` is set in production.
  - Serverless compatibility with Vercel (`api/index.js`).
