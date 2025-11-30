import React from 'react'
import { Link } from 'react-router-dom'

const Forms = () => {
  const forms = [
    {
      id: 'form-20',
      name: 'Form 20',
      description: 'Application for Registration of a Motor Vehicle',
      icon: '📋',
      path: '/forms/form-20'
    },
    {
      id: 'form-46',
      name: 'Form 46',
      description: 'Application for grant of authorisation tourist Permit or National Permit',
      icon: '🚗',
      path: '/forms/form-46'
    }
  ]

  return (
    <div className="min-h-screen pt-16 lg:pt-20 px-4 pb-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">RTO Forms</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <Link
              key={form.id}
              to={form.path}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
            >
              <div className="text-4xl mb-3">{form.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{form.name}</h3>
              <p className="text-gray-500 text-sm">{form.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Forms
