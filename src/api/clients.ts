import client from './client'
import type { Client, ClientPayload, Paginated } from '@/types'

export async function getClients(params?: { search?: string; per_page?: number; page?: number }) {
  const res = await client.get<{ ok: true; data: Paginated<Client> }>('/clients', { params })
  return res.data.data
}

export async function getClient(id: number) {
  const res = await client.get<{ ok: true; data: Client }>(`/clients/${id}`)
  return res.data.data
}

export async function createClient(payload: ClientPayload) {
  const res = await client.post<{ ok: true; data: Client }>('/clients', payload)
  return res.data
}

export async function updateClient(id: number, payload: ClientPayload) {
  const res = await client.put<{ ok: true; data: Client }>(`/clients/${id}`, payload)
  return res.data
}

export async function deleteClient(id: number) {
  const res = await client.delete<{ ok: true; data: Record<string, never> }>(`/clients/${id}`)
  return res.data
}
