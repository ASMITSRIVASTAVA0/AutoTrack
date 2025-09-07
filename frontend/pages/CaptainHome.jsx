import React from 'react'
import {Link} from "react-router-dom";
import CaptainDetails from '../Components/CaptainDetails';
import RidePopUp from '../Components/RidePopUp';
import {useState} from "react";
import {useRef} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import ConfirmRidePopUp from '../Components/ConfirmRidePopUp';

const CaptainHome = () => {
  const [ridePopUpPanel,setRidePopUpPanel]=useState(true);
  const ridePopUpPanelRef=useRef(null);

  useGSAP(function(){
    if(ridePopUpPanel){
      gsap.to(ridePopUpPanelRef.current,{
        transform:"translateY(0)"
      })
    }
    else{
      gsap.to(ridePopUpPanelRef.current,{
        transform:"translateY(100%)"
      })
    }
  },[ridePopUpPanel]);

  const [confirmRidePopUpPanel,setConfirmRidePopUpPanel]=useState(false);
  const confirmRidePopUpPanelRef=useRef(null);

  useGSAP(function(){
    if(confirmRidePopUpPanel){
      gsap.to(confirmRidePopUpPanelRef.current,{
        transform:"translateY(0)"
      })
    }
    else{
      gsap.to(confirmRidePopUpPanelRef.current,{
        transform:"translateY(100%)"
      })
    }
  },[confirmRidePopUpPanel]);



  return (
        <div
        className="h-screen"
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
            className="h-3/5"
            >
                <img 
                src="/map2img.png"
                className="h-full w-full object cover"
                />
            </div>
            <div
            className="h-2/5"
            >
    
              <CaptainDetails/>

            </div>

            <div 
            className="translate-y-full fixed w-full z-10 bottom-0 bg-yellow-200 px-3 py-6 pt-12"
            ref={ridePopUpPanelRef}
            >
                <RidePopUp
                setRidePopUpPanel={setRidePopUpPanel}
                setConfirmRidePopUpPanel={setConfirmRidePopUpPanel}
                
                />
            </div>

            <div 
            className="translate-y-full fixed w-full h-screen z-10 bottom-0 bg-yellow-200 px-3 py-6 pt-12"
            ref={confirmRidePopUpPanelRef}
            >
                <ConfirmRidePopUp
                setConfirmRidePopUpPanel={setConfirmRidePopUpPanel}
                setRidePopUpPanel={setRidePopUpPanel}
              
                />
            </div>
        </div>
  )
}

export default CaptainHome;