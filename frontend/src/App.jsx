import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Start from './pages/Start'
import UserLogin from './pages/UserLogin'
import UserSignup from './pages/UserSignup'
import Captainlogin from './pages/Captainlogin'
import CaptainSignup from './pages/CaptainSignup'
import Home from './pages/Home'
import UserProtectWrapper from './pages/UserProtectWrapper'
import UserLogout from './pages/UserLogout'
import CaptainHome from './pages/CaptainHome'
import CaptainProtectWrapper from './pages/CaptainProtectWrapper'
import CaptainLogout from './pages/CaptainLogout'
import Riding from './pages/Riding'
import CaptainRiding from './pages/CaptainRiding'
import 'remixicon/fonts/remixicon.css'

const App = () => {

  return (
    <div>
      <Routes>
        {/* Routes=container that render first matching route */}
        
        {/* Route=define path and what component to render */}
        <Route
        path='/home'
        element={
          <UserProtectWrapper>
            <Home/>
          </UserProtectWrapper>
        } 
        />

{/* authenticated routes */}
        <Route path='/captain-home' element={
          <CaptainProtectWrapper>
            <CaptainHome />
          </CaptainProtectWrapper>

        } />

        <Route path='/riding' element={<Riding />} />
        <Route path='/captain-riding' element={<CaptainRiding />} />



{/* public routes */}
        <Route path='/' element={<Start />} />
        <Route path='/login' element={<UserLogin />} />
        <Route path='/captain-login' element={<Captainlogin />} />
        
        <Route path='/signup' element={<UserSignup />} />
        <Route path='/captain-signup' element={<CaptainSignup />} />

        <Route path='/user/logout'
          element={<UserProtectWrapper>
            <UserLogout />
          </UserProtectWrapper>
          } />
        <Route path='/captain/logout' element={
          <CaptainProtectWrapper>
            <CaptainLogout />
          </CaptainProtectWrapper>
        } />
      </Routes>
    </div>
  )
}

export default App

/*
v5 route syntax <Route path='' component={} />
v6 route syntax <Route path='' element={} />
v6 uses element prop to pass JSX element to render for that route
*/

/*
useNavigate: programmatic navigation after form submit or useEffect
Link: declarative navigation via clickable links
*/

/*
token-based auth(persistent auth)
localStorage: persists until manually cleared
sessionStorage: clears when tab/browser closed
cookies: can set expiration, sent with every HTTP request to server
*/