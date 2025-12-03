
// import React, { useContext } from 'react'
// import { CaptainDataContext } from '../context/CaptainContext'

// const CaptainDetails = () => {

//     const { captain } = useContext(CaptainDataContext)

//     return (
//         <div>
//             <div className='flex items-center justify-between'>
//                 <div className='flex items-center justify-start gap-3'>
//                     <img 
//                     className='h-10 w-10 rounded-full object-cover' 
//                     src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdlMd7stpWUCmjpfRjUsQ72xSWikidbgaI1w&s" 
//                     alt="" />
//                     <h4 
//                     className='text-lg font-medium capitalize'>
//                         Hi! {captain.fullname.firstname + " " + captain.fullname.lastname}
//                     </h4>
//                 </div>
//                 <div>
//                     <h4 className='text-xl font-semibold'>₹{captain.earned}</h4>
//                     <p className='text-sm text-gray-600'>Earned</p>
//                 </div>
//             </div>
//             <div className='flex p-3 mt-8 bg-gray-100 rounded-xl justify-center gap-5 items-start'>
//                 <div className='text-center'>
//                     <i className="text-3xl mb-2 font-thin ri-timer-2-line"></i>
//                     <h5 className='text-lg font-medium'>{captain.rating}</h5>
//                     <p className='text-sm text-gray-600'>Rating</p>
//                 </div>
//                 <div className='text-center'>
//                     <i className="text-3xl mb-2 font-thin ri-speed-up-line"></i>
//                     <h5 className='text-lg font-medium'>{captain.totalkm}</h5>
//                     <p className='text-sm text-gray-600'>Total Km</p>
//                 </div>
//                 <div className='text-center'>
//                     <i className="text-3xl mb-2 font-thin ri-booklet-line"></i>
//                     <h5 className='text-lg font-medium'>10.2</h5>
//                     <p className='text-sm text-gray-600'>Hours Online</p>
//                 </div>

//             </div>
//         </div>
//     )
// }

// export default CaptainDetails

import React, { useContext, useState, useEffect } from 'react';
import { CaptainDataContext } from '../context/CaptainContext'


// ==================== CAPTAIN DETAILS ====================
const CaptainDetails = () => {
  const { captain } = useContext(CaptainDataContext);

  return (
    <div className="relative">
      {/* Gradient Header Card */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-2xl p-6 shadow-xl overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                className="h-14 w-14 rounded-full object-cover border-4 border-white shadow-lg" 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdlMd7stpWUCmjpfRjUsQ72xSWikidbgaI1w&s" 
                alt="Captain" 
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <p className="text-white text-opacity-90 text-xs font-medium mb-1">Welcome back,</p>
              <h4 className="text-white text-xl font-bold capitalize">
                {captain.fullname.firstname} {captain.fullname.lastname}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <h4 className="text-white text-3xl font-bold">₹{captain.earned}</h4>
            <p className="text-white text-opacity-80 text-sm font-medium">Total Earned</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
              <i className="ri-star-fill text-white text-2xl"></i>
            </div>
            <h5 className="text-2xl font-bold text-gray-800">{captain.rating}</h5>
            <p className="text-sm text-gray-600 font-medium mt-1">Rating</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-md">
              <i className="ri-map-pin-distance-fill text-white text-2xl"></i>
            </div>
            <h5 className="text-2xl font-bold text-gray-800">{captain.totalkm}</h5>
            <p className="text-sm text-gray-600 font-medium mt-1">Total Km</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-3 shadow-md">
              <i className="ri-time-fill text-white text-2xl"></i>
            </div>
            <h5 className="text-2xl font-bold text-gray-800">10.2</h5>
            <p className="text-sm text-gray-600 font-medium mt-1">Hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptainDetails;