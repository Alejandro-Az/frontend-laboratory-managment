import client from './client'
import type { UserProfile, UserPreferences } from '@/types'

export async function getProfile() {
  const res = await client.get<{ ok: true; data: UserProfile }>('/settings/profile')
  return res.data.data
}

export async function updateProfile(payload: { name: string; email: string }) {
  const res = await client.patch<{ ok: true; data: UserProfile }>('/settings/profile', payload)
  return res.data
}

export async function getPreferences() {
  const res = await client.get<{ ok: true; data: UserPreferences }>('/settings/preferences')
  return res.data.data
}

export async function updatePreferences(payload: UserPreferences) {
  const res = await client.patch<{ ok: true; data: UserPreferences }>('/settings/preferences', payload)
  return res.data
}

export async function changePassword(payload: {
  current_password: string
  password: string
  password_confirmation: string
}) {
  const res = await client.post<{ ok: true; data: Record<string, never> }>('/settings/change-password', payload)
  return res.data
}
