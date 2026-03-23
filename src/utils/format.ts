import type { SampleStatus, SamplePriority, ProjectStatus, SampleEventType } from '@/types'

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  // Strings tipo "YYYY-MM-DD" se parsean como medianoche UTC.
  // Forzamos timeZone:'UTC' para evitar el desfase de un día en zonas negativas.
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(isDateOnly ? { timeZone: 'UTC' } : {}),
  })
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

export const STATUS_LABELS: Record<SampleStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export const STATUS_COLORS: Record<SampleStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const PRIORITY_LABELS: Record<SamplePriority, string> = {
  standard: 'Estándar',
  urgent: 'Urgente',
}

export const PRIORITY_COLORS: Record<SamplePriority, string> = {
  standard: 'bg-gray-100 text-gray-700',
  urgent: 'bg-orange-100 text-orange-800',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Activo',
  completed: 'Completado',
  on_hold: 'En espera',
  archived: 'Archivado',
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-gray-100 text-gray-700',
}

export const EVENT_TYPE_LABELS: Record<SampleEventType, string> = {
  created: 'Muestra creada',
  updated: 'Notas actualizadas',
  analysis_started: 'Análisis iniciado',
  priority_changed: 'Prioridad cambiada',
  status_changed: 'Estado cambiado',
  result_added: 'Resultado agregado',
  completed: 'Completada',
  deleted: 'Eliminada',
  restored: 'Restaurada',
}
