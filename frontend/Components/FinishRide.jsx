import React from "react";
import { Link } from "react-router-dom";
const FinishRide=(props)=>{
    return (
        
    
            <div
            // className="h-[100%] "
            >

            <h5 
            className="p-3 text-center w-[90%] absolute  top-0  " 
            onClick={()=>{
            // props.setVehiclePanel(false)
            // props.setConfirmRidePanel(false)
            // props.setVehiclePanel(false)
                props.setFinishRidePanel(false)
            }}
            >
            <i className="ri-arrow-down-s-line font-bold"></i>            
            </h5>
            <h3 className="text-2xl font-semibold " >Finish this Ride</h3>
            <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                    <img className="h-14 w-14 rounded-full object-cover" src="/driverpic.jpg" />
                    <h2 className="text-lg font-medium">Asmit Srivastava</h2>
                </div>
                <h5 className="text-lg font-semibold" >2.2 KM</h5>
            </div>
            <div
            className="gap-2 flex w-full justify-between flex-col items-center"
            >

                <div
                className="w-full mt-4"
                >
                    <div
                    className="ml-2 flex items-center gap-5 p-2 border-b-2 border-gray-400"
                    >
                        <i className=" text-lg ri-map-pin-fill"></i>
                        <div >
                            <h3
                            className="text-lg font-medium"
                            >562/11-A</h3>
                            <p
                            className="text-sm -mt-1 text-gray-600  "
                            >Akbarpur, Kanpur Dehat
                            </p>
                        </div>
                    </div>
                    <div
                    className="ml-2 flex items-center gap-5 p-2 border-b-2 border-gray-400"
                    >
                        <i className=" text-lg ri-map-pin-fill"></i>
                        <div >
                            <h3
                            className="text-lg font-medium"
                            >562/11-A</h3>
                            <p
                            className="text-sm -mt-1 text-gray-600  "
                            >Akbarpur, Kanpur Dehat
                            </p>
                        </div>
                    </div>
                    <div
                    className="ml-2 flex items-center gap-5 p-2  "
                    >
                        <i className="text-lg ri-currency-fill"></i>                    
                    <div >
                            <h3
                            className="text-lg font-medium"
                            >₹199</h3>
                            <p
                            className="text-sm -mt-1 text-gray-600 "
                            >Cash Cash
                            </p>
                        </div>
                    </div>
                </div>

                <div 
                className="mt-6 w-full"
                >
                    
                        

                        <Link
                        to="/captain-home"
                        className=" w-full mt-5 flex justify-center bg-green-600 text-lg text-white font-semibold p-3 rounded-lg" 
                        >
                            
                            Finish Ride
                    
                        </Link>
                        {/* <p
                        className="mt-10 text-xs"
                        >Click on Finish Ride button if you have completed the payment</p>
 */}



                </div>
                
        
            </div>

        </div>
    )
};

export default FinishRide;