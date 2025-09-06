import React from 'react'
import {Link} from "react-router-dom";

const CaptainHome = () => {
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
        </div>
  )
}

export default CaptainHome;