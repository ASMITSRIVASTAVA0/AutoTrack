import axios from 'axios';


const useRideHandling = ({
  captain,//captain data
  addNotification,//method to add notification
  setStats//method to update captain stats
}) => {


  const confirmRide = async (ride) => {
    if (!ride || !captain?._id) {
      addNotification('Invalid ride or captain information', 'error');
      return;
    }

    console.log("at useRideHandling.js, Confirming ride for ride", ride);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/rides/confirm`,
        {
          rideId: ride._id,
          captainId: captain._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('tokenCaptain')}`
          }
        }
      );

      // Update stats
      // setStats(prev => ({
      //   ...prev,
      //   ridesToday: prev.ridesToday + 1,
      //   earnings: prev.earnings + (ride.estimatedFare || 50)
      // }));

      // fetch states from captain 
      
      addNotification('Ride confirmed successfully!', 'success');
      
      return response.data;
    } catch (error) {
      console.error('at useRideHandling.js, Error confirming ride:', error);
      const errorMessage = error.response?.data?.message || 'Failed to confirm ride';
      addNotification(errorMessage, 'error');
      throw error;
    }
  };

  return {
    confirmRide
  };
};

export default useRideHandling;