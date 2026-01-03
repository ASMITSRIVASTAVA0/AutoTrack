

// this file has single useEffect to track captain location and update every 2 seconds


import { useEffect } from 'react';

const useEffectCaptainLocationTracking = ({
  socket,
  captain,
  captainLocation,
  setCaptainLocation,
  setPulseAnimation,
  addNotification
}) => {


  useEffect(() => {
    if (!captain?._id) return;

    const updateLocation = () => {
              if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          position => {
                            const location = {
                              lat: position.coords.latitude,
                              lng: position.coords.longitude
                            };
                            
                            setCaptainLocation(location);
                            
                            // Only emit location if socket is connected
                            if (socket && socket.connected) {
                              // socket.emit('update-location-captain', {
                              //   captainId: captain._id,
                              //   location: location
                              // });
                            }
                            
                            setPulseAnimation(true);
                            setTimeout(() => setPulseAnimation(false), 1000);
                          },
                          (error) => {
                            console.error('Error getting location:', error);
                            addNotification('Error getting location', 'error');
                          }
                        );
              }
    };

    // Update location every 2 seconds
    const locationInterval = setInterval(updateLocation, 2000);
    updateLocation(); // Initial update

    // Cleanup
    return () => {
      clearInterval(locationInterval);
    };
  }, [socket, captain, setCaptainLocation, setPulseAnimation, addNotification]);

  useEffect(() => {
    if (!captain?._id) return;

    // single function to get and update location
    const updateLocation = () => {
              if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                            position => {
                                      const updatedLocation = {
                                        lat: position.coords.latitude,
                                        lng: position.coords.longitude
                                      };
                                      
                                      // set captain location
                                      // map marker will use this in frontend
                                      setCaptainLocation(updatedLocation);
                                      
                                      // update location to backend via socket
                                      if (socket && socket.connected) {
                                        // socket.emit('update-location-captain', {
                                        //   captainId: captain._id,
                                        //   captainLocation: captainLocation//send captainlocation to backend
                                        // });
                                      }
                                      
                                      setPulseAnimation(true);
                                      setTimeout(() => setPulseAnimation(false), 1000);
                            },



                            (error) => {
                                  console.error('at useEffectCaptainLocationTracking,error getting location:');
                                  addNotification('Error getting location', 'error');
                            }
                      );
              }
    };


    // Update location every 2 seconds
    const locationInterval = setInterval(updateLocation, 2000);
    // updateLocation();
    // ===================================================================



    // Cleanup
    return () => {
      clearInterval(locationInterval);
    };
  }, [socket, captain, setCaptainLocation, setPulseAnimation, addNotification]);

};

export default useEffectCaptainLocationTracking;