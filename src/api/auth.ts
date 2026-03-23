import client from './client'
import type { LoginResponse, AuthUser, RefreshResponse } from '@/types'

export async function login(email: string, password: string) {
  const res = await client.post<{ ok: true; data: LoginResponse }>('/auth/login', { email, password })
  return res.data
}

export async function logout() {
  const res = await client.post<{ ok: true; data: Record<string, never> }>('/auth/logout')
  return res.data
}

export async function refresh() {
  const res = await client.post<{ ok: true; data: RefreshResponse }>('/auth/refresh')
  return res.data
}

export async function getMe() {
  const res = await client.get<{ ok: true; data: AuthUser }>('/me')
  return res.data
}
