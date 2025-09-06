import React from "react";

const WaitingForDriver=(props)=>{
    return (
         <div>
            <h5 
            className="p-3 text-center w-[90%] absolute top-0  " 
            onClick={()=>{
            // props.setVehiclePanel(false)
            // props.setConfirmRidePanel(false)
            // props.setVehiclePanel(false)
            // props.setVehicleFound(false)
            props.setWaitingForDriver(false)
            }}
            >
            <i class="text-xl ri-arrow-down-s-line font-bold"></i>            
            </h5>
            
            <div
            className="flex items-center justify-between p-2"
            >
                <img src="/car.jpg" className="h-25"/>
                {/* <i className="flex justify-center text-5xl text-blue-800 ri-user-fill"></i> */}
                <div className="text-right">
                    <h2 className="text-lg font-medium ">Asmit</h2>
                    <h4 className="text-xl font-semibold -mt-1 -mb-1">UP77 X 1234</h4>
                    <p className="text-sm text-gray-700 ">Wagon-R</p>
                </div>
            </div>

            <div
            className="gap-2 flex w-full justify-between flex-col items-center"
            >
                {/* <img src="/car.jpg " /> */}

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

export default WaitingForDriver;