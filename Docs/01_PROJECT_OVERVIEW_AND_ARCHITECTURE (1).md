# 01 — Project Overview & System Architecture

**Project Title**  
USING WINDOWS EVENT LOGS TO DETECT USB-BASED DATA EXFILTRATION: AN EXPLAINABLE DETECTOR VALIDATED FOR ORGANISATIONS / ENTERPRISES

**Document purpose**  
This file is the single source of truth for high-level vision, architecture, technology choices, security principles, and deployment model. All subsequent implementation agents must read this document first.

---

## 1. Vision

Build a practical, multi-tenant USB data-exfiltration detection platform for organisations.  

The system consists of three cooperating components:

1. **Windows Background Worker Service** (installed on each monitored endpoint)  
2. **ASP.NET Core Web API** (central middle-tier)  
3. **React frontend** (auditor / security-team dashboard)

The intellectual core remains an **explainable detector**: every alert carries human-readable reasons that cite the exact Windows Event Record IDs that triggered it, together with a risk score.

---

## 2. Core Capabilities

| Capability | Description |
|------------|-------------|
| USB insertion detection | Real-time detection of removable storage devices |
| Audit-policy awareness | Check whether required audit settings are enabled; never silently change them |
| Session reconstruction | Rebuild complete USB sessions (connect → file activity → disconnect) |
| File-level monitoring | Detect reads/writes to removable media when audit settings allow it |
| Explainable risk scoring | Weighted rules produce a score + natural-language reasons citing Event IDs |
| Offline resilience | Local durable queue; sync when connectivity returns |
| Multi-tenancy | Organisations identified by unique `CorpCode` |
| Notifications | Email, webhook, or API callbacks to the security team |
| Auditor authentication | Corporate Code + username + password (hashed at rest) |
| Subscription awareness | Free trial by default; paid plans enforced via feature flags |

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Monitored Windows Endpoint                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  .NET 8 Worker Service                                │  │
│  │  - Watches for USB device arrival                     │  │
│  │  - Checks audit settings (does NOT auto-enable)       │  │
│  │  - Reads Event Logs only when USB is present          │  │
│  │  - Reconstructs sessions + calculates risk score      │  │
│  │  - Local SQLite / file queue for offline buffering    │  │
│  │  - Sends structured JSON payloads to central API      │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Central Backend                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ASP.NET Core Web API (.NET 8)                        │  │
│  │  - Receives telemetry from Worker Services            │  │
│  │  - Authenticates organisations via CorpCode           │  │
│  │  - Persists events, sessions, alerts, risk scores     │  │
│  │  - Triggers notifications (email / webhook)           │  │
│  │  - Exposes authenticated endpoints for the React app  │  │
│  │  - Manages subscriptions & feature flags              │  │
│  └───────────────────────────────────────────────────────┘  │
│                             │                               │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Database (PostgreSQL recommended / SQL Server)       │  │
│  │  Organisations · Auditors · AllowedDevices            │  │
│  │  Subscriptions · Hosts · UsbSessions · Events · Alerts│  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS (JWT)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  React Frontend (TypeScript + modern UI library)            │
│  - Login (CorpCode + Username + Password)                   │
│  - Organisation-scoped dashboard                            │
│  - Session list, alert detail, risk score breakdown         │
│  - Allowed-device management                                │
│  - Auditor management (admin role)                          │
│  - Subscription status                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Technology Stack (mandatory)

| Layer | Choice | Notes |
|-------|--------|-------|
| Worker Service | .NET 8 Worker Service (C#) | Windows Service installer |
| API | ASP.NET Core 8 Web API (C#) | Minimal APIs or controllers |
| Database | PostgreSQL (preferred) or SQL Server | EF Core |
| Frontend | React 18+ with TypeScript | Vite |
| Styling | Tailwind CSS + shadcn/ui (or equivalent modern component library) | Clean, professional, accessible |
| Auth | JWT (access + refresh tokens) | Password hashing: Argon2id or bcrypt |
| Email (dev) | Resend / Brevo / Mailtrap | Free tier suitable for development |
| Payments (future) | Stripe | Not required for v1 |
| Local queue | SQLite or file-based JSON queue | Offline resilience |

---

## 5. Security Principles (non-negotiable)

- Passwords **must** be hashed with Argon2id (or bcrypt with work factor ≥ 12). Never store plaintext.
- All API traffic over HTTPS.
- JWT with short-lived access tokens + refresh token rotation.
- Least-privilege service account for the Worker Service.
- Input validation and anti-forgery on every endpoint.
- Rate limiting on authentication endpoints.
- CorpCode is treated as a tenant identifier; every query is scoped by it.
- Secrets (connection strings, API keys, SMTP) live in environment variables or a secret store, never in source control.
- The Worker Service never runs as LocalSystem unless absolutely required; prefer a dedicated low-privilege account.

---

## 6. Important Design Decision — Audit Policy Handling

**Do not automatically enable Windows audit policies.**

Rationale: Changing audit policy is a privileged, organisation-wide decision. Many enterprises will refuse a product that modifies Local Security Policy without explicit administrator consent.

Required behaviour:

1. On USB insertion, query current audit policy state.
2. If the necessary settings (Audit PNP Activity, Audit Removable Storage) are **not** enabled, raise a high-severity alert: “Detection incomplete – required audit settings are disabled”.
3. Optionally ship a separate elevated PowerShell helper that an administrator can run once to enable the settings.
4. Only process file-level write/read events when the settings are confirmed active.

---

## 7. Deployment Model

- **Worker Service**: MSI or `sc.exe` install on each monitored Windows endpoint. CorpCode and API base URL configured in `appsettings.json` or environment variables.
- **API + Database**: Hosted on a central server or cloud (Azure App Service, AWS ECS, or simple VPS).
- **Frontend**: Static build served by the API or a CDN / Azure Static Web Apps / Netlify.
- **Offline mode**: Fully supported. The Worker buffers events locally and ships them when the API becomes reachable again.

---

## 8. Success Criteria for the First Implementable Version (v1)

1. Worker Service correctly detects USB insertion and reads relevant event logs.
2. Structured payloads containing HostName, DeviceId, logged-in user, event trail, and risk score are sent to the API.
3. API persists data under the correct CorpCode and exposes authenticated endpoints.
4. React dashboard allows an auditor to log in, view sessions/alerts, and see explainable reasons.
5. Offline buffering works (events are not lost when the host is offline).
6. Passwords are properly hashed; common OWASP vulnerabilities are avoided.
7. Free-trial subscription is the default; paid plans exist as data model only.

---

## 9. Out of Scope for v1 (explicit)

- Automatic enabling of Windows audit policies.
- Stripe payment collection (design the tables only).
- Mobile applications.
- macOS / Linux agents.
- Full SIEM integration.
- Machine-learning anomaly detection (keep the detector rule-based and explainable).

---

## 10. Related Documents

- `02_WINDOWS_WORKER_SERVICE.md` — complete specification for the endpoint Windows Background Worker Service.
- `03_BACKEND_API.md` — ASP.NET Core API, database schema, authentication, notifications and subscriptions.
- `04_FRONTEND_AND_INTEGRATION.md` — React screens, auth flow, dashboard behaviour, and how the UI consumes the API.

Agents implementing any component **must** stay consistent with the architecture and security principles defined in this document.
