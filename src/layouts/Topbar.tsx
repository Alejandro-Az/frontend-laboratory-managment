import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="h-[68px] bg-white border-b flex items-center justify-between px-6 shrink-0">
      <div className="flex bg-white items-center max-w-lg w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-400">
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search samples, projects, clients..." className="flex-1 outline-none text-gray-700 bg-transparent placeholder-gray-400" />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">2</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">{user?.roles?.[0] || 'ADMIN'}</div>
          </div>
          <button onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white overflow-hidden shadow-sm hover:bg-blue-700 transition-colors" title="Logout">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
