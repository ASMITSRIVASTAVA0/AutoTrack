import React from "react";

const ConfirmRide=(props)=>{
    return (
        <div>
            <h5 
            className="p-3 text-center w-[90%] absolute top-0  " 
            onClick={()=>{
            // props.setVehiclePanel(false)
            props.setConfirmRidePanel(false)
            // props.setVehiclePanel(false)
            }}
            >
            <i class="ri-arrow-down-s-line font-bold"></i>            
            </h5>
            <h3 className="text-2xl font-semibold mb-5" >Confirm your Ride</h3>
            
            <div
            className="gap-2 flex w-full justify-between flex-col items-center"
            >
                <img src="/car.jpg " />

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
                className=" mt-4 w-full bg-green-600 text-white font-semibold p-2 rounded-lg text-center"
                onClick={()=>{
                    props.setVehicleFound(true)
                }}
                >
                    <button>Confirm</button>
                </div>
            
            </div>

            
        </div>
    )
};

export default ConfirmRide;