# USB Infilterator Detector — Frontend

React auditor dashboard for the USB Infilterator Detector platform. It talks to the ASP.NET Core API for organization onboarding, tenant auditor access, USB session/alert review, device and user management, and SuperAdmin organization controls.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn-style UI primitives
- TanStack Query, Zustand, React Hook Form + Zod, Axios, Recharts

## Project layout

```
src/
  backend/    # API client, DTOs, auth tokens, React Query hooks
  frontend/   # UI: pages, features, layouts, components, routes
```

## Prerequisites

- Node.js 20+ (or current LTS)
- Running API instance (default local URL below)

## Setup

```powershell
cd USBInfilteratorDetectorServiceFrontend
copy .env.example .env
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

### Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | API origin with no trailing slash (e.g. `https://localhost:44357`) |

Vite loads `.env` at startup — restart `npm run dev` after changing it. Keep `.env` local; commit only `.env.example`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on port 5173 |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

## Main routes

| Path | Audience |
|------|----------|
| `/login` | Tenant auditor login (CorpCode + username + password) |
| `/forgot-password` | Request temporary password email |
| `/onboarding` | Public organization signup |
| `/dashboard`, `/sessions`, `/sessions/:id` | Auditor dashboard and explainable session detail |
| `/devices`, `/auditors`, `/hr-staff` | Tenant management (role-gated) |
| `/subscription`, `/organization`, `/change-password` | Plan, org profile, and password change |
| `/superadmin/login`, `/superadmin/organizations` | Platform SuperAdmin console |

## API integration notes

- JWT access + refresh for auditors; SuperAdmin login is separate (no refresh).
- Auditor users API path: `/api/auditor-users`
- Session detail is the product focus: risk score plus explainable reasons with Event Record IDs
- CORS on the API must allow `http://localhost:5173`

## Related repos

- Backend API: `USBInfilteratorDetectorServiceAPI`
- Windows Worker Service: `USBInfilteratorDetectorService`

## In Addition

# USB Exfiltration Detector – Frontend

**React + TypeScript auditor dashboard** for the USB Exfiltration Detector platform.

Security teams and authorised auditors use this application to review USB sessions, inspect explainable risk scores, manage allowed devices, and monitor organisation-wide activity. All data is strictly scoped to the organisation identified by the `CorpCode` used at login.

---

## Overview

| Component | Role |
|-----------|------|
| Windows Worker Service | Detects USB activity on endpoints and sends structured payloads |
| Central API | Stores sessions, reasons, devices, auditors; issues JWTs |
| **This Frontend** | Authenticated, organisation-scoped dashboard for auditors |

The differentiator of the product is **explainability**: every high-risk session shows the human-readable reasons and the Windows Event Record IDs that produced the score.

---

## Key Features

- **Secure login** – Corporate Code + Username + Password
- **Organisation-scoped views** – All data filtered by the logged-in tenant
- **Dashboard** – Summary counts, recent high-severity alerts, quick filters
- **Sessions list** – Filterable, sortable table of USB sessions
- **Session detail** – Full timeline, risk score breakdown, and cited Event Record IDs
- **Allowed devices** – Manage the organisation’s approved USB serial numbers
- **Auditor management** – Admin-only user administration
- **Subscription status** – Current plan and feature flags
- **Role-based access** – `Admin`, `Auditor`, `Viewer`

---

## Tech Stack

| Item | Choice |
|------|--------|
| Framework | React 18+ with TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS + shadcn/ui (or equivalent) |
| Data fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| HTTP client | Axios (or fetch) with JWT interceptors |
| Auth state | Zustand or React Context |
| Charts (optional) | Recharts |

---

## Getting Started

### Prerequisites

- Node.js 18+ (or 20 LTS recommended)
- Access to a running instance of the central API

### 1. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment

Create a `.env` (or `.env.local`) file:

```env
VITE_API_BASE_URL=https://localhost:7xxx
```

Only the API base URL should be exposed to the browser. Never put secrets in the frontend bundle.

### 3. Run locally

```bash
npm run dev
```

The app will typically be available at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
```

The output in `dist/` can be served by any static host or by the API itself.

---

## Authentication Flow

1. User opens `/login`.
2. Enters **Corporate Code**, **Username**, and **Password**.
3. Frontend calls `POST /api/auth/login`.
4. On success, stores the access token (and refresh token) and redirects to `/dashboard`.
5. An HTTP interceptor attaches `Authorization: Bearer <token>` to every subsequent request.
6. On `401`, the client attempts a silent refresh. If refresh fails, the user is logged out.

Protected routes are wrapped in an `AuthGuard`. Role-based rendering controls access to admin features.

---

## Main Screens

| Route | Purpose | Roles |
|-------|---------|-------|
| `/login` | Authentication | Public |
| `/dashboard` | Summary metrics & recent alerts | All authenticated |
| `/sessions` | Filterable list of USB sessions | All authenticated |
| `/sessions/:id` | Session detail + explainable reasons | All authenticated |
| `/devices` | Allowed USB devices management | Auditor, Admin |
| `/auditors` | Auditor user management (create without password; temp password emailed) | Admin only |
| `/subscription` | Current plan status | All authenticated |

### Session Detail (most important screen)

Must clearly show:

- Host, user, device serial, vendor/model, connect/disconnect times
- Overall risk score
- **List of reasons** with weights and the Event Record IDs that triggered each rule
- Timeline of raw events belonging to the session
- Whether detection was complete (audit settings status)

---

## Project Structure (recommended)

```
src/
├── api/                 # API client functions
├── components/          # Shared UI components
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── sessions/
│   ├── devices/
│   ├── auditors/
│   └── subscription/
├── hooks/
├── layouts/
├── pages/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

---

## Role-Based Access

| Feature | Viewer | Auditor | Admin |
|---------|--------|---------|-------|
| View dashboard & sessions | ✓ | ✓ | ✓ |
| View session detail & reasons | ✓ | ✓ | ✓ |
| Manage Allowed Devices | ✗ | ✓ | ✓ |
| Manage Auditors | ✗ | ✗ | ✓ |
| View subscription | ✓ | ✓ | ✓ |

---

## API Integration

All authenticated requests go to the central ASP.NET Core API. Key endpoints used by the frontend:

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/forgot-password` | Request temporary password email |
| `POST` | `/api/auth/change-password` | Change own password |
| `POST` | `/api/auditor-users/{id}/reset-password` | Admin email temporary password |
| `POST` | `/api/auth/refresh` | Silent token refresh |
| `GET` | `/api/sessions` | List sessions (with filters) |
| `GET` | `/api/sessions/{id}` | Session detail + reasons + events |
| `GET` | `/api/alerts` | Recent alerts |
| `GET/POST/PUT/DELETE` | `/api/devices` | Allowed devices |
| `GET/POST/PUT/DELETE` | `/api/auditor-users` | Auditor management (Admin; create generates password and emails it) |
| `GET` | `/api/subscription` | Current plan |
| `GET` | `/api/dashboard/summary` | Dashboard aggregates |

---

## UX Guidelines

- Clean, professional security-product aesthetic
- High-contrast risk scores (green / amber / red)
- Explainable reasons must be prominent — never hidden behind extra clicks
- Helpful empty states and clear loading / error handling
- Accessible (keyboard navigation, ARIA labels)
- Responsive (laptop and wide desktop first; mobile secondary)

---

## Security Notes

- No secrets or API keys in the frontend bundle
- Tokens handled carefully (prefer memory + httpOnly refresh cookie when possible)
- All data is already tenant-scoped by the API; the UI never attempts cross-organisation access
- Client-side validation (Zod) is complementary to server-side validation

---

## Suggested Implementation Order

1. Vite + React + TypeScript + Tailwind scaffolding  
2. Auth pages, token handling, and protected routes  
3. App layout (sidebar + header)  
4. Sessions list + Session detail (including reasons)  
5. Dashboard summary  
6. Allowed Devices CRUD  
7. Auditors management (Admin)  
8. Subscription status page  
9. Polish, empty states, error handling, responsive tweaks  

---

## Related Components

| Component | Description |
|-----------|-------------|
| Windows Worker Service | Endpoint agent that produces the telemetry shown in this UI |
| Central API | Backend that authenticates users and serves all data |

See the companion specification documents:

- `01_PROJECT_OVERVIEW_AND_ARCHITECTURE.md`
- `02_WINDOWS_WORKER_SERVICE.md`
- `03_BACKEND_API.md`
- `04_FRONTEND_AND_INTEGRATION.md`

---

## Licence

Specify your licence here (e.g. MIT, proprietary, etc.).

---

## Contributing

1. Create a feature branch  
2. Keep components small and typed  
3. Ensure every new view respects role-based access  
4. Open a pull request with a clear description of the change  
