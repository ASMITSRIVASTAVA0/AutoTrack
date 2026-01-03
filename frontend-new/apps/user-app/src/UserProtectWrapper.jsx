// UserProtectWrapper.jsx
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from './context/UserContext'

const UserProtectWrapper = ({ children }) => {
  const { user, setUser } = useContext(UserDataContext)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('tokenUser')
      
      if (!token) {
        navigate('/login')
        return
      }

      try {
        console.log("Fetching user profile with token:", token)
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        console.log("User profile fetched successfully:", response.data)
        
        // Make sure to set the user data properly
        if (response.data && setUser) {
          setUser(response.data)
          console.log("User set in context:", response.data)
        } else {
          throw new Error('Invalid user data received')
        }
        
      } catch (error) {
        console.error("Error fetching user profile", error)
        localStorage.removeItem('tokenUser')
        // localStorage.removeItem('user')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if we don't already have user data
    if (!user) {
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [navigate, setUser, user])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Only render children if we have a valid user
  if (!user) {
    return null
  }

  return children
}

export default UserProtectWrapper