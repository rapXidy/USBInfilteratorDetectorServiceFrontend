# 03 — Backend API Specification

**Document purpose**  
Complete implementation contract for the ASP.NET Core Web API, database schema, authentication, notifications, and subscription logic.

This document covers **only** the central backend. The Windows Worker Service is specified separately in `02_WINDOWS_WORKER_SERVICE.md`.

Agents implementing the API must also read:
- `01_PROJECT_OVERVIEW_AND_ARCHITECTURE.md`
- `02_WINDOWS_WORKER_SERVICE.md` (to understand the exact payload shape that will be ingested)

---

## 1. Technology

| Item | Choice |
|------|--------|
| Runtime | .NET 8 |
| Framework | ASP.NET Core Web API |
| ORM | Entity Framework Core |
| Database | PostgreSQL (preferred) or SQL Server |
| Auth | JWT (access + refresh tokens) |
| Password hashing | Argon2id (preferred) or bcrypt (work factor ≥ 12) |
| Email (development) | Resend, Brevo, Mailtrap, or similar free-tier provider |

---

## 2. Database Schema

All multi-tenant tables are scoped by `OrganizationId` / `CorpCode`.

### 2.1 Organizations
- Id (PK)
- CorpCode (unique, indexed)
- Name
- Email
- Phone
- OfficeAddress
- Sector
- CreatedAt
- IsActive

### 2.2 Auditors
- Id (PK)
- OrganizationId (FK)
- Username (unique per organisation)
- PasswordHash
- DisplayName
- Role (`Admin` | `Auditor` | `Viewer`)
- IsActive
- CreatedAt
- LastLoginAt

### 2.3 AllowedDevices
- Id (PK)
- OrganizationId (FK)
- DeviceSerial (indexed)
- Vendor
- Model
- Description / Owner
- AddedByAuditorId
- CreatedAt
- IsActive

### 2.4 Subscriptions
- Id (PK)
- OrganizationId (FK)
- Plan (`FreeTrial` | `Pro` | `Enterprise`)
- Status (`Active` | `Expired` | `Cancelled`)
- StartsAt
- EndsAt
- ExternalPaymentId (nullable – future Stripe)
- CreatedAt

### 2.5 Hosts
- Id (PK)
- OrganizationId (FK)
- HostName
- DeviceId (unique per organisation)
- LastSeenAt
- OsVersion

### 2.6 UsbSessions
- Id (PK)
- OrganizationId (FK)
- HostId (FK)
- SessionId (GUID supplied by the Worker)
- DeviceSerial
- Vendor / Model
- ConnectedAt
- DisconnectedAt
- TotalBytesWritten
- RiskScore
- DetectionComplete (bool)
- CreatedAt

### 2.7 SessionReasons
- Id (PK)
- UsbSessionId (FK)
- RuleName
- Weight
- Description
- EventRecordIds (JSON array or normalised link table)

### 2.8 RawEvents (recommended for forensics)
- Id (PK)
- UsbSessionId (FK)
- EventId
- RecordId
- TimeCreated
- Activity
- Description
- RawJson (optional)

### 2.9 NotificationsLog
- Id (PK)
- OrganizationId (FK)
- UsbSessionId (FK, nullable)
- Severity
- Title
- Body
- Channel (`Email` | `Webhook` | `Api`)
- Status (`Pending` | `Sent` | `Failed`)
- SentAt
- ErrorMessage

---

## 3. Authentication & Authorisation

### 3.1 Auditor (human) authentication
- `POST /api/auth/login`  
  Body: `{ "corpCode": "...", "username": "...", "password": "..." }`  
  Returns: access token + refresh token.

- `POST /api/auth/refresh`
- `POST /api/auth/logout`

All subsequent auditor requests must carry `Authorization: Bearer <access-token>`.

### 3.2 Worker Service authentication
The Windows Worker Service authenticates with a shared API key or client-credentials grant (not interactive user credentials).  
Recommended header: `X-Api-Key: <key>` or standard OAuth2 client-credentials.

### 3.3 Tenant isolation
Every data query **must** be filtered by the Organisation that belongs to the authenticated CorpCode / OrganizationId claim. Cross-tenant access is forbidden.

---

## 4. API Endpoint Groups

### 4.1 Ingestion (Worker Service → API)
- `POST /api/ingest/batch`  
  Accepts one or more structured payloads exactly as defined in `02_WINDOWS_WORKER_SERVICE.md`.  
  Authenticated by service credentials.  
  Responsibilities: validate, persist Host / Session / Reasons / Events, update LastSeenAt, evaluate notification rules.

### 4.2 Authentication
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### 4.3 Sessions & Alerts (auditor-facing)
- `GET /api/sessions` — filterable (date range, min risk score, host, device serial, detectionComplete)
- `GET /api/sessions/{id}` — full detail including reasons and events
- `GET /api/alerts` — recent high-severity items

### 4.4 Allowed Devices
- `GET /api/devices`
- `POST /api/devices`
- `PUT /api/devices/{id}`
- `DELETE /api/devices/{id}` (soft-delete preferred)

### 4.5 Auditors (Admin role only)
- `GET /api/auditors`
- `POST /api/auditors`
- `PUT /api/auditors/{id}`
- `DELETE /api/auditors/{id}` (or deactivate)

### 4.6 Subscription
- `GET /api/subscription` — current plan and status  
  (Stripe checkout endpoints are explicitly out of scope for v1)

### 4.7 Dashboard helpers
- `GET /api/dashboard/summary` — aggregated counts for the home screen

---

## 5. Notification Pipeline

When a new high-risk session or an “audit settings missing” alert is persisted:

1. Load the organisation’s notification preferences.
2. Queue an email and/or fire a configured webhook.
3. Record the attempt and outcome in `NotificationsLog`.

Email content should include:
- Organisation name
- Host + logged-in user
- Device serial
- Risk score
- Top reasons (human-readable)
- Direct deep-link to the session in the React dashboard

Recommended development providers: Resend, Brevo, or Mailtrap.

---

## 6. Subscription Enforcement

- Every new organisation starts on the **FreeTrial** plan.
- Feature flags (maximum hosts, data retention, webhook support, etc.) are evaluated against the current plan.
- Stripe payment collection is **out of scope for v1**. Only the data model and enforcement logic are required.

---

## 7. Security Checklist

- [ ] Passwords hashed with Argon2id (or bcrypt cost ≥ 12)
- [ ] JWT signing key stored outside source control
- [ ] All data queries filtered by OrganizationId / CorpCode
- [ ] Input validation on every endpoint
- [ ] Rate limiting on `/api/auth/login`
- [ ] HTTPS only in production
- [ ] No secrets written to logs
- [ ] CORS restricted to the frontend origin
- [ ] Service-to-API authentication is distinct from human authentication

---

## 8. Implementation Order Recommendation

1. Database + EF Core models + migrations  
2. Organisation / Auditor / AllowedDevice CRUD + authentication  
3. Ingest endpoint + persistence of sessions, reasons and events  
4. Notification pipeline (email first)  
5. Subscription data model + basic feature-flag checks  
6. Dashboard summary endpoint  

---

## 9. Related Documents

- `01_PROJECT_OVERVIEW_AND_ARCHITECTURE.md` — overall architecture and security principles
- `02_WINDOWS_WORKER_SERVICE.md` — payload contract and Worker behaviour
- `04_FRONTEND_AND_INTEGRATION.md` — how the React application consumes these endpoints
