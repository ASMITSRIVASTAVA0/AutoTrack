
import { useState } from 'react';
import axios from 'axios';

const useRideManagement = ({
  pickup,setPickup,

  destination,setDestination,

  vehicleType,setVehiclePanel,

  addNotification
}) => {
  const [ride, setRide] = useState(null);
  const [fare, setFare] = useState(null); // CHANGED: Use state instead of local variable

  const handlePickupChange = async (e) => {
    setPickup(e.target.value);
  };

  const handleDestinationChange = async (e) => {
    setDestination(e.target.value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };

  const calcFare = async () => {
    if (!pickup || !destination) {
      addNotification('Please enter both pickup and destination locations', 'error');
      return;
    }

    try {
      console.log("at controller.user/useRideManagment.js, calcFare me, pickup ", pickup, " destination ", destination);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rides/get-fare`, {
        params: { pickup, destination },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokenUser')}`
        },
        timeout: 20000
      });

      console.log("fare response", response.data);
      setFare(response.data); // CHANGED: Use setFare to update state
      
      // Show vehicle panel after getting fare
      setVehiclePanel(true);
      
    } catch (error) {
      console.error("Error getting fare:", error);
      addNotification('Failed to calculate fare. Please try again.', 'error');
    }
  };

  const createRide = async () => {
    console.log("at controller.user/useRideManagement.js, create ride called");

    if (!vehicleType) {
      addNotification('Please select a vehicle type', 'error');
      return;
    }
    if(!pickup||!destination){
      addNotification("Please enter valid pickup or destination","error");
      return;
    }
    if (!fare) {
      addNotification("Please calculate fare first", "error");
      return;
    }

    const rideData = {
      pickup: {
        address:pickup
      },
      destination: {
        address:destination
      },
      vehicleType: vehicleType,
      fare: fare[vehicleType] // CHANGED: Access the specific fare based on vehicle type
    };

    console.log("Sending ride data,pickup="+pickup+" dest="+destination," vehicletype="+vehicleType+" fare="+fare[vehicleType]);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/rides/create`,
        rideData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('tokenUser')}`
          },
          timeout: 15000
        }
      );

      console.log("Ride created successfully, rideid=", response.data?.ride._id);
      setRide(response.data.ride );
      addNotification('Ride created successfully! Looking for captain...', 'success');

      return response.data;

    } catch (error) {
      console.error("at controller.user/useRideManangement.js, Error creating ride");
      const errorMessage = error.response?.data?.message || 'Failed to create ride';
      addNotification(errorMessage, 'error');
      throw error;
    }
  };

  return {
    ride,
    setRide,
    fare,
    setFare, // Added
    calcFare,
    createRide,
    handlePickupChange,
    handleDestinationChange,
    submitHandler
  };
};

export default useRideManagement;
