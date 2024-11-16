import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Therapist {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
}

const TherapistManagement = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [editingTherapist, setEditingTherapist] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: ''
  })
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchTherapists()
    }
  }, [user])

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

  const handleEdit = async (therapistId: number) => {
    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]}`
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        fetchTherapists()
        setEditingTherapist(null)
      }
    } catch (error) {
      console.error('Error updating therapist:', error)
    }
  }

  const handleDelete = async (therapistId: number) => {
    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]}`
        }
      })

      if (response.ok) {
        fetchTherapists()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting therapist:', error)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Therapist Management
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Manage therapist accounts and credentials
      </p>
      
      <ul className="mt-6 divide-y divide-gray-200">
        {therapists.map((therapist) => (
          <li key={therapist.id} className="py-4">
            {editingTherapist === therapist.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    className="border rounded-md px-3 py-2 text-gray-900"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    className="border rounded-md px-3 py-2 text-gray-900"
                    placeholder="Last Name"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="border rounded-md px-3 py-2 text-gray-900"
                    placeholder="Email"
                  />
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="border rounded-md px-3 py-2 text-gray-900"
                  >
                    <option value="THERAPIST" className="text-gray-900">Therapist</option>
                    <option value="ADMIN" className="text-gray-900">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingTherapist(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEdit(therapist.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {therapist.first_name} {therapist.last_name}
                  </h4>
                  <p className="text-sm text-gray-600">{therapist.email}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {therapist.role}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setEditingTherapist(therapist.id)
                      setEditForm({
                        first_name: therapist.first_name,
                        last_name: therapist.last_name,
                        email: therapist.email,
                        role: therapist.role
                      })
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(therapist.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

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
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 
                               hover:bg-red-700 rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TherapistManagement
