import React, { useEffect, useRef, useState, useContext, lazy, Suspense } from 'react';
/*
useEffect=run side effects in functional comp, run code after runder, re-run when dependecies changes
useEffect(()=>{ .... code, return ()=>{... cleanup};},[dependencies])

useRef=store stores that survive re-renders and used for dom access or managing mutalbe varibale
const inputref=useRef(null);

useState=manage local compo state, when update, react re-render compo
const [count,setCount]=useState(0);

useContext=let compo access shared data directly from context provider without prop drilling
const val=useContext(mycontext);

lazy=used for code-spliting, loads compo only when its needed on demand,reduce bundle size, performance
const About=lazy(()=>import("./About.jsx"))

suspence=wrapper compo that shlows a fallback UI while a lazy comp is loading
<Suspence fallback={<div>Loading..</div>}>
    <LazyCompo/>
</Suspence>

*/
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

/*
useGSAp=react-hook to make animation smooth inside react comp, do animation cleanup, re-runs on dependency change,ensure animation run after comp mount, avoid react re-render issues
gsap=main animation library that provide actual animation method, while useGSAp connect those animations with react-lifecycle
gsap.to(),gsap.from(),gsap.timeline()
*/

import axios from 'axios';
/*
js library to make http req from both broswer and node.js, works iwth async/await, automatic json handling(no JSON.stringify() or JSON.parse()),buildin timeout
library=collection of reusable code,e.g react, axios
framework=give structure to build code/application e.g. springboot, angular, django
runtime environment=software layer that provide everything to run program e.g. nodejs, jvm,
software development kit(sdk)=build appli for a specific platform. include library, documentation, tools, debuggers. e.g. aws, sdk, ios sdk
api=endpoints allowing two sys to communicate. eg.e rest apis,
compiler=entire src code into machine code before execution e.g. java, c, c++
interpreter=execute code line by line at runtime e.g python, javscript
engier=core program that execute code. low-level executor that processes code

*/

import 'remixicon/fonts/remixicon.css';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';


import { useNavigate } from 'react-router-dom';

// Lazy load components for better performance
const LiveTracking = lazy(() => import('../pages.riding/LiveTracking'));
const LiveTrackingStatic = lazy(() => import("../pages.riding/LiveTrackingStatic"));
const VehiclePanel = lazy(() => import('../components/compo.user/VehiclePanel'));
const ConfirmRide = lazy(() => import('../components/compo.captain/ConfirmRide'));
const LookingForDriver = lazy(() => import('../components/compo.user/LookingForDriver'));
const WaitingForDriver = lazy(() => import('../components/compo.user/WaitingForDriver'));

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
    const [showParentMenu, setShowParentMenu] = useState(false);
    const [currentParent, setCurrentParent] = useState(null);
    const [isLoadingParent, setIsLoadingParent] = useState(false);

    // Refs
    const vehiclePanelRef = useRef(null);
    const confirmRidePanelRef = useRef(null);
    const vehicleFoundRef = useRef(null);
    const waitingForDriverRef = useRef(null);
    const panelRef = useRef(null);
    const panelCloseRef = useRef(null);
    const parentMenuRef = useRef(null);

    // Context and navigation
    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);
    const { user, setUser } = useContext(UserDataContext);

    // Initialize mounted state
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);
/*
run only onces at no dependency,
after 100ms, calls setMounted(true), on compo unmount, 
clean up timer with clearTimeout
delay state change so UI transiton can happen, prevent heavy computation on first render, wait until compo is "state"
*/
    // Load current parent data
    useEffect(() => {
        if (user?.parentId) {
            fetchCurrentParent();
        } else {
            setCurrentParent(null);
        }
    }, [user?.parentId]);
    // Fetch current parent details
    const fetchCurrentParent = async () => {
        try {
            setIsLoadingParent(true);
            // const token = localStorage.getItem('token');
            const token=localStorage.getItem("tokenUser");
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/users/get-parent`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );
            setCurrentParent(response.data.parent);
        } catch (error) {
            console.error('Error fetching parent:', error);
            setCurrentParent(null);
        } finally {
            setIsLoadingParent(false);
        }
    };


    // Close parent menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (parentMenuRef.current && !parentMenuRef.current.contains(event.target)) {
                setShowParentMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

            // Check if request already exists to prevent duplicates
            const existingRequest = parentRequests.find(req => 
                req._id === data.requestId || 
                (req.parentId === data.parentId && req.status === 'pending')
            );
            
            if (existingRequest) {
                console.log('Duplicate parent request received, ignoring');
                return;
            }

            const newRequest = {
                _id: data.requestId || Date.now(),
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
            // setParentRequests(data.requests || data.pendingRequests || []);
            setParentRequests(data.pendingRequests || []);
        
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


    const loadParentRequests = async () => {
        try {
            setIsLoadingRequests(true);
            // const token = localStorage.getItem('token');
            const token = localStorage.getItem('tokenUser');
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/user-parents/pending-parent-requests`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );
            // console.log(response.data.pendingRequests);
            setParentRequests(response.data.pendingRequests || []);
        } catch (error) {
            console.error('Error loading parent requests:', error);
            addNotification('Failed to load parent requests', 'error');
        } finally {
            setIsLoadingRequests(false);
        }
    };

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

    // In Home.jsx, update the acceptParentRequest function
    const acceptParentRequest = async (requestId, parentId) => {
        try {
            setIsLoadingRequests(true);
            const token = localStorage.getItem('tokenUser');
            
            console.log("Accepting request:", requestId, "for parent:", parentId);
            
            if (!requestId) {
                addNotification('Invalid request ID', 'error');
                return;
            }
            
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/user-parents/accept-parent-request/${requestId}`,
                { parentId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );
            
            console.log("Accept parent req response:", response.data);
            // console.log("Accept parent req response:", response.data?.message);
            
            // Remove the accepted request from state
            setParentRequests(prev => prev.filter(req => req._id !== requestId));
            
            // Refresh user data to get updated parentId
            await refreshUserData();
            
            addNotification('Parent request accepted successfully!', 'success');
            
        } catch (error) {
            console.error('Error accepting parent request:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || 'Error accepting request';
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoadingRequests(false);
        }
    };
    const rejectParentRequest = async (requestId, parentId) => {
        try {
            console.log("Reject parent req called, requestId=", requestId, "parentId=", parentId);
            setIsLoadingRequests(true);
            const token = localStorage.getItem('tokenUser');
            
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/user-parents/reject-parent-request/${requestId}`,
                { parentId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );
            
            console.log("Reject response:", response.data);
            
            // Remove the rejected request from state
            setParentRequests(prev => prev.filter(req => req._id !== requestId));
            
            
            addNotification('Parent request rejected successfully.', 'info');
            
        } catch (error) {
            console.error('Error rejecting parent request:', error);
            const errorMessage = error.response?.data?.message || 'Error rejecting request';
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoadingRequests(false);
        }
    };
    // Refresh user data after parent changes
    // In Home.jsx, update refreshUserData function
    const refreshUserData = async () => {
        try {
            const token = localStorage.getItem('tokenUser');
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/users/profile`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );
            
            console.log("Refreshed user data:", response.data);
            
            if (response.data.user) {
                setUser(response.data.user);
                if (response.data.user.parentId) {
                    await fetchCurrentParent();
                } else {
                    setCurrentParent(null);
                }
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };
    // Remove current parent
    const removeParent = async () => {
        if (!user?.parentId) {
            addNotification('No parent to remove', 'error');
            return;
        }

        if (!window.confirm('Are you sure you want to remove this parent? This will disconnect you from their monitoring.')) {
            return;
        }

        try {
            setIsLoadingParent(true);
            const token = localStorage.getItem('tokenUser');
            
            const response = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}/users/remove-parent`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );
            
            console.log("Remove parent response:", response);
            
            // Update user context
            setUser(prev => ({
                ...prev,
                parentId: null
            }));
            
            // Update current parent state
            setCurrentParent(null);
            
            // Close menu
            setShowParentMenu(false);
            
            // Notify parent via socket
            socket.emit('parent-removed', {
                parentId: user.parentId,
                userId: user._id,
                userName: `${user.fullname.firstname} ${user.fullname.lastname}`
            });
            
            addNotification('Parent removed successfully', 'success');
            
        } catch (error) {
            console.error('Error removing parent:', error);
            const errorMessage = error.response?.data?.message || 'Error removing parent';
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoadingParent(false);
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
        // console.log("pickup", pickup);
        // console.log("destination", destination);
    };

    // GSAP animations
    useGSAP(() => {
        if (panelOpen) {
            gsap.to(panelRef.current, {
                height: '100%',
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

    // Parent menu animation
    useGSAP(() => {
        if (showParentMenu) {
            gsap.fromTo('.parent-menu-dropdown', 
                { scale: 0.8, opacity: 0, y: -10 },
                { scale: 1, opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
            );
        }
    }, [showParentMenu]);

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
                    Authorization: `Bearer ${localStorage.getItem('tokenUser')}`
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
                        Authorization: `Bearer ${localStorage.getItem('tokenUser')}`
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
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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
        
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
        }
    `

    return (
        <div className='h-screen bg-gradient-to-b from-gray-900 via-black to-blue-900 relative overflow-hidden'>
            <style>{styles}</style>

            {/* Parent Management Button */}
            <div className="absolute top-4 right-4 z-50" ref={parentMenuRef}>
                <div className="relative">
                    <button
                        onClick={() => setShowParentMenu(!showParentMenu)}
                        className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                            currentParent 
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                                : 'bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800'
                        }`}
                        disabled={isLoadingParent}
                        title={currentParent ? `Connected to ${currentParent.fullname?.firstname}` : 'No parent connected'}
                    >
                        {isLoadingParent ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : currentParent ? (
                            <>
                                <i className="ri-user-heart-line text-xl text-white"></i>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                            </>
                        ) : (
                            <i className="ri-user-line text-xl text-gray-300"></i>
                        )}
                    </button>

                    {/* Parent Menu Dropdown */}
                    {showParentMenu && (
                        <div className="parent-menu-dropdown absolute top-14 right-0 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-800 dark:text-white">
                                    {currentParent ? 'Parent Connected' : 'Parent Status'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {currentParent 
                                        ? `Connected to ${currentParent.fullname?.firstname} ${currentParent.fullname?.lastname}`
                                        : 'No parent monitoring your rides'}
                                </p>
                            </div>
                            
                            {currentParent ? (
                                <>
                                    <div className="p-4">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {currentParent.fullname?.firstname?.[0]}
                                                    {currentParent.fullname?.lastname?.[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-800 dark:text-white">
                                                    {currentParent.fullname?.firstname} {currentParent.fullname?.lastname}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {currentParent.email}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <i className="ri-shield-check-line mr-2 text-green-500"></i>
                                                <span>Can monitor your rides</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <i className="ri-map-pin-line mr-2 text-blue-500"></i>
                                                <span>Can see your location during rides</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <i className="ri-notification-line mr-2 text-yellow-500"></i>
                                                <span>Receives ride notifications</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={removeParent}
                                            className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isLoadingParent}
                                        >
                                            {isLoadingParent ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Removing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ri-user-unfollow-line mr-2"></i>
                                                    Remove Parent
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4">
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mx-auto mb-4">
                                            <i className="ri-user-line text-2xl text-gray-500 dark:text-gray-400"></i>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                            No parent is currently monitoring your rides.
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                            Parents can send you connection requests to monitor your rides.
                                        </p>
                                        
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => {
                                                    setShowParentRequests(true);
                                                    setShowParentMenu(false);
                                                }}
                                                className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-300"
                                            >
                                                <i className="ri-user-add-line mr-2"></i>
                                                View Pending Requests ({parentRequests.length})
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    setShowParentMenu(false);
                                                    addNotification('You can ask parents to send you connection requests', 'info');
                                                }}
                                                className="w-full text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                How to connect with a parent?
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
            {/* <Suspense fallback={null}>
                <ParentRequestsBadge 
                    parentRequests={parentRequests}
                    setShowParentRequests={setShowParentRequests}
                />
            </Suspense> */}

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
            <div className='fixed top-0 left-0 w-full h-2/3 z-0'>
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
                    <LiveTrackingStatic/>
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
                className='fixed w-full h-full z-30 bottom-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl'
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
                className='fixed w-full h-full z-30 bottom-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl'
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
                className='fixed w-full h-full z-30 bottom-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl'
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
                className='fixed w-full h-full z-30 bottom-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl'
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

      
        </div>
    );
};

export default Home;