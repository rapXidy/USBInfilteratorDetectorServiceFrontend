# 04 — React Frontend & Integration Specification

**Document purpose**  
Complete specification for the auditor-facing React application and how it integrates with the ASP.NET Core API.  

Any AI agent building the frontend must follow this document and remain consistent with the architecture and security rules defined in `01_PROJECT_OVERVIEW_AND_ARCHITECTURE.md` and the API contracts in `03_BACKEND_API.md` (payloads originate from the Worker Service in `02_WINDOWS_WORKER_SERVICE.md`).

---

## 1. Technology Stack

| Item | Choice |
|------|--------|
| Framework | React 18+ with TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS + shadcn/ui (or equivalent modern, accessible component library) |
| State / data fetching | TanStack Query (React Query) + Zustand or Context for auth state |
| Forms | React Hook Form + Zod validation |
| HTTP client | Axios or fetch wrapper with interceptors for JWT |
| Charts (optional) | Recharts or Chart.js |
| Date handling | date-fns or Day.js |

---

## 2. Authentication Flow

1. User navigates to `/login`.
2. Form fields: **Corporate Code**, **Username**, **Password**.
3. `POST /api/auth/login` with the three values.
4. On success:
   - Store access token (memory or short-lived secure storage) and refresh token (httpOnly cookie preferred, or secure storage).
   - Redirect to `/dashboard`.
5. Axios / fetch interceptor attaches `Authorization: Bearer <token>` on every request.
6. On 401, attempt silent refresh; if refresh fails, clear tokens and redirect to `/login`.
7. Logout clears tokens and redirects to `/login`.

**Security notes**
- Never store the password.
- Protect routes with an `AuthGuard` component.
- Role-based rendering: `Admin`, `Auditor`, `Viewer`.

---

## 3. Application Structure (recommended)

```
src/
  api/                  # API client functions
  components/           # Reusable UI components
  features/
    auth/
    dashboard/
    sessions/
    devices/
    auditors/
    subscription/
  hooks/
  layouts/
  pages/
  types/
  utils/
  App.tsx
  main.tsx
```

---

## 4. Required Screens

### 4.1 Login Page
- Clean, professional, centred card.
- Fields: CorpCode, Username, Password.
- Show clear error messages (invalid credentials, organisation inactive, etc.).
- “Forgot password” can be a future placeholder.

### 4.2 Dashboard (home after login)
Organisation-scoped overview:
- Total sessions in the selected period
- High-risk sessions count
- Hosts currently reporting
- Recent high-severity alerts (last 10)
- Simple trend chart (sessions or risk score over time) – optional but desirable
- Quick filters: last 24 h / 7 d / 30 d

### 4.3 Sessions List
- Paginated, filterable, sortable table.
- Columns: Timestamp, Host, User, Device Serial, Risk Score, Status (Detection Complete / Incomplete), Actions.
- Filters: date range, minimum risk score, host name, device serial, “unapproved device only”.
- Clicking a row opens the Session Detail view.

### 4.4 Session Detail
The most important screen for auditors. Must show:

- Session header (host, user, device serial, vendor/model, connect/disconnect times, total bytes written, overall risk score).
- **Explainable reasons** list – each reason with its weight and the Event Record IDs that triggered it.
- Timeline / list of raw events belonging to the session.
- Audit-settings status for that host at the time of the session (especially if detection was incomplete).
- Ability to mark the session as “reviewed” (optional nice-to-have).

### 4.5 Allowed Devices
- Table of approved USB device serials for the organisation.
- Add / edit / deactivate.
- Admin or Auditor role required for mutations.

### 4.6 Auditors (Admin only)
- List of users who can access the dashboard.
- Invite / create, edit role, activate/deactivate.
- Never show password hashes.

### 4.7 Subscription / Plan Status
- Current plan name and status (Free Trial / Pro / etc.).
- End date of trial or billing period.
- Clear message that paid plans and Stripe checkout are coming later.
- Feature flags reflected in the UI (e.g. “Webhooks available on Pro plan”).

### 4.8 Settings / Profile (optional)
- Change own password.
- View organisation details (read-only for non-admins).

---

## 5. UX & Visual Guidelines

- Modern, clean, professional (security-product aesthetic).
- Prefer light theme with a dark option if time permits.
- High contrast for risk scores:
  - Low → green
  - Medium → amber
  - High → red
- Always surface the **explainable reasons** prominently; do not hide them behind extra clicks.
- Empty states should be helpful (“No high-risk sessions in the last 7 days”).
- Loading and error states must be handled gracefully.
- Responsive: usable on laptop and wide desktop; mobile is secondary.

---

## 6. API Integration Contracts (frontend perspective)

All requests (except login/refresh) must include the JWT.

Key endpoints the frontend will call:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | Authenticate |
| POST | `/api/auth/refresh` | Silent token refresh |
| GET | `/api/sessions` | List sessions (query params for filters) |
| GET | `/api/sessions/{id}` | Full session detail + reasons + events |
| GET | `/api/alerts` | Recent alerts |
| GET | `/api/devices` | Allowed devices |
| POST/PUT/DELETE | `/api/devices` | Manage allowed devices |
| GET | `/api/auditors` | List auditors (Admin) |
| POST/PUT | `/api/auditors` | Manage auditors |
| GET | `/api/subscription` | Current plan status |
| GET | `/api/dashboard/summary` | Aggregated numbers for the home dashboard |

(Exact query parameter names should match the backend implementation; keep them consistent.)

---

## 7. Multi-Tenancy in the UI

- After login the UI is **strictly scoped** to the organisation that belongs to the CorpCode used at login.
- No cross-organisation data leakage is possible from the frontend side; the API already enforces isolation.
- Organisation name should appear in the header/sidebar so the auditor always knows which tenant they are viewing.

---

## 8. Role-Based Access

| Feature | Viewer | Auditor | Admin |
|---------|--------|---------|-------|
| View dashboard & sessions | ✓ | ✓ | ✓ |
| View session detail & reasons | ✓ | ✓ | ✓ |
| Manage Allowed Devices | ✗ | ✓ | ✓ |
| Manage Auditors | ✗ | ✗ | ✓ |
| View subscription | ✓ | ✓ | ✓ |
| Change organisation settings | ✗ | ✗ | ✓ |

---

## 9. Implementation Order Recommendation (Frontend)

1. Project scaffolding (Vite + React + TS + Tailwind + routing)
2. Auth pages + token handling + protected routes
3. Basic layout (sidebar + header)
4. Sessions list + Session detail (including reasons)
5. Dashboard summary
6. Allowed Devices CRUD
7. Auditors management (Admin)
8. Subscription status page
9. Polish, empty states, error handling, responsive tweaks

---

## 10. Non-Functional Requirements

- All forms validated client-side (Zod) and server-side errors displayed cleanly.
- Accessible (keyboard navigation, ARIA labels on interactive elements).
- No secrets or API keys in the frontend bundle.
- Environment variables for `VITE_API_BASE_URL` only.

---

## 11. Related Documents

- `01_PROJECT_OVERVIEW_AND_ARCHITECTURE.md` — architecture, security principles, and the decision **not** to auto-enable Windows audit policies.
- `02_WINDOWS_WORKER_SERVICE.md` — payload contract produced by the endpoint agent.
- `03_BACKEND_API.md` — exact API contracts, data shapes, and risk-score structure that the frontend must render.


---

**Final note for agents**  
The differentiator of this product is **explainability**. Every high-risk session must make it obvious *why* the score was raised, citing the underlying Windows Event Record IDs. The Session Detail page is therefore the most important screen—implement it thoroughly.
