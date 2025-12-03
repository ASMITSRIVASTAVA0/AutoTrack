import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ParentDataContext } from '../context/ParentContext'

const ParentLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { parent, setParent } = useContext(ParentDataContext)
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/parents/login`, {
        email: email,
        password: password
      })

      if (response.status === 200) {
        const data = response.data
        setParent(data.parent)
        localStorage.setItem('token', data.token)
        navigate('/parent-home')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
      console.error('Parent login failed', err)
    } finally {
      setLoading(false)
    }

    setEmail('')
    setPassword('')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col justify-between p-6'>
      <div className='max-w-md mx-auto w-full'>
        {/* Logo */}
        <div className='mb-8'>
          <img className='w-14 h-14 object-contain' src="/autotracklogo.png" alt="AutoTrack Logo" />
        </div>

        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Parent Login</h1>
          <p className='text-gray-600'>Monitor your child's safe travel</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submitHandler} className='space-y-5'>
          {/* Email Field */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Email Address</label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-purple-500 transition-colors'
              type="email"
              placeholder='your.email@example.com'
            />
          </div>

          {/* Password Field */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Password</label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-purple-500 transition-colors'
              type="password"
              placeholder='Enter your password'
            />
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type='submit'
            className='w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6'
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Signup Link */}
        <p className='text-center text-gray-600 mt-6'>
          Don't have an account?{' '}
          <Link to='/parent-signup' className='text-purple-600 font-semibold hover:text-purple-700'>
            Sign up here
          </Link>
        </p>

        {/* Back to Role Selection */}
        <p className='text-center text-gray-600 mt-4'>
          <Link to='/role' className='text-gray-600 hover:text-gray-800 underline text-sm'>
            ← Back to role selection
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className='max-w-md mx-auto w-full text-center'>
        <p className='text-xs text-gray-500 leading-tight'>
          This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service</span> apply.
        </p>
      </div>
    </div>
  )
}

export default ParentLogin