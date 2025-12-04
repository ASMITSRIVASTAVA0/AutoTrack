import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/CaptainContext'

const CaptainSignup = () => {
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
  const [vehicleColor, setVehicleColor] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleCapacity, setVehicleCapacity] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { setCaptain } = useContext(CaptainDataContext)

  const submitHandler = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const newCaptain = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType: vehicleType
      }
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, newCaptain)

      if (response.status === 201) {
        const data = response.data
        setCaptain(data.captain)
        localStorage.setItem('token', data.token)
        navigate('/captain-home')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
      console.error('Captain signup failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackClick = () => {
    console.log('Navigating back to role selection...')
    navigate('/role')
  }

  const handleLoginClick = () => {
    console.log('Navigating to captain login...')
    navigate('/captain-login')
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
                  <h1 className='text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight'>Become a Captain</h1>
                  <p className='text-zinc-400 text-sm sm:text-base'>Start earning by driving with AutoTrack</p>
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
                <form onSubmit={submitHandler} className='space-y-5 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent'>
                  {/* Personal Information Section */}
                  <div className='space-y-4'>
                    {/* Name Fields */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div className='group/input'>
                        <label className='block text-sm font-semibold text-zinc-300 mb-2'>First Name</label>
                        <div className='relative'>
                          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                            <svg className='w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-400 transition-colors' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            required
                            className='w-full bg-zinc-800/50 border-2 border-zinc-700/50 rounded-2xl pl-12 pr-4 py-3 text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800/70 transition-all duration-300 hover:border-zinc-600/50'
                            type="text"
                            placeholder='First name'
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className='group/input'>
                        <label className='block text-sm font-semibold text-zinc-300 mb-2'>Last Name</label>
                        <div className='relative'>
                          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                            <svg className='w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-400 transition-colors' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            className='w-full bg-zinc-800/50 border-2 border-zinc-700/50 rounded-2xl pl-12 pr-4 py-3 text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800/70 transition-all duration-300 hover:border-zinc-600/50'
                            type="text"
                            placeholder='Last name'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

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
                          className='w-full bg-zinc-800/50 border-2 border-zinc-700/50 rounded-2xl pl-12 pr-4 py-3 text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800/70 transition-all duration-300 hover:border-zinc-600/50'
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
                          className='w-full bg-zinc-800/50 border-2 border-zinc-700/50 rounded-2xl pl-12 pr-4 py-3 text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800/70 transition-all duration-300 hover:border-zinc-600/50'
                          type="password"
                          placeholder='At least 6 characters'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details Section */}
                  <div className='pt-4 border-t border-zinc-700/50 mt-4'>
                    <div className='flex items-center gap-2 mb-4'>
                      <div className='w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-md flex items-center justify-center'>
                        <svg className='w-3.5 h-3.5 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className='font-semibold text-white text-lg'>Vehicle Details</h3>
                    </div>

                    {/* Vehicle Color & Plate */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                      <div className='group/input'>
                        <label className='block text-sm font-semibold text-zinc-300 mb-2'>Vehicle Color</label>
                        <div className='relative'>
                          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                            <svg className='w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-400 transition-colors' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                          </div>
                          <input
                            required
                            className='w-full bg-zinc-800/50 border-2 border-zinc-700/50 rounded-2xl pl-12 pr-4 py-3 text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800/70 transition-all duration-300 hover:border-zinc-600/50'
                            type="text"
                            placeholder='e.g., Red, Blue'
                            value={vehicleColor}
                            onChange={(e) => setVehicleColor(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className='group/input'>
                        <label className='block text-sm font-semibold text-zinc-300 mb-2'>License Plate</label>
                        <div className='relative'>
                          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                            <svg className='w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-400 transition-colors' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <input
                            required
                            className='w-full bg-zinc-800/50 border-2 border-zinc-700/50 rounded-2xl pl-12 pr-4 py-3 text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800/70 transition-all duration-300 hover:border-zinc-600/50'
                            type="text"
                            placeholder='e.g., ABC-123'
                            value={vehiclePlate}
                            onChange={(e) => setVehiclePlate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Capacity & Type */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div className='group/input'>
                        <label className='block text-sm font-semibold text-zinc-300 mb-2'>Seating Capacity</label>
                        <div className='relative'>
                          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                            <svg className='w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-400 transition-colors' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <input
                            required
                            className='w-full bg-zinc-800/50 border-2 border-zinc-700/50 rounded-2xl pl-12 pr-4 py-3 text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800/70 transition-all duration-300 hover:border-zinc-600/50'
                            type="number"
                            placeholder='e.g., 4'
                            min='1'
                            value={vehicleCapacity}
                            onChange={(e) => setVehicleCapacity(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className='group/input'>
                        <label className='block text-sm font-semibold text-zinc-300 mb-2'>Vehicle Type</label>
                        <div className='relative'>
                          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                            <svg className='w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-400 transition-colors' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </div>
                          <select
                            required
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value)}
                            className='w-full bg-zinc-800/50 border-2 border-zinc-700/50 rounded-2xl pl-12 pr-4 py-3 text-white text-base focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800/70 transition-all duration-300 hover:border-zinc-600/50 appearance-none'
                          >
                            <option value='' className='bg-zinc-800'>Select vehicle type</option>
                            <option value='car' className='bg-zinc-800'>Car</option>
                            <option value='motorcycle' className='bg-zinc-800'>Motorcycle</option>
                            <option value='auto' className='bg-zinc-800'>Auto</option>
                          </select>
                          <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none'>
                            <svg className='w-4 h-4 text-zinc-500' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    disabled={loading}
                    type='submit'
                    className='group/btn relative w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-[length:200%_100%] hover:bg-right text-white py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-500 overflow-hidden hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 mt-8'
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
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Captain Account
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

                {/* Login Link */}
                <p className='text-center text-zinc-400 mt-6'>
                  Already have an account?{' '}
                  <button onClick={handleLoginClick} className='text-blue-400 font-semibold hover:text-blue-300 transition-colors'>
                    Login here
                  </button>
                </p>

                {/* Back to Role Selection */}
                <div className='mt-4 text-center'>
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

export default CaptainSignup