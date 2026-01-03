// UserContext.jsx - Fix the implementation
import React, { createContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios'

export const UserDataContext = createContext()

const UserContext = ({ children }) => {
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('tokenUser')
      
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      )
      
      if (response.data && response.data._id) {
        const userData = response.data
        setUserState(userData)
        // localStorage.setItem('user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // If token is invalid, clear everything
      localStorage.removeItem('tokenUser')
      // localStorage.removeItem('user')
      setUserState(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const setUser = useCallback((userData) => {
    if (userData && typeof userData === 'object' && userData._id) {
      setUserState(userData)
      // localStorage.setItem('user', JSON.stringify(userData))
    } else {
      console.error('Invalid user data provided to setUser:', userData)
      // localStorage.removeItem('user')
      setUserState(null)
    }
  }, [])

  // Provide loading state
  const value = { 
    user, 
    setUser, 
    loading,
    refreshUserData: fetchUserData // Export refresh function
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext