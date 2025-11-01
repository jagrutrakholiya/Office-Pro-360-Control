'use client'
import { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import Link from 'next/link'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="text-slate-600">Checking authentication…</div>
      </div>
    )
  }

  if (!user) {
    if (pathname !== '/login') router.push('/login')
    return null
  }

  const nav = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/companies', label: 'Companies', icon: '🏢' },
    { href: '/plans', label: 'Plans', icon: '💎' },
    { href: '/inquiries', label: 'Inquiries', icon: '📬' },
    { href: '/reviews', label: 'Reviews', icon: '⭐' },
    { href: '/earnings', label: 'Earnings', icon: '💰' }
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex flex-col shadow-2xl">
        <div className="mb-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Office360</div>
          <div className="text-xs text-slate-400 mt-1">Control Panel</div>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {nav.map(n => (
            <Link 
              key={n.href} 
              href={n.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${pathname === n.href ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/50' : 'hover:bg-slate-700/50'}`}
            >
              <span className="text-lg">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-700 pt-4 mt-4">
          <div className="text-xs text-slate-400 mb-3 truncate">{user.email}</div>
          <button onClick={logout} className="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg font-medium text-sm shadow-lg transition-all duration-200">
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}


