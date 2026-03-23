import { useEffect, useState } from 'react'
import { getMetrics, getRecentSamples, getRecentActivity } from '@/api/dashboard'
import type { DashboardMetrics, RecentSampleItem, RecentActivityItem } from '@/types'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Badge } from '@/components/Badge'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  timeAgo,
} from '@/utils/format'

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [samples, setSamples] = useState<RecentSampleItem[]>([])
  const [activity, setActivity] = useState<RecentActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getMetrics(), getRecentSamples(5), getRecentActivity(10)])
      .then(([m, s, a]) => {
        setMetrics(m)
        setSamples(s.items)
        setActivity(a.items)
      })
      .catch(() => setError('Error al cargar el dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner className="py-20" />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Command center for laboratory operations</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <MetricCard label="Total Samples" value={metrics?.total_samples ?? 0} color="blue" icon={<svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} />
        <MetricCard label="Urgent Samples" value={metrics?.urgent_samples ?? 0} color="red" icon={<svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <MetricCard label="Pending Analysis" value={metrics?.pending_analysis ?? 0} color="yellow" icon={<svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <MetricCard label="Completion Rate" value={`${metrics?.completion_rate ?? 0}%`} color="green" icon={<svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} isCircleValue />
        <MetricCard label="Rejection Rate" value={`${metrics?.rejection_rate ?? 0}%`} color="orange" icon={<svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>} isCircleValue />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 tracking-tight">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {activity.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-gray-400">Sin actividad.</p>
            )}
            {activity.map((a) => (
              <div key={a.id} className="px-6 py-4 flex items-start gap-4">
                <div className="mt-1 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{a.user_name}</span>{' '}
                    <span className="text-gray-600">{a.description.replace(a.user_name, '')}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {timeAgo(a.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Samples */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 tracking-tight">Recent Samples</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-gray-100 text-gray-500 text-xs">
                <tr>
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {samples.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No hay muestras.</td></tr>
                )}
                {samples.map((s) => (
                  <tr key={s.id} className={s.priority === 'urgent' ? 'bg-red-50/50' : 'bg-white'}>
                    <td className="px-6 py-4 text-gray-500">#{s.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{s.code}</td>
                    <td className="px-6 py-4 text-gray-600">{s.client_name}</td>
                    <td className="px-6 py-4">
                      <Badge label={STATUS_LABELS[s.status]} colorClass={STATUS_COLORS[s.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  color,
  icon,
  isCircleValue = false,
}: {
  label: string
  value: number | string
  color: 'blue' | 'red' | 'yellow' | 'green' | 'orange'
  icon?: React.ReactNode
  isCircleValue?: boolean
}) {
  const styles = {
    blue: 'bg-[#eff6ff] border-blue-200 text-blue-900',
    red: 'bg-[#fef2f2] border-red-200 text-red-900',
    yellow: 'bg-[#fffbeb] border-yellow-200 text-yellow-900',
    green: 'bg-[#f0fdf4] border-green-200 text-green-900',
    orange: 'bg-[#fff7ed] border-orange-200 text-orange-900',
  }[color]

  return (
    <div className={`rounded-xl border p-5 flex flex-col justify-between h-32 ${styles} shadow-sm`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium opacity-80">{label}</p>
        {icon && <div className="p-1 rounded-full bg-white bg-opacity-50">{icon}</div>}
      </div>
      <div className="mt-2">
        {isCircleValue ? (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-4 border-green-500 bg-white shadow-sm">
            <span className="text-sm font-bold text-gray-900">{value}</span>
          </div>
        ) : (
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        )}
      </div>
    </div>
  )
}
