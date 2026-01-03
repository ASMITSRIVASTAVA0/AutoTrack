import React from 'react'
import {Suspense} from "react";

const RidePopUp = (props) => {
    // Safely access ride properties
    const userName = props.ride?.user?.fullname ? 
        `${props.ride.user.fullname.firstname} ${props.ride.user.fullname.lastname}` : 
        'Customer';

    const pickupAddress = typeof props.ride?.pickup === 'string' ? 
        props.ride.pickup : 
        props.ride?.pickup?.address || 'Pickup location';

    const destinationAddress = typeof props.ride?.destination === 'string' ? 
        props.ride.destination : 
        props.ride?.destination?.address || 'Destination';

    const fare = props.ride?.fare || 'Calculating...';

    const ridePopupPanelRef=props.ridePopupPanelRef;

    return (
        <div 
        ref={ridePopupPanelRef} 
        className='
        text-white
        fixed w-full z-60 bottom-0 bg-gradient-to-t from-gray-900 via-black to-gray-900 rounded-t-3xl shadow-2xl overflow-hidden border-t border-white/10'
        style={{ opacity: 0 }}
        >
            <div className='p-4 sm:p-6 pt-6 sm:pt-8'>
                <div className='flex justify-center mb-4'>
                    <div className='w-12 sm:w-16 h-1 sm:h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full'></div>
                </div>
                <Suspense fallback={<div className="text-white text-center">Loading ride details...</div>}>
                    <div>
                        <h5 
                            className='p-1 text-center w-[93%] absolute top-0' 
                            onClick={() => {
                                props.setRidePopupPanel(false)
                            }}
                        >
                            <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
                        </h5>

                        <h3 className='text-2xl font-semibold mb-5'>New Ride Available!</h3>

                        <div className='flex items-center justify-between p-3 bg-yellow-400 rounded-lg mt-4'>
                            <div className='flex items-center gap-3 '>
                                <img className='h-12 rounded-full object-cover w-12' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="" />
                                <h2 className='text-lg font-medium'>{userName}</h2>
                            </div>
                            <h5 className='text-lg font-semibold'>-1 KM</h5>
                        </div>

                        <div className='flex gap-2 justify-between flex-col items-center'>
                            <div className='w-full mt-5'>
                                <div className='flex items-center gap-5 p-3 border-b-2'>
                                    <i className="ri-map-pin-user-fill"></i>
                                    <div>
                                        <h3 className='text-lg font-medium'>Pickup</h3>
                                        <p className='text-sm -mt-1 text-gray-600'>{pickupAddress}</p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-5 p-3 border-b-2'>
                                    <i className="text-lg ri-map-pin-2-fill"></i>
                                    <div>
                                        <h3 className='text-lg font-medium'>Destination</h3>
                                        <p className='text-sm -mt-1 text-gray-600'>{destinationAddress}</p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-5 p-3'>
                                    <i className="ri-currency-line"></i>
                                    <div>
                                        <h3 className='text-lg font-medium'>₹{fare}</h3>
                                        <p className='text-sm -mt-1 text-gray-600'>Charge</p>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-5 w-full '>
                                <button 
                                    onClick={() => {
                                        props.setConfirmRidePopupPanel(true)
                                        props.confirmRide()
                                    }} 
                                    className='bg-green-600 w-full text-white font-semibold p-2 px-10 rounded-lg'
                                >
                                    Accept
                                </button>

                                <button 
                                    onClick={() => {
                                        props.setRidePopupPanel(false)
                                    }} 
                                    className='mt-2 w-full bg-gray-300 text-gray-700 font-semibold p-2 px-10 rounded-lg'
                                >
                                    Ignore
                                </button>
                            </div>
                        </div>
                    </div>
                </Suspense>
            </div>
        </div>
        
    )
}

export default RidePopUp