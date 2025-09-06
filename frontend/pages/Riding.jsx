import React from "react";
import { Link } from "react-router-dom";

const Riding=()=>{
    return (
        <div
        className="h-screen"
        >
            <Link
            to="/home"
            className="fixed right-2 top-2 h-15 w-15 bg-green-100 flex items-center justify-center rounded-full "
            >
                <i className="font-lg text-3xl ri-home-5-line"></i>
            </Link>
            <div 
            className="h-1/2"
            >
                <img 
                src="/map2img.png"
                className="h-full w-full object cover"
                />
            </div>
            <div
            className="h-1/2"
            >
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
                className="gap-2 flex w-full justify-between flex-col items-center p-4"
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
                    className=" m-4 w-full bg-green-600 text-white font-semibold p-2 rounded-lg text-center"
                    
                    >
                        <button>Make a Payment</button>
                    </div>
                
                </div>

                

            </div>
        </div>
    )
};

export default Riding;