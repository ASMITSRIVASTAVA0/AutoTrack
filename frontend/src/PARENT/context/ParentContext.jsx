import React, { createContext, useState } from 'react'

export const ParentDataContext = createContext()

const ParentContext = ({ children }) => {
  const [parent, setParent] = useState(null)

  return (
    <ParentDataContext.Provider value={{ parent, setParent }}>
      {children}
    </ParentDataContext.Provider>
  )
}

export default ParentContext