
<img width="247" height="87" alt="image" src="https://github.com/user-attachments/assets/3a6496e6-6cf5-4b0c-86e0-330ba156eef0" />

**Chronicle Recursive Implementation of Seamless Productcycle**

*Engineering Changes, Executed with Control.*

---

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth.js-purple?style=flat-square)


</div>

---

## What is CRISP?

CRISP is an **Engineering Change Order (ECO)** system that enforces a structured, approval-driven process for every change made to Products and Bills of Materials.

> Instead of allowing direct edits to master data — all changes are **proposed → reviewed → approved → applied**.  
> This eliminates data overwrites, enforces accountability, and maintains a complete audit trail.

---

## Table of Contents

- [Core Objectives](#-core-objectives)
- [Tech Stack](#-tech-stack)
- [Roles](#-roles)
- [Core Modules](#-core-modules)
- [Intelligence Engines](#-intelligence-engines)
- [Reports & Analytics](#-reports--analytics)
- [Folder Structure](#-folder-structure)
- [Setup Guide](#-setup-guide)
- [Demo Credentials](#-demo-credentials)
- [Future Scope](#-future-scope)

---

##  Core Objectives

| # | Objective |
|---|-----------|
| 01 | Prevent direct modification of critical product and BOM data |
| 02 | Enforce approval-based workflows with configurable stage rules |
| 03 | Maintain full version history and complete audit traceability |
| 04 | Surface risk, cost, and conflict intelligence before changes are applied |
| 05 | Improve collaboration across Engineering, Approver, Operations, and Admin teams |

---

##  Tech Stack

<details>
<summary><strong>Frontend</strong></summary>

| Package | Purpose |
|---------|---------|
| `next.js` (App Router) | Server & client components, layouts, route groups |
| `react` | UI rendering with hooks and client-side state |
| `tailwindcss v4` | Utility-first styling |
| `shadcn/ui` + `radix-ui` | Accessible component primitives |
| `recharts` | Dashboard charts and analytics |
| `@xyflow/react` | Interactive BOM tree graph rendering |
| `@dnd-kit` | Drag-and-drop Kanban board for ECO stages |
| `sonner` | Toast notifications |
| `lucide-react` | Icon system |

## Core Objectives

</details>

<details>
<summary><strong>Backend</strong></summary>

| Package | Purpose |
|---------|---------|
| `next.js` API Routes | RESTful endpoints for ECO, BOM, product, approval, intelligence |
| `prisma` | Type-safe database access and migrations |
| `postgresql` | Relational database |
| `next-auth` (beta) | Session-based auth with role-aware access control |
| `bcryptjs` | Password hashing |

</details>

<details>
<summary><strong>Intelligence Engines</strong></summary>

| Engine | File |
|--------|------|
| Risk Scoring | `src/lib/risk-engine.ts` |
| Ripple Analysis | `src/lib/ripple-engine.ts` |
| Conflict Detection | `src/lib/conflict-engine.ts` |
| Live Cost Delta | `src/lib/cost-engine.ts` |
| SLA Monitoring | `src/lib/sla-engine.ts` |

</details>

<details>
<summary><strong>Export, State & Utilities</strong></summary>

`jsPDF` · `jspdf-autotable` · `UploadThing` · `zustand` · `react-hook-form` · `zod` · `date-fns` · `next-themes`

</details>

<img width="1362" height="808" alt="image" src="https://github.com/user-attachments/assets/2e3575c8-655e-48bc-b0a3-d84e54ccbd44" />

---

##  Roles

```
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ Role                │ Capabilities                                           │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Engineering User    │ Create ECOs · Propose changes · Initiate approvals     │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Approver            │ Review ECOs · Approve or reject · Advance pipeline     │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Operations User     │ Read-only · View active Products & BOMs                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Admin               │ Full access · Configure stages · Apply · Rollback      │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

---

##  Core Modules

<details>
<summary><strong>ECO Management</strong></summary>

- Three ECO types: **Product**, **BOM**, and **Rollback**
- Proposed changes stored as structured `proposedChanges` JSON payload
- Kanban board with drag-and-drop stage management
- Per-ECO detail page: full diff, risk score, conflict status, audit timeline
- Conflict validation gate — conflicts must be resolved before apply

</details>

<details>
<summary><strong>Product Management</strong></summary>

- Full product registry with `name`, `salePrice`, `costPrice`, `version`, `status`
- Products version on ECO apply — current version archived, new version created
- File attachments via UploadThing
- Product version timeline showing the full change history

</details>

<details>
<summary><strong>BOM Management</strong></summary>

- Multi-level Bills of Materials with **Components** (sub-products + quantities) and **Operations** (name, duration, work center)
- Interactive BOM tree view using React Flow for visual hierarchy
- BOM versioning — archived on apply, new version created with deltas applied
- BOM version history list per product

</details>

<details>
<summary><strong>Approval Workflow</strong></summary>

- Configurable **ECO Stages** with name, order, SLA hours, and approval required flag
- Per-stage **Approval Rules** assigning users as `REQUIRED` or `OPTIONAL` approvers
- Stage-gated advancement — ECOs must satisfy required approvers before moving
- Admin-only apply and rollback, blocked if unresolved conflicts exist

</details>

<details>
<summary><strong>Version History & Rollback</strong></summary>

- Every applied ECO produces a new immutable archived version
- Rollback ECO type: Admin can revert a product to its previous version
- Rollback creates a `ROLLBACK_APPLIED` audit log entry with old and new version references

</details>

<details>
<summary><strong>Audit Trail</strong></summary>

- Every ECO action writes an `AuditLog` record
- Stores `action`, `affectedRecord`, `oldValue`, `newValue`, `userId`, `timestamp`
- Full audit history visible per ECO

</details>

---

##  Intelligence Engines

CRISP runs **five real-time engines** that evaluate every ECO automatically — before any human reviews it.

---

### Risk Scoring Engine

Calculates a **0–100 risk score** from multiple signals, then classifies the result:

```
Score  0–24   →  LOW      ████░░░░░░░░
Score 25–49   →  MEDIUM   ████████░░░░
Score 50–74   →  HIGH     ████████████
Score 75–100  →  CRITICAL ████████████  ⚠
```

| Signal | Points |
|--------|--------|
| Sale price change > 20% | +30 |
| Sale price change > 10% | +15 |
| Cost price change > 15% | +25 |
| Cost price change > 5% | +10 |
| BOM component removed | +15 each |
| BOM component added | +10 each |
| BOM component modified | +8 each |
| Rollback ECO type | +20 baseline |
| Version bump triggered | +5 |

---

### Ripple Analysis Engine

Traces **downstream cross-BOM impact** of proposed changes.

```
ECO targets  →  Product A
                    │
                    ▼
          ┌─────────────────────┐
          │  Active BOMs using  │
          │  Product A as a     │  ← surfaces these
          │  sub-component      │
          └─────────────────────┘
```

- Collects all `productId`s being changed in the ECO
- Finds all active BOMs containing those products as components
- Excludes the ECO's own BOM to focus on cross-product impact

---

### Conflict Detection Engine

Detects concurrent ECOs that would **overwrite the same fields** on the same product.

```
ECO-001  →  salePrice: 120   ←──┐
ECO-002  →  salePrice: 135   ←──┴── CONFLICT detected · apply blocked
```

Scanned fields: `salePrice` · `costPrice` · `name`

---

### Live Cost Delta Calculator

Real-time BOM cost impact preview — updates as you type.

```
Before:  Component A × 4  =  $200.00
After:   Component A × 6  =  $300.00
                          ──────────
         Δ Cost           =  +$100.00  (+50.0%)
```

---

### SLA Monitoring Engine

Monitors per-stage approval windows and auto-notifies on breach.

```
New                →  24h window
Engineering Review →  12h window
Approval           →   8h window
```

- Breach detected via `enteredStageAt` timestamp
- Notifications auto-generated for all Admin + Approver users
- Duplicate-safe: existing unread SLA breach notifications are not recreated

---

##  Reports & Analytics

Six built-in reports, all accessible from the Reports module:

| Report | Description |
|--------|-------------|
| **ECO Summary** | All ECOs by stage and type |
| **SLA Breach Report** | ECOs that exceeded their stage SLA window |
| **Risk Analysis** | Distribution of ECOs by risk level across products |
| **Product Versions** | Version history and change frequency per product |
| **Approval Trends** | Cycle times and bottleneck identification |
| **Conflict Log** | All detected conflicts and their resolution status |

Admin dashboard additionally includes live **Recharts** visualizations for ECO throughput and stage distribution.

---

##  Folder Structure

```
src/
├── app/
│   ├── (auth)/                     # Login, signup, forgot password
│   ├── (dashboard)/
│   │   ├── dashboard/              # Role-specific dashboards
│   │   ├── eco/                    # ECO list, new, detail (diff, conflicts, ripple, rollback)
│   │   ├── products/               # Product list, new, detail + timeline
│   │   ├── bom/                    # BOM list, new, detail (tree, timeline)
│   │   ├── approve/                # Role-specific approval views
│   │   ├── reports/                # All six report pages
│   │   └── settings/               # Stage & approval rule configuration
│   └── api/
│       ├── eco/                    # CRUD, approve, apply, rollback, validate
│       ├── intelligence/           # risk-score, cost-delta, ripple, conflict-check
│       └── bom/ products/ auth/    # Supporting endpoints
│
├── components/
│   ├── ui/                         # shadcn/ui base components
│   ├── dashboard/                  # Role dashboards, ECO table, charts
│   ├── eco/                        # Kanban board and cards
│   ├── bom/                        # BOM tree, version list
│   ├── diff/                       # BOM tree diff viewer
│   ├── timeline/                   # Version timeline
│   ├── cost/                       # Live cost calculator
│   └── layout/                     # Shell, sidebar, topbar, notifications
│
├── lib/
│   ├── risk-engine.ts
│   ├── ripple-engine.ts
│   ├── conflict-engine.ts
│   ├── cost-engine.ts
│   ├── sla-engine.ts
│   └── audit.ts  permissions.ts  auth.ts  prisma.ts
│
├── hooks/
│   ├── useLiveCost.ts
│   ├── useRippleAnalysis.ts
│   ├── useSLATimer.ts
│   └── useECOConflicts.ts
│
└── store/
    └── notifications.ts            # Zustand notification store
```

---

##  Setup Guide

### 1 · Clone the repository

```bash
git clone https://github.com/your-username/crisp.git
cd crisp
```

### 2 · Install dependencies

```bash
npm install
```

### 3 · Configure environment variables

Create a `.env.local` file:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/crisp"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4 · Setup database

```bash
# Push Prisma schema
npx prisma db push

# Seed with realistic demo data
npm run db:seed

# Open Prisma Studio (optional)
npx prisma studio
```

### 5 · Run the development server

```bash
npm run dev
```

> Application runs at `http://localhost:3000`

---

##  Demo Credentials

All seeded accounts share the same password — see `.env.example` or the seed file.

| Role | Login ID |
|------|----------|
| Admin | `admin@crisp.dev` |
| Engineering | `engineer@crisp.dev` |
| Approver | `approver@crisp.dev` |
| Operations | `ops@crisp.dev` |

---

## 🔭 Future Scope

<details>
<summary><strong>1 · Advanced Workflow Automation</strong></summary>

Dynamic approval routing based on product type, cost, or risk level. Conditional auto-approve for low-risk changes. SLA-based escalation. Parallel and multi-stage approval pipelines.

</details>

<details>
<summary><strong>2 · AI-Based Change Impact Analysis</strong></summary>

LLM-powered ECO summaries. Natural language conflict explanations. Recommendation engine for optimized change decisions. Predicted cost and production time impact.

</details>

<details>
<summary><strong>3 · CAD & Engineering Tool Integration</strong></summary>

Direct integration with AutoCAD and SolidWorks. Automatic design file versioning. Visual diff comparison between CAD revisions. Centralized storage for design documents.

</details>

<details>
<summary><strong>4 · Mobile Application</strong></summary>

ECO creation and approval on the go. Push notifications for pending approvals. Offline access with background sync.

</details>

<details>
<summary><strong>5 · ERP Integration</strong></summary>

Bi-directional sync with SAP, Oracle, or similar ERP systems to propagate approved changes to production planning and procurement.

</details>

<details>
<summary><strong>6 · Webhook & API Platform</strong></summary>

Outbound webhooks on ECO state changes for integration with CI/CD pipelines, Slack, Jira, and enterprise tooling.

</details>

---

<div align="center">

```
CRISP — Chronicle Recursive Implementation of Seamless Productcycle
```

*Built with Next.js · Prisma · PostgreSQL*

</div>
