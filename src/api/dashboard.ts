import client from './client'
import type { DashboardMetrics, RecentSampleItem, RecentActivityItem } from '@/types'

export async function getMetrics() {
  const res = await client.get<{ ok: true; data: DashboardMetrics }>('/dashboard/metrics')
  return res.data.data
}

export async function getRecentSamples(limit = 5) {
  const res = await client.get<{ ok: true; data: { items: RecentSampleItem[]; meta: { count: number } } }>(
    '/dashboard/recent-samples',
    { params: { limit } }
  )
  return res.data.data
}

export async function getRecentActivity(limit = 10) {
  const res = await client.get<{ ok: true; data: { items: RecentActivityItem[]; meta: { count: number } } }>(
    '/dashboard/recent-activity',
    { params: { limit } }
  )
  return res.data.data
}
