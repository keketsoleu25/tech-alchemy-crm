<<<<<<< HEAD
ï»¿# Tech Alchemy CRM
=======
# Tech Alchemy CRM
>>>>>>> 121e79912a5d3509745ec386ff6b8ee67473e805

Modern CRM and business management platform built with Next.js, TypeScript, Prisma, and PostgreSQL.

<<<<<<< HEAD
Built for freelancers, agencies, and small businesses to manage clients, projects, tasks, and invoices from a single platform instead of juggling spreadsheets, Trello boards, and Word documents.

---

## Overview

Tech Alchemy CRM centralizes the full client lifecycle â€” from first contact through project delivery to final invoice â€” into one authenticated, role-aware application. It was built as a full-stack engineering exercise, with a deliberate focus on production-readiness: server-side authorization on every route, input validation, rate limiting, pagination, and tested (not just written) functionality at every step.

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
- Every API route checks the session and scopes every query to `userId` â€” no data is reachable across accounts
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

- No automated test suite yet â€” all functionality has been manually verified in-browser through development
- No file upload support (contracts, logos, attachments)
- Notifications are created manually or triggered by specific actions, not yet wired to every business event (e.g. invoice overdue)
- Uses Neon's free-tier serverless Postgres, which suspends after inactivity â€” the first request after idle time can be slow while the database wakes up

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

Copyright (c) 2026 Keketso Leu. All rights reserved. See [LICENSE](./LICENSE) for terms — portfolio review only, no reuse without written permission.

---

Built by Keketso Leu Â· Powered by The Alchemy Lab
=======
### Turn client chaos into finished, paid work.

A full-stack customer relationship and business operations platform for freelancers, agencies, consultants, startups, NGOs, and small teams.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.12-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9.1-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Repository](https://github.com/keketsoleu25/tech-alchemy-crm) Â· [Report a bug](https://github.com/keketsoleu25/tech-alchemy-crm/issues) Â· [Live demo](https://tech-alchemy-crm.vercel.app)

**Status:** Active development â€” core CRM workflow implemented

</div>

---

## Table of contents

- [Overview](#overview)
- [The problem](#the-problem)
- [How the platform works](#how-the-platform-works)
- [Implemented features](#implemented-features)
- [Technology stack](#technology-stack)
- [Application architecture](#application-architecture)
- [Data model](#data-model)
- [Security and data isolation](#security-and-data-isolation)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Available scripts](#available-scripts)
- [API overview](#api-overview)
- [Project structure](#project-structure)
- [Development status](#development-status)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Deployment notes](#deployment-notes)
- [Author](#author)

---

## Overview

Tech Alchemy CRM is a production-style SaaS portfolio project that centralizes the work involved in delivering services to clients. It connects client records, projects, tasks, invoices, notifications, and user access inside one responsive web application.

The product is designed around a practical business pipeline:

**Client â†’ Project â†’ Task â†’ Invoice â†’ Payment follow-up**

Instead of treating those records as unrelated lists, the database preserves the relationships between them. A project can belong to a client, a task belongs to a project, and an invoice can be connected to both a client and a project. This creates a usable history of the work performed for every customer.

The current version demonstrates full-stack development across authentication, authorization, relational data modelling, route handlers, server-rendered dashboards, client-side CRUD interfaces, input validation, transactional updates, pagination, email workflows, and server-generated PDF documents.

---

## The problem

Freelancers and small organizations often manage the same client job across several disconnected tools:

- A spreadsheet stores contact details.
- Messaging apps hold important client conversations.
- A task board tracks delivery work.
- Documents or templates are used to prepare invoices.
- Email is used for reminders and account communication.
- Business totals must be calculated manually.

That workflow becomes difficult to maintain as the number of clients and projects grows. Information is duplicated, context is lost, and it becomes harder to answer simple questions such as:

- Which projects are still active?
- Which tasks are unfinished?
- How much money is still outstanding?
- Which invoice belongs to which project?
- What work has been completed for a particular client?

Tech Alchemy CRM brings these records into a single relational system and gives each signed-in user an isolated workspace for managing them.

---

## How the platform works

1. A user creates an account with email and password or signs in with Google.
2. The user adds a client and stores contact, company, and internal note information.
3. A project is created and optionally connected to that client.
4. Tasks are added to the project with a status, priority, description, and due date.
5. An invoice is created with one or more line items, tax, dates, notes, and links to the relevant client or project.
6. The invoice can be downloaded as an authenticated server-generated PDF.
7. The dashboard summarizes clients, active projects, open tasks, outstanding invoice value, and unread notifications.

This connected workflow is the foundation for planned features such as a client portal, reporting, automated reminders, lead conversion, and subscription-based SaaS plans.

---

## Implemented features

### Authentication and account security

- Email and password registration.
- Password hashing with `bcryptjs` using 12 salt rounds.
- Credentials-based authentication through Auth.js/NextAuth.
- Google OAuth sign-in.
- JWT-based session strategy.
- Email verification tokens with a 24-hour expiry.
- Password-reset tokens with a one-hour expiry.
- Transactional email delivery through Resend.
- Protected dashboard and admin routes.
- Automatic redirects for authenticated and unauthenticated users.
- Role-aware sessions with `USER` and `ADMIN` access levels.
- Rate limiting for login, registration, password recovery, and selected create operations.

### Dashboard overview

The authenticated dashboard calculates live values from PostgreSQL instead of displaying placeholder statistics.

- Total client count.
- Active and planning project count.
- Open task count.
- Outstanding invoice value in South African rand.
- Number of unpaid invoices.
- Unread notification count.
- Quick navigation from each metric to its related module.
- Session and account-role information.

### Client management

- Create, view, update, and delete client records.
- Store client name, email address, phone number, company, and notes.
- Keep each client's records isolated by authenticated user ID.
- Connect clients to projects and invoices.
- Server-side pagination with ten records per page.
- Zod validation on API input.

### Project management

- Create, view, update, and delete projects.
- Optionally assign a project to a client.
- Store a project description, budget, start date, and end date.
- Track `PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, and `CANCELLED` states.
- Connect projects to tasks and invoices.
- Server-side pagination with total record and page counts.
- Ownership checks before connected records are accepted.

### Task management

- Create, view, update, and delete project tasks.
- Require every task to belong to a valid project owned by the signed-in user.
- Track `TODO`, `IN_PROGRESS`, and `DONE` states.
- Track `LOW`, `MEDIUM`, and `HIGH` priorities.
- Store task descriptions and optional due dates.
- Filter task API queries by project.
- Request task counts independently when only a total is needed.
- Server-side pagination.

### Invoice management

- Create, view, update, and delete invoices.
- Automatically generate unique invoice numbers.
- Add one or more invoice line items.
- Store item descriptions, quantities, and unit prices.
- Calculate subtotal, tax, and final total.
- Track `DRAFT`, `SENT`, `PAID`, `OVERDUE`, and `CANCELLED` states.
- Link an invoice to a client, a project, both, or neither.
- Validate linked records against the signed-in user's ownership.
- Update invoice line items inside a Prisma transaction.
- Display amounts in South African rand.
- Paginate invoice records on the server.

### PDF invoice generation

- Generate invoice PDFs on the server with PDFKit.
- Include invoice number, status, issue date, due date, client, project, line items, tax, total, and notes.
- Create multi-page PDFs when line items exceed one page.
- Return PDFs as downloadable attachments.
- Prevent one user from downloading another user's invoice by scoping the database lookup to the active session.
- Disable response caching for generated invoice documents.

### Notifications

- Create typed in-app notifications.
- Support informational, success, warning, error, task, invoice, lead, project, and system categories.
- Add an optional action URL.
- Filter the interface between all and unread notifications.
- Mark individual notifications as read or unread.
- Soft-delete notifications by recording a deletion timestamp.
- Display unread totals on the main dashboard.

### Administration

- Separate admin-only page protected by middleware and a server-side role check.
- View registered users, verification state, role, join date, and CRM record counts.
- Role-aware navigation for administrators.
- User interface for promoting and demoting roles.

### User experience

- Responsive landing page and application navigation.
- Mobile navigation with horizontal module access.
- Dark dashboard interface with clear status labels.
- Empty states, loading states, error messages, and deletion confirmations.
- React Server Components for initial data loading.
- Client components for interactive forms and paginated data management.

---

## Technology stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16.2.12 | App Router, React Server Components, route handlers, and production builds |
| UI runtime | React 19.2.4 | Interactive user interfaces and component composition |
| Language | TypeScript 5 | Static typing across the frontend, server, and data layer |
| Styling | Tailwind CSS 4 | Responsive layouts and component styling |
| Authentication | Auth.js / NextAuth 5 beta | Credentials, Google OAuth, JWT sessions, and route protection |
| Database | PostgreSQL | Relational storage for users and business records |
| ORM | Prisma 7.9.1 | Schema modelling, migrations, type-safe queries, and transactions |
| PostgreSQL adapter | `@prisma/adapter-pg` | Prisma database connection through the `pg` driver |
| Validation | Zod 4 | Runtime validation of API request bodies |
| Password security | bcryptjs | Password hashing and verification |
| Forms | React Hook Form | Form-state dependency available to the application |
| Email | Resend | Verification and password-recovery emails |
| Documents | PDFKit | Server-side invoice PDF generation |
| Quality | ESLint 9 + Next.js rules | Core Web Vitals and TypeScript linting |
| Hosting target | Vercel | Next.js application deployment |

---

## Application architecture

```mermaid
flowchart TD
    A[User] --> B[Next.js interface]
    B --> C[Server Components]
    B --> D[Route Handlers]
    C --> E[Auth.js session]
    D --> E
    C --> F[Prisma ORM]
    D --> F
    F --> G[(PostgreSQL)]
    D --> H[Resend email]
    D --> I[PDFKit documents]
```

The application uses a hybrid server/client design:

- Server Components authenticate the request and load the first page of dashboard data directly through Prisma.
- Client Components manage interactive forms, optimistic interface changes, pagination, and calls to internal API routes.
- Route Handlers validate input, verify sessions, enforce ownership, and perform database mutations.
- Auth.js supplies authentication handlers, JWT sessions, Google OAuth, credentials login, and role information.
- PostgreSQL stores relational business data while Prisma provides the typed access layer.
- Resend and PDFKit handle external email delivery and document generation respectively.

---

## Data model

| Model | Responsibility | Important relationships |
|---|---|---|
| `User` | Account identity, role, password and token state | Owns clients, leads, projects, tasks, invoices, and notifications |
| `Account` | OAuth provider account | Belongs to a user |
| `Session` | Auth.js database-compatible session record | Belongs to a user |
| `VerificationToken` | Auth.js verification token storage | Identified by token and identifier |
| `Client` | Person or organization receiving services | Belongs to a user; has projects and invoices |
| `Lead` | Future sales-pipeline record | Belongs to a user; can link to notifications |
| `Project` | Client work with status, budget, and dates | Belongs to a user; optionally belongs to a client; has tasks and invoices |
| `Task` | Deliverable or unit of project work | Belongs to a user and a project |
| `Invoice` | Billable document with dates, tax, and status | Belongs to a user; optionally links to a client and project |
| `InvoiceLineItem` | Quantity and unit-price entry | Belongs to an invoice |
| `Notification` | User-facing update with read and deletion state | Belongs to a user; schema supports optional entity links |

The schema uses indexes on common ownership, relationship, status, and notification fields. Cascade deletion removes records that cannot exist without their owner, while optional client and project links use `SetNull` where preserving the business record is more appropriate.

---

## Security and data isolation

Security is enforced at more than one layer:

- Dashboard routes redirect unauthenticated visitors to the login page.
- Admin routes require both an authenticated session and the `ADMIN` role.
- API route handlers reject missing sessions with `401 Unauthorized`.
- Business records are queried with both the requested record ID and the signed-in user's ID.
- Linked clients and projects are checked for ownership before mutations are accepted.
- Passwords are hashed before storage and compared using bcrypt.
- Password-reset and email-verification tokens are generated with Node.js cryptographic random bytes.
- Tokens expire and are cleared after successful use.
- Password recovery returns a neutral response when an email is not registered, reducing account enumeration risk.
- Zod validates user-controlled input before database writes.
- Selected high-frequency operations use rate limiting.
- Invoice PDFs require an authenticated, ownership-scoped lookup.

> [!IMPORTANT]
> The current rate limiter stores counters in application memory. That is suitable for a portfolio deployment or single development process, but a production multi-instance deployment should replace it with a shared service such as Redis or Upstash.

---

## Getting started

### Prerequisites

Install or create the following before running the project:

- Node.js 20 or later.
- npm.
- A PostgreSQL database, either local or hosted.
- Google OAuth credentials for Google sign-in.
- A Resend API key for verification and password-reset email delivery.

### 1. Clone the repository

```bash
git clone https://github.com/keketsoleu25/tech-alchemy-crm.git
cd tech-alchemy-crm
```

### 2. Install dependencies

```bash
npm install
```

The `postinstall` script automatically runs `prisma generate` after dependencies are installed.

### 3. Configure the environment

Create a `.env` file in the project root and add the variables shown below. Never commit real credentials to GitHub.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="Tech Alchemy CRM <onboarding@your-domain.com>"
```

You can generate a development secret with Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Prepare the database

```bash
npx prisma generate
npx prisma migrate dev
```

To inspect the data visually during development:

```bash
npx prisma studio
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Useful local routes:

- `/` â€” public landing page
- `/register` â€” account creation
- `/login` â€” credentials or Google sign-in
- `/forgot-password` â€” password-recovery request
- `/dashboard` â€” authenticated business overview
- `/admin` â€” admin-only user management

---

## Environment variables

| Variable | Required | Description |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma and the PostgreSQL adapter |
| `AUTH_SECRET` | Yes | Secret used by Auth.js to protect authentication data |
| `NEXTAUTH_URL` | Yes | Base application URL used to build verification and password-reset links |
| `GOOGLE_CLIENT_ID` | For Google login | OAuth client ID created in Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | For Google login | OAuth client secret created in Google Cloud Console |
| `RESEND_API_KEY` | For email flows | Resend credential used to send account emails |
| `EMAIL_FROM` | Recommended | Verified sender address; falls back to the Resend onboarding address |

For a deployed application, set `NEXTAUTH_URL` to the production origin and add the following Google OAuth callback URL in Google Cloud:

```text
https://your-domain.com/api/auth/callback/google
```

---

## Database setup

Prisma reads its schema from `prisma/schema.prisma` and migrations from `prisma/migrations`.

Common commands:

```bash
# Generate the Prisma client
npx prisma generate

# Create and apply a development migration
npx prisma migrate dev --name describe_your_change

# Apply existing migrations in production
npx prisma migrate deploy

# Open the database browser
npx prisma studio
```

When using a hosted PostgreSQL provider, confirm that the connection string is active and that SSL parameters match the provider's requirements.

---

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the compiled production server |
| `npm run lint` | Run ESLint across the project |
| `npm run postinstall` | Generate the Prisma client; normally triggered by `npm install` |

Before opening a pull request or deploying a change, run:

```bash
npm run lint
npm run build
```

---

## API overview

The application uses Next.js Route Handlers rather than a separate API server.

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/auth/*` | `GET`, `POST` | Auth.js authentication handlers and OAuth callbacks |
| `/api/register` | `POST` | Register a user and send an email-verification link |
| `/api/verify-email` | `GET` | Verify a valid, unexpired email token |
| `/api/forgot-password` | `POST` | Create and email a password-reset token |
| `/api/reset-password` | `POST` | Replace a password using a valid reset token |
| `/api/clients` | `GET`, `POST` | List paginated clients or create a client |
| `/api/clients/[id]` | `GET`, `PATCH`, `DELETE` | Read, update, or delete an owned client |
| `/api/projects` | `GET`, `POST` | List paginated projects or create a project |
| `/api/projects/[id]` | `GET`, `PATCH`, `DELETE` | Read, update, or delete an owned project |
| `/api/tasks` | `GET`, `POST` | List/filter paginated tasks or create a task |
| `/api/tasks/[id]` | `GET`, `PATCH`, `DELETE` | Read, update, or delete an owned task |
| `/api/invoices` | `GET`, `POST` | List paginated invoices or create an invoice |
| `/api/invoices/[id]` | `GET`, `PATCH`, `DELETE` | Read, transactionally update, or delete an owned invoice |
| `/api/invoices/[id]/pdf` | `GET` | Generate and download an authenticated invoice PDF |
| `/api/notifications` | `GET`, `POST` | List or create notifications |
| `/api/notifications/[id]` | `PATCH`, `DELETE` | Change read state or soft-delete a notification |

All business-resource endpoints require an authenticated session. Record-level handlers scope database operations to the active user.

---

## Project structure

```text
tech-alchemy-crm/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ (auth)/             # Login, registration, verification, and reset pages
â”‚   â”œâ”€â”€ admin/              # Role-protected administration interface
â”‚   â”œâ”€â”€ api/                # Auth and CRM route handlers
â”‚   â”œâ”€â”€ dashboard/          # Authenticated CRM pages
â”‚   â”œâ”€â”€ globals.css         # Global Tailwind styles
â”‚   â”œâ”€â”€ layout.tsx          # Root layout and providers
â”‚   â””â”€â”€ page.tsx            # Public landing page
â”œâ”€â”€ components/             # Interactive forms, managers, navigation, and providers
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ auth.ts             # Auth.js configuration and callbacks
â”‚   â”œâ”€â”€ mail.ts             # Resend email workflows
â”‚   â”œâ”€â”€ prisma.ts           # Prisma client and PostgreSQL adapter
â”‚   â”œâ”€â”€ rate-limit.ts       # In-memory request limiter
â”‚   â””â”€â”€ tokens.ts           # Cryptographically secure token helpers
â”œâ”€â”€ prisma/
â”‚   â”œâ”€â”€ migrations/         # Database migration history
â”‚   â””â”€â”€ schema.prisma       # Relational application schema
â”œâ”€â”€ middleware.ts           # Route protection and role-based redirects
â”œâ”€â”€ next.config.ts          # Next.js and PDFKit server configuration
â”œâ”€â”€ prisma.config.ts        # Prisma schema, migration, and datasource configuration
â”œâ”€â”€ package.json            # Dependencies and npm scripts
â””â”€â”€ tsconfig.json           # Strict TypeScript configuration
```

---

## Development status

| Area | Status | Notes |
|---|---|---|
| Public landing page | Complete | Responsive product introduction and calls to action |
| Credentials authentication | Complete | Registration, hashed passwords, login, and JWT sessions |
| Google OAuth | Implemented | Requires valid Google environment variables |
| Email verification | Implemented | Requires a valid Resend sender configuration |
| Password recovery | Implemented | Token-based request and reset flow |
| Dashboard metrics | Complete | Live totals loaded from PostgreSQL |
| Client management | Complete | CRUD and server-side pagination |
| Project management | Complete | CRUD, client relationships, statuses, dates, budgets, and pagination |
| Task management | Complete | CRUD, project relationships, priorities, statuses, filters, and pagination |
| Invoice management | Complete | CRUD, line items, tax, totals, relationships, statuses, and pagination |
| Invoice PDF export | Complete | Authenticated server-side PDF generation |
| Notifications | Complete | Manual creation, filtering, read state, and soft deletion |
| Admin user directory | Implemented | Role-protected user overview and record counts |
| Admin role mutation | Complete | Promote/demote tested end-to-end; a user cannot change their own role |
| Lead pipeline | Schema foundation | `Lead` model and statuses exist; dashboard workflow is not yet exposed |
| Automated tests | Planned | No test command is currently defined in `package.json` |
| Hosted demo and screenshots | Planned | Deployment URL has not been added to this README yet |

---

## Known limitations

- Rate-limit counters are stored in memory and are not shared across server instances.
- Notification creation is currently manual; domain events do not yet create reminders automatically.
- The lead data model exists, but lead capture and pipeline screens are not yet part of the dashboard navigation.
- The admin role-change interface still needs an end-to-end verified mutation endpoint.
- Automated unit, integration, and end-to-end tests have not yet been added.
- There is no client-facing portal, subscription billing, file storage, or team workspace support yet.
- Reporting is currently limited to dashboard summary metrics.
- A public production demo and application screenshots are still pending.

These items are documented deliberately so the repository distinguishes the working MVP from the longer-term SaaS vision.

---

## Roadmap

### Near term

- Complete and verify admin role updates.
- Add the lead pipeline user interface and lead-to-client conversion.
- Generate notifications automatically from task, project, and invoice events.
- Add search, sorting, and richer filters to business modules.
- Add unit tests for validation and calculations.
- Add integration tests for authenticated resource ownership.
- Add end-to-end tests for the main client-to-invoice workflow.
- Publish a hosted demo and add real screenshots.

### Product expansion

- Read-only client portal.
- Invoice email delivery and payment reminders.
- Recurring invoices and reusable invoice templates.
- Business reporting, revenue trends, and downloadable reports.
- Kanban project and task views.
- File attachments for projects and clients.
- Team workspaces, invitations, and granular permissions.
- Audit log for important changes.
- Subscription plans and usage limits.
- White-label branding for agencies.
- Optional AI assistance for summaries, follow-ups, and business insights.

---

## Deployment notes

The application is designed for deployment on Vercel with a reachable PostgreSQL database.

1. Import the GitHub repository into Vercel.
2. Add every required environment variable to the Vercel project.
3. Set `NEXTAUTH_URL` to the final deployed origin.
4. Add the deployed Auth.js callback URL to the Google OAuth application.
5. Verify the sender domain or sender address in Resend.
6. Apply production database migrations with `npx prisma migrate deploy`.
7. Run a production build and verify registration, login, email, CRUD, and PDF flows.

The repository's `postinstall` script generates Prisma Client during dependency installation. `next.config.ts` keeps PDFKit as a server external package so invoice generation runs in the server environment.

---

## Author

**Keketso Leu**  
Full-Stack Developer and Founder of **The Tech Alchemy Lab**

- GitHub: [@keketsoleu25](https://github.com/keketsoleu25)
- Project: [Tech Alchemy CRM](https://github.com/keketsoleu25/tech-alchemy-crm)

Tech Alchemy CRM is being built as both a practical business product and a demonstration of full-stack engineering with modern React, Next.js, TypeScript, PostgreSQL, Prisma, authentication, authorization, email, and document-generation workflows.

---

<div align="center">

**Built with discipline, iteration, and a little alchemy.**

</div>
>>>>>>> 121e79912a5d3509745ec386ff6b8ee67473e805



