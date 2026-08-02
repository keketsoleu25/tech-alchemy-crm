# Tech Alchemy CRM

Modern CRM and business management platform built with Next.js, TypeScript, Prisma, and PostgreSQL.

Built for freelancers, agencies, and small businesses to manage clients, projects, tasks, and invoices from a single platform instead of juggling spreadsheets, Trello boards, and Word documents.

---

## Overview

Tech Alchemy CRM centralizes the full client lifecycle — from first contact through project delivery to final invoice — into one authenticated, role-aware application. It was built as a full-stack engineering exercise, with a deliberate focus on production-readiness: server-side authorization on every route, input validation, rate limiting, pagination, and tested (not just written) functionality at every step.

## Features

**Authentication**
- Email/password registration with bcrypt hashing and a defensive check against invalid password hashes
- Google OAuth sign-in
- Login rate limiting (5 attempts per 15 minutes per account)
- Email verification and password reset flows via Resend
- Role-based sessions (`USER` / `ADMIN`) via NextAuth v5 (Auth.js)

**Dashboard**
- Live stats pulled directly from the database: client count, active projects, open tasks, outstanding invoice total, unread notifications
- Each stat links directly to its module

**Clients**
- Full CRUD, scoped per user
- Server-side pagination

**Projects**
- Full CRUD, linked to Clients
- Status tracking (Planning / Active / On Hold / Completed / Cancelled), budget, timeline
- Deleting a project checks its task count first and warns explicitly before cascading the deletion
- Server-side pagination

**Tasks**
- Full CRUD, linked to Projects
- Status (To do / In progress / Done) and priority (Low / Medium / High)
- Server-side pagination

**Invoices**
- Full CRUD with dynamic, multi-row line items
- Live subtotal / tax / total calculation
- Server-side numeric validation (rejects negative or invalid quantities and prices)
- Auto-generated invoice numbers
- PDF export (PDFKit)
- Server-side pagination

**Notifications**
- Soft-delete pattern (nothing is ever hard-deleted, just marked)
- Mark read / unread, filter by unread

**Admin panel**
- Role-gated (`ADMIN` only, server-enforced)
- View all users, promote/demote roles
- A user cannot change their own role (enforced server-side)

**Security**
- Every API route checks the session and scopes every query to `userId` — no data is reachable across accounts
- Zod validation on every write endpoint
- Rate limiting on login and all create endpoints
- Secrets rotated and never committed (`.env` is gitignored)

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL (Neon, serverless) |
| ORM | Prisma |
| Authentication | NextAuth v5 (Auth.js) |
| Validation | Zod |
| Styling | Tailwind CSS |
| Password hashing | bcryptjs |
| Email | Resend |
| PDF generation | PDFKit |

## Project Status

| Module | Status |
|---|---|
| Authentication | Complete |
| Dashboard | Complete |
| Client Management | Complete |
| Project Management | Complete |
| Task Management | Complete |
| Invoice System | Complete |
| PDF Export | Complete |
| Notifications | Complete |
| Admin Panel | Complete |
| Pagination | Complete (all modules) |
| Rate Limiting | Complete (login + create endpoints) |
| Automated Tests | Not yet implemented |
| Deployment | In progress |

## Known Limitations

Documented honestly rather than glossed over:

- No automated test suite yet — all functionality has been manually verified in-browser through development
- No file upload support (contracts, logos, attachments)
- Notifications are created manually or triggered by specific actions, not yet wired to every business event (e.g. invoice overdue)
- Uses Neon's free-tier serverless Postgres, which suspends after inactivity — the first request after idle time can be slow while the database wakes up

## Getting Started

```bash
git clone https://github.com/keketsoleu25/tech-alchemy-crm.git
cd tech-alchemy-crm
npm install
```

Create a `.env` file with:

```
DATABASE_URL=
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
EMAIL_FROM=
```

```bash
npx prisma generate
npx prisma db push
npm run dev
```

## License

Private project. All rights reserved.

---

Built by Keketso Leu · Powered by The Alchemy Lab
