# CRISP — Chronicle Recursive Implementation of Seamless Productcycle

> **Engineering Changes, Executed with Control.**

CRISP is an Engineering Change Order (ECO) system that enables controlled, versioned, and approval-driven changes to Products and Bills of Materials. Instead of allowing direct edits to master data, all changes are proposed, reviewed, approved, and then applied — ensuring stability of active data, preserving full version history, and guaranteeing only validated changes reach production.

---

## Table of Contents

- [Core Objectives](#core-objectives)
- [Tech Stack](#tech-stack)
- [Roles](#roles)
- [Core Modules](#core-modules)
- [Intelligence Engines](#intelligence-engines)
- [Reports & Analytics](#reports--analytics)
- [Folder Structure](#folder-structure)
- [Setup Guide](#setup-guide)
- [Demo Credentials](#demo-credentials)
- [Future Scope](#future-scope)

---

## Core Objectives

- Prevent direct modification of critical product and BOM data
- Enforce approval-based workflows with configurable stage rules
- Maintain full version history and audit traceability
- Surface risk, cost, and conflict intelligence before changes are applied
- Improve collaboration across Engineering, Approver, Operations, and Admin teams

---

## Tech Stack

### Frontend
- **Next.js** (App Router) — server and client components, layouts, route groups
- **React** — UI rendering with hooks and client-side state
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui + Radix UI** — accessible component primitives (dialogs, dropdowns, sheets, badges, tables, tabs)
- **Recharts** — dashboard charts and analytics visualizations
- **@xyflow/react** — interactive BOM tree graph rendering
- **@dnd-kit** — drag-and-drop Kanban board for ECO stages
- **Sonner** — toast notifications
- **Lucide React** — icon system

### Backend
- **Next.js API Routes** — RESTful endpoints for ECO, BOM, product, approval, and intelligence operations
- **Prisma ORM** — type-safe database access and migrations
- **PostgreSQL** — relational database
- **NextAuth.js (beta)** — session-based authentication with role-aware access control
- **bcryptjs** — password hashing

### Business Logic Engines
- **Risk Engine** — multi-factor ECO risk scoring (price delta, BOM component changes, rollback type)
- **Ripple Analysis Engine** — detects cross-BOM impact of proposed changes
- **Conflict Detection Engine** — finds overlapping ECOs targeting the same product fields
- **Cost Delta Engine** — calculates real-time BOM cost impact before approval
- **SLA Engine** — monitors stage SLA windows and generates breach notifications

### Export & Reporting
- **jsPDF + jspdf-autotable** — PDF report generation
- **UploadThing** — file attachment uploads for product records

### State Management & Utilities
- **Zustand** — client-side notification store
- **React Hook Form + Zod** — form handling and schema validation
- **date-fns** — date arithmetic for SLA tracking
- **next-themes** — light/dark theme support

---

## Roles

| Role | Capabilities |
|---|---|
| **Engineering User** | Create and submit ECOs, propose Product or BOM changes, work in draft, initiate approval workflows |
| **Approver** | Review proposed ECOs, approve or reject per stage rules, advance ECOs through the pipeline |
| **Operations User** | Read-only access to active Products and BOMs |
| **Admin** | Full access — configure ECO stages, manage approval rules, apply approved ECOs, trigger rollbacks |

---

## Core Modules

### ECO Management
- Create ECOs of three types: **Product**, **BOM**, and **Rollback**
- Propose structured changes stored as a `proposedChanges` JSON payload
- Kanban board view for drag-and-drop stage management
- Per-ECO detail page with full proposed change diff, risk score, conflict status, and audit timeline
- ECO validation gate — conflicts must be resolved before an ECO can be applied

### Product Management
- Full product registry with `name`, `salePrice`, `costPrice`, `version`, and `status`
- Products version on ECO apply — current version is archived, a new version is created
- File attachments per product via UploadThing
- Product version timeline showing the full history of changes

### BOM Management
- Multi-level Bill of Materials with **Components** (sub-products + quantities) and **Operations** (name, duration, work center)
- Interactive BOM tree view using React Flow for visual hierarchy
- BOM versioning — archived on apply, new version created with component/operation deltas applied
- BOM version history list per product

### Approval Workflow
- Configurable **ECO Stages** (name, order, SLA hours, approval required flag)
- Per-stage **Approval Rules** assigning specific users as `REQUIRED` or `OPTIONAL` approvers
- Stage-gated approval — ECOs must satisfy required approvers before advancing
- Admin-only apply and rollback actions, blocked if unresolved conflicts exist

### Version History & Rollback
- Full product version archive — every applied ECO produces a new immutable version
- Rollback ECO type: Admin can revert a product to its previous version
- Rollback creates an audit log entry (`ROLLBACK_APPLIED`) with old and new version references

### Audit Trail
- Every ECO action (version creation, BOM change, approval, apply, rollback) writes an `AuditLog` record
- Stores `action`, `affectedRecord`, `oldValue`, `newValue`, `userId`, and `timestamp`
- Full audit history visible per ECO

### Settings (Admin)
- ECO Stage configurator — create, reorder, and configure stages with SLA hours and approval requirements
- Approval Rule manager — assign required and optional approvers per stage

---

## Intelligence Engines

CRISP runs four real-time analysis engines that evaluate every ECO before it is applied:

### Risk Scoring Engine
Calculates a 0–100 risk score from multiple signals:
- **Sale price delta** — flags changes above 10% or 20% thresholds
- **Cost price delta** — flags changes above 5% or 15% thresholds
- **BOM component changes** — scores removals (15 pts each), additions (10 pts each), and modifications (8 pts each)
- **Rollback type** — carries a baseline 20-point risk
- **Version bump** — adds 5 points when an archive-and-version cycle is triggered

Risk level classification: `LOW` → `MEDIUM` → `HIGH` → `CRITICAL`

### Ripple Analysis Engine
Traces downstream impact across the product graph:
- Identifies all active BOMs that use the changed product (or any component product in the ECO) as a sub-component
- Surfaces affected BOMs, their version, parent product name, and component quantities
- Excludes the ECO's own BOM from results to focus on cross-product impact

### Conflict Detection Engine
Detects concurrent ECOs that would overwrite the same product fields:
- Scans all open ECOs (not Done/Rejected) targeting the same product
- Compares `proposedChanges` on shared fields (`salePrice`, `costPrice`, `name`)
- Flags conflicting ECOs and blocks apply until conflicts are resolved
- Marks ECO `conflictStatus` as `CONFLICT` or `NONE` in the database

### Live Cost Delta Calculator
Real-time BOM cost impact preview:
- Takes original and new component quantities from the proposed BOM change
- Fetches current `costPrice` for all affected sub-products
- Returns `beforeCost`, `afterCost`, `delta`, and `deltaPercent`
- Displayed live in the ECO editor before submission

### SLA Monitoring Engine
Monitors approval stage deadlines:
- Checks all open ECOs against per-stage SLA windows (`New`: 24h, `Engineering Review`: 12h, `Approval`: 8h — configurable)
- Identifies breached ECOs based on `enteredStageAt` timestamp
- Auto-generates notifications to all Admin and Approver users for each breach

---

## Reports & Analytics

Six built-in reports accessible from the Reports module:

| Report | Description |
|---|---|
| **ECO Summary** | Overview of all ECOs by stage and type |
| **SLA Breach Report** | ECOs that have exceeded the stage SLA window |
| **Risk Analysis** | Distribution of ECOs by risk level across products |
| **Product Versions** | Version history and change frequency per product |
| **Approval Trends** | Approval cycle times and bottleneck identification |
| **Conflict Log** | All detected ECO conflicts and their resolution status |

Admin dashboard additionally includes live charts (powered by Recharts) for ECO throughput and stage distribution.

---

## Folder Structure

```
src/
├── app/
│   ├── (auth)/               # Login, signup, forgot password
│   ├── (dashboard)/
│   │   ├── dashboard/        # Role-specific dashboards
│   │   ├── eco/              # ECO list, new ECO, ECO detail (diff, conflicts, ripple, rollback)
│   │   ├── products/         # Product list, new product, product detail + timeline
│   │   ├── bom/              # BOM list, new BOM, BOM detail (tree, timeline)
│   │   ├── approve/          # Role-specific approval views
│   │   ├── reports/          # All six report pages
│   │   └── settings/         # Stage and approval rule configuration
│   └── api/
│       ├── eco/              # ECO CRUD, approve, apply, rollback, validate
│       ├── products/         # Product CRUD
│       ├── bom/              # BOM CRUD
│       ├── intelligence/     # risk-score, cost-delta, ripple-analysis, conflict-check
│       ├── notifications/    # Notification fetch
│       ├── settings/         # Stage and rule management
│       └── auth/             # NextAuth handler
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── dashboard/            # Role dashboards, ECO table, charts
│   ├── layout/               # Shell, sidebar, topbar, notifications panel
│   ├── eco/                  # Kanban board and cards
│   ├── bom/                  # BOM tree, version list
│   ├── diff/                 # BOM tree diff viewer
│   ├── timeline/             # Version timeline
│   ├── cost/                 # Live cost calculator
│   ├── approve/              # Approver action panel
│   └── auth/                 # Login, signup, forgot password forms
├── lib/
│   ├── risk-engine.ts
│   ├── ripple-engine.ts
│   ├── conflict-engine.ts
│   ├── cost-engine.ts
│   ├── sla-engine.ts
│   ├── audit.ts
│   ├── permissions.ts
│   ├── role-guard.ts
│   ├── auth.ts
│   └── prisma.ts
├── hooks/
│   ├── useLiveCost.ts
│   ├── useRippleAnalysis.ts
│   ├── useSLATimer.ts
│   └── useECOConflicts.ts
├── store/
│   └── notifications.ts      # Zustand notification store
└── types/
    ├── eco.types.ts
    ├── risk.types.ts
    ├── conflict.types.ts
    └── index.ts
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

---

## Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/crisp.git
cd crisp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/crisp"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database

Push the Prisma schema:
```bash
npx prisma db push
```

Seed the database with realistic demo data:
```bash
npm run db:seed
```

Open Prisma Studio (optional):
```bash
npx prisma studio
```

### 5. Run the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Demo Credentials

The seed creates users for all four roles. All seeded accounts share the same password (see `.env.example` or the seed file).

| Role | Login ID |
|---|---|
| Admin | `admin@crisp.dev` |
| Engineering | `engineer@crisp.dev` |
| Approver | `approver@crisp.dev` |
| Operations | `ops@crisp.dev` |

---

## Future Scope

1. **Advanced Workflow Automation** — dynamic approval routing by product type or risk level, conditional auto-approve for low-risk changes, parallel and multi-stage approval pipelines, SLA escalation mechanisms

2. **AI-Based Change Impact Analysis** — LLM-powered ECO summaries, natural language conflict explanations, recommendation engine for optimized change decisions, predicted cost and production time impact

3. **CAD & Engineering Tool Integration** — direct sync with AutoCAD and SolidWorks, automatic design file versioning, visual diff comparison between CAD revisions

4. **Mobile Application** — ECO creation and approval on the go, push notifications for pending approvals, offline access with background sync

5. **ERP Integration** — bi-directional sync with SAP, Oracle, or similar ERP systems to propagate approved changes to production planning and procurement

6. **Webhook & API Platform** — outbound webhooks on ECO state changes for integration with CI/CD pipelines, Slack, Jira, and other tooling
