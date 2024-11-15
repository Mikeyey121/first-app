'use client'
import { useEffect } from 'react'
import ClientForm from '../components/ClientForm'
import ClientList from '../components/ClientList'
import { useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function ClientsPage() {
  const clientListRef = useRef<{ refresh: () => void }>()
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Client Management</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <ClientForm onClientAdded={() => {
        clientListRef.current?.refresh()
      }} />
      <ClientList ref={clientListRef} />
    </div>
  )
}