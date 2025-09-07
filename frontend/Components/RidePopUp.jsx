import React from "react";
const RidePopUp=(props)=>{
    return (
        <div>

            <h5 
            className="p-3 text-center w-[90%] absolute top-0  " 
            onClick={()=>{
            // props.setVehiclePanel(false)
            // props.setConfirmRidePanel(false)
            // props.setVehiclePanel(false)
                props.setRidePopUpPanel(false)
            }}
            >
            <i class="ri-arrow-down-s-line font-bold"></i>            
            </h5>
            <h3 className="text-2xl font-semibold " >New Ride Available!</h3>
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
                className="p-2 flex w-full items-center justify-between"
                >
                    <button
                    onClick={()=>{
                        props.setRidePopUpPanel(false)
                    }}
                    className=" mt-2 w-2/5 bg-gray-300 text-gray-900 font-semibold p-2 rounded-lg text-center"
                
                    >Ignore</button>
                    <button
                    className=" ml-3 mt-2 w-2/5 bg-green-600 text-white font-semibold p-2 rounded-lg text-center"
                    onClick={()=>{
                        props.setConfirmRidePopUpPanel(true)
                    }}
                    >Accept</button>
                    
                </div>
                
            
            </div>

        </div>
    )
};

export default RidePopUp;