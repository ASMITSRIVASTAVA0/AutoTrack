import React from "react";
import {Link} from "react-router-dom";
const CaptainRiding=()=>{
    return (
        <div
        className="h-screen relative"
        >
            <div
            className="fixed right-2 top-2"
            >
              <Link
              to="/captain-login"
              className=" h-15 w-15 bg-yellow-200 flex items-center justify-center rounded-full "
              >
                  <i className="font-lg text-3xl ri-logout-box-r-line"></i>
              </Link>
            </div>
            
            <div 
            className="h-4/5"
            >
                <img 
                src="/map2img.png"
                className="h-full w-full object cover"
                />
            </div>

            <div
            className="h-1/5 bg-yellow-400 p-6 flex items-center justify-between  "
            >
              <h5
              className="p-1 text-center w-[90%] relative top-0 bg-gray-800 h-5 w-5 text-white"
              onClick={()=>{

              }}
              >
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line "></i>
              </h5>
              <h4 className="text-xl font-semibold " >4 KM away</h4>
              <button
              className="bg-green-600 text-white font-semibold p-3 px-10 rounded-lg "
              >Complete Ride</button>
            </div>

        </div>
    )
};

export default CaptainRiding;