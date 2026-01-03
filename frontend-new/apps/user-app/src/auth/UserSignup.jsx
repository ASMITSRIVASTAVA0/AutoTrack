
import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'

const UserSignup = () => {
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
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { user, setUser } = useContext(UserDataContext)

  const submitHandler = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const newUser = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/register`, newUser)

      if (response.status === 201) {
        const data = response.data
        setUser(data.user)
        localStorage.setItem('tokenUser', data.tokenUser)
        // localStorage.setItem('user', JSON.stringify(data.user))  // Save user to localStorage
        
        navigate('/home')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
      console.error('Signup request failed', err)
    } finally {
      setLoading(false)
    }

    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
  }

  const handleLoginClick = () => {
    navigate("/login")
  }

  const handleBackClick = () => {
    navigate("/role")
  }

  const parallaxStyle = {
    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
  }

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-black'>
      {/* Animated mesh gradient background */}
      <div className='absolute inset-0 opacity-60'>
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-green-900/30 to-black'></div>
        <div 
          className='absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-emerald-900/20 via-transparent to-green-900/20 transition-transform duration-300 ease-out'
          style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` }}
        ></div>
      </div>

      {/* Animated orbs with parallax */}
      <div 
        className='absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-emerald-600/40 to-green-600/40 rounded-full blur-3xl animate-pulse transition-transform duration-300 ease-out'
        style={parallaxStyle}
      ></div>
      <div 
        className='absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-green-600/30 to-emerald-600/30 rounded-full blur-3xl animate-pulse transition-transform duration-300 ease-out' 
        style={{ 
          animationDelay: '1s',
          transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
        }}
      ></div>

      {/* Floating particles */}
      <div className='absolute inset-0 z-10'>
        {[...Array(30)].map((_, i) => (
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
        <div className='max-w-md mx-auto w-full flex-1 flex flex-col justify-center'>
          
          {/* Logo */}
          <div 
            className='mb-8 transition-all duration-1000 ease-out'
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-30px)'
            }}
          >
            <div className='inline-flex items-center gap-3 bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 cursor-pointer'>
              <div className='relative w-11 h-11 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg'>
                <div className='absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-400 rounded-xl blur opacity-50'></div>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='relative w-6 h-6 text-white'>
                  <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="currentColor"/>
                </svg>
              </div>
              <span className='text-white font-bold text-xl tracking-tight'>AutoTrack</span>
            </div>
          </div>

          {/* Header */}
          <div 
            className='mb-8 transition-all duration-1000 ease-out delay-200'
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-20px)'
            }}
          >
            <div className='inline-flex items-center gap-2 mb-4'>
              <div className='w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30'>
                <svg className='w-5 h-5 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className='text-3xl sm:text-4xl font-bold text-white'>Create Account</h1>
            </div>
            <p className='text-zinc-400 text-base sm:text-lg'>Join AutoTrack as a Passenger</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className='mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-2xl backdrop-blur-xl animate-pulse'>
              <div className='flex items-center gap-2'>
                <svg className='w-5 h-5' fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Form Container */}
          <div 
            className='space-y-5 transition-all duration-1000 ease-out delay-400'
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            {/* Name Fields */}
            <div className='group'>
              <label className='block text-sm font-semibold text-zinc-300 mb-2 group-focus-within:text-emerald-400 transition-colors'>
                Full Name
              </label>
              <div className='flex gap-3'>
                <div className='relative flex-1'>
                  <div className='absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors'>
                    <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    required
                    className='w-full bg-zinc-900/50 backdrop-blur-xl border-2 border-zinc-800/80 rounded-2xl pl-12 pr-4 py-4 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:bg-zinc-900/70 transition-all duration-300'
                    type="text"
                    placeholder='First name'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className='relative flex-1'>
                  <div className='absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors'>
                    <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    className='w-full bg-zinc-900/50 backdrop-blur-xl border-2 border-zinc-800/80 rounded-2xl pl-12 pr-4 py-4 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:bg-zinc-900/70 transition-all duration-300'
                    type="text"
                    placeholder='Last name'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className='group'>
              <label className='block text-sm font-semibold text-zinc-300 mb-2 group-focus-within:text-emerald-400 transition-colors'>
                Email Address
              </label>
              <div className='relative'>
                <div className='absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors'>
                  <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full bg-zinc-900/50 backdrop-blur-xl border-2 border-zinc-800/80 rounded-2xl pl-12 pr-4 py-4 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:bg-zinc-900/70 transition-all duration-300'
                  type="email"
                  placeholder='user@autotrack.com'
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='group'>
              <label className='block text-sm font-semibold text-zinc-300 mb-2 group-focus-within:text-emerald-400 transition-colors'>
                Password
              </label>
              <div className='relative'>
                <div className='absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors'>
                  <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full bg-zinc-900/50 backdrop-blur-xl border-2 border-zinc-800/80 rounded-2xl pl-12 pr-4 py-4 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:bg-zinc-900/70 transition-all duration-300'
                  type="password"
                  placeholder='At least 6 characters'
                />
                <p className='text-xs text-zinc-500 mt-2 ml-1'>Password must be at least 6 characters long</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              onClick={submitHandler}
              className='group/btn relative w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 bg-[length:200%_100%] hover:bg-right text-white font-bold py-4 rounded-2xl transition-all duration-500 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]'
            >
              {/* Animated shine */}
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000'></div>
              
              <span className='relative flex items-center justify-center gap-2'>
                {loading ? (
                  <>
                    <svg className='animate-spin h-5 w-5 text-white' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className='opacity-25' cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className='opacity-75' fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <svg 
                      className='w-5 h-5 transition-transform duration-500 group-hover/btn:translate-x-1' 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Login Link */}
          <div 
            className='text-center mt-6 transition-all duration-1000 ease-out delay-500'
            style={{
              opacity: mounted ? 1 : 0
            }}
          >
            <p className='text-zinc-400'>
              Already have an account?{' '}
              <button 
                onClick={handleLoginClick}
                className='text-emerald-400 font-semibold hover:text-emerald-300 transition-colors underline decoration-emerald-400/50 hover:decoration-emerald-300'
              >
                Login here
              </button>
            </p>
          </div>

          {/* Back to Role Selection */}
          <div 
            className='text-center mt-4 transition-all duration-1000 ease-out delay-600'
            style={{
              opacity: mounted ? 1 : 0
            }}
          >
            <button 
              onClick={handleBackClick}
              className='group inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm'
            >
              <svg className='w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Back to role selection
            </button>
          </div>
        </div>

        {/* Footer */}
        <div 
          className='max-w-md mx-auto w-full text-center pt-8 transition-all duration-1000 ease-out delay-700'
          style={{
            opacity: mounted ? 1 : 0
          }}
        >
          <div className='bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-4'>
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
    </div>
  )
}

export default UserSignup