
import React, { useContext, lazy, Suspense } from 'react';
import 'remixicon/fonts/remixicon.css';

import { SocketContext } from "./context/SocketContext.jsx";
import { UserDataContext } from './context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useHomeController } from './controllers/index.js';
import { Animation } from './components/Animation.js';

// Lazy load components
const ConfirmRide = lazy(() => import('./components/ConfirmRide.jsx'));
const LookingForDriver = lazy(() => import('./components/LookingForDriver.jsx'));
const WaitingForDriver = lazy(() => import('./components/WaitingForDriver.jsx'));
const NotificationToast = lazy(() => import('./components/NotificationToast.jsx'));
const ParentRequestsPanel = lazy(() => import('./components/ParentRequestsPanel.jsx'));

// Regular imports
import ParentMenu from './components/ParentMenu.jsx';
import VehiclePanel from './components/VehiclePanel.jsx';
import BottomFormPanel from './components/BottomFormPanel.jsx';
import StaticMapBg from './components/StaticMapBg.jsx';

const Home = () => {
    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);
    const { user, setUser } = useContext(UserDataContext);

    const controller = useHomeController(socket, user, navigate, setUser);
    const { styles } = Animation();

    return (
        <div className='h-screen bg-gradient-to-b from-gray-900 via-black to-blue-900 relative overflow-hidden'>
            <style>{styles}</style>
            
            {/* Socket Connection Status */}
            {!controller.socketConnected && (
                <div className="absolute top-2 left-2 z-50 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Connecting...
                </div>
            )}

            {/* Parent Management Button */} 
            <ParentMenu
                parentMenuRef={controller.parentMenuRef}
                showParentMenu={controller.showParentMenu}
                setShowParentMenu={controller.setShowParentMenu}
                currentParent={controller.currentParent}
                isLoadingParent={controller.isLoadingParent}
                removeParent={controller.removeParent}
                parentRequests={controller.parentRequests}
                setShowParentRequests={controller.setShowParentRequests}
                addNotification={controller.addNotification}
            />
            
            {/* Notification Toast */}
            <Suspense fallback={null}>
                <NotificationToast 
                    notifications={controller.notifications} 
                    removeNotification={controller.removeNotification} 
                />
            </Suspense>

            {/* Parent Requests Panel */}
            <Suspense fallback={null}>
                <ParentRequestsPanel
                    showParentRequests={controller.showParentRequests}
                    setShowParentRequests={controller.setShowParentRequests}
                    parentRequests={controller.parentRequests}
                    isLoadingRequests={controller.isLoadingRequests}
                    acceptParentRequest={controller.acceptParentRequest}
                    rejectParentRequest={controller.rejectParentRequest}
                />
            </Suspense>

            {/* LiveTracking as Background */}
            <StaticMapBg
                pickup={controller.pickup}
                destination={controller.destination}
                mounted={controller.mounted}
            />

            {/* Bottom Form Panel */}
            <Suspense fallback={
                <div className="fixed bottom-0 left-0 right-0 h-48 bg-white rounded-t-2xl animate-pulse"></div>
            }>
                <BottomFormPanel
                    panelOpen={controller.panelOpen}
                    setPanelOpen={controller.setPanelOpen}
                    panelCloseRef={controller.panelCloseRef}

                    pickup={controller.pickup}
                    setPickup={controller.setPickup}

                    destination={controller.destination}
                    setDestination={controller.setDestination}

                    handlePickupChange={controller.handlePickupChange}
                    handleDestinationChange={controller.handleDestinationChange}

                    calcFare={controller.calcFare}
                    submitHandler={controller.submitHandler}
                />
            </Suspense>

            {/* Overlay Panels */}
            {/* Vehicle Panel */}
            {controller.vehiclePanel&&(
                <div
                    ref={controller.vehiclePanelRef}
                    className='fixed w-full h-full z-30 bottom-0' // REMOVED: inline styles
                >
                    <Suspense fallback={
                        <div className="p-4 sm:p-6 pt-8">
                            <div className="text-center py-10">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="text-gray-600 mt-4">Loading vehicle options...</p>
                            </div>
                        </div>
                    }>
                        <VehiclePanel
                            selectVehicle={controller.setVehicleType}
                            fare={controller.fare}
                            setConfirmRidePanel={controller.setConfirmRidePanel}
                            setVehiclePanel={controller.setVehiclePanel}
                        />
                    </Suspense>
                </div>
            )}
            

            {/* Confirm Ride Panel */}
            {controller.confirmRidePanel && (
                <div
                    ref={controller.confirmRidePanelRef}
                    className='fixed w-full h-full z-30 bottom-0' // REMOVED: inline styles
                >
                    <Suspense fallback={
                        <div className="p-4 sm:p-6 pt-8">
                            <div className="text-center py-10">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="text-gray-600 mt-4">Confirming ride details...</p>
                            </div>
                        </div>
                    }>
                        <ConfirmRide
                            createRide={controller.createRide}
                            pickup={controller.pickup}
                            destination={controller.destination}
                            fare={controller.fare}
                            vehicleType={controller.vehicleType}
                            setConfirmRidePanel={controller.setConfirmRidePanel}
                            setVehicleFound={controller.setVehicleFound}
                        />
                    </Suspense>
                </div>
            )}
            

            {/* Looking for Driver Panel */}
            {controller.vehicleFound && (
                <div
                    ref={controller.vehicleFoundRef}
                    className='fixed w-full h-full z-30 bottom-0' // REMOVED: inline styles
                >
                    <Suspense fallback={
                        <div className="p-4 sm:p-6 pt-8">
                            <div className="text-center py-10">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="text-gray-600 mt-4">Searching for captain...</p>
                            </div>
                        </div>
                    }>
                        <LookingForDriver
                            ride={controller.ride}
                            createRide={controller.createRide}
                            pickup={controller.pickup}
                            destination={controller.destination}
                            fare={controller.fare}
                            vehicleType={controller.vehicleType}
                            setVehicleFound={controller.setVehicleFound}
                        />
                    </Suspense>
                </div>
            )}
            

            {/* Waiting for Driver Panel */}
            {controller.waitingForDriver && (
                <div
                    ref={controller.waitingForDriverRef}
                    className='fixed w-full h-full z-30 bottom-0' // REMOVED: inline styles
                >
                    <Suspense fallback={
                        <div className="p-4 sm:p-6 pt-8">
                            <div className="text-center py-10">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="text-gray-600 mt-4">Captain is arriving...</p>
                            </div>
                        </div>
                    }>
                        <WaitingForDriver
                            ride={controller.ride}
                            setVehicleFound={controller.setVehicleFound}
                            setWaitingForDriver={controller.setWaitingForDriver}
                            waitingForDriver={controller.waitingForDriver}
                        />
                    </Suspense>
                </div>
            )}
            
        </div>
    );
};

export default Home;
