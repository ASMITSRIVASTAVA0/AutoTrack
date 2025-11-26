import React, { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import { SocketContext } from '../context/SocketContext';
import { useContext } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';

const Home = () => {
    const [pickup, setPickup] = useState('')
    const [destination, setDestination] = useState('')
    const [panelOpen, setPanelOpen] = useState(false)
    const vehiclePanelRef = useRef(null)
    const confirmRidePanelRef = useRef(null)
    const vehicleFoundRef = useRef(null)
    const waitingForDriverRef = useRef(null)
    const panelRef = useRef(null)
    const panelCloseRef = useRef(null)
    const [vehiclePanel, setVehiclePanel] = useState(false)
    const [confirmRidePanel, setConfirmRidePanel] = useState(false)
    const [vehicleFound, setVehicleFound] = useState(false)
    const [waitingForDriver, setWaitingForDriver] = useState(false)
    const [pickupSuggestions, setPickupSuggestions] = useState([])
    const [destinationSuggestions, setDestinationSuggestions] = useState([])
    const [activeField, setActiveField] = useState(null)

    const [fare, setFare] = useState({})
    const [traveltime, setTraveltime] = useState(null);
    const [duration, setDuration] = useState(null);

    const [vehicleType, setVehicleType] = useState(null)
    const [ride, setRide] = useState(null)

    const navigate = useNavigate()

    const { socket } = useContext(SocketContext)
    const { user } = useContext(UserDataContext)

    // In Home.jsx - update socket listeners
    useEffect(() => {
        const handleRideConfirmed = (data) => {
            console.log("Ride confirmed:", data);
            const rideData = data.ride || data;
            setVehicleFound(false);
            setWaitingForDriver(true);
            setRide(rideData);
        };

        const handleRideStarted = (data) => {
            console.log("Ride started:", data);
            const rideData = data.ride || data;
            setWaitingForDriver(false);
            navigate('/riding', { state: { ride: rideData } });
        };

        socket.on('ride-confirmed', handleRideConfirmed);
        socket.on('ride-started', handleRideStarted);

        return () => {
            socket.off('ride-confirmed', handleRideConfirmed);
            socket.off('ride-started', handleRideStarted);
        };
    }, [navigate]);

    useEffect(() => {
        socket.emit("join", { userType: "user", userId: user._id })
    }, [user])

    socket.on('ride-confirmed', (data) => {
        // Handle both direct ride object and nested data
        const rideData = data.ride || data;
        setRide(rideData);

        setVehicleFound(false);
        setWaitingForDriver(true);
    });

    socket.on('ride-started', (data) => {
        const rideData = data.ride || data;
        console.log("Ride started:", rideData);
        setWaitingForDriver(false);
        navigate('/riding', { state: { ride: rideData } });
    });

    const handlePickupChange = async (e) => {
        setPickup(e.target.value)
    }

    const handleDestinationChange = async (e) => {
        setDestination(e.target.value)
    }

    const submitHandler = (e) => {
        e.preventDefault()
        console.log("pickup", pickup);
        console.log("destination", destination);
    }

    useGSAP(function () {
        if (panelOpen) {
            gsap.to(panelRef.current, {
                height: '70%',
                padding: 24
            })
            gsap.to(panelCloseRef.current, {
                opacity: 1
            })
        } else {
            gsap.to(panelRef.current, {
                height: '0%',
                padding: 0
            })
            gsap.to(panelCloseRef.current, {
                opacity: 0
            })
        }
    }, [panelOpen])

    useGSAP(function () {
        if (vehiclePanel) {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [vehiclePanel])

    useGSAP(function () {
        if (confirmRidePanel) {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [confirmRidePanel])

    useGSAP(function () {
        if (vehicleFound) {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [vehicleFound])

    useGSAP(function () {
        if (waitingForDriver) {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [waitingForDriver])

    async function findTrip() {
        setVehiclePanel(true)
        setPanelOpen(false)

        console.log("findTrip me, pickup ", pickup, " destination ", destination);
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
            params: { pickup, destination },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log("fare response", response.data);
        setFare(response.data);
    }

    async function createRide() {
        console.log("create ride called");

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
                    }
                }
            );

            console.log("Ride created successfully:", response.data);

            setRide(response.data.ride || response.data);

            console.log("Ride_id ", response.data._id);
            return response.data;

        } catch (error) {
            console.error("Error creating ride:", error.response?.data || error.message);
            throw error;
        }
    }

    return (
        <div className='h-screen relative overflow-hidden'>
            {/* Logo */}
            <img
                className='w-16 absolute left-5 top-5 z-20'
                src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
                alt="autotrack"
            />

            {/* LiveTracking as Background - Fixed positioning */}
            <div className='fixed top-0 left-0 w-full h-full z-0'>
                <LiveTracking />
            </div>

            {/* Main Content Overlay */}
            <div className='relative z-10 flex flex-col justify-end h-full'>
                {/* Bottom Form Panel */}
                <div className='bg-white relative'>
                    <h5
                        ref={panelCloseRef}
                        onClick={() => setPanelOpen(false)}
                        className='absolute opacity-0 right-6 top-6 text-2xl z-30 cursor-pointer'
                    >
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>

                    <div className='p-6'>
                        <h4 className='text-2xl font-semibold'>Find a trip</h4>

                        <form className='relative py-3' onSubmit={submitHandler}>
                            <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full z-10"></div>
                            <input
                                onClick={() => {
                                    setPanelOpen(true)
                                    setActiveField('pickup')
                                }}
                                value={pickup}
                                onChange={handlePickupChange}
                                className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full relative z-20'
                                type="text"
                                placeholder='Add a pick-up location'
                            />
                            <input
                                onClick={() => {
                                    setPanelOpen(true)
                                    setActiveField('destination')
                                }}
                                value={destination}
                                onChange={handleDestinationChange}
                                className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3 relative z-20'
                                type="text"
                                placeholder='Enter your destination'
                            />
                        </form>
                        <button
                            onClick={findTrip}
                            className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full relative z-20'
                        >
                            Find Trip
                        </button>
                    </div>
                </div>

                {/* Expandable Panel */}
                <div ref={panelRef} className='bg-white h-0 overflow-hidden'>
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
                className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'
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
                className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'
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
                className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'
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
                className='fixed w-full z-30 bottom-0 bg-white px-3 py-6 pt-12'
            >
                <WaitingForDriver
                    ride={ride}
                    setVehicleFound={setVehicleFound}
                    setWaitingForDriver={setWaitingForDriver}
                    waitingForDriver={waitingForDriver}
                />
            </div>
        </div>
    )
}

export default Home