// import React from 'react'
// // import rideModel from '../../../Backend/models/ride.model';

// const LookingForDriver = (props) => {
//     return (
//         <div>
//             {/* mycode */}
//             <h1>rideid={props.ride}</h1>


//             <h5 
//             className='p-1 text-center w-[93%] absolute top-0' 
//             onClick={() => {
//                 props.setVehicleFound(false)
//             }}>
//                 <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
//             </h5>


//             <h3 className='text-2xl font-semibold mb-5'>Looking for a Driver</h3>

//             <div className='flex gap-2 justify-between flex-col items-center'>
//                 <img className='h-20' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />

//                 <div className='w-full mt-5'>

//                     <div className='flex items-center gap-5 p-3 border-b-2'>
//                         <i className="ri-map-pin-user-fill"></i>
//                         <div>
//                             <h3 className='text-lg font-medium'>Pickup</h3>
//                             <p className='text-sm -mt-1 text-gray-600'>{props.pickup}</p>
//                         </div>
//                     </div>


//                     <div className='flex items-center gap-5 p-3 border-b-2'>
//                         <i className="text-lg ri-map-pin-2-fill"></i>
//                         <div>
//                             <h3 className='text-lg font-medium'>Destination</h3>
//                             <p className='text-sm -mt-1 text-gray-600'>{props.destination}</p>
//                         </div>
//                     </div>


//                     <div className='flex items-center gap-5 p-3'>
//                         <i className="ri-currency-line"></i>
//                         <div>
//                             <h3 className='text-lg font-medium'>₹{props.fare[ props.vehicleType ]} </h3>
//                             <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
//                         </div>
//                     </div>

                    
//                 </div>
//                 <button
//                 onClick={()=>{
//                     props.createRide();
//                 }}
//                 className='bg-red-500'
//                 >
//                     confirm loooking for driver
//                 </button>
                
//             </div>
//         </div>
//     )
// }

// export default LookingForDriver

// LookingForDriver.jsx
import React from 'react'

const LookingForDriver = (props) => {
    // Safely extract addresses
    const pickupAddress = typeof props.pickup === 'string' 
        ? props.pickup 
        : props.pickup?.address || '';

    const destinationAddress = typeof props.destination === 'string' 
        ? props.destination 
        : props.destination?.address || '';

    // Safely extract ride data
    const rideData = props.ride || {};

    return (
        <div>
            <h5 
            className='p-1 text-center w-[93%] absolute top-0' 
            onClick={() => {
                props.setVehicleFound(false)
            }}>
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>
            
            <div className='text-center'>
                <h1 className='text-2xl font-semibold mb-4'>Looking for Driver</h1>
                <div className='animate-pulse'>
                    <i className="ri-car-line text-4xl text-blue-500"></i>
                </div>
                
                <div className='mt-6 text-left'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill text-blue-500"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Pickup</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{pickupAddress}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill text-red-500"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{destinationAddress}</p>
                        </div>
                    </div>
                    {rideData.otp && (
                        <div className='flex items-center gap-5 p-3 border-b-2'>
                            <i className="ri-shield-keyhole-line text-green-500"></i>
                            <div>
                                <h3 className='text-lg font-medium'>OTP</h3>
                                <p className='text-sm -mt-1 text-gray-600'>{rideData.otp}</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <p className='mt-4 text-gray-600'>Please wait while we find a driver for you...</p>
            </div>
        </div>
    )
}

export default LookingForDriver