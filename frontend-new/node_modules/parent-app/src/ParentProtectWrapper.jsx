import React, { useContext, useEffect, useState } from 'react'
import { ParentDataContext } from './context/ParentContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const ParentProtectWrapper = ({
    children
}) => {
    // const token = localStorage.getItem('token')
    const token = localStorage.getItem('tokenParent')
    const navigate = useNavigate()
    const { parent, setParent } = useContext(ParentDataContext)
    const [ isLoading, setIsLoading ] = useState(true)

    useEffect(() => {
        if (!token) {
            console.log('No token found, redirecting to login')
            navigate('/parents/login')
            return
        }

        axios.get(`${import.meta.env.VITE_BACKEND_URL}/parents/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            console.log('Parent profile fetched successfully:', response.data)
            if (response.status === 200) {
                setParent(response.data.parent)
                setIsLoading(false)
            }
        }).catch(err => {
                console.error('Error fetching parent profile:', err)
                localStorage.removeItem('tokenParent')
                navigate('/parents/login')
            })
    }, [ token ])

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
                    <p className='text-gray-600 font-semibold'>Loading your account...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            {children}
        </>
    )
}

export default ParentProtectWrapper