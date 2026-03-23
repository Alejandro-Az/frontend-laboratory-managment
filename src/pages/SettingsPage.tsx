import { useEffect, useState } from 'react'
import { getProfile, updateProfile, getPreferences, updatePreferences, changePassword } from '@/api/settings'
import type { UserProfile, UserPreferences } from '@/types'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { extractApiError, getFieldError } from '@/utils/errors'

export function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure system preferences</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <ProfileSection />
        <PreferencesSection />
        <ChangePasswordSection />
        <DataManagementSection />
      </div>
    </div>
  )
}

function SectionCard({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden h-full">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className="font-semibold text-gray-800 tracking-tight text-lg">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function ProfileSection() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p)
        setForm({ name: p.name, email: p.email })
      })
      .catch(() => setError('Error al cargar el perfil.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})
    setSuccess(false)
    try {
      const res = await updateProfile(form)
      if (res.ok) {
        setProfile(res.data)
        setSuccess(true)
      }
    } catch (err) {
      const apiErr = extractApiError(err)
      if (apiErr?.error.code === 'VALIDATION_ERROR') {
        setFieldErrors(apiErr.error.details)
      } else {
        setError(apiErr?.error.message ?? 'Error al guardar.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner className="py-8" />

  const icon = (
    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    </div>
  )

  return (
    <SectionCard title="User Profile" icon={icon}>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setSuccess(false) }}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {getFieldError(fieldErrors, 'name') && (
            <p className="text-xs text-red-600 mt-1">{getFieldError(fieldErrors, 'name')}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setSuccess(false) }}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {getFieldError(fieldErrors, 'email') && (
            <p className="text-xs text-red-600 mt-1">{getFieldError(fieldErrors, 'email')}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
          <input
            type="text"
            value={profile?.roles[0] ?? ''}
            readOnly
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {success ? <p className="text-sm text-green-600">Saved</p> : <div />}
          {form.name !== profile?.name || form.email !== profile?.email ? (
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          ) : null}
        </div>
      </form>
    </SectionCard>
  )
}

function PreferencesSection() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPreferences()
      .then(setPrefs)
      .catch(() => setError('Error al cargar preferencias.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(key: keyof UserPreferences) {
    if (!prefs) return
    const newPrefs = { ...prefs, [key]: !prefs[key] }
    setPrefs(newPrefs)
    try {
      await updatePreferences(newPrefs)
    } catch {
      setPrefs(prefs) // revert
      setError('Error al guardar preferencias.')
    }
  }

  if (loading) return <Spinner className="py-8" />
  if (!prefs) return <ErrorMessage message={error} />

  const labels: Record<keyof UserPreferences, string> = {
    notify_urgent_sample_alerts: 'Urgent sample alerts',
    notify_sample_completion: 'Sample completion notifications',
    notify_daily_activity_digest: 'Daily activity digest',
    notify_project_updates: 'Project updates',
  }

  const icon = (
    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    </div>
  )

  return (
    <SectionCard title="Notifications" icon={icon}>
      {error && <ErrorMessage message={error} />}
      <div className="space-y-4">
        {(Object.keys(labels) as (keyof UserPreferences)[]).map((key) => (
          <label key={key} className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{labels[key]}</span>
            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${prefs[key] ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={() => handleToggle(key)}
                className="hidden"
              />
              {prefs[key] && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              )}
            </div>
          </label>
        ))}
      </div>
    </SectionCard>
  )
}

function ChangePasswordSection() {
  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setFieldErrors((e) => ({ ...e, [field]: [] }))
    setError('')
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      await changePassword(form)
      setForm({ current_password: '', password: '', password_confirmation: '' })
      setSuccess(true)
      setTimeout(() => setIsOpen(false), 2000)
    } catch (err) {
      const apiErr = extractApiError(err)
      if (apiErr?.error.code === 'VALIDATION_ERROR') {
        setFieldErrors(apiErr.error.details)
      } else if (apiErr?.error.code === 'INVALID_PASSWORD') {
        setError('La contraseña actual es incorrecta.')
      } else {
        setError(apiErr?.error.message ?? 'Error al cambiar contraseña.')
      }
    } finally {
      setLoading(false)
    }
  }

  const icon = (
    <div className="p-2 bg-red-50 text-red-500 rounded-lg">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    </div>
  )

  return (
    <SectionCard title="Security" icon={icon}>
      <div className="space-y-3">
        {!isOpen ? (
          <>
            <button onClick={() => setIsOpen(true)} className="w-full text-center py-2.5 px-4 border border-gray-200 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
              Change Password
            </button>
            <button className="w-full text-center py-2.5 px-4 border border-gray-200 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
              Two-Factor Authentication
            </button>
            <button className="w-full text-center py-2.5 px-4 border border-gray-200 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
              View Login History
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'current_password' as const, label: 'Current Password' },
              { key: 'password' as const, label: 'New Password' },
              { key: 'password_confirmation' as const, label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                <input
                  type="password"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  required
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    getFieldError(fieldErrors, key) ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {getFieldError(fieldErrors, key) && (
                  <p className="text-xs text-red-600 mt-1">{getFieldError(fieldErrors, key)}</p>
                )}
              </div>
            ))}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">Password changed.</p>}

            <div className="flex gap-2">
              <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2 border rounded-md text-gray-700 text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-60 shadow-sm">
                {loading ? 'Saving...' : 'Save Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </SectionCard>
  )
}

function DataManagementSection() {
  const icon = (
    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
    </div>
  )

  return (
    <SectionCard title="Data Management" icon={icon}>
      <div className="space-y-3">
        <button className="w-full text-center py-2.5 px-4 border border-gray-200 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
          Export All Data
        </button>
        <button className="w-full text-center py-2.5 px-4 border border-gray-200 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
          Import Data
        </button>
        <button className="w-full text-center py-2.5 px-4 border border-red-200 rounded-md text-sm text-red-600 font-medium hover:bg-red-50 transition-colors shadow-sm mt-4">
          Clear All Samples
        </button>
      </div>
    </SectionCard>
  )
}
