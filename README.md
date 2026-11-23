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
| `/onboarding` | Public organization signup |
| `/dashboard`, `/sessions`, `/sessions/:id` | Auditor dashboard and explainable session detail |
| `/devices`, `/auditors`, `/hr-staff` | Tenant management (role-gated) |
| `/subscription`, `/organization` | Plan and org profile |
| `/superadmin/login`, `/superadmin/organizations` | Platform SuperAdmin console |

## API integration notes

- JWT access + refresh for auditors; SuperAdmin login is separate (no refresh).
- Auditor users API path: `/api/auditor-users`
- Session detail is the product focus: risk score plus explainable reasons with Event Record IDs
- CORS on the API must allow `http://localhost:5173`

## Related repos

- Backend API: `USBInfilteratorDetectorServiceAPI`
- Windows Worker Service: `USBInfilteratorDetectorService`
