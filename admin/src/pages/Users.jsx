import { useState, useEffect } from 'react'
import api from '../utils/api'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/users')
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.mobile || !formData.password) {
      setError('Name, mobile, and password are required')
      return
    }

    try {
      const response = await api.post('/api/admin/users', formData)
      if (response.data.success) {
        setSuccess('User created successfully!')
        setShowModal(false)
        setFormData({ name: '', mobile: '', email: '', password: '' })
        fetchUsers()
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await api.delete(`/api/admin/users/${id}`)
      setSuccess('User deleted successfully!')
      fetchUsers()
    } catch (error) {
      setError('Failed to delete user')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Manage Users</h1>
          <p className='text-gray-600 mt-1'>Create and manage user accounts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className='px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          Create New User
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800'>
          {success}
        </div>
      )}
      {error && !showModal && (
        <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800'>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className='bg-white rounded-lg shadow'>
        {loading ? (
          <div className='p-8 text-center'>
            <div className='inline-block animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full'></div>
            <p className='mt-2 text-gray-600'>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            No users found. Create your first user!
          </div>
        ) : (
          <table className='w-full'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase'>Name</th>
                <th className='px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase'>Mobile</th>
                <th className='px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase'>Email</th>
                <th className='px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase'>Status</th>
                <th className='px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase'>Created</th>
                <th className='px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {users.map((user) => (
                <tr key={user._id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 text-sm font-medium text-gray-900'>{user.name}</td>
                  <td className='px-6 py-4 text-sm text-gray-700'>{user.mobile}</td>
                  <td className='px-6 py-4 text-sm text-gray-700'>{user.email || '-'}</td>
                  <td className='px-6 py-4 text-sm'>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-700'>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className='text-red-600 hover:text-red-800 font-semibold'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold text-gray-800'>Create New User</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setError('')
                  setFormData({ name: '', mobile: '', email: '', password: '' })
                }}
                className='text-gray-500 hover:text-gray-700'
              >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            {error && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800'>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='Enter full name'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  Mobile Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='mobile'
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder='10-digit mobile number'
                  maxLength={10}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  Email <span className='text-gray-400'>(Optional)</span>
                </label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='email@example.com'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  Password <span className='text-red-500'>*</span>
                </label>
                <input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='Minimum 4 characters'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  required
                  minLength={4}
                />
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  type='button'
                  onClick={() => {
                    setShowModal(false)
                    setError('')
                    setFormData({ name: '', mobile: '', email: '', password: '' })
                  }}
                  className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold'
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
