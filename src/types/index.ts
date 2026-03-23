// ── Envelope ──────────────────────────────────────────────
export interface ApiOk<T> {
  ok: true
  data: T
  message: string
}

export interface ApiError {
  ok: false
  error: {
    code: string
    message: string
    details: Record<string, string[]>
  }
}

export type ApiResponse<T> = ApiOk<T> | ApiError

// ── Pagination ────────────────────────────────────────────
export interface PaginatedMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface Paginated<T> {
  items: T[]
  meta: PaginatedMeta
}

// ── Auth ──────────────────────────────────────────────────
export interface AuthUser {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export interface LoginResponse {
  token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

export interface RefreshResponse {
  token: string
  token_type: string
  expires_in: number
}

// ── Client ────────────────────────────────────────────────
export interface Client {
  id: number
  name: string
  contact_email: string | null
  contact_phone: string | null
  location: string | null
  created_by: number
  updated_by: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ClientPayload {
  name: string
  contact_email?: string | null
  contact_phone?: string | null
  location?: string | null
}

// ── Project ───────────────────────────────────────────────
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'archived'

export interface Project {
  id: number
  client_id: number
  name: string
  status: ProjectStatus
  started_at: string | null
  ended_at: string | null
  description: string | null
  created_by: number
  updated_by: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ProjectPayload {
  client_id: number
  name: string
  status: ProjectStatus
  started_at?: string | null
  ended_at?: string | null
  description?: string | null
}

// ── Sample ────────────────────────────────────────────────
export type SampleStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type SamplePriority = 'standard' | 'urgent'

export interface LatestResultSummary {
  result_summary: string
  analyzed_at: string
  analyst_name: string
}

export interface SampleResult {
  id: number
  result_summary: string
  result_data: Record<string, unknown>
  analyzed_at: string
  analyst_name: string
}

export interface SampleListItem {
  id: number
  code: string
  status: SampleStatus
  priority: SamplePriority
  project_id: number
  project_name: string
  client_id: number
  client_name: string
  received_at: string
  latest_result_summary: LatestResultSummary | null
  latest_result_at: string | null
  results_count: number
  created_by_name: string
  updated_at: string
}

export interface SampleDetail extends SampleListItem {
  notes: string | null
  analysis_started_at: string | null
  completed_at: string | null
  rejection_count: number
  results: SampleResult[]
  latest_result: SampleResult | null
}

export interface SampleCreatePayload {
  project_id: number
  code: string
  priority: SamplePriority
  received_at: string
  notes?: string
}

export interface SampleResultPayload {
  result_summary: string
  result_data?: Record<string, unknown>
}

// ── Sample Events ─────────────────────────────────────────
export type SampleEventType =
  | 'created'
  | 'updated'
  | 'analysis_started'
  | 'priority_changed'
  | 'status_changed'
  | 'result_added'
  | 'completed'
  | 'deleted'
  | 'restored'

export interface SampleEvent {
  id: number
  event_type: SampleEventType
  description: string
  old_status: SampleStatus | null
  new_status: SampleStatus | null
  old_priority: SamplePriority | null
  new_priority: SamplePriority | null
  metadata: unknown
  user_name: string
  created_at: string
}

// ── Dashboard ─────────────────────────────────────────────
export interface DashboardMetrics {
  total_samples: number
  urgent_samples: number
  pending_analysis: number
  completion_rate: number
  rejection_rate: number
}

export interface RecentSampleItem {
  id: number
  code: string
  status: SampleStatus
  priority: SamplePriority
  received_at: string
  project_id: number
  project_name: string
  client_id: number
  client_name: string
  latest_result_summary: string | null
  latest_result_at: string | null
  updated_at: string
}

export interface RecentActivityItem {
  id: number
  event_type: SampleEventType
  description: string
  sample_id: number
  sample_code: string
  user_id: number
  user_name: string
  created_at: string
  metadata: Record<string, unknown>
}

// ── Settings ──────────────────────────────────────────────
export interface UserProfile {
  id: number
  name: string
  email: string
  roles: string[]
}

export interface UserPreferences {
  notify_urgent_sample_alerts: boolean
  notify_sample_completion: boolean
  notify_daily_activity_digest: boolean
  notify_project_updates: boolean
}
