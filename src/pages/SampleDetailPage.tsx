import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getSample,
  updateSampleStatus,
  updateSamplePriority,
  addSampleResult,
  getSampleEvents,
  updateSampleNotes,
} from '@/api/samples'
import type { SampleDetail, SampleStatus, SamplePriority, SampleEvent } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Badge } from '@/components/Badge'
import { Pagination } from '@/components/Pagination'
import { extractApiError } from '@/utils/errors'
import {
  STATUS_LABELS, STATUS_COLORS,
  PRIORITY_LABELS, PRIORITY_COLORS,
  EVENT_TYPE_LABELS,
  formatDate, formatDateTime,
} from '@/utils/format'

export function SampleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const [sample, setSample] = useState<SampleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function reload() {
    if (!id) return
    setLoading(true)
    getSample(Number(id))
      .then(setSample)
      .catch(() => setError('Error al cargar la muestra.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [id])

  if (loading) return <Spinner className="py-20" />
  if (error || !sample) return <ErrorMessage message={error || 'Muestra no encontrada.'} />

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        <Link to="/samples" className="hover:text-blue-600">Muestras</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">{sample.code}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sample.code}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {sample.client_name} · {sample.project_name}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge label={STATUS_LABELS[sample.status]} colorClass={STATUS_COLORS[sample.status]} />
            <Badge label={PRIORITY_LABELS[sample.priority]} colorClass={PRIORITY_COLORS[sample.priority]} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Info label="Recibida" value={formatDate(sample.received_at)} />
          <Info label="Análisis iniciado" value={formatDateTime(sample.analysis_started_at)} />
          <Info label="Completada" value={formatDateTime(sample.completed_at)} />
          <Info label="Creada por" value={sample.created_by_name} />
          <Info label="Resultados" value={String(sample.results_count)} />
          <div>
            <p className="text-xs text-gray-400">Ciclos de retrabajo</p>
            <p className={`font-medium ${sample.rejection_count > 0 ? 'text-orange-600' : 'text-gray-700'}`}>
              {sample.rejection_count > 0
                ? `${sample.rejection_count} vez${sample.rejection_count > 1 ? 'ces' : ''}`
                : '—'}
            </p>
          </div>
        </div>

        {sample.notes !== undefined && (
          <NotesSection
            notes={sample.notes}
            sampleId={sample.id}
            isAdmin={isAdmin}
            onSaved={reload}
          />
        )}
      </div>

      {/* Cambiar estado */}
      <StatusSection sample={sample} onUpdated={setSample} />

      {/* Cambiar prioridad — solo admin */}
      {isAdmin && <PrioritySection sample={sample} onUpdated={setSample} />}

      {/* Agregar resultado */}
      <AddResultSection sampleId={sample.id} onAdded={reload} />

      {/* Historial de resultados */}
      {sample.results.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Historial de resultados</h2>
          <div className="space-y-4">
            {[...sample.results]
              .sort((a, b) => new Date(b.analyzed_at).getTime() - new Date(a.analyzed_at).getTime())
              .map((r) => (
                <div key={r.id} className="border rounded-lg p-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>{r.analyst_name}</span>
                    <span>{formatDateTime(r.analyzed_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{r.result_summary}</p>
                  {Object.keys(r.result_data).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">Ver datos</summary>
                      <pre className="mt-2 text-xs bg-gray-50 rounded p-3 overflow-auto">
                        {JSON.stringify(r.result_data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Bitácora de eventos */}
      <EventsSection sampleId={sample.id} />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-700 font-medium">{value}</p>
    </div>
  )
}

function NotesSection({
  notes,
  sampleId,
  isAdmin,
  onSaved,
}: {
  notes: string | null
  sampleId: number
  isAdmin: boolean
  onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(notes ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      await updateSampleNotes(sampleId, value)
      onSaved()
      setEditing(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <p className="text-xs text-gray-400 mb-1">Notas</p>
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <p className="text-sm text-gray-600">{notes || '—'}</p>
          {isAdmin && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-blue-600 hover:underline shrink-0"
            >
              Editar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function StatusSection({
  sample,
  onUpdated,
}: {
  sample: SampleDetail
  onUpdated: (s: SampleDetail) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const statuses: SampleStatus[] = ['pending', 'in_progress', 'completed', 'cancelled']

  async function handleChange(status: SampleStatus) {
    if (status === sample.status) return
    setLoading(true)
    setError('')
    try {
      const res = await updateSampleStatus(sample.id, status)
      if (res.ok) onUpdated(res.data)
    } catch (err) {
      const apiErr = extractApiError(err)
      setError(apiErr?.error.message ?? 'Error al cambiar estado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h2 className="font-semibold text-gray-800 mb-3">Estado</h2>
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => handleChange(s)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-60 ${
              s === sample.status
                ? STATUS_COLORS[s] + ' border-transparent'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}

function PrioritySection({
  sample,
  onUpdated,
}: {
  sample: SampleDetail
  onUpdated: (s: SampleDetail) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(priority: SamplePriority) {
    if (priority === sample.priority) return
    setLoading(true)
    setError('')
    try {
      const res = await updateSamplePriority(sample.id, priority)
      if (res.ok) onUpdated(res.data)
    } catch (err) {
      const apiErr = extractApiError(err)
      setError(apiErr?.error.message ?? 'Error al cambiar prioridad.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h2 className="font-semibold text-gray-800 mb-3">Prioridad</h2>
      <div className="flex gap-2">
        {(['standard', 'urgent'] as SamplePriority[]).map((p) => (
          <button
            key={p}
            onClick={() => handleChange(p)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-60 ${
              p === sample.priority
                ? PRIORITY_COLORS[p] + ' border-transparent'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {PRIORITY_LABELS[p]}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}

function AddResultSection({ sampleId, onAdded }: { sampleId: number; onAdded: () => void }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      await addSampleResult(sampleId, { result_summary: summary })
      setSummary('')
      setSuccess(true)
      onAdded()
    } catch (err) {
      const apiErr = extractApiError(err)
      setError(apiErr?.error.message ?? 'Error al agregar resultado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h2 className="font-semibold text-gray-800 mb-3">Agregar resultado</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={summary}
          onChange={(e) => { setSummary(e.target.value); setSuccess(false) }}
          required
          rows={3}
          placeholder="Resumen del análisis..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Resultado agregado correctamente.</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Agregar resultado'}
        </button>
      </form>
    </div>
  )
}

function EventsSection({ sampleId }: { sampleId: number }) {
  const [events, setEvents] = useState<SampleEvent[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getSampleEvents(sampleId, { page, per_page: 20 })
      .then((data) => {
        setEvents(data.items)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }, [sampleId, page])

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Bitácora de eventos</h2>
      {loading ? (
        <Spinner className="py-8" />
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400">Sin eventos.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b">
              <tr>
                <th className="pb-2 text-left">Fecha</th>
                <th className="pb-2 text-left">Tipo</th>
                <th className="pb-2 text-left">Descripción</th>
                <th className="pb-2 text-left">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50">
                  <td className="py-2 pr-4 text-gray-400 whitespace-nowrap">{formatDateTime(ev.created_at)}</td>
                  <td className="py-2 pr-4">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      {EVENT_TYPE_LABELS[ev.event_type]}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{ev.description}</td>
                  <td className="py-2 text-gray-500">{ev.user_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            total={meta.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
