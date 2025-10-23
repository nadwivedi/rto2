// API Configuration
const API_BASE_URL = 'http://localhost:5000/api'

// Driving License API
export const drivingLicenseAPI = {
  // Get all driving license applications
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}/driving-licenses${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch applications')
      }

      return data
    } catch (error) {
      console.error('Error fetching applications:', error)
      throw error
    }
  },

  // Get single application by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/driving-licenses/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch application')
      }

      return data
    } catch (error) {
      console.error('Error fetching application:', error)
      throw error
    }
  },

  // Create new application
  create: async (applicationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/driving-licenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create application')
      }

      return data
    } catch (error) {
      console.error('Error creating application:', error)
      throw error
    }
  },

  // Update application
  update: async (id, applicationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/driving-licenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update application')
      }

      return data
    } catch (error) {
      console.error('Error updating application:', error)
      throw error
    }
  },

  // Delete application
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/driving-licenses/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete application')
      }

      return data
    } catch (error) {
      console.error('Error deleting application:', error)
      throw error
    }
  },

  // Add payment to application
  addPayment: async (id, paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/driving-licenses/${id}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add payment')
      }

      return data
    } catch (error) {
      console.error('Error adding payment:', error)
      throw error
    }
  },

  // Update application status
  updateStatus: async (id, statusData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/driving-licenses/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status')
      }

      return data
    } catch (error) {
      console.error('Error updating status:', error)
      throw error
    }
  },

  // Update license status (learning to full)
  updateLicenseStatus: async (id, licenseData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/driving-licenses/${id}/license-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(licenseData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update license status')
      }

      return data
    } catch (error) {
      console.error('Error updating license status:', error)
      throw error
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/driving-licenses/statistics`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch statistics')
      }

      return data
    } catch (error) {
      console.error('Error fetching statistics:', error)
      throw error
    }
  },

  // Get license expiry report
  getExpiryReport: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/driving-licenses/expiry-report`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch expiry report')
      }

      return data
    } catch (error) {
      console.error('Error fetching expiry report:', error)
      throw error
    }
  },

  // Get learning licenses expiring soon (next 30 days)
  getLLExpiringSoon: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}/driving-licenses/ll-expiring-soon${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch LL expiring soon')
      }

      return data
    } catch (error) {
      console.error('Error fetching LL expiring soon:', error)
      throw error
    }
  },

  // Get driving licenses expiring soon (next 30 days)
  getDLExpiringSoon: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}/driving-licenses/dl-expiring-soon${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch DL expiring soon')
      }

      return data
    } catch (error) {
      console.error('Error fetching DL expiring soon:', error)
      throw error
    }
  }
}

// National Permit API
export const nationalPermitAPI = {
  // Get Part A expiring soon (next 30 days)
  getPartAExpiringSoon: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}/national-permits/part-a-expiring-soon${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch Part A expiring soon')
      }

      return data
    } catch (error) {
      console.error('Error fetching Part A expiring soon:', error)
      throw error
    }
  },

  // Get Part B expiring soon (next 30 days)
  getPartBExpiringSoon: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}/national-permits/part-b-expiring-soon${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch Part B expiring soon')
      }

      return data
    } catch (error) {
      console.error('Error fetching Part B expiring soon:', error)
      throw error
    }
  }
}

export default drivingLicenseAPI
