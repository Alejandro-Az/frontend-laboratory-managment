import client from './client'
import type {
  SampleListItem,
  SampleDetail,
  SampleStatus,
  SamplePriority,
  SampleCreatePayload,
  SampleResultPayload,
  SampleEvent,
  Paginated,
} from '@/types'

export async function getSamples(params?: {
  status?: SampleStatus
  priority?: SamplePriority
  client_id?: number
  project_id?: number
  received_from?: string
  received_to?: string
  per_page?: number
  page?: number
}) {
  const res = await client.get<{ ok: true; data: Paginated<SampleListItem> }>('/samples', { params })
  return res.data.data
}

export async function getSample(id: number) {
  const res = await client.get<{ ok: true; data: SampleDetail }>(`/samples/${id}`)
  return res.data.data
}

export async function createSample(payload: SampleCreatePayload) {
  const res = await client.post<{ ok: true; data: SampleDetail }>('/samples', payload)
  return res.data
}

export async function updateSampleNotes(id: number, notes: string) {
  const res = await client.put<{ ok: true; data: SampleDetail }>(`/samples/${id}`, { notes })
  return res.data
}

export async function deleteSample(id: number) {
  const res = await client.delete<{ ok: true; data: Record<string, never> }>(`/samples/${id}`)
  return res.data
}

export async function restoreSample(id: number) {
  const res = await client.post<{ ok: true; data: SampleDetail }>(`/samples/${id}/restore`)
  return res.data
}

export async function updateSampleStatus(id: number, status: SampleStatus) {
  const res = await client.patch<{ ok: true; data: SampleDetail }>(`/samples/${id}/status`, { status })
  return res.data
}

export async function updateSamplePriority(id: number, priority: SamplePriority) {
  const res = await client.patch<{ ok: true; data: SampleDetail }>(`/samples/${id}/priority`, { priority })
  return res.data
}

export async function addSampleResult(id: number, payload: SampleResultPayload) {
  const res = await client.post<{ ok: true; data: SampleDetail }>(`/samples/${id}/results`, payload)
  return res.data
}

export async function getSampleEvents(id: number, params?: { per_page?: number; page?: number }) {
  const res = await client.get<{ ok: true; data: Paginated<SampleEvent> }>(`/samples/${id}/events`, { params })
  return res.data.data
}
