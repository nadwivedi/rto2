import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      const storedAdmin = localStorage.getItem('admin')

      if (!token) {
        setLoading(false)
        return
      }

      // Verify token with backend
      const response = await axios.get(`${API_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setAdmin(response.data.data.admin)
        setIsAuthenticated(true)
      } else {
        // Token is invalid
        logout()
      }
    } catch (error) {
      console.error('Auth check error:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = (token, adminData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('admin', JSON.stringify(adminData))
    setAdmin(adminData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    setAdmin(null)
    setIsAuthenticated(false)
  }

  const value = {
    admin,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
