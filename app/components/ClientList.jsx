'use client'
import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

const ClientList = forwardRef((props, ref) => {
  const [clients, setClients] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const { user } = useAuth()
  const router = useRouter()

  const getToken = () => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; token=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
  }

  const fetchClients = useCallback(async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        console.error('No token found in cookies')
        router.push('/')
        return
      }

      console.log('Sending request with token:', token.substring(0, 10) + '...')

      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)

      if (response.status === 401) {
        console.error('Unauthorized request')
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
      console.log('User present, fetching clients') // Debug log
      fetchClients()
    }
  }, [fetchClients, refreshKey, user])

  useImperativeHandle(ref, () => ({
    refresh: () => setRefreshKey(prev => prev + 1)
  }))

  if (!user) {
    return null
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Clients</h2>
      <div className="grid gap-4">
        {clients.map((client) => (
          <div key={client.id} className="border rounded-lg p-4">
            <h3 className="font-bold">{client.first_name} {client.last_name}</h3>
            {client.email && <p className="text-sm">Email: {client.email}</p>}
            {client.phone && <p className="text-sm">Phone: {client.phone}</p>}
          </div>
        ))}
      </div>
    </div>
  )
})

ClientList.displayName = 'ClientList'

export default ClientList