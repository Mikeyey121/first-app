'use client'
import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

const ClientList = forwardRef((props, ref) => {
  const [clients, setClients] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const { user } = useAuth()
  const router = useRouter()

  useImperativeHandle(ref, () => ({
    refresh: () => setRefreshKey(prev => prev + 1)
  }))

  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch('/api/clients', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]}`
        }
      })

      if (response.status === 401) {
        router.push('/')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }

      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error('Fetch error:', error)
    }
  }, [router])

  useEffect(() => {
    if (user) {
      fetchClients()
    }
  }, [fetchClients, refreshKey, user])

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No clients</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new client.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="grid gap-6">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 
                     hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {client.first_name} {client.last_name}
                </h3>
                {client.email && (
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="inline-flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {client.email}
                    </span>
                  </p>
                )}
                {client.phone && (
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="inline-flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {client.phone}
                    </span>
                  </p>
                )}
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

ClientList.displayName = 'ClientList'

export default ClientList