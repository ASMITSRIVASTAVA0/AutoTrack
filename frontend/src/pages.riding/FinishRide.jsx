// import React from 'react'
// import axios from 'axios'
// import { useNavigate } from 'react-router-dom'

// const FinishRide = (props) => {
//     const navigate = useNavigate()

//     // Safely access ride properties
//     const userName = props.ride?.user?.fullname ? 
//         `${props.ride.user.fullname.firstname} ${props.ride.user.fullname.lastname}` : 
//         'Customer';

//     const pickupAddress = typeof props.ride?.pickup === 'string' ? 
//         props.ride.pickup : 
//         props.ride?.pickup?.address || 'Pickup location';

//     const destinationAddress = typeof props.ride?.destination === 'string' ? 
//         props.ride.destination : 
//         props.ride?.destination?.address || 'Destination';

//     const fare = props.ride?.fare || 'Calculating...';

//     async function endRide() {
//         if (!props.ride?._id) {
//             console.error("No ride ID found");
//             return;
//         }

//         try {
//             const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/end-ride`, {
//                 rideId: props.ride._id
//             }, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('token')}`
//                 }
//             })

//             if (response.status === 200) {
//                 navigate('/captain-home')
//             }
//         } catch (error) {
//             console.error("Error ending ride:", error);
//         }
//     }

//     return (
//         <div>
//             <h5 
//                 className='p-1 text-center w-[93%] absolute top-0' 
//                 onClick={() => {
//                     props.setFinishRidePanel(false)
//                 }}
//             >
//                 <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
//             </h5>

//             <h3 className='text-2xl font-semibold mb-5'>Finish this Ride</h3>

//             <div className='flex items-center justify-between p-4 border-2 border-yellow-400 rounded-lg mt-4'>
//                 <div className='flex items-center gap-3 '>
//                     <img 
//                         className='h-12 rounded-full object-cover w-12' 
//                         src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" 
//                         alt="" 
//                     />
//                     <h2 className='text-lg font-medium'>{userName}</h2>
//                 </div>
//                 <h5 className='text-lg font-semibold'>2.2 KM</h5>
//             </div>
            
//             <div className='flex gap-2 justify-between flex-col items-center'>
//                 <div className='w-full mt-5'>
//                     <div className='flex items-center gap-5 p-3 border-b-2'>
//                         <i className="ri-map-pin-user-fill"></i>
//                         <div>
//                             <h3 className='text-lg font-medium'>Pickup</h3>
//                             <p className='text-sm -mt-1 text-gray-600'>{pickupAddress}</p>
//                         </div>
//                     </div>
//                     <div className='flex items-center gap-5 p-3 border-b-2'>
//                         <i className="text-lg ri-map-pin-2-fill"></i>
//                         <div>
//                             <h3 className='text-lg font-medium'>Destination</h3>
//                             <p className='text-sm -mt-1 text-gray-600'>{destinationAddress}</p>
//                         </div>
//                     </div>
//                     <div className='flex items-center gap-5 p-3'>
//                         <i className="ri-currency-line"></i>
//                         <div>
//                             <h3 className='text-lg font-medium'>₹{fare}</h3>
//                             <p className='text-sm -mt-1 text-gray-600'>Charges</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className='mt-10 w-full'>
//                     <button
//                         onClick={endRide}
//                         className='w-full mt-5 flex text-lg justify-center bg-green-600 text-white font-semibold p-3 rounded-lg'
//                     >
//                         Finish Ride
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default FinishRide
import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const FinishRide = (props) => {
    const navigate = useNavigate()

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

    async function endRide() {
        if (!props.ride?._id) {
            console.error("No ride ID found");
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/end-ride`, {
                rideId: props.ride._id
            }, {
                headers: {
                    // Authorization: `Bearer ${localStorage.getItem('token')}`
                    Authorization: `Bearer ${localStorage.getItem('tokenCaptain')}`
                }
            })

            if (response.status === 200) {
                navigate('/captain-home')
            }
        } catch (error) {
            console.error("Error ending ride:", error);
        }
    }

    return (
        <div className="relative">
            <div className="mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Finish Ride</h2>
                <p className="text-gray-400 text-sm">Complete the ride and collect payment</p>
            </div>

            {/* Passenger Card */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6 animate-slideInUp">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full opacity-20 animate-ping"></div>
                            <img 
                                className="h-12 w-12 rounded-full object-cover border-2 border-emerald-500/50 relative z-10" 
                                src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" 
                                alt="Passenger" 
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-white">{userName}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <i className="ri-star-fill text-yellow-400 text-sm"></i>
                                <span className="text-sm text-gray-400">4.8 • 2.2 KM away</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ride Details */}
            <div className="space-y-3 mb-8">
                {/* Pickup */}
                <div className="group/pickup flex items-center gap-4 p-3 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover/pickup:scale-110 transition-transform">
                        <i className="ri-map-pin-user-fill text-white text-lg"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm text-gray-400">Pickup</h3>
                        <p className="text-white font-medium">{pickupAddress}</p>
                    </div>
                </div>

                {/* Destination */}
                <div className="group/dest flex items-center gap-4 p-3 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg group-hover/dest:scale-110 transition-transform">
                        <i className="ri-map-pin-2-fill text-white text-lg"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm text-gray-400">Destination</h3>
                        <p className="text-white font-medium">{destinationAddress}</p>
                    </div>
                </div>

                {/* Fare */}
                <div className="group/fare flex items-center gap-4 p-3 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover/fare:scale-110 transition-transform">
                        <i className="ri-currency-line text-white text-lg"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm text-gray-400">Fare</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-white">₹{fare}</p>
                            <span className="text-xs text-gray-400">(incl. all charges)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={endRide}
                    className="group/finish relative w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
                >
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/finish:translate-x-full transition-transform duration-1000'></div>
                    <i className="ri-checkbox-circle-line group-hover/finish:scale-110 transition-transform"></i>
                    Complete & Collect Payment
                </button>

                <button
                    onClick={() => props.setFinishRidePanel(false)}
                    className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg"
                >
                    <i className="ri-arrow-down-line"></i>
                    Close Panel
                </button>
            </div>
        </div>
    )
}

export default FinishRide