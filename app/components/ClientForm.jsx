'use client'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function ClientForm({ onClientAdded }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    therapistId: user?.id || null,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          therapistId: user?.id
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to create client')
      }
      
      const newClient = await response.json()
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        therapistId: user?.id || null
      })
      onClientAdded?.()
    } catch (error) {
      console.error('Error:', error)
      alert(error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          First Name
        </label>
        <input
          type="text"
          required
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black bg-white"
          placeholder="Enter first name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Last Name
        </label>
        <input
          type="text"
          required
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black bg-white"
          placeholder="Enter last name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black bg-white"
          placeholder="Enter email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Phone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black bg-white"
          placeholder="Enter phone"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Add Client
      </button>
    </form>
  )
}