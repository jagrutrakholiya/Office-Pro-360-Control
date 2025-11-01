'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../lib/api'

type User = { id: string; name: string; email: string; role: string }
type AuthContextType = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('cp_token')
    if (stored) {
      setToken(stored)
      api.get('/auth/me').then(({ data }) => {
        if (data.user.role === 'super_admin') {
          setUser(data.user)
        } else {
          localStorage.removeItem('cp_token')
          setToken(null)
        }
        setLoading(false)
      }).catch(() => {
        localStorage.removeItem('cp_token')
        setToken(null)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.user.role !== 'super_admin') throw new Error('Super admin only')
    localStorage.setItem('cp_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('cp_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

