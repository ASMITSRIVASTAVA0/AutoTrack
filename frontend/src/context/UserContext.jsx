// UserContext.jsx - Fix the implementation
import React, { createContext, useState, useCallback } from 'react'

export const UserDataContext = createContext()//create global state container that allow compo to share data without prop drlling
/*
createContext only create context obj(empty container) but doesnot tell react what value should be shared,
.Provider(fill container with data and share it with chilren) is compo that actually supplies(provides) value to all child comp
*/

/*
useCallback memoizes a func to avoid unnecessary re-render by ensuring func reference only changes when its dependencies changes
*/

const UserContext = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })//load user from localStorage on first render


  // Use useCallback to prevent unnecessary re-renders
  const setUser = useCallback((userData) => {
    setUserState(userData)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))//store user to localstorage whenever call setUser
    } else {
      localStorage.removeItem('user')//on logout this SHOULD be done
    }
  }, []);

  return (
    // .Provider me value={{user,setUser}} dia that can be access by all {children} compo
    <UserDataContext.Provider value={{ user, setUser }}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext