import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Start from './pages.startup/Start'
import UserLogin from './pages.login/UserLogin'
import UserSignup from './pages.signup/UserSignup'
import Captainlogin from './pages.login/Captainlogin'
import CaptainSignup from './pages.signup/CaptainSignup'
import Home from './pages.home/Home'
import UserProtectWrapper from './pages.protectwrapper/UserProtectWrapper'
import UserLogout from './pages.logout/UserLogout'
import CaptainHome from './pages.home/CaptainHome'
import CaptainProtectWrapper from './pages.protectwrapper/CaptainProtectWrapper'
import CaptainLogout from './pages.logout/CaptainLogout'
import Riding from './pages.riding/Riding'
import CaptainRiding from './pages.riding/CaptainRiding'
import 'remixicon/fonts/remixicon.css'
import Role from './pages.startup/Role';

import ParentLogin from './pages.login/ParentLogin'
import ParentSignup from './pages.signup/ParentSignup'
import ParentProtectWrapper from './pages.protectwrapper/ParentProtectWrapper'
import ParentHome from './pages.home/ParentHome';
import ParentLogout from './pages.logout/ParentLogout';
import TermsOfService from './pages.startup/TermsOfService'
import PrivaryPolicy from './pages.startup/PrivaryPolicy'

import CaptainProfile from "./components/compo.captain/CaptainProfile";
import Earnings from "./components/compo.captain/Earnings";
import RideHistory from "./components/compo.captain/RideHistory";
import Support from "./components/compo.captain/Support";

const App = () => {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Start />} />
        <Route path='/role' element={<Role />} />
        <Route path="/termsofservice" element={<TermsOfService/>}/>
        <Route path="/privacypolicy" element={<PrivaryPolicy/>}/>
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
        {/* <Route path='/captain-home' element={
          <CaptainProtectWrapper>
            <CaptainHome />
          </CaptainProtectWrapper>

        } /> */}

        <Route path="/captain-home" element={
          <CaptainProtectWrapper>
            <CaptainHome />
          </CaptainProtectWrapper>
        }>
          <Route path="profile" element={<CaptainProfile />} />
          <Route path="history" element={<RideHistory />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="support" element={<Support />} />
        </Route>

        <Route path="/parent-home" element={
          <ParentProtectWrapper>
            <ParentHome />
          </ParentProtectWrapper>
        }
        />

        <Route path='/riding' element={<Riding />} />
        <Route path='/captain-riding' element={<CaptainRiding />} />


        

        <Route path='/login' element={<UserLogin />} />
        <Route path='/captain-login' element={<Captainlogin />} />
        <Route path='/parent-login' element={<ParentLogin />} />
  
        
        <Route path='/signup' element={<UserSignup />} />
        <Route path='/captain-signup' element={<CaptainSignup />} />
        <Route path='/parent-signup' element={<ParentSignup />} />
  

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
        <Route path='/parent/logout' element={
          <ParentProtectWrapper>
            <ParentLogout />
          </ParentProtectWrapper>
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