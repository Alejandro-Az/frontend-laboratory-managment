import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from './Spinner'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <Spinner className="min-h-screen" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
