import React, { useEffect, useRef, useState, useContext } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';

const Home = () => {
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [panelOpen, setPanelOpen] = useState(false);
    
    const vehiclePanelRef = useRef(null);
    const confirmRidePanelRef = useRef(null);
    const vehicleFoundRef = useRef(null);
    const waitingForDriverRef = useRef(null);
    const panelRef = useRef(null);
    const panelCloseRef = useRef(null);
    
    const [vehiclePanel, setVehiclePanel] = useState(false);
    const [confirmRidePanel, setConfirmRidePanel] = useState(false);
    const [vehicleFound, setVehicleFound] = useState(false);
    const [waitingForDriver, setWaitingForDriver] = useState(false);
    
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [activeField, setActiveField] = useState(null);
    
    const [fare, setFare] = useState({});
    const [traveltime, setTraveltime] = useState(null);
    const [duration, setDuration] = useState(null);
    
    const [vehicleType, setVehicleType] = useState(null);
    const [ride, setRide] = useState(null);
    
    const [parentRequests, setParentRequests] = useState([]);
    const [showParentRequests, setShowParentRequests] = useState(false);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);
    const { user } = useContext(UserDataContext);

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
            
            // Auto-show requests panel if it's the first request
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
        
        // Auto-remove notification after 5 seconds
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
                `${import.meta.env.VITE_BASE_URL}/user-parent/pending-parent-requests`,
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
            
            // Remove from local state
            setParentRequests(prev => prev.filter(req => req.parentId !== parentId));
            
            // Notify parent via socket
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
            
            // Remove from local state
            setParentRequests(prev => prev.filter(req => req.parentId !== parentId));
            
            // Notify parent via socket
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
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(0)',
                duration: 0.4,
                ease: 'power2.out'
            });
        } else {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(100%)',
                duration: 0.4,
                ease: 'power2.in'
            });
        }
    }, [vehiclePanel]);

    useGSAP(() => {
        if (confirmRidePanel) {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(0)',
                duration: 0.4,
                ease: 'power2.out'
            });
        } else {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(100%)',
                duration: 0.4,
                ease: 'power2.in'
            });
        }
    }, [confirmRidePanel]);

    useGSAP(() => {
        if (vehicleFound) {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(0)',
                duration: 0.4,
                ease: 'power2.out'
            });
        } else {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(100%)',
                duration: 0.4,
                ease: 'power2.in'
            });
        }
    }, [vehicleFound]);

    useGSAP(() => {
        if (waitingForDriver) {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(0)',
                duration: 0.4,
                ease: 'power2.out'
            });
        } else {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(100%)',
                duration: 0.4,
                ease: 'power2.in'
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

    // Notification Toast Component
    const NotificationToast = () => (
        <div className="fixed top-20 right-5 z-50 space-y-2 max-w-sm">
            {notifications.map(notification => (
                <div 
                    key={notification.id}
                    className={`p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
                        notification.type === 'success' 
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : notification.type === 'error'
                            ? 'bg-red-50 border-red-500 text-red-700'
                            : 'bg-blue-50 border-blue-500 text-blue-700'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                            <i className={`mt-1 ${
                                notification.type === 'success' ? 'ri-checkbox-circle-fill text-green-500' :
                                notification.type === 'error' ? 'ri-error-warning-fill text-red-500' :
                                'ri-information-fill text-blue-500'
                            }`}></i>
                            <div>
                                <p className="font-medium text-sm">{notification.message}</p>
                                <p className="text-xs mt-1 opacity-75">
                                    {new Date(notification.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-500 hover:text-gray-700 ml-2"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className='h-screen relative overflow-hidden'>
            {/* Logo */}
            <img
                className='w-16 absolute left-5 top-5 z-20'
                src="/autotracklogo.png"
                alt="autotrack"
            />

            {/* Notification Toast */}
            <NotificationToast />

            {/* Parent Requests Notification Badge */}
            {parentRequests.length > 0 && (
                <div 
                    className='fixed top-20 right-5 z-30 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-lg hover:bg-red-600 transition-colors animate-bounce'
                    onClick={() => setShowParentRequests(true)}
                    title={`${parentRequests.length} pending parent request${parentRequests.length > 1 ? 's' : ''}`}
                >
                    {parentRequests.length}
                    <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse'></span>
                </div>
            )}

            {/* Parent Requests Panel */}
            {showParentRequests && (
                <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 flex items-center justify-center p-4'>
                    <div className='bg-white rounded-xl p-6 w-full max-w-md max-h-96 overflow-y-auto shadow-2xl'>
                        <div className='flex justify-between items-center mb-6 pb-4 border-b border-gray-200'>
                            <div>
                                <h3 className='text-2xl font-bold text-gray-900'>Parent Requests</h3>
                                <p className='text-sm text-gray-600 mt-1'>
                                    {parentRequests.length} pending request{parentRequests.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowParentRequests(false)}
                                className='text-gray-400 hover:text-gray-600 text-2xl transition-colors'
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        
                        {isLoadingRequests ? (
                            <div className='flex flex-col items-center justify-center py-12'>
                                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4'></div>
                                <p className='text-gray-600 font-medium'>Loading requests...</p>
                            </div>
                        ) : parentRequests.length === 0 ? (
                            <div className='text-center py-12'>
                                <i className="ri-inbox-line text-5xl text-gray-300 mb-4"></i>
                                <p className='text-gray-500 text-lg font-medium'>No pending requests</p>
                                <p className='text-gray-400 text-sm mt-1'>Parent requests will appear here</p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {parentRequests.map(request => (
                                    <div 
                                        key={request.parentId || request._id} 
                                        className='border border-gray-200 rounded-xl p-5 bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 transition-all duration-300 shadow-sm hover:shadow-md'
                                    >
                                        <div className='flex justify-between items-start mb-4'>
                                            <div className='flex-1'>
                                                <div className='flex items-center gap-3 mb-2'>
                                                    <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg'>
                                                        {request.parentName?.charAt(0) || 'P'}
                                                    </div>
                                                    <div>
                                                        <p className='font-bold text-lg text-gray-900'>{request.parentName}</p>
                                                        <p className='text-sm text-gray-600 flex items-center gap-1 mt-1'>
                                                            <i className="ri-time-line"></i>
                                                            {new Date(request.requestedAt || request.timestamp).toLocaleDateString()} at {' '}
                                                            {new Date(request.requestedAt || request.timestamp).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className='text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100'>
                                                    <i className="ri-shield-check-line text-blue-500 mr-2"></i>
                                                    Wants to track your rides for safety and receive ride notifications.
                                                </p>
                                            </div>
                                        </div>
                                        <div className='flex gap-3'>
                                            <button
                                                onClick={() => acceptParentRequest(request.parentId)}
                                                disabled={isLoadingRequests}
                                                className='flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed'
                                            >
                                                {isLoadingRequests ? (
                                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                                                ) : (
                                                    <>
                                                        <i className="ri-check-line"></i>
                                                        Accept
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => rejectParentRequest(request.parentId)}
                                                disabled={isLoadingRequests}
                                                className='flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed'
                                            >
                                                <i className="ri-close-line"></i>
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* LiveTracking as Background - Fixed positioning */}
            <div className='fixed top-0 left-0 w-full h-full z-0'>
                <LiveTracking />
            </div>

            {/* Main Content Overlay */}
            <div className='relative z-10 flex flex-col justify-end h-full'>
                {/* Bottom Form Panel */}
                <div className='bg-white relative rounded-t-3xl shadow-2xl'>
                    <h5
                        ref={panelCloseRef}
                        onClick={() => setPanelOpen(false)}
                        className='absolute opacity-0 right-6 top-6 text-2xl z-30 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors'
                    >
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>

                    <div className='p-6'>
                        <h4 className='text-2xl font-bold text-gray-900 mb-2'>Find a trip</h4>
                        <p className='text-gray-600 mb-4'>Book a ride in seconds</p>

                        <form className='relative py-3' onSubmit={submitHandler}>
                            <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full z-10 shadow-lg"></div>
                            <input
                                onClick={() => {
                                    setPanelOpen(true);
                                    setActiveField('pickup');
                                }}
                                value={pickup}
                                onChange={handlePickupChange}
                                className='bg-gray-100 px-12 py-4 text-lg rounded-xl w-full relative z-20 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:shadow-lg transition-all duration-300'
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
                                className='bg-gray-100 px-12 py-4 text-lg rounded-xl w-full mt-3 relative z-20 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:shadow-lg transition-all duration-300'
                                type="text"
                                placeholder='Enter your destination'
                            />
                        </form>
                        <button
                            onClick={findTrip}
                            disabled={!pickup || !destination}
                            className='bg-gradient-to-r from-black to-gray-800 text-white px-4 py-4 rounded-xl mt-4 w-full relative z-20 font-semibold text-lg hover:from-gray-800 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Find Trip
                        </button>
                    </div>
                </div>

                {/* Expandable Panel */}
                <div ref={panelRef} className='bg-white h-0 overflow-hidden rounded-t-3xl'>
                    <LocationSearchPanel
                        suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                        setPanelOpen={setPanelOpen}
                        setVehiclePanel={setVehiclePanel}
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                    />
                </div>
            </div>

            {/* Overlay Panels */}
            <div
                ref={vehiclePanelRef}
                className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-10 pt-12 rounded-t-3xl shadow-2xl'
            >
                <VehiclePanel
                    selectVehicle={setVehicleType}
                    fare={fare}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehiclePanel={setVehiclePanel}
                />
            </div>

            <div
                ref={confirmRidePanelRef}
                className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-6 pt-12 rounded-t-3xl shadow-2xl'
            >
                <ConfirmRide
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehicleFound={setVehicleFound}
                />
            </div>

            <div
                ref={vehicleFoundRef}
                className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-6 pt-12 rounded-t-3xl shadow-2xl'
            >
                <LookingForDriver
                    ride={ride}
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setVehicleFound={setVehicleFound}
                />
            </div>

            <div
                ref={waitingForDriverRef}
                className='fixed w-full z-30 bottom-0 bg-white px-3 py-6 pt-12 rounded-t-3xl shadow-2xl'
            >
                <WaitingForDriver
                    ride={ride}
                    setVehicleFound={setVehicleFound}
                    setWaitingForDriver={setWaitingForDriver}
                    waitingForDriver={waitingForDriver}
                />
            </div>
        </div>
    );
};

export default Home;