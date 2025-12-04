

import React, { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom';
//useNavigate() is hook to navigate
// navigate(-1) go back, navigate(1) go forward
// ,navigate("/login",{replace:true})//no back button history
// ,navigate("/profile",{state:{userid:10}})//navigate with state(send data)


const Start = () => {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)//useState add state to functional comp,return arr with curr state and setter func, re-render when state changes
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

  
  const parallaxStyle = {
    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
  }

  return (
    <div className='relative h-screen w-full overflow-hidden bg-black'>
      {/* Animated mesh gradient background */}
      <div className='absolute inset-0 opacity-60'>
        <div className='absolute inset-0 bg-gradient-to-br from-red-900/40 via-blue-900/30 to-black'></div>
        <div 
          className='absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-red-900/20 via-transparent to-blue-900/20 transition-transform duration-300 ease-out'
          style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` }}
        ></div>
      </div>
      
      {/* Background image */}
      <div 
        className='absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-out opacity-50'
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1619059558110-c45be64b73ae?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
          transform: mounted ? `scale(1) translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)` : 'scale(1.15)',
          filter: 'brightness(0.5) contrast(1.2)'
        }}
      ></div>

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

      {/* Floating particles */}
      <div className='absolute inset-0 z-10'>

        {/* ...=> spread oper, used to expand arr, obj, iterable into individual elem, let copy, merge, expand structures */}
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
      <div className='relative z-30 h-full flex flex-col justify-between p-6 sm:p-8 md:p-10 max-w-7xl mx-auto'>
        
        {/* Top section - Logo */}
        <div 
          className='transition-all duration-1000 ease-out'
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-40px)'
          }}
        >
          <div className='group inline-flex items-center gap-3 bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-zinc-700/50 shadow-2xl hover:shadow-red-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-pointer'>
            <div className='relative w-11 h-11 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-500/60 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110'>
              <div className='absolute inset-0 bg-gradient-to-br from-red-400 to-orange-400 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-500'></div>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='relative w-6 h-6 text-white'>
                <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="currentColor"/>
              </svg>
            </div>
            <span className='text-white font-bold text-xl sm:text-2xl tracking-tight'>AutoTrack</span>
            <div className='ml-2 px-2 py-1 bg-red-500/20 rounded-lg border border-red-500/30'>
              <span className='text-red-400 text-xs font-semibold'>FREE</span>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div 
          className='transition-all duration-1000 ease-out delay-300 max-w-2xl mx-auto w-full'
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(60px)'
          }}
        >
          {/* Main Card */}
          <div className='group relative bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-black/95 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 md:p-10 border border-zinc-800/80 shadow-2xl hover:shadow-purple-500/10 transition-all duration-700 hover:border-zinc-700/80'>
            
            {/* Glow effect on hover */}
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-blue-500/5 rounded-[32px] transition-all duration-700'></div>
            
            {/* Content */}
            <div className='relative'>
              {/* Accent line */}
              <div className='w-20 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full mb-6 shadow-lg shadow-red-500/50'></div>
              
              {/* Heading */}
              <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight'>
                Get Started with
                <span className='block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mt-1 animate-pulse'>
                  AutoTrack
                </span>
              </h1>
              
              <p className='text-zinc-400 text-sm sm:text-base md:text-lg mb-8 leading-relaxed'>
                Your premium ride is just a tap away. Experience comfort, safety, and reliability like never before.
              </p>

              {/* Features Grid */}
              <div className='grid grid-cols-3 gap-3 sm:gap-4 mb-8'>
                {[
                  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Quick', color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/30' },
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Secure', color: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/30' },
                  { icon: 'M5 13l4 4L19 7', label: 'Easy', color: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/30' }
                ].map((feature, i) => (
                  <div 
                    key={i}
                    className='group/card bg-zinc-800/50 backdrop-blur rounded-2xl p-3 sm:p-4 border border-zinc-700/50 hover:border-zinc-600 transition-all duration-500 hover:scale-110 hover:-translate-y-2 cursor-pointer hover:shadow-xl hover:bg-zinc-800/80'
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-2 shadow-lg ${feature.shadow} group-hover/card:shadow-2xl group-hover/card:scale-110 transition-all duration-500 group-hover/card:rotate-12`}>
                      <svg className='w-5 h-5 sm:w-6 sm:h-6 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={feature.icon} />
                      </svg>
                    </div>
                    <p className='text-xs sm:text-sm text-zinc-300 font-semibold group-hover/card:text-white transition-colors duration-300'>{feature.label}</p>
                  </div>
                ))}
              </div>

              {/* Continue Button */}
              <button 
                onClick={() => navigate('/role')}
                className='group/btn relative w-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-[length:200%_100%] hover:bg-right text-white py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg shadow-2xl shadow-red-500/40 hover:shadow-red-500/60 transition-all duration-500 overflow-hidden hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]'
              >
                {/* Animated shine */}
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000'></div>
                
                {/* Pulse effect */}
                <div className='absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-0 group-hover/btn:opacity-100'></div>
                
                <span className='relative flex items-center justify-center gap-2 sm:gap-3'>
                  Continue
                  <svg 
                    className='w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 group-hover/btn:translate-x-2 group-hover/btn:scale-125' 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              {/* Footer text */}
              <p className='text-center text-xs sm:text-sm text-zinc-500 mt-6 leading-relaxed'>
                By continuing, you agree to our{' '}
                <span 
                className='text-zinc-400 underline hover:text-white transition-colors cursor-pointer'
                onClick={()=>{
                  navigate("/termsofservice");
                }}
                >Terms of Service</span>
                {' '}and{' '}
                <span 
                className='text-zinc-400 underline hover:text-white transition-colors cursor-pointer'
                onClick={()=>{
                  navigate("/privacypolicy")
                }}
                >Privacy Policy</span>
              </p>
            </div>
          </div>

        
        </div>
      </div>
    </div>
  )
}

export default Start



// react comp using function instead of class
// const Start=()=>{...}==>can use hooks to manage state and side effects
// hooks are func that allow functional comp(no need of class comp) to use state, methods, contexts, refs,etc
// hooks e.g. 
// useState() manage state(independent), 
// useReducer() manage state(complex, depend on prev state, state has multi sub values)
// useEffect() runs side-effects like fetching data, timers, event listeners, 
// useContext() access global data without props drilling,
// useRef() access DOM elem, 
// useMemo(()=>heavyfunc(num),[num]) memoize expensive calc
// useCallback memoize func to avoid re-render, const handleclick=useCallback(()=>{...},[])
// class Components extends React.Components, use "this" to access, complex than functional component

// start.jsx==> jsx=javascript xml(extensible markup language)
// syntax extension for js to describe ui in react comp, put js expression inside {},
// attribute become props, class=>className, for=>htmlFor,eventHandler are camelcase=onClick,onChange
// fragments <> <h1><p><i>  </> let return multi top-level elem without extra DOM node
// Array.map() for lists: {items.map(i=><li>hello</li>)}
// jsx=>react(frontend), client side render, {}, virtual DOM elem output
// ejs=>node.js(backend), server-side render, <%= %>, plain HTML

// props==. properties, READ-only inputs passed from par to child comp,while STATE are mutable
/*
function App(){
  return <Greeting name="asmit"/>
}
function Greeting(props){
  return <h1>{props.name}</h1>
}
*/

// arrow func lexically binds this context
// arrow func doNOT hve own this, they inherit this from par scope, called lexical scoping
// function(){}, this depends on how func is called
// ()=>{}, this depends on where func is written(lexical environment)


// relative==space it originally occupy remains reserved, move relative to original position
// absolute==relative to nearest positioned ancestor
// fixed=====relative to viewport(browser window)

// display=>flex(1d layout row or col), support justify-content, align-items, gap
// grid(2d layout row and col), support grid-template-columns, grid-template-rows, gap
// inline-flex(flex container that behave like inline(no next line force) text), 
// block(default display type for <div>, occupies full width of par,force new line before and after)