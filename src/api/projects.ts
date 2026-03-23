import client from './client'
import type { Project, ProjectPayload, ProjectStatus, Paginated } from '@/types'

export async function getProjects(params?: {
  status?: ProjectStatus
  client_id?: number
  per_page?: number
  page?: number
}) {
  const res = await client.get<{ ok: true; data: Paginated<Project> }>('/projects', { params })
  return res.data.data
}

export async function getProject(id: number) {
  const res = await client.get<{ ok: true; data: Project }>(`/projects/${id}`)
  return res.data.data
}

export async function createProject(payload: ProjectPayload) {
  const res = await client.post<{ ok: true; data: Project }>('/projects', payload)
  return res.data
}

export async function updateProject(id: number, payload: ProjectPayload) {
  const res = await client.put<{ ok: true; data: Project }>(`/projects/${id}`, payload)
  return res.data
}

export async function deleteProject(id: number) {
  const res = await client.delete<{ ok: true; data: Record<string, never> }>(`/projects/${id}`)
  return res.data
}
