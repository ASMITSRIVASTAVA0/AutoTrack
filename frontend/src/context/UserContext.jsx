// UserContext.jsx - Fix the implementation
import React, { createContext, useState, useCallback } from 'react'

export const UserDataContext = createContext()

const UserContext = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  // Use useCallback to prevent unnecessary re-renders
  const setUser = useCallback((userData) => {
    setUserState(userData)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }, [])

  return (
    <UserDataContext.Provider value={{ user, setUser }}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext