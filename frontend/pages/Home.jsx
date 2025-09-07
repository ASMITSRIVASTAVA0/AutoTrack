import React from 'react';
import {useGSAP} from "@gsap/react";
import {useState} from "react";
import gsap from "gsap";
import { useRef } from 'react';
import 'remixicon/fonts/remixicon.css';
import LocationSearchPanel from '../Components/LocationSearchPanel';
import VehiclePanel from '../Components/VehiclePanel';
import ConfirmRide from '../Components/ConfirmRide';
import LookingForDriver from '../Components/LookingForDriver';
import WaitingForDriver from '../Components/WaitingForDriver';

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen,setPanelOpen]=useState(false);

  const panelRef=useRef(null);

  const panelCloseRef = useRef(null);

  const [vehiclePanelOpen,setVehiclePanel]=useState(false);

  const submitHandler=(e)=>{
    e.preventDefault();
  }

  useGSAP(function(){
    if(panelOpen)
    {
      gsap.to(panelCloseRef.current,{opacity:1})
      gsap.to(panelRef.current,
        {
          height:"70%",
          padding:20,
          opacity:1
        }
      );
    }
    else
    {
      gsap.to(panelCloseRef.current,{opacity:0});
      gsap.to(panelRef.current,
        {
          height:'0%',
          padding:0,
          opacity:0
        });
    }
  },[panelOpen]);

  const vehiclePanelRef=useRef(null);

  useGSAP(function(){
    if(vehiclePanelOpen){
      gsap.to(vehiclePanelRef.current,{
        transform:"translateY(0)"
      })
    }
    else{
      gsap.to(vehiclePanelRef.current,{
        transform:"translateY(100%)"
      })
    }
  },[vehiclePanelOpen]);

  const [confirmRidePanel,setConfirmRidePanel]=useState(false);

  const confirmRidePanelRef=useRef(null);

  useGSAP(function(){
    if(confirmRidePanel){
      gsap.to(confirmRidePanelRef.current,{
        transform:"translateY(0)"
      })
    }
    else{
      gsap.to(confirmRidePanelRef.current,{
        transform:"translateY(100%)"
      })
    }
  },[confirmRidePanel]);

  
  const [vehicleFound,setVehicleFound]=useState(false);

  const vehicleFoundRef=useRef(null);

  useGSAP(function(){
    if(vehicleFound){
      gsap.to(vehicleFoundRef.current,{
        transform:"translateY(0)"
      })
    }
    else{
      gsap.to(vehicleFoundRef.current,{
        transform:"translateY(100%)"
      })
    }
  },[vehicleFound]);

  const [waitingForDriver,setWaitingForDriver]=useState(false);
  const waitingForDriverRef=useRef(null);

  useGSAP(function(){
    if(waitingForDriver){
      gsap.to(waitingForDriverRef.current,{
        transform:"translateY(0)"
      })
    }
    else{
      gsap.to(waitingForDriverRef.current,{
        transform:"translateY(100%)"
      })
    }
  },[waitingForDriver]);


  return (
    <div className="h-screen relative overflow-hidden " >

      <div className="absolute" >
        <h1 className="text-2xl">AutoTrack</h1>  
      </div>
      <div 
      onClick={()=>{
        setVehiclePanel(false)
      }}
      className="h-screen w-screen absolute  z-0  ">
        <img className="h-full w-full object-cover " src="/homeimg.jpg" alt="home background image"/>
      </div>

      <div className="flex flex-col justify-end bg-white absolute top-0 h-screen w-full" >
        <div className="h-[30%] p-6 bg-white relative" >
          <h4
          ref={panelCloseRef}
          onClick={()=>{
            setPanelOpen(false)
          }}
          className="opacity-0 absolute right-6 top-6 text-2xl" >
            <i className="ri-arrow-down-s-line"></i>
          </h4>
          <h4 className="text-2xl font-semibold" >Find a Trip</h4>
          <form
          onSubmit={(e)=>{
            submitHandler(e);
          }}
          >
            <div className="line absolute h-16 w-1 top-[45%] left-10 bg-gray-900 rounded-full"></div>
            <input 
            className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-6 " 
            type="text" 
            placeholder="Add a pick-up location" 
            value={pickup}
            onClick={()=>{
              setPanelOpen(true);
            }}
            onChange={(e)=>{
              setPickup(e.target.value);
            }}
            />

            <input 
            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3 ' 
            type="text"
            placeholder="Enter your destination" 
            value={destination}
            onClick={()=>{
              setPanelOpen(true);
            }}
            onChange={(e)=>{
              setDestination(e.target.value);
            }}
            />
          </form>
        </div>
        <div ref={panelRef} className="opacity-0 bg-[#eee] h-0" >
            <LocationSearchPanel
            vehiclePanelOpen={vehiclePanelOpen}
            setVehiclePanel={setVehiclePanel}
            panelOpen={panelOpen}
            setPanelOpen={setPanelOpen}
            />
        </div>
        
      </div>

      <div 
      className="fixed w-full z-10 bottom-0 bg-yellow-200 px-3 py-6 pt-12 translate-y-full"
      ref={vehiclePanelRef}
      >
          <VehiclePanel
          setVehiclePanel={setVehiclePanel}
          setConfirmRidePanel={setConfirmRidePanel}
          />
      </div>

      <div className="fixed w-full z-10 bottom-0  px-3 py-6 pt-12 bg-red-100 translate-y-full"
      ref={confirmRidePanelRef}
      >
          <ConfirmRide
          setConfirmRidePanel={setConfirmRidePanel} 
          setVehiclePanel={setVehiclePanel}  
          setVehicleFound={setVehicleFound}       
          />
      </div>

      <div className="fixed w-full z-10 bottom-0  px-3 py-6 pt-12 bg-blue-200 translate-y-full"
      ref={vehicleFoundRef}
      >
          <LookingForDriver
          setConfirmRidePanel={setConfirmRidePanel} 
          setVehicleFound={setVehicleFound}       
          setWaitingForDriver={setWaitingForDriver}
          />
      </div>

      <div className="translate-y-full fixed w-full z-10 bottom-0  px-3 py-6 pt-12 bg-green-200 "
      ref={waitingForDriverRef}
      >
          <WaitingForDriver
          // setConfirmRidePanel={} 
          // setVehicleFound={} 
          setWaitingForDriver={setWaitingForDriver}  
          />
      </div>


    </div>
  )
}

export default Home;