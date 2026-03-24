import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getSamples, createSample, deleteSample, updateSampleNotes } from '@/api/samples'
import { getClients } from '@/api/clients'
import { getProjects } from '@/api/projects'
import type { SampleListItem, SampleStatus, SamplePriority, Client, Project, SampleCreatePayload } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { EmptyState } from '@/components/EmptyState'
import { Pagination } from '@/components/Pagination'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { extractApiError, getFieldError } from '@/utils/errors'
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  formatDate,
} from '@/utils/format'

export function SamplesPage() {
  const { isAdmin } = useAuth()
  const [samples, setSamples] = useState<SampleListItem[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)

  const [filterStatus, setFilterStatus] = useState<SampleStatus | ''>('')
  const [filterPriority, setFilterPriority] = useState<SamplePriority | ''>('')
  const [filterClient, setFilterClient] = useState<number | ''>('')
  const [filterProject, setFilterProject] = useState<number | ''>('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SampleListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SampleListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getClients({ per_page: 100 }).then((d) => setClients(d.items)).catch(() => {})
  }, [])

  useEffect(() => {
    setFilterProject('')
    if (!filterClient) { setProjects([]); return }
    getProjects({ client_id: Number(filterClient), per_page: 100 })
      .then((d) => setProjects(d.items))
      .catch(() => {})
  }, [filterClient])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getSamples({
      status: filterStatus || undefined,
      priority: filterPriority || undefined,
      client_id: filterClient || undefined,
      project_id: filterProject || undefined,
      received_from: filterFrom || undefined,
      received_to: filterTo || undefined,
      page,
      per_page: 15,
    })
      .then((data) => {
        setSamples(data.items)
        setMeta(data.meta)
      })
      .catch(() => setError('Error al cargar muestras.'))
      .finally(() => setLoading(false))
  }, [filterStatus, filterPriority, filterClient, filterProject, filterFrom, filterTo, page])

  useEffect(() => { load() }, [load])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteSample(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sample Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track laboratory samples</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            + New Sample
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
        {/* Filtros */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-end">
          <div className="flex flex-wrap gap-4 items-end flex-1">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1 font-medium">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value as SampleStatus | ''); setPage(1) }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[140px]"
              >
                <option value="">All Statuses</option>
                {(['pending', 'in_progress', 'completed', 'cancelled'] as SampleStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1 font-medium">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => { setFilterPriority(e.target.value as SamplePriority | ''); setPage(1) }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[130px]"
              >
                <option value="">All Priorities</option>
                {(['standard', 'urgent'] as SamplePriority[]).map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1 font-medium">Client</label>
              <select
                value={filterClient}
                onChange={(e) => { setFilterClient(e.target.value ? Number(e.target.value) : ''); setPage(1) }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[150px]"
              >
                <option value="">All Clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1 font-medium">Project</label>
              <select
                value={filterProject}
                onChange={(e) => { setFilterProject(e.target.value ? Number(e.target.value) : ''); setPage(1) }}
                disabled={!filterClient}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[150px] disabled:opacity-50"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1 font-medium">Date From</label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => { setFilterFrom(e.target.value); setPage(1) }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1 font-medium">Date To</label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => { setFilterTo(e.target.value); setPage(1) }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 flex items-center gap-2 shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Excel
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 flex items-center gap-2 shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              PDF
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <Spinner className="py-16" />
          ) : error ? (
            <div className="p-6"><ErrorMessage message={error} /></div>
          ) : samples.length === 0 ? (
            <EmptyState message="No se encontraron muestras." />
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-xs font-semibold text-gray-900 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Received Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {samples.map((s) => {
                  const isUrgent = s.priority === 'urgent';
                  return (
                    <tr key={s.id} className={isUrgent ? 'bg-red-50/40 hover:bg-red-50' : 'bg-white hover:bg-gray-50'}>
                      <td className="px-6 py-3 text-gray-500">#{s.id}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">{s.code}</td>
                      <td className="px-6 py-3 text-gray-600">{s.client_name}</td>
                      <td className="px-6 py-3 text-gray-600">{s.project_name}</td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(s.received_at)}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${
                          s.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          s.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          s.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        } ${isUrgent && s.status === 'pending' ? 'bg-red-100 text-red-800 border-red-200' : ''}`}>
                          {isUrgent && s.status === 'pending' ? 'Urgent' : STATUS_LABELS[s.status]}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-3 text-gray-400">
                          <Link to={`/samples/${s.id}`} className="hover:text-blue-600" title="Ver">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </Link>
                          {isAdmin && (
                            <>
                              <button onClick={() => setEditTarget(s)} className="hover:text-amber-500" title="Editar notas">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button
                                onClick={() => setDeleteTarget(s)}
                                className="hover:text-red-500"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && !error && samples.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-500">Showing {((meta.current_page - 1) * 15) + 1} to {Math.min(meta.current_page * 15, meta.total)} of {meta.total} samples</span>
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              total={meta.total}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {modalOpen && (
        <SampleCreateModal
          clients={clients}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load() }}
        />
      )}

      {editTarget && (
        <EditNotesModal
          sample={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load() }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`¿Eliminar la muestra "${deleteTarget.code}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}

function SampleCreateModal({
  clients,
  onClose,
  onSaved,
}: {
  clients: Client[]
  onClose: () => void
  onSaved: () => void
}) {
  const [selectedClient, setSelectedClient] = useState<number | ''>(clients[0]?.id ?? '')
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  const [form, setForm] = useState<SampleCreatePayload>({
    project_id: 0,
    code: '',
    priority: 'standard',
    received_at: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedClient) { setProjects([]); return }
    setLoadingProjects(true)
    getProjects({ client_id: Number(selectedClient), per_page: 100 })
      .then((d) => {
        setProjects(d.items)
        setForm((f) => ({ ...f, project_id: d.items[0]?.id ?? 0 }))
      })
      .finally(() => setLoadingProjects(false))
  }, [selectedClient])

  function set<K extends keyof SampleCreatePayload>(field: K, value: SampleCreatePayload[K]) {
    setForm((f) => ({ ...f, [field]: value }))
    setFieldErrors((e) => ({ ...e, [field]: [] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createSample({ ...form, notes: form.notes || undefined })
      onSaved()
    } catch (err) {
      const apiErr = extractApiError(err)
      if (apiErr?.error.code === 'VALIDATION_ERROR') {
        setFieldErrors(apiErr.error.details)
      } else {
        setError(apiErr?.error.message ?? 'Error al crear muestra.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Nueva muestra" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value ? Number(e.target.value) : '')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Proyecto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto *</label>
          {loadingProjects ? (
            <p className="text-sm text-gray-400">Cargando proyectos...</p>
          ) : (
            <select
              value={form.project_id}
              onChange={(e) => set('project_id', Number(e.target.value))}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          {getFieldError(fieldErrors, 'project_id') && (
            <p className="text-xs text-red-600 mt-1">{getFieldError(fieldErrors, 'project_id')}</p>
          )}
        </div>

        {/* Código */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => set('code', e.target.value)}
            required
            placeholder="SAMPLE-001"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError(fieldErrors, 'code') ? 'border-red-400' : ''
            }`}
          />
          {getFieldError(fieldErrors, 'code') && (
            <p className="text-xs text-red-600 mt-1">{getFieldError(fieldErrors, 'code')}</p>
          )}
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
          <div className="flex gap-4">
            {(['standard', 'urgent'] as SamplePriority[]).map((p) => (
              <label key={p} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={p}
                  checked={form.priority === p}
                  onChange={() => set('priority', p)}
                  className="accent-blue-600"
                />
                <span className="text-sm">{PRIORITY_LABELS[p]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fecha recepción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de recepción *</label>
          <input
            type="date"
            value={form.received_at}
            onChange={(e) => set('received_at', e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
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
            {loading ? 'Creando...' : 'Crear muestra'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function EditNotesModal({
  sample,
  onClose,
  onSaved,
}: {
  sample: SampleListItem
  onClose: () => void
  onSaved: () => void
}) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await updateSampleNotes(sample.id, notes)
      onSaved()
    } catch {
      setError('Error al guardar las notas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={`Notas — ${sample.code}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Escribe las notas de esta muestra..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
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
