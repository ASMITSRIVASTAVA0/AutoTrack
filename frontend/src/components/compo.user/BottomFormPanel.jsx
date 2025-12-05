import React from 'react';

const BottomFormPanel = ({ 
    panelOpen, 
    setPanelOpen, 
    panelCloseRef, 
    pickup, 
    setPickup, 
    destination, 
    setDestination, 
    setActiveField,
    handlePickupChange,
    handleDestinationChange,
    findTrip,
    submitHandler
}) => {
    return (
        <div className='relative z-10 flex flex-col justify-end h-full'>
            {/* Bottom Form Panel */}
            <div className={`bg-white relative rounded-t-2xl sm:rounded-t-3xl shadow-2xl transition-all duration-300 ${
                panelOpen ? 'max-h-[70vh]' : 'max-h-[50vh] sm:max-h-[40vh]'
            }`}>
                {/* Close Button - Only show when panel is open */}
                {panelOpen && (
                    <div
                        ref={panelCloseRef}
                        onClick={() => setPanelOpen(false)}
                        className='absolute top-3 right-3 sm:top-6 sm:right-6 z-30 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors p-2'
                    >
                        <i className="ri-arrow-down-s-line text-2xl sm:text-3xl"></i>
                    </div>
                )}

                <div className='p-4 sm:p-6'>
                    <div className='mb-4 sm:mb-6'>
                        <h4 className='text-xl sm:text-2xl font-bold text-gray-900'>Find a trip</h4>
                        <p className='text-xs sm:text-sm text-gray-600'>Book a ride in seconds</p>
                    </div>

                    <form className='relative py-2 sm:py-3' onSubmit={submitHandler}>
                        <div className="absolute h-12 sm:h-16 w-1 top-1/2 -translate-y-1/2 left-3 sm:left-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full z-10 shadow-lg"></div>
                        
                        <input
                            onClick={() => {
                                setPanelOpen(true);
                                setActiveField('pickup');
                            }}
                            value={pickup}
                            onChange={handlePickupChange}
                            className='bg-gray-100 pl-10 sm:pl-12 pr-3 py-3 sm:py-4 text-sm sm:text-base rounded-xl w-full border-2 border-transparent focus:border-blue-500 focus:bg-white focus:shadow-lg transition-all duration-300 placeholder-gray-500'
                            type="text"
                            placeholder='Add a pick-up location'
                        />
                        
                        <input
                            onClick={() => {
                                setPanelOpen(true);
                                setActiveField('destination');
                            }}
                            value={destination}
                            onChange={handleDestinationChange}
                            className='bg-gray-100 pl-10 sm:pl-12 pr-3 py-3 sm:py-4 text-sm sm:text-base rounded-xl w-full mt-2 sm:mt-3 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:shadow-lg transition-all duration-300 placeholder-gray-500'
                            type="text"
                            placeholder='Enter your destination'
                        />
                    </form>
                    
                    <button
                        onClick={findTrip}
                        disabled={!pickup || !destination}
                        className='group relative bg-gradient-to-r from-black to-gray-800 text-white px-4 py-3 sm:py-4 rounded-xl mt-3 sm:mt-4 w-full font-semibold text-sm sm:text-base hover:from-gray-800 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
                        Find Trip
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BottomFormPanel;