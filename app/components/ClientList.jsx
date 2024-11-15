'use client'
import { useEffect, useState, forwardRef, useImperativeHandle, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

const ClientList = forwardRef((props, ref) => {
  const [clients, setClients] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingClient, setEditingClient] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
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

  const handleEdit = async (clientId, field, value) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]}`
        },
        body: JSON.stringify({ [field]: value }),
      })

      if (!response.ok) throw new Error('Failed to update client')
      
      // Update local state
      setClients(clients.map(client => 
        client.id === clientId 
          ? { ...client, [field]: value }
          : client
      ))
      setEditingClient(null)
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  const handleDelete = async (clientId) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]}`
        },
      })

      if (!response.ok) throw new Error('Failed to delete client')
      
      // Update local state
      setClients(clients.filter(client => client.id !== clientId))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const EditableField = ({ client, field, value }) => {
    const [editValue, setEditValue] = useState(value)
    const inputRef = useRef(null)

    useEffect(() => {
      if (editingClient === `${client.id}-${field}`) {
        inputRef.current?.focus()
      }
    }, [editingClient])

    if (editingClient === `${client.id}-${field}`) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleEdit(client.id, field, editValue)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleEdit(client.id, field, editValue)
            }
          }}
          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )
    }

    return (
      <span 
        onClick={() => setEditingClient(`${client.id}-${field}`)}
        className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md"
      >
        {value}
      </span>
    )
  }

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
          <div key={client.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 
                                        hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-grow">
                <h3 className="text-lg font-medium text-gray-900">
                  <EditableField 
                    client={client} 
                    field="first_name" 
                    value={client.first_name}
                  /> {' '}
                  <EditableField 
                    client={client} 
                    field="last_name" 
                    value={client.last_name}
                  />
                </h3>
                {client.email && (
                  <p className="text-sm text-gray-600">
                    <span className="inline-flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <EditableField 
                        client={client} 
                        field="email" 
                        value={client.email}
                      />
                    </span>
                  </p>
                )}
                {client.phone && (
                  <p className="text-sm text-gray-600">
                    <span className="inline-flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <EditableField 
                        client={client} 
                        field="phone" 
                        value={client.phone}
                      />
                    </span>
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDeleteConfirm(client.id)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm === client.id && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Delete Client
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete {client.first_name} {client.last_name}? 
                    This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 
                               border border-gray-300 rounded-md focus:outline-none focus:ring-2 
                               focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 
                               hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 
                               focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

ClientList.displayName = 'ClientList'

export default ClientList