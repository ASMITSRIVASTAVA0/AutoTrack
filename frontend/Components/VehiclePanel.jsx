import React from "react";

const VehiclePanel=(props)=>{
    return (
        <div>
        
            <h5 
            className="p-3 text-center w-[90%] absolute top-0  " 
            onClick={()=>{
            props.setVehiclePanel(false)
            props.setConfirmRidePanel(false)
            }}
            >
            <i class="text-xl ri-arrow-down-s-line font-bold"></i>            
            </h5>
            <h3 className="text-2xl font-semibold mb-5" >Choose a Vehicle</h3>
            <div
            onClick={()=>{
                props.setConfirmRidePanel(true)
            }}
            className="flex border-2 active:border-black rounded-xl w-full bg-red-600 items-center justify-between" >
                <img className="h-10" src="/car.jpg" alt=""/>
                <div className="ml-2 w-1/2" >
                <h4 className="font-medium text-sm" >AutoTrackGo <span><i className="ri-user-fill"></i> 4</span></h4>
                <h5 className="font-medium text-sm" >2 min away</h5>
                <p className="font-normal text-xs text-gray-600 " >Affordable, Compact rides</p>
                </div>
                <h2 className="text-xl font-semibold" >₹199</h2>
            </div>

            <div 
            onClick={()=>{
                props.setConfirmRidePanel(true)
            }}
            className="flex border-2 active:border-black rounded-xl w-full bg-red-600 items-center justify-between" >
                <img className="h-10" src="/car.jpg" alt=""/>
                <div className="ml-2 w-1/2" >
                <h4 className="font-medium text-sm" >AutoTrackGo <span><i className="ri-user-fill"></i> 4</span></h4>
                <h5 className="font-medium text-sm" >2 min away</h5>
                <p className="font-normal text-xs text-gray-600 " >Affordable, Compact rides</p>
                </div>
                <h2 className="text-xl font-semibold" >₹199</h2>
            </div>

            <div 
            onClick={()=>{
                props.setConfirmRidePanel(true)
            }}
            className="flex border-2 active:border-black rounded-xl w-full bg-red-600 items-center justify-between" >
                <img className="h-10" src="/car.jpg" alt=""/>
                <div className="ml-2 w-1/2">
                <h4 className="font-medium text-sm" >AutoTrackGo <span><i className="ri-user-fill"></i> 4</span></h4>
                <h5 className="font-medium text-sm" >2 min away</h5>
                <p className="font-normal text-xs text-gray-600 " >Affordable, Compact rides</p>
                </div>
                <h2 className="text-xl font-semibold" >₹199</h2>
            </div>

        </div>

    )
}

export default VehiclePanel;
