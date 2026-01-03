import React, { useContext, lazy, Suspense } from 'react';
// import { useNavigate } from 'react-router-dom';

// import contexts==============================================
import { SocketContext } from '../SocketContext.jsx';
import { CaptainDataContext } from './context/CaptainContext.jsx';



// Lazy load components
const RidePopUp = lazy(() => import('../component.captain/RidePopUp.jsx'));
const ConfirmRidePopUp = lazy(() => import('../component.captain/ConfirmRidePopUp.jsx'));



// import captain.components=================================================
import RideHistory from '../component.captain/RideHistory.jsx';
import Earnings from '../component.captain/Earnings.jsx';
import Support from '../component.captain/Support.jsx';
import CaptainDetails from '../component.captain/CaptainDetails.jsx';
import MapCaptain from '../component.captain/MapCaptain.jsx';
import SideBar from '../component.captain/SideBar.jsx';
import Header from '../component.captain/Header.jsx';
import NotificationToast from "../component.captain/NotificationToast.jsx";

// import css==================================================
import { Animation } from '../component.captain/Animation.js';



// import controller hook=============================================
import { useCaptainHomeController } from './controller.captain/index.js';



const CaptainHome = () => {
    const { socket } = useContext(SocketContext);
    const { captain } = useContext(CaptainDataContext);
    // // const navigate = useNavigate();

    const controller = useCaptainHomeController(socket, captain);


    const { styles } = Animation();

   
    const renderActiveSection = () => {
        switch(controller.activeSection) {
            case 'profile':
                return <CaptainDetails/>;
            case 'history':
                return <RideHistory />;
            case 'earnings':
                return <Earnings stats={controller.stats} />;
            case 'support':
                return <Support />;
            default:
                return <CaptainDetails/>;
        }
    };

    return (
        <div className='h-screen bg-gradient-to-b from-gray-900 via-black to-blue-900 relative overflow-hidden'>
            <style>{styles}</style>

            <NotificationToast 
                notifications={controller.notifications}
                mousePosition={controller.mousePosition}
                removeNotification={controller.removeNotification}
            />

            <Header
                isSidebarOpen={controller.isSidebarOpen}
                setIsSidebarOpen={controller.setIsSidebarOpen}     
                mounted={controller.mounted}
                isOnline={controller.isOnline}
                setIsOnline={controller.setIsOnline}
            />

            {/* Main Content Layout */}
            <div className='flex flex-col lg:flex-row h-full pt-16 sm:pt-20'>
                <MapCaptain
                    mounted={controller.mounted}
                    captainLocation={controller.captainLocation}
                    pulseAnimation={controller.pulseAnimation}
                />

                <SideBar
                    mounted={controller.mounted}
                    isSidebarOpen={controller.isSidebarOpen}
                    setIsSidebarOpen={controller.setIsSidebarOpen}
                    activeSection={controller.activeSection}
                    setActiveSection={controller.setActiveSection}
                    renderActiveSection={renderActiveSection}
                />
            </div>

            {/* Ride Popup */}
            {controller.ride && (
                <div 
                    ref={controller.ridePopupPanelRef} 
                    className='
                    text-white
                    fixed w-full z-60 bottom-0 bg-gradient-to-t from-gray-900 via-black to-gray-900 rounded-t-3xl shadow-2xl overflow-hidden border-t border-white/10'
                    style={{ opacity: 0 }}
                >
                    <div className='p-4 sm:p-6 pt-6 sm:pt-8'>
                        {/* Drag Handle */}
                        <div className='flex justify-center mb-4'>
                            <div className='w-12 sm:w-16 h-1 sm:h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full'></div>
                        </div>
                        <Suspense fallback={<div className="text-white text-center">Loading ride details...</div>}>
                            <RidePopUp
                                ride={controller.ride}
                                setRidePopupPanel={controller.setRidePopupPanel}
                                setConfirmRidePopupPanel={controller.setConfirmRidePopupPanel}
                                confirmRide={controller.confirmRide}
                            />
                        </Suspense>
                    </div>
                </div>
            )}

            {/* Confirm Ride Popup */}
            {controller.ride && (
                <div 
                    ref={controller.confirmRidePopupPanelRef} 
                    className='
                    text-white
                    fixed w-full h-screen z-60 bottom-0 bg-gradient-to-t from-gray-900 via-black to-gray-900 rounded-t-3xl shadow-2xl overflow-auto border-t border-white/10'
                    style={{ opacity: 0 }}
                >
                    <div className='p-4 sm:p-6 pt-6 sm:pt-8'>
                        {/* Drag Handle */}
                        <div className='flex justify-center mb-4'>
                            <div className='w-12 sm:w-16 h-1 sm:h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-full'></div>
                        </div>
                        <Suspense fallback={<div className="text-white text-center">Loading confirmation...</div>}>
                            <ConfirmRidePopUp
                                ride={controller.ride}
                                setConfirmRidePopupPanel={controller.setConfirmRidePopupPanel} 
                                setRidePopupPanel={controller.setRidePopupPanel} 
                            />
                        </Suspense>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaptainHome;