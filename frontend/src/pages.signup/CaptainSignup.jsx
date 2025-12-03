import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/CaptainContext'

const CaptainSignup = () => {
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
  const { captain, setCaptain } = React.useContext(CaptainDataContext)

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

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-between p-6'>
      <div className='max-w-md mx-auto w-full'>
        {/* Logo */}
        <div className='mb-8'>
          <img className='w-14 h-14 object-contain' src="/autotracklogo.png" alt="AutoTrack Logo" />
        </div>

        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Become a Captain</h1>
          <p className='text-gray-600'>Start earning by driving with AutoTrack</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submitHandler} className='space-y-4 max-h-96 overflow-y-auto pr-2'>
          {/* Personal Info */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Full Name</label>
            <div className='flex gap-3'>
              <input
                required
                className='flex-1 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors'
                type="text"
                placeholder='First name'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                className='flex-1 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors'
                type="text"
                placeholder='Last name'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Email Address</label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors'
              type="email"
              placeholder='your.email@example.com'
            />
          </div>

          {/* Password */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Password</label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors'
              type="password"
              placeholder='At least 6 characters'
            />
          </div>

          {/* Vehicle Section */}
          <div className='border-t-2 border-gray-300 pt-4 mt-4'>
            <h3 className='font-semibold text-gray-900 mb-3'>Vehicle Details</h3>

            {/* Color & Plate */}
            <div className='flex gap-3 mb-3'>
              <input
                required
                className='flex-1 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors'
                type="text"
                placeholder='Vehicle color'
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
              />
              <input
                required
                className='flex-1 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors'
                type="text"
                placeholder='License plate'
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
              />
            </div>

            {/* Capacity & Type */}
            <div className='flex gap-3'>
              <input
                required
                className='flex-1 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors'
                type="number"
                placeholder='Seating capacity'
                min='1'
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
              />
              <select
                required
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className='flex-1 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors'
              >
                <option value=''>Select vehicle type</option>
                <option value='car'>Car</option>
                <option value='motorcycle'>Motorcycle</option>
                <option value='auto'>Auto</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type='submit'
            className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6'
          >
            {loading ? 'Creating Account...' : 'Create Captain Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className='text-center text-gray-600 mt-6'>
          Already have an account?{' '}
          <Link to='/captain-login' className='text-blue-600 font-semibold hover:text-blue-700'>
            Login here
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

export default CaptainSignup