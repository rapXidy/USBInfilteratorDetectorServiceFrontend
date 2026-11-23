/** Session / alert DTOs — mirror `SessionDtos.cs`. */

/** Row of GET /api/sessions. `id` is the DB id (use it for `/sessions/:id`); `sessionId` is the Worker's GUID. */
export interface SessionListItem {
  id: string
  sessionId: string
  hostName: string
  deviceSerial: string
  vendor: string | null
  model: string | null
  connectedAt: string
  disconnectedAt: string | null
  totalBytesWritten: number
  riskScore: number
  detectionComplete: boolean
}

/** One explainable detection rule that contributed to a session's risk score. */
export interface SessionReason {
  ruleName: string
  weight: number
  description: string
  /** Windows Event Log record ids that support this reason. */
  eventRecordIds: number[]
}

/** Raw Windows event captured for a session. */
export interface RawEvent {
  eventId: number
  recordId: number
  timeCreated: string
  activity: string
  description: string | null
}

/** GET /api/sessions/{id} — full detail with reasons + events. */
export interface SessionDetail {
  id: string
  sessionId: string
  hostName: string
  loggedInUser: string | null
  deviceSerial: string
  vendor: string | null
  model: string | null
  connectedAt: string
  disconnectedAt: string | null
  totalBytesWritten: number
  riskScore: number
  detectionComplete: boolean
  reasons: SessionReason[]
  events: RawEvent[]
}

/** Row of GET /api/alerts. NOTE: navigate with `usbSessionId` (DB id), not `sessionId`. */
export interface Alert {
  sessionId: string
  usbSessionId: string
  hostName: string
  deviceSerial: string
  riskScore: number
  detectionComplete: boolean
  connectedAt: string
  topReasons: SessionReason[]
}

/** Query-string filters for GET /api/sessions. */
export interface SessionsQuery {
  fromUtc?: string
  toUtc?: string
  minRiskScore?: number
  host?: string
  deviceSerial?: string
  detectionComplete?: boolean
  skip?: number
  take?: number
}
