import axios from 'axios'

export interface ApiErrorShape {
  ok: false
  error: {
    code: string
    message: string
    details: Record<string, string[]>
  }
}

export function extractApiError(err: unknown): ApiErrorShape | null {
  if (axios.isAxiosError(err) && err.response?.data) {
    const data = err.response.data as ApiErrorShape
    if (data.ok === false) return data
  }
  return null
}

export function getFieldError(
  details: Record<string, string[]> | undefined,
  field: string
): string | undefined {
  return details?.[field]?.[0]
}
