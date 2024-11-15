'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  role: string
  first_name: string
}

interface AuthContextType {
  user: User | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (token) {
        const decoded = jwtDecode<User>(token)
        setUser(decoded)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth state error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return null // or a loading spinner
  }

  const login = (token: string) => {
    try {
      if (typeof token !== 'string') {
        throw new Error('Invalid token format')
      }
      
      // Set the cookie
      document.cookie = `token=${token}; path=/; max-age=86400; samesite=lax`
      
      // Decode and set user
      const decoded = jwtDecode<User>(token)
      setUser(decoded)
      
      // Navigate to clients page
      router.push('/clients')
    } catch (error) {
      console.error('Login error:', error)
      setUser(null)
    }
  }

  const logout = () => {
    // Clear the cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}