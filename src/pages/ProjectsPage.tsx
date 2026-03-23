import { useEffect, useState, useCallback } from 'react'
import { getProjects, createProject, updateProject, deleteProject } from '@/api/projects'
import { getClients } from '@/api/clients'
import type { Project, ProjectPayload, ProjectStatus, Client } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { EmptyState } from '@/components/EmptyState'
import { Pagination } from '@/components/Pagination'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Badge } from '@/components/Badge'
import { extractApiError, getFieldError } from '@/utils/errors'
import { formatDate, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/utils/format'

const STATUS_OPTIONS: ProjectStatus[] = ['active', 'completed', 'on_hold', 'archived']

export function ProjectsPage() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | ''>('')
  const [filterClient, setFilterClient] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getClients({ per_page: 100 }).then((d) => setClients(d.items)).catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getProjects({
      status: filterStatus || undefined,
      client_id: filterClient || undefined,
      page,
      per_page: 15,
    })
      .then((data) => {
        setProjects(data.items)
        setMeta(data.meta)
      })
      .catch(() => setError('Error al cargar proyectos.'))
      .finally(() => setLoading(false))
  }, [filterStatus, filterClient, page])

  useEffect(() => { load() }, [load])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProject(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  function clientName(clientId: number) {
    return clients.find((c) => c.id === clientId)?.name ?? `#${clientId}`
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage laboratory research projects</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            + New Project
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex gap-4 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as ProjectStatus | ''); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
            ))}
          </select>

          <select
            value={filterClient}
            onChange={(e) => { setFilterClient(e.target.value ? Number(e.target.value) : ''); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <Spinner className="py-16" />
        ) : error ? (
          <div className="p-6"><ErrorMessage message={error} /></div>
        ) : projects.length === 0 ? (
          <EmptyState message="No se encontraron proyectos." />
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div key={p.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 border border-blue-100 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        label={PROJECT_STATUS_LABELS[p.status]}
                        colorClass={p.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 border' : PROJECT_STATUS_COLORS[p.status]}
                      />
                      {isAdmin && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button onClick={() => { setEditing(p); setModalOpen(true) }} className="text-gray-400 hover:text-blue-600 p-1" title="Editar">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => setDeleteTarget(p)} className="text-gray-400 hover:text-red-600 p-1" title="Eliminar">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base">{p.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-2 gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {clientName(p.client_id)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1 gap-2 mb-6">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Started {formatDate(p.started_at)}
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col">
                    <span className="text-xl font-bold text-gray-900">1</span>
                    <span className="text-xs text-gray-500">Total Samples</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4 border-gray-100">
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                total={meta.total}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <ProjectFormModal
          project={editing}
          clients={clients}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load() }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`¿Eliminar el proyecto "${deleteTarget.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}

function ProjectFormModal({
  project,
  clients,
  onClose,
  onSaved,
}: {
  project: Project | null
  clients: Client[]
  onClose: () => void
  onSaved: () => void
}) {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<ProjectPayload>({
    client_id: project?.client_id ?? (clients[0]?.id ?? 0),
    name: project?.name ?? '',
    status: project?.status ?? 'active',
    started_at: project?.started_at?.split('T')[0] ?? '',
    ended_at: project?.ended_at?.split('T')[0] ?? '',
    description: project?.description ?? '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof ProjectPayload>(field: K, value: ProjectPayload[K]) {
    setForm((f) => ({ ...f, [field]: value }))
    setFieldErrors((e) => ({ ...e, [field]: [] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const payload: ProjectPayload = {
      ...form,
      started_at: form.started_at || null,
      ended_at: form.ended_at || null,
      description: form.description || null,
    }
    try {
      if (project) {
        await updateProject(project.id, payload)
      } else {
        await createProject(payload)
      }
      onSaved()
    } catch (err) {
      const apiErr = extractApiError(err)
      if (apiErr?.error.code === 'VALIDATION_ERROR') {
        setFieldErrors(apiErr.error.details)
      } else {
        setError(apiErr?.error.message ?? 'Error al guardar.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={project ? 'Editar proyecto' : 'Nuevo proyecto'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
          <select
            value={form.client_id}
            onChange={(e) => set('client_id', Number(e.target.value))}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {getFieldError(fieldErrors, 'client_id') && (
            <p className="text-xs text-red-600 mt-1">{getFieldError(fieldErrors, 'client_id')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {getFieldError(fieldErrors, 'name') && (
            <p className="text-xs text-red-600 mt-1">{getFieldError(fieldErrors, 'name')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value as ProjectStatus)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <input
              type="date"
              value={form.started_at ?? ''}
              min={today}
              onChange={(e) => set('started_at', e.target.value || null)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
            <input
              type="date"
              value={form.ended_at ?? ''}
              onChange={(e) => set('ended_at', e.target.value || null)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value || null)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

