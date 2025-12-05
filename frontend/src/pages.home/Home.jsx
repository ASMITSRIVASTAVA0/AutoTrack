import React, { useEffect, useRef, useState, useContext, lazy, Suspense } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

// Lazy load components for better performance
const LiveTracking = lazy(() => import('../components/LiveTracking'));
const LocationSearchPanel = lazy(() => import('../components/LocationSearchPanel'));
const VehiclePanel = lazy(() => import('../components/VehiclePanel'));
const ConfirmRide = lazy(() => import('../components/ConfirmRide'));
const LookingForDriver = lazy(() => import('../components/LookingForDriver'));
const WaitingForDriver = lazy(() => import('../components/WaitingForDriver'));

const NotificationToast = lazy(() => import('../components/compo.notification/NotificationToast'));
const ParentRequestsPanel = lazy(() => import('../components/compo.user/ParentRequestsPanel'));
const ParentRequestsBadge = lazy(() => import('../components/compo.user/ParentRequestsBadge'));
const BottomFormPanel = lazy(() => import('../components/compo.user/BottomFormPanel'));

const Home = () => {
    // State variables
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [panelOpen, setPanelOpen] = useState(false);
    const [vehiclePanel, setVehiclePanel] = useState(false);
    const [confirmRidePanel, setConfirmRidePanel] = useState(false);
    const [vehicleFound, setVehicleFound] = useState(false);
    const [waitingForDriver, setWaitingForDriver] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [fare, setFare] = useState({});
    const [vehicleType, setVehicleType] = useState(null);
    const [ride, setRide] = useState(null);
    const [parentRequests, setParentRequests] = useState([]);
    const [showParentRequests, setShowParentRequests] = useState(false);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [mounted, setMounted] = useState(false);

    // Refs
    const vehiclePanelRef = useRef(null);
    const confirmRidePanelRef = useRef(null);
    const vehicleFoundRef = useRef(null);
    const waitingForDriverRef = useRef(null);
    const panelRef = useRef(null);
    const panelCloseRef = useRef(null);

    // Context and navigation
    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);
    const { user } = useContext(UserDataContext);

    // Initialize mounted state
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Enhanced socket implementation
    useEffect(() => {
        if (!user || !socket) return;

        const handleRideConfirmed = (data) => {
            console.log("Ride confirmed:", data);
            const rideData = data.ride || data;
            setVehicleFound(false);
            setWaitingForDriver(true);
            setRide(rideData);
            addNotification('Ride confirmed! Captain is on the way.', 'success');
        };

        const handleRideStarted = (data) => {
            console.log("Ride started:", data);
            const rideData = data.ride || data;
            setWaitingForDriver(false);
            navigate('/riding', { state: { ride: rideData } });
        };

        const handleParentRequestReceived = (data) => {
            console.log('Parent request received:', data);
            const newRequest = {
                id: data.requestId || Date.now(),
                parentId: data.parentId,
                parentName: data.parentName,
                timestamp: new Date(data.timestamp || Date.now()),
                status: 'pending'
            };
            
            setParentRequests(prev => [newRequest, ...prev]);
            addNotification(`New parent request from ${data.parentName}`, 'info');
            
            if (parentRequests.length === 0) {
                setShowParentRequests(true);
            }
        };

        const handleParentRequestsList = (data) => {
            console.log('Parent requests list:', data);
            setParentRequests(data.requests || data.pendingRequests || []);
        };

        const handleSocketError = (error) => {
            console.error('Socket error:', error);
            addNotification('Connection error. Please check your internet.', 'error');
        };

        // Join user room
        socket.emit("join", { userType: "user", userId: user._id });
        loadParentRequests();

        // Set up event listeners
        socket.on('ride-confirmed', handleRideConfirmed);
        socket.on('ride-started', handleRideStarted);
        socket.on('parent-request-received', handleParentRequestReceived);
        socket.on('parent-requests-list', handleParentRequestsList);
        socket.on('error', handleSocketError);
        socket.on('connect_error', handleSocketError);

        return () => {
            // Cleanup event listeners
            socket.off('ride-confirmed', handleRideConfirmed);
            socket.off('ride-started', handleRideStarted);
            socket.off('parent-request-received', handleParentRequestReceived);
            socket.off('parent-requests-list', handleParentRequestsList);
            socket.off('error', handleSocketError);
            socket.off('connect_error', handleSocketError);
        };
    }, [navigate, socket, user]);

    // Notification system
    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type, timestamp: new Date() }]);
        
        setTimeout(() => {
            setNotifications(prev => prev.filter(notification => notification.id !== id));
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const loadParentRequests = async () => {
        try {
            setIsLoadingRequests(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/user-parents/pending-parent-requests`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );
            setParentRequests(response.data.pendingRequests || []);
        } catch (error) {
            console.error('Error loading parent requests:', error);
            addNotification('Failed to load parent requests', 'error');
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const acceptParentRequest = async (parentId) => {
        try {
            setIsLoadingRequests(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/user-parent/accept-parent-request`,
                { parentId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );
            
            setParentRequests(prev => prev.filter(req => req.parentId !== parentId));
            
            socket.emit('parent-request-accepted', {
                parentId: parentId,
                userId: user._id,
                userName: `${user.fullname.firstname} ${user.fullname.lastname}`
            });
            
            addNotification('Parent request accepted successfully!', 'success');
            
        } catch (error) {
            console.error('Error accepting parent request:', error);
            const errorMessage = error.response?.data?.message || 'Error accepting request';
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const rejectParentRequest = async (parentId) => {
        try {
            setIsLoadingRequests(true);
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/user-parent/reject-parent-request`,
                { parentId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );
            
            setParentRequests(prev => prev.filter(req => req.parentId !== parentId));
            
            socket.emit('parent-request-rejected', {
                parentId: parentId,
                userId: user._id,
                userName: `${user.fullname.firstname} ${user.fullname.lastname}`
            });
            
            addNotification('Parent request rejected.', 'info');
            
        } catch (error) {
            console.error('Error rejecting parent request:', error);
            const errorMessage = error.response?.data?.message || 'Error rejecting request';
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const handlePickupChange = async (e) => {
        setPickup(e.target.value);
    };

    const handleDestinationChange = async (e) => {
        setDestination(e.target.value);
    };

    const submitHandler = (e) => {
        e.preventDefault();
        console.log("pickup", pickup);
        console.log("destination", destination);
    };

    // GSAP animations
    useGSAP(() => {
        if (panelOpen) {
            gsap.to(panelRef.current, {
                height: '70%',
                padding: 24,
                duration: 0.3
            });
            gsap.to(panelCloseRef.current, {
                opacity: 1,
                duration: 0.3
            });
        } else {
            gsap.to(panelRef.current, {
                height: '0%',
                padding: 0,
                duration: 0.3
            });
            gsap.to(panelCloseRef.current, {
                opacity: 0,
                duration: 0.3
            });
        }
    }, [panelOpen]);

    useGSAP(() => {
        if (vehiclePanel) {
            gsap.fromTo(vehiclePanelRef.current, 
                { y: "100%", opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
            );
        } else {
            gsap.to(vehiclePanelRef.current, {
                y: "100%",
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            });
        }
    }, [vehiclePanel]);

    useGSAP(() => {
        if (confirmRidePanel) {
            gsap.fromTo(confirmRidePanelRef.current, 
                { y: "100%", opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
            );
        } else {
            gsap.to(confirmRidePanelRef.current, {
                y: "100%",
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            });
        }
    }, [confirmRidePanel]);

    useGSAP(() => {
        if (vehicleFound) {
            gsap.fromTo(vehicleFoundRef.current, 
                { y: "100%", opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
            );
        } else {
            gsap.to(vehicleFoundRef.current, {
                y: "100%",
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            });
        }
    }, [vehicleFound]);

    useGSAP(() => {
        if (waitingForDriver) {
            gsap.fromTo(waitingForDriverRef.current, 
                { y: "100%", opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
            );
        } else {
            gsap.to(waitingForDriverRef.current, {
                y: "100%",
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            });
        }
    }, [waitingForDriver]);

    async function findTrip() {
        if (!pickup || !destination) {
            addNotification('Please enter both pickup and destination locations', 'error');
            return;
        }

        setVehiclePanel(true);
        setPanelOpen(false);

        try {
            console.log("findTrip me, pickup ", pickup, " destination ", destination);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
                params: { pickup, destination },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                timeout: 20000
            });

            console.log("fare response", response.data);
            setFare(response.data);
        } catch (error) {
            console.error("Error getting fare:", error);
            addNotification('Failed to calculate fare. Please try again.', 'error');
            setVehiclePanel(false);
        }
    }

    async function createRide() {
        console.log("create ride called");

        if (!vehicleType) {
            addNotification('Please select a vehicle type', 'error');
            return;
        }

        // Make sure pickup and destination are objects with address property
        const rideData = {
            pickup: {
                address: typeof pickup === "string" ? pickup : pickup.address
            },
            destination: {
                address: typeof destination === "string" ? destination : destination.address
            },
            vehicleType: vehicleType
        };

        console.log("Sending ride data:", rideData);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/create`,
                rideData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    timeout: 15000
                }
            );

            console.log("Ride created successfully:", response.data);
            setRide(response.data.ride || response.data);
            addNotification('Ride created successfully! Looking for captain...', 'success');

            console.log("Ride_id ", response.data._id);
            return response.data;

        } catch (error) {
            console.error("Error creating ride:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Failed to create ride';
            addNotification(errorMessage, 'error');
            throw error;
        }
    }

    // Custom CSS animations
    const styles = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        
        .animate-slideInRight {
            animation: slideInRight 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-slideInUp {
            animation: slideInUp 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            background-size: 200% 100%;
            animation: shimmer 3s infinite;
        }
    `

    return (
        <div className='h-screen bg-gradient-to-b from-gray-900 via-black to-blue-900 relative overflow-hidden'>
            <style>{styles}</style>

            {/* Logo */}
            <div className={`fixed top-4 left-4 sm:top-6 sm:left-6 z-30 transition-all duration-1000 ${
                mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
            }`}>
                <div className='relative group/logo'>
                    <div className='relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 group-hover/logo:shadow-blue-500/50 transition-all duration-500 group-hover/logo:scale-110 group-hover/logo:rotate-12'>
                        <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl sm:rounded-2xl blur opacity-50 group-hover/logo:opacity-100 transition-opacity duration-500'></div>
                        <img 
                            className='w-6 sm:w-8 relative z-10 filter brightness-0 invert' 
                            src="/autotracklogo.png" 
                            alt="AutoTrack" 
                        />
                    </div>
                    <div className='absolute top-full left-0 mt-2 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 pointer-events-none'>
                        <div className='bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg'>
                            AutoTrack Ride Booking
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            <Suspense fallback={null}>
                <NotificationToast 
                    notifications={notifications} 
                    removeNotification={removeNotification} 
                />
            </Suspense>

            {/* Parent Requests Badge */}
            <Suspense fallback={null}>
                <ParentRequestsBadge 
                    parentRequests={parentRequests}
                    setShowParentRequests={setShowParentRequests}
                />
            </Suspense>

            {/* Parent Requests Panel */}
            <Suspense fallback={null}>
                <ParentRequestsPanel
                    showParentRequests={showParentRequests}
                    setShowParentRequests={setShowParentRequests}
                    parentRequests={parentRequests}
                    isLoadingRequests={isLoadingRequests}
                    acceptParentRequest={acceptParentRequest}
                    rejectParentRequest={rejectParentRequest}
                />
            </Suspense>

            {/* LiveTracking as Background */}
            <div className='fixed top-0 left-0 w-full h-full z-0'>
                <Suspense fallback={
                    <div className='h-full bg-gradient-to-br from-blue-900 via-black to-cyan-900 flex items-center justify-center'>
                        <div className='text-center'>
                            <div className='relative w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4'>
                                <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-ping opacity-20'></div>
                                <div className='absolute inset-2 sm:inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50'>
                                    <i className="ri-navigation-line text-xl sm:text-3xl text-white animate-spin"></i>
                                </div>
                            </div>
                            <p className='text-white/80 font-semibold text-lg mb-2'>Loading Map</p>
                            <p className='text-blue-400/60 text-sm animate-pulse'>Initializing navigation...</p>
                        </div>
                    </div>
                }>
                    <LiveTracking />
                </Suspense>
            </div>

            {/* Bottom Form Panel */}
            <Suspense fallback={
                <div className="fixed bottom-0 left-0 right-0 h-48 bg-white rounded-t-2xl animate-pulse"></div>
            }>
                <BottomFormPanel
                    panelOpen={panelOpen}
                    setPanelOpen={setPanelOpen}
                    panelCloseRef={panelCloseRef}
                    pickup={pickup}
                    setPickup={setPickup}
                    destination={destination}
                    setDestination={setDestination}
                    setActiveField={setActiveField}
                    handlePickupChange={handlePickupChange}
                    handleDestinationChange={handleDestinationChange}
                    findTrip={findTrip}
                    submitHandler={submitHandler}
                />
            </Suspense>

            {/* Overlay Panels */}
            {/* Vehicle Panel */}
            <div
                ref={vehiclePanelRef}
                className='fixed w-full z-30 bottom-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl'
                style={{ opacity: 0, transform: 'translateY(100%)' }}
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
                        selectVehicle={setVehicleType}
                        fare={fare}
                        setConfirmRidePanel={setConfirmRidePanel}
                        setVehiclePanel={setVehiclePanel}
                    />
                </Suspense>
            </div>

            {/* Confirm Ride Panel */}
            <div
                ref={confirmRidePanelRef}
                className='fixed w-full z-30 bottom-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl'
                style={{ opacity: 0, transform: 'translateY(100%)' }}
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
                        createRide={createRide}
                        pickup={pickup}
                        destination={destination}
                        fare={fare}
                        vehicleType={vehicleType}
                        setConfirmRidePanel={setConfirmRidePanel}
                        setVehicleFound={setVehicleFound}
                    />
                </Suspense>
            </div>

            {/* Looking for Driver Panel */}
            <div
                ref={vehicleFoundRef}
                className='fixed w-full z-30 bottom-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl'
                style={{ opacity: 0, transform: 'translateY(100%)' }}
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
                        ride={ride}
                        createRide={createRide}
                        pickup={pickup}
                        destination={destination}
                        fare={fare}
                        vehicleType={vehicleType}
                        setVehicleFound={setVehicleFound}
                    />
                </Suspense>
            </div>

            {/* Waiting for Driver Panel */}
            <div
                ref={waitingForDriverRef}
                className='fixed w-full z-30 bottom-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl'
                style={{ opacity: 0, transform: 'translateY(100%)' }}
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
                        ride={ride}
                        setVehicleFound={setVehicleFound}
                        setWaitingForDriver={setWaitingForDriver}
                        waitingForDriver={waitingForDriver}
                    />
                </Suspense>
            </div>

            {/* Location Search Panel (when activeField is set) */}
            {activeField && (
                <Suspense fallback={
                    <div className="fixed inset-0 z-40 bg-white flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                }>
                    <LocationSearchPanel
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                        setActiveField={setActiveField}
                        setPanelOpen={setPanelOpen}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default Home;