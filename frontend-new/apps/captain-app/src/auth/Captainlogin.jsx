// import React, { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import axios from 'axios'
// import { CaptainDataContext } from '../context/CaptainContext'

// const CaptainLogin = () => {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const { captain, setCaptain } = React.useContext(CaptainDataContext)
//   const navigate = useNavigate()

//   const submitHandler = async (e) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)

//     try {
//       const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/captains/login`, {
//         email: email,
//         password: password
//       })

//       if (response.status === 200) {
//         const data = response.data
//         setCaptain(data.captain)
//         localStorage.setItem('token', data.token)
//         navigate('/captains/home')
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed. Please try again.')
//       console.error('Captain login failed', err)
//     } finally {
//       setLoading(false)
//     }

//     setEmail('')
//     setPassword('')
//   }

//   return (
//     <div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-between p-6'>
//       <div className='max-w-md mx-auto w-full'>
//         {/* Logo */}
//         <div className='mb-8'>
//           <img className='w-14 h-14 object-contain' src="/autotracklogo.png" alt="AutoTrack Logo" />
//         </div>

//         {/* Header */}
//         <div className='mb-8'>
//           <h1 className='text-3xl font-bold text-gray-900 mb-2'>Captain Login</h1>
//           <p className='text-gray-600'>Login to your driver account</p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className='mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
//             {error}
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={submitHandler} className='space-y-5'>
//           {/* Email Field */}
//           <div>
//             <label className='block text-sm font-semibold text-gray-700 mb-2'>Email Address</label>
//             <input
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className='w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors'
//               type="email"
//               placeholder='your.email@example.com'
//             />
//           </div>

//           {/* Password Field */}
//           <div>
//             <label className='block text-sm font-semibold text-gray-700 mb-2'>Password</label>
//             <input
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className='w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors'
//               type="password"
//               placeholder='Enter your password'
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             disabled={loading}
//             type='submit'
//             className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6'
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>

//         {/* Signup Link */}
//         <p className='text-center text-gray-600 mt-6'>
//           Don't have an account?{' '}
//           <Link to='/captains/signup' className='text-blue-600 font-semibold hover:text-blue-700'>
//             Sign up here
//           </Link>
//         </p>

//         {/* Back to Role Selection */}
//         <p className='text-center text-gray-600 mt-4'>
//           <Link to='/role' className='text-gray-600 hover:text-gray-800 underline text-sm'>
//             ← Back to role selection
//           </Link>
//         </p>
//       </div>

//       {/* Footer */}
//       <div className='max-w-md mx-auto w-full text-center'>
//         <p className='text-xs text-gray-500 leading-tight'>
//           This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service</span> apply.
//         </p>
//       </div>
//     </div>
//   )
// }

// export default CaptainLogin


import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from './CaptainContext'

const CaptainLogin = () => {
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { captain, setCaptain } = React.useContext(CaptainDataContext)
  const navigate = useNavigate()


  
  const submitHandler = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/captains/login`, {
        email: email,
        password: password
      })

      if (response.status === 200) {
        const data = response.data
        setCaptain(data.captain)
        // localStorage.setItem('token', data.token)
        localStorage.setItem('tokenCaptain', data.tokenCaptain)
        
        navigate('/captains/home')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
      console.error('Captain login failed', err)
    } finally {
      setLoading(false)
    }

    setEmail('')
    setPassword('')
  }


  const handleBackClick = () => {
    console.log('Navigating back to role selection...')
    navigate('/role')
  }

  const handleSignupClick = () => {
    console.log('Navigating to captain signup...')
    navigate('/captains/signup')
  }

  const parallaxStyle = {
    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
  }

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-black'>
      {/* Animated mesh gradient background */}
      <div className='absolute inset-0 opacity-60'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-900/40 via-cyan-900/30 to-black'></div>
        <div 
          className='absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-blue-900/20 via-transparent to-cyan-900/20 transition-transform duration-300 ease-out'
          style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` }}
        ></div>
      </div>

      {/* Animated orbs with parallax */}
      <div 
        className='absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-600/40 to-cyan-600/40 rounded-full blur-3xl animate-pulse transition-transform duration-300 ease-out'
        style={parallaxStyle}
      ></div>
      <div 
        className='absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-cyan-600/30 to-blue-600/30 rounded-full blur-3xl animate-pulse transition-transform duration-300 ease-out' 
        style={{ 
          animationDelay: '1s',
          transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
        }}
      ></div>

      {/* Floating particles */}
      <div className='absolute inset-0 z-10'>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className='absolute w-1 h-1 bg-white/30 rounded-full'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
      `}</style>

      {/* Content */}
      <div className='relative z-30 min-h-screen flex flex-col justify-between p-6 sm:p-8'>
        <div className='max-w-md mx-auto w-full'>
          {/* Logo */}
          <div 
            className='mb-8 sm:mb-12 transition-all duration-1000 ease-out'
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-30px)'
            }}
          >
            <button onClick={handleBackClick} className='group inline-flex items-center gap-3 bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-1'>
              <div className='relative w-11 h-11 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/60 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110'>
                <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-500'></div>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='relative w-6 h-6 text-white'>
                  <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="currentColor"/>
                </svg>
              </div>
              <span className='text-white font-bold text-xl sm:text-2xl tracking-tight'>AutoTrack</span>
              <div className='ml-2 px-2 py-1 bg-blue-500/20 rounded-lg border border-blue-500/30'>
                <span className='text-blue-400 text-xs font-semibold'>CAPTAIN</span>
              </div>
            </button>
          </div>

          {/* Main Form Card */}
          <div 
            className='transition-all duration-1000 ease-out delay-200'
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(40px)'
            }}
          >
            <div className='group relative bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-black/95 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 md:p-10 border border-zinc-800/80 shadow-2xl hover:shadow-blue-500/10 transition-all duration-700 hover:border-zinc-700/80'>
              
              {/* Glow effect on hover */}
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-blue-500/5 rounded-[32px] transition-all duration-700'></div>
              
              {/* Content */}
              <div className='relative'>
                {/* Accent line */}
                <div className='w-20 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full mb-6 shadow-lg shadow-blue-500/50'></div>
                
                {/* Header */}
                <div className='mb-8'>
                  <h1 className='text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight'>Captain Login</h1>
                  <p className='text-zinc-400 text-sm sm:text-base'>Access your driver dashboard</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className='mb-6 p-4 bg-red-500/10 border border-red-500/30 backdrop-blur-xl text-red-400 rounded-2xl flex items-start gap-3'>
                    <svg className='w-5 h-5 flex-shrink-0 mt-0.5' fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className='text-sm'>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={submitHandler} className='space-y-5'>
                  {/* Email Field */}
                  <div className='group/input'>
                    <label className='block text-sm font-semibold text-zinc-300 mb-2'>Email Address</label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-400 transition-colors' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full bg-zinc-800/50 border-2 border-zinc-700/50 rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800/70 transition-all duration-300 hover:border-zinc-600/50'
                        type="email"
                        placeholder='captain@autotrack.com'
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className='group/input'>
                    <label className='block text-sm font-semibold text-zinc-300 mb-2'>Password</label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-400 transition-colors' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full bg-zinc-800/50 border-2 border-zinc-700/50 rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800/70 transition-all duration-300 hover:border-zinc-600/50'
                        type="password"
                        placeholder='Enter your password'
                      />
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <br/>

                  {/* Submit Button */}
                  <button
                    disabled={loading}
                    type='submit'
                    className='group/btn relative w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-[length:200%_100%] hover:bg-right text-white py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-500 overflow-hidden hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 mt-6'
                  >
                    {/* Animated shine */}
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000'></div>
                    
                    {/* Pulse effect */}
                    {!loading && <div className='absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-0 group-hover/btn:opacity-100'></div>}
                    
                    <span className='relative flex items-center justify-center gap-2 sm:gap-3'>
                      {loading ? (
                        <>
                          <svg className='animate-spin h-5 w-5' fill="none" viewBox="0 0 24 24">
                            <circle className='opacity-25' cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className='opacity-75' fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Logging in...
                        </>
                      ) : (
                        <>
                          Login
                          <svg 
                            className='w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 group-hover/btn:translate-x-2 group-hover/btn:scale-125' 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* Signup Link */}
                <p className='text-center text-zinc-400 mt-8'>
                  Don't have an account?{' '}
                  <button onClick={handleSignupClick} className='text-blue-400 font-semibold hover:text-blue-300 transition-colors'>
                    Sign up here
                  </button>
                </p>

                {/* Back to Role Selection */}
                <div className='mt-6 text-center'>
                  <button 
                    onClick={handleBackClick}
                    className='group/back inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm'
                  >
                    <svg className='w-4 h-4 transition-transform duration-300 group-hover/back:-translate-x-1' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Back to role selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className='max-w-md mx-auto w-full text-center mt-8 transition-all duration-1000 ease-out delay-400'
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)'
          }}
        >
          <p className='text-xs text-zinc-500 leading-relaxed'>
            This site is protected by reCAPTCHA and the{' '}
            <span className='text-zinc-400 underline hover:text-zinc-300 cursor-pointer transition-colors'>Google Privacy Policy</span>
            {' '}and{' '}
            <span className='text-zinc-400 underline hover:text-zinc-300 cursor-pointer transition-colors'>Terms of Service</span>
            {' '}apply.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CaptainLogin