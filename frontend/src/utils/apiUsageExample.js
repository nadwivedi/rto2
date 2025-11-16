import api from './api'

// Example: How to use the api utility in your components

// ===== USER LOGIN =====
export const loginUser = async (identifier, password) => {
  const response = await api.post('/api/auth/login', {
    identifier,
    password
  })
  return response.data
}

// ===== GET USER PROFILE =====
export const getUserProfile = async () => {
  const response = await api.get('/api/auth/profile')
  return response.data
}

// ===== LOGOUT USER =====
export const logoutUser = async () => {
  const response = await api.post('/api/auth/logout')
  return response.data
}

// ===== EXAMPLE: FETCH SOME PROTECTED DATA =====
export const fetchUserDashboardData = async () => {
  const response = await api.get('/api/user/dashboard')
  return response.data
}

// ===== EXAMPLE USAGE IN A COMPONENT =====
/*
import { getUserProfile, logoutUser } from '../utils/apiUsageExample'

const MyComponent = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Fetch user profile on mount
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile()
        setUser(data.user)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      // Redirect to login
      window.location.href = '/user/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
*/
