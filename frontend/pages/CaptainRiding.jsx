import React from "react";
import {Link} from "react-router-dom";
import FinishRide from "../Components/FinishRide";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {useState,useRef} from "react";

const CaptainRiding=()=>{

  const [finishRidePanel,setFinishRidePanel]=useState(false);
  const finishRidePanelRef=useRef(null);

  useGSAP(function(){
    if(finishRidePanel){
      gsap.to(finishRidePanelRef.current,{
        transform:"translateY(0)"
      })
    }
    else{
      gsap.to(finishRidePanelRef.current,{
        transform:"translateY(100%)"
      })
    }
  },[finishRidePanel]);


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
            className="h-1/5 bg-yellow-400 p-6 flex items-center justify-between relative pt-10 "
            onClick={()=>{
              setFinishRidePanel(true)
            }}
            >
              <h5
              className="p-1 text-center w-[95%] absolute  top-0 "
              // onClick={()=>{

              // }}
              >
                <i className="text-3xl text-black-900 ri-arrow-down-wide-line "></i>
              </h5>
              <h4 className="text-xl font-semibold " >4 KM away</h4>
              <button
              className="bg-green-600 text-white font-semibold p-3 px-10 rounded-lg "
              >Complete Ride</button>
            </div>

            <div 
            className="translate-y-full fixed w-full h-screen z-10 bottom-0 bg-yellow-200 px-3 py-6 pt-12"
            ref={finishRidePanelRef}
            >
                <FinishRide
                setFinishRidePanel={setFinishRidePanel}
                />
            </div>

        </div>

        
    )
};

export default CaptainRiding;