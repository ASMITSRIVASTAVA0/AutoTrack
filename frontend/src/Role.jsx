// import React from 'react'
// import { Link } from 'react-router-dom'

// const Role = () => {
//   return (
//     <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4'>
      
//       {/* Header */}
//       <div className='text-center mb-16'>
//         <h1 className='text-5xl font-bold text-white mb-3'>AutoTrack</h1>
//         <p className='text-xl text-gray-300'>Choose your role to continue</p>
//       </div>

//       {/* Cards Container */}
//       <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl'>
        
//         {/* Captain Card */}
//         <Link 
//           to='/captains/login'
//           className='group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-1 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105'
//         >
//           <div className='relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-80 group-hover:from-blue-500 group-hover:to-blue-700 transition-all duration-300'>
            
//             {/* Icon */}
//             <div className='mb-6 text-6xl'>🚗</div>
            
//             {/* Content */}
//             <h2 className='text-3xl font-bold text-white mb-2 text-center'>Captain</h2>
//             <p className='text-blue-100 text-center mb-6'>Login as Driver</p>
            
//             {/* Features */}
//             <ul className='text-sm text-blue-100 space-y-2 text-center'>
//               <li>✓ Accept Rides</li>
//               <li>✓ Track Earnings</li>
//               <li>✓ Manage Schedule</li>
//             </ul>
            
//             {/* Button Effect */}
//             <div className='mt-6 px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold group-hover:bg-blue-100 transition-colors duration-300'>
//               Get Started
//             </div>
//           </div>
//         </Link>

//         {/* User Card */}
//         <Link 
//           to='/login'
//           className='group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-700 p-1 shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105'
//         >
//           <div className='relative bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-80 group-hover:from-green-500 group-hover:to-green-700 transition-all duration-300'>
            
//             {/* Icon */}
//             <div className='mb-6 text-6xl'>👤</div>
            
//             {/* Content */}
//             <h2 className='text-3xl font-bold text-white mb-2 text-center'>User</h2>
//             <p className='text-green-100 text-center mb-6'>Login as Passenger</p>
            
//             {/* Features */}
//             <ul className='text-sm text-green-100 space-y-2 text-center'>
//               <li>✓ Book Rides</li>
//               <li>✓ Track Journey</li>
//               <li>✓ Safe Travel</li>
//             </ul>
            
//             {/* Button Effect */}
//             <div className='mt-6 px-6 py-2 bg-white text-green-600 rounded-lg font-semibold group-hover:bg-green-100 transition-colors duration-300'>
//               Get Started
//             </div>
//           </div>
//         </Link>

//         {/* Parent Card */}
//         <Link 
//           to='/parents/login'
//           className='group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-1 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105'
//         >
//           <div className='relative bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-80 group-hover:from-purple-500 group-hover:to-purple-700 transition-all duration-300'>
            
//             {/* Icon */}
//             <div className='mb-6 text-6xl'>👨‍👧</div>
            
//             {/* Content */}
//             <h2 className='text-3xl font-bold text-white mb-2 text-center'>Parent</h2>
//             <p className='text-purple-100 text-center mb-6'>Login as Guardian</p>
            
//             {/* Features */}
//             <ul className='text-sm text-purple-100 space-y-2 text-center'>
//               <li>✓ Monitor Child</li>
//               <li>✓ Real-time Tracking</li>
//               <li>✓ Safety Features</li>
//             </ul>
            
//             {/* Button Effect */}
//             <div className='mt-6 px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold group-hover:bg-purple-100 transition-colors duration-300'>
//               Get Started
//             </div>
//           </div>
//         </Link>
//       </div>

//       {/* Back Button */}
//       <Link 
//         to='/'
//         className='mt-12 px-8 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-300 shadow-lg'
//       >
//         ← Back to Home
//       </Link>
//     </div>
//   )
// }

// export default Role


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const Role = () => {
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const navigate=useNavigate();
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



  const handleBackClick = () => {
    console.log('Navigating back to home...')
    // Navigation logic: navigate to '/'
    navigate("/");
  }

  const parallaxStyle = {
    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
  }

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-black'>
      {/* Animated mesh gradient background */}
      <div className='absolute inset-0 opacity-60'>
        <div className='absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-black'></div>
        <div 
          className='absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-red-900/20 via-transparent to-blue-900/20 transition-transform duration-300 ease-out'
          style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` }}
        ></div>
      </div>

      {/* Animated orbs with parallax */}
      <div 
        className='absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-purple-600/40 to-pink-600/40 rounded-full blur-3xl animate-pulse transition-transform duration-300 ease-out'
        style={parallaxStyle}
      ></div>
      <div 
        className='absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl animate-pulse transition-transform duration-300 ease-out' 
        style={{ 
          animationDelay: '1s',
          transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
        }}
      ></div>
      <div 
        className='absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-full blur-3xl animate-pulse transition-transform duration-300 ease-out' 
        style={{ 
          animationDelay: '2s',
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
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
      <div className='relative z-30 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8'>
        
        {/* Header */}
        <div 
          className='text-center mb-12 sm:mb-16 transition-all duration-1000 ease-out'
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-40px)'
          }}
        >
          <h1 className='text-4xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight'>
            
            <span className='block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mt-1 animate-pulse'>
              Choose Your Role
            </span>
          </h1>
          <p className='text-lg sm:text-xl text-zinc-400'>Select how you want to use AutoTrack</p>
        </div>

        <div 
          className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl mb-12 transition-all duration-1000 ease-out delay-300'
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(60px)'
          }}
        >
        
          
          {/* Captain Card */}
          <button
            onClick={() => 
              // handleRoleClick('captain')
              navigate("/captains/login")
            }
            className='group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl border border-zinc-800/80 shadow-2xl hover:shadow-blue-500/30 transition-all duration-700 hover:scale-105 hover:-translate-y-2 cursor-pointer'
          >
            {/* Glow effect on hover */}
            <div className='absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-blue-500/20 group-hover:via-cyan-500/10 group-hover:to-blue-500/20 rounded-3xl transition-all duration-700'></div>
            
            <div className='relative p-8 flex flex-col items-center justify-center min-h-[400px]'>
              
              {/* Icon with animated background */}
              <div className='relative mb-6'>
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 scale-150'></div>
                <div className='relative w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500'>
                  <svg className='w-10 h-10 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
              </div>
              
              {/* Content */}
              <h2 className='text-3xl font-bold text-white mb-2 text-center group-hover:text-blue-400 transition-colors duration-500'>Captain</h2>
              <p className='text-zinc-400 text-center mb-6 group-hover:text-zinc-300 transition-colors duration-500'>Login as Driver</p>
              
              {/* Features */}
              <ul className='text-sm text-zinc-400 space-y-2 text-center mb-6'>
                <li className='flex items-center justify-center gap-2 group-hover:text-zinc-300 transition-colors'>
                  <svg className='w-4 h-4 text-blue-500' fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Accept Rides
                </li>
                <li className='flex items-center justify-center gap-2 group-hover:text-zinc-300 transition-colors'>
                  <svg className='w-4 h-4 text-blue-500' fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Track Earnings
                </li>
                <li className='flex items-center justify-center gap-2 group-hover:text-zinc-300 transition-colors'>
                  <svg className='w-4 h-4 text-blue-500' fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Manage Schedule
                </li>
              </ul>
              
              {/* Button */}
              <div className='px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold group-hover:shadow-xl group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110 flex items-center gap-2'>
                Get Started
                <svg className='w-4 h-4 transition-transform duration-500 group-hover:translate-x-1' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>

          {/* User Card */}
          <button
            onClick={() => 
              navigate("/login")
            }
            className='group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl border border-zinc-800/80 shadow-2xl hover:shadow-emerald-500/30 transition-all duration-700 hover:scale-105 hover:-translate-y-2 cursor-pointer'
          >
            {/* Glow effect on hover */}
            <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-green-500/0 to-emerald-500/0 group-hover:from-emerald-500/20 group-hover:via-green-500/10 group-hover:to-emerald-500/20 rounded-3xl transition-all duration-700'></div>
            
            <div className='relative p-8 flex flex-col items-center justify-center min-h-[400px]'>
              
              {/* Icon with animated background */}
              <div className='relative mb-6'>
                <div className='absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 scale-150'></div>
                <div className='relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500'>
                  <svg className='w-10 h-10 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              
              {/* Content */}
              <h2 className='text-3xl font-bold text-white mb-2 text-center group-hover:text-emerald-400 transition-colors duration-500'>User</h2>
              <p className='text-zinc-400 text-center mb-6 group-hover:text-zinc-300 transition-colors duration-500'>Login as Passenger</p>
              
              {/* Features */}
              <ul className='text-sm text-zinc-400 space-y-2 text-center mb-6'>
                <li className='flex items-center justify-center gap-2 group-hover:text-zinc-300 transition-colors'>
                  <svg className='w-4 h-4 text-emerald-500' fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Book Rides
                </li>
                <li className='flex items-center justify-center gap-2 group-hover:text-zinc-300 transition-colors'>
                  <svg className='w-4 h-4 text-emerald-500' fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Track Journey
                </li>
                <li className='flex items-center justify-center gap-2 group-hover:text-zinc-300 transition-colors'>
                  <svg className='w-4 h-4 text-emerald-500' fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Safe Travel
                </li>
              </ul>
              
              {/* Button */}
              <div className='px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold group-hover:shadow-xl group-hover:shadow-emerald-500/50 transition-all duration-500 group-hover:scale-110 flex items-center gap-2'>
                Get Started
                <svg className='w-4 h-4 transition-transform duration-500 group-hover:translate-x-1' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>

          {/* Parent Card */}
          <button
            onClick={() => 
              navigate("/parents/login")
            }
            className='group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl border border-zinc-800/80 shadow-2xl hover:shadow-purple-500/30 transition-all duration-700 hover:scale-105 hover:-translate-y-2 cursor-pointer'
          >
            {/* Glow effect on hover */}
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/20 group-hover:via-pink-500/10 group-hover:to-purple-500/20 rounded-3xl transition-all duration-700'></div>
            
            <div className='relative p-8 flex flex-col items-center justify-center min-h-[400px]'>
              
              {/* Icon with animated background */}
              <div className='relative mb-6'>
                <div className='absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 scale-150'></div>
                <div className='relative w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500'>
                  <svg className='w-10 h-10 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Content */}
              <h2 className='text-3xl font-bold text-white mb-2 text-center group-hover:text-purple-400 transition-colors duration-500'>Parent</h2>
              <p className='text-zinc-400 text-center mb-6 group-hover:text-zinc-300 transition-colors duration-500'>Login as Guardian</p>
              
              {/* Features */}
              <ul className='text-sm text-zinc-400 space-y-2 text-center mb-6'>
                <li className='flex items-center justify-center gap-2 group-hover:text-zinc-300 transition-colors'>
                  <svg className='w-4 h-4 text-purple-500' fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Monitor Child
                </li>
                <li className='flex items-center justify-center gap-2 group-hover:text-zinc-300 transition-colors'>
                  <svg className='w-4 h-4 text-purple-500' fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Real-time Tracking
                </li>
                <li className='flex items-center justify-center gap-2 group-hover:text-zinc-300 transition-colors'>
                  <svg className='w-4 h-4 text-purple-500' fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Safety Features
                </li>
              </ul>
              
              {/* Button */}
              <div className='px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 flex items-center gap-2'>
                Get Started
                <svg className='w-4 h-4 transition-transform duration-500 group-hover:translate-x-1' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className='group relative px-8 py-4 bg-zinc-900/70 backdrop-blur-xl text-white font-semibold rounded-2xl border border-zinc-800/70 hover:bg-zinc-900/90 hover:border-zinc-700 transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 flex items-center gap-2'
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)'
          }}
        >
          <svg className='w-5 h-5 transition-transform duration-500 group-hover:-translate-x-1' fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default Role