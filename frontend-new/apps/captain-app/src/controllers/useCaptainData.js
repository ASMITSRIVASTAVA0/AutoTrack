import { useState } from 'react';

const useCaptainData = () => {
  const [stats, setStats] = useState({
    ridesToday: 12,
    earnings: 245,
    onlineTime: '2.4h',
    rating: 4.9
  });

  const [captainLocation, setCaptainLocation] = useState(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  return {
    stats,setStats,

    captainLocation,setCaptainLocation,

    pulseAnimation,setPulseAnimation
  };
};

export default useCaptainData;