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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4 group">
                <span className="inline-flex items-center">
                  Hello, 
                  <span className="font-semibold text-blue-600 ml-2 group-hover:scale-105 transition-transform duration-200">
                    {user.first_name || 'there'}
                  </span>
                  <span className="text-yellow-500 ml-1 animate-bounce">!</span>
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent 
                         text-sm font-medium rounded-lg text-white bg-red-600 
                         hover:bg-red-700 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Client Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Client</h2>
                <ClientForm onClientAdded={() => clientListRef.current?.refresh()} />
              </div>
            </div>

            {/* Client List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Clients</h2>
                <ClientList ref={clientListRef} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}