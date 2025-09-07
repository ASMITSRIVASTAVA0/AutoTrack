import React from "react";

const CaptainDetails=()=>{
    return (
        <div>
            
            <div
            className="h-2/5 p-6"
            >
                <div className="flex items-center justify-between">
                <div className="flex items-center justify-between p-2">
                    <img  className="h-12 w-12 rounded-full object-cover" src="/driverpic.jpg" alt=""/>
                    <h4 className="ml-1"> Asmit Srivastava</h4>
                </div>

                <div>
                    <h4>₹199</h4>
                    <p>Earned</p>
                </div>

                </div>

                <div
                className="flex p-3 bg-gray-200 rounded-xl justify-center gap-5 items-start m-2"
                >
                <div className="text-center">
                    <i className="text-3xl mb-2 font-thin ri-timer-2-fill"></i>
                    <h5 className="text-lg font-medium" >10.2</h5>
                    <p className="text-sm text-gray-600">Hours Online</p>
                </div  >
                <div className='text-center'>
                    <i className="text-3xl mb-2 font-thin ri-speed-up-fill"></i>
                    <h5 className="text-lg font-medium" >10.2</h5>
                    <p className="text-sm text-gray-600">Hours Online</p>
                </div  >
                <div className='text-center '>
                    <i className="text-3xl mb-2 font-thin ri-sticky-note-fill"></i>
                    <h5 className="text-lg font-medium" >10.2</h5>
                    <p className="text-sm text-gray-600">Hours Online</p>
                </div>
                </div>
            </div>
        </div>
    )
};

export default CaptainDetails;