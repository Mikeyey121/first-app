import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import TherapistForm from './TherapistForm'

interface Therapist {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
}

interface EditableFieldProps {
  therapist: Therapist
  field: keyof Omit<Therapist, 'id'>
  value: string
}

const TherapistManagement = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [editingTherapist, setEditingTherapist] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const { user } = useAuth()

  const fetchTherapists = async () => {
    try {
      const response = await fetch('/api/admin/therapists', {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTherapists(data)
      }
    } catch (error) {
      console.error('Error fetching therapists:', error)
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchTherapists()
    }
  }, [user])

  const handleEdit = async (therapistId: number, field: string, value: string) => {
    try {
      const therapist = therapists.find(t => t.id === therapistId)
      console.log('Editing therapist:', therapist)
      console.log('Field:', field)
      console.log('New value:', value)

      const updatedData = {
        ...therapist,
        [field]: value
      }

      console.log('Updated data:', updatedData)

      const response = await fetch(`/api/admin/therapists/${therapistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]}`
        },
        body: JSON.stringify(updatedData)
      })

      if (response.ok) {
        setTherapists(therapists.map(t => 
          t.id === therapistId 
            ? { ...t, [field]: value }
            : t
        ))
        setEditingTherapist(null)
      } else {
        const error = await response.json()
        console.error('Failed to update therapist:', error)
      }
    } catch (error) {
      console.error('Error updating therapist:', error)
    }
  }

  const handleDelete = async (therapistId: number) => {
    try {
      console.log('Delete attempt for therapist:', therapistId)
      const response = await fetch(`/api/admin/therapists/${therapistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]}`
        }
      })

      console.log('Delete response status:', response.status)
      
      if (response.ok) {
        console.log('Delete successful')
        setTherapists(prevTherapists => prevTherapists.filter(t => t.id !== therapistId))
        setDeleteConfirm(null)
      } else {
        const error = await response.json()
        console.error('Failed to delete therapist:', error)
      }
    } catch (error) {
      console.error('Error deleting therapist:', error)
    }
  }

  const EditableField = ({ therapist, field, value }: EditableFieldProps) => {
    const [editValue, setEditValue] = useState(value)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (editingTherapist === `${therapist.id}-${field}`) {
        inputRef.current?.focus()
      }
    }, [editingTherapist, therapist.id, field])

    if (field === 'role') {
      return (
        <button
          onClick={() => {
            const newRole = value === 'THERAPIST' ? 'ADMIN' : 'THERAPIST'
            handleEdit(therapist.id, field, newRole)
          }}
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'ADMIN' 
              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}
        >
          {value}
        </button>
      )
    }

    if (editingTherapist === `${therapist.id}-${field}`) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleEdit(therapist.id, field, editValue)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleEdit(therapist.id, field, editValue)
            }
          }}
          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      )
    }

    return (
      <span 
        onClick={() => setEditingTherapist(`${therapist.id}-${field}`)}
        className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md text-gray-900"
      >
        {value}
      </span>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Therapist Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Therapist</h2>
            <TherapistForm onTherapistAdded={fetchTherapists} />
          </div>
        </div>

        {/* Therapist List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Therapists</h2>
            <div className="overflow-hidden">
              <div className="grid gap-6">
                {therapists.map((therapist) => (
                  <div key={therapist.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-grow">
                        <h3 className="text-lg font-medium text-gray-900">
                          <EditableField 
                            therapist={therapist} 
                            field="first_name" 
                            value={therapist.first_name}
                          /> {' '}
                          <EditableField 
                            therapist={therapist} 
                            field="last_name" 
                            value={therapist.last_name}
                          />
                        </h3>
                        <p className="text-sm text-gray-600">
                          <span className="inline-flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <EditableField 
                              therapist={therapist} 
                              field="email" 
                              value={therapist.email}
                            />
                          </span>
                        </p>
                        <EditableField 
                          therapist={therapist} 
                          field="role" 
                          value={therapist.role}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setDeleteConfirm(therapist.id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {deleteConfirm === therapist.id && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Delete Therapist
                          </h3>
                          <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete {therapist.first_name} {therapist.last_name}? 
                            This action cannot be undone.
                          </p>
                          <div className="flex justify-end space-x-4">
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 
                                       border border-gray-300 rounded-md"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDelete(therapist.id)}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default TherapistManagement