import React from 'react'
import {Link} from "react-router-dom";

const Start = () => {
  return (
    <div>
      <div className="bg-no-repeat bg-center bg-cover bg-[url(/AutoTrackLogo.png)] h-screen pt-8 flex justify-between flex-col w-full ">
        <img className="w-16 ml-8" 
        // src="../src/assets/AutoTrackLogo.png"
        />
        <div className="bg-white py-4 pb-7 px-4"> 
          <h2 className="text-3xl font-bold" >Get Started with AutoTrack</h2>
          <Link to="/login" className="flex items-center justify-center w-full bg-black text-white py-3 rounded mt-5">Continue</Link>
        </div>
      </div>
    </div>
  )
}

export default Start;