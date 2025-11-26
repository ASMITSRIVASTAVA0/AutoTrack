// import React, { useState, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Fix for default markers in react-leaflet - this is crucial!
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// // Component to update map center when position changes
// function UpdateMapView({ coords }) {
//   const map = useMap();
//   useEffect(() => {
//     if (coords && coords[0] !== 0 && coords[1] !== 0) {
//       map.setView(coords);
//     }
//   }, [coords, map]);
//   return null;
// }

// const LiveTracking = () => {
//   const [currentPosition, setCurrentPosition] = useState([0, 0]);
//   const [routePath, setRoutePath] = useState([]);
//   const [destination, setDestination] = useState(null);
//   const [zoomLevel, setZoomLevel] = useState(15);
//   const [error, setError] = useState(null);

//   // Get current location
//   useEffect(() => {
//     if (navigator.geolocation) {
//       const handlePosition = (position) => {
//         const { latitude, longitude } = position.coords;
//         console.log('Position updated:', latitude, longitude);
//         setCurrentPosition([latitude, longitude]);
//         setError(null);
//       };

//       const handleError = (error) => {
//         console.error('Geolocation error:', error);
//         setError(`Location error: ${error.message}`);
//         // Fallback position
//         setCurrentPosition([28.6139, 77.2090]); // Delhi, India as fallback
//       };

//       // Get initial position
//       navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
//         enableHighAccuracy: true,
//         // timeout: 10000,
//         // mycode
//         timeout: 1000000,
//         maximumAge: 0
//       });

//       // Watch position
//       const watchId = navigator.geolocation.watchPosition(
//         handlePosition,
//         handleError,
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 0
//         }
//       );

//       return () => navigator.geolocation.clearWatch(watchId);
//     } else {
//       setError('Geolocation not supported');
//       setCurrentPosition([28.6139, 77.2090]); // Fallback
//     }
//   }, []);

//   // Set destination
//   useEffect(() => {
//     if (currentPosition[0] !== 0 && currentPosition[1] !== 0) {
//       const demoDestination = [
//         currentPosition[0] + 0.01,
//         currentPosition[1] + 0.01
//       ];
//       setDestination(demoDestination);
//     }
//   }, [currentPosition]);

//   // Get route from OpenRouteService
//   const getRoute = async (start, end) => {
//     // Validate coordinates
//     if (!start || !end || start[0] === 0 || start[1] === 0) {
//       return;
//     }

//     try {
//       const apiKey = import.meta.env.VITE_OPENROUTE_SERVICE_API_KEY;
//       if (!apiKey) {
//         throw new Error('OpenRouteService API key missing');
//       }

//       const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
//         method: 'POST',
//         headers: {
//           'Authorization': apiKey,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           coordinates: [
//             [start[1], start[0]], // [lng, lat]
//             [end[1], end[0]]      // [lng, lat]
//           ]
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
      
//       if (data.features && data.features[0]) {
//         const coordinates = data.features[0].geometry.coordinates;
//         const path = coordinates.map(coord => [coord[1], coord[0]]); // Convert to [lat, lng]
//         setRoutePath(path);
//         setError(null);
//       }
//     } catch (error) {
//       console.error('Route fetch error:', error);
//       setError(`Route error: ${error.message}`);
//       // Fallback: straight line between points
//       setRoutePath([start, end]);
//     }
//   };

//   // Fetch route when destination changes
//   useEffect(() => {
//     if (destination && currentPosition[0] !== 0) {
//       getRoute(currentPosition, destination);
//     }
//   }, [currentPosition, destination]);

//   // Custom icons
//   const createCustomIcon = (color) => {
//     return new L.Icon({
//       iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
//       shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
//       iconSize: [25, 41],
//       iconAnchor: [12, 41],
//       popupAnchor: [1, -34],
//       shadowSize: [41, 41]
//     });
//   };

//   if (currentPosition[0] === 0 && currentPosition[1] === 0) {
//     return (
//       <div style={{ 
//         height: '100vh', 
//         width: '100%', 
//         display: 'flex', 
//         justifyContent: 'center', 
//         alignItems: 'center',
//         flexDirection: 'column'
//       }}>
//         <div>Loading your location...</div>
//         {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
//       </div>
//     );
//   }

//   return (
//     <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
//       {/* Zoom Controls */}
//       <div style={{
//         position: 'absolute',
//         top: '10px',
//         right: '10px',
//         zIndex: 1000,
//         background: 'white',
//         padding: '10px',
//         borderRadius: '5px',
//         boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '5px'
//       }}>
//         <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
//           Zoom: {zoomLevel}
//         </div>
//         <button 
//           onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
//           style={{ padding: '5px 10px', cursor: 'pointer' }}
//         >
//           +
//         </button>
//         <button 
//           onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
//           style={{ padding: '5px 10px', cursor: 'pointer' }}
//         >
//           -
//         </button>
//       </div>

//       {/* Error Display */}
//       {error && (
//         <div style={{
//           position: 'absolute',
//           top: '10px',
//           left: '10px',
//           zIndex: 1000,
//           background: '#ffebee',
//           color: '#c62828',
//           padding: '10px',
//           borderRadius: '5px',
//           maxWidth: '300px',
//           fontSize: '14px'
//         }}>
//           {error}
//         </div>
//       )}

//       <MapContainer
//         center={currentPosition}
//         zoom={zoomLevel}
//         style={{ height: '100%', width: '100%' }}
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
        
//         <UpdateMapView coords={currentPosition} />
        
//         <Marker position={currentPosition} icon={createCustomIcon('green')}>
//           <Popup>
//             Your Location<br />
//             Lat: {currentPosition[0].toFixed(4)}, Lng: {currentPosition[1].toFixed(4)}
//           </Popup>
//         </Marker>
        
//         {destination && (
//           <Marker position={destination} icon={createCustomIcon('red')}>
//             <Popup>Destination</Popup>
//           </Marker>
//         )}
        
//         {routePath.length > 0 && (
//           <Polyline
//             positions={routePath}
//             pathOptions={{ color: 'blue', weight: 4, opacity: 0.7 }}
//           />
//         )}
//       </MapContainer>
//     </div>
//   );
// };

// export default LiveTracking;

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet - this is crucial!
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to update map center when position changes
function UpdateMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] !== 0 && coords[1] !== 0) {
      map.setView(coords);
    }
  }, [coords, map]);
  return null;
}

const LiveTracking = () => {
  const [currentPosition, setCurrentPosition] = useState([0, 0]);
  const [routePath, setRoutePath] = useState([]);
  const [destination, setDestination] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [error, setError] = useState(null);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      const handlePosition = (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Position updated:', latitude, longitude);
        setCurrentPosition([latitude, longitude]);
        setError(null);
      };

      const handleError = (error) => {
        console.error('Geolocation error:', error);
        setError(`Location error: ${error.message}`);
        // Fallback position
        setCurrentPosition([28.6139, 77.2090]); // Delhi, India as fallback
      };

      // Get initial position
      navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        timeout: 1000000, // Increased timeout
        maximumAge: 0
      });

      // Watch position
      const watchId = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation not supported');
      setCurrentPosition([28.6139, 77.2090]); // Fallback
    }
  }, []);

  // Set destination
  useEffect(() => {
    if (currentPosition[0] !== 0 && currentPosition[1] !== 0) {
      const demoDestination = [
        currentPosition[0] + 0.01,
        currentPosition[1] + 0.01
      ];
      setDestination(demoDestination);
    }
  }, [currentPosition]);

  // Get route from OSRM (Free & No API Key)
  const getRoute = async (start, end) => {
    // Validate coordinates
    if (!start || !end || start[0] === 0 || start[1] === 0) {
      return;
    }

    try {
      // OSRM uses the format: start_lng,start_lat;end_lng,end_lat
      const coordsString = `${start[1]},${start[0]};${end[1]},${end[0]}`;
      
      // Using the public OSRM demo server
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
      
      console.log("Fetching route from OSRM:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if route was found
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found between the specified locations');
      }

      // OSRM returns coordinates in [lng, lat] format, convert to [lat, lng]
      const coordinates = data.routes[0].geometry.coordinates;
      const path = coordinates.map(coord => [coord[1], coord[0]]); // Convert to [lat, lng]
      
      setRoutePath(path);
      setError(null);
      
      console.log("OSRM route found, distance:", data.routes[0].distance, "meters");

    } catch (error) {
      console.error('OSRM Route fetch error:', error);
      setError(`Routing error: ${error.message}`);
      // Fallback: straight line between points
      setRoutePath([start, end]);
    }
  };

  // Fetch route when destination changes
  useEffect(() => {
    if (destination && currentPosition[0] !== 0) {
      getRoute(currentPosition, destination);
    }
  }, [currentPosition, destination]);

  // Custom icons
  const createCustomIcon = (color) => {
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  if (currentPosition[0] === 0 && currentPosition[1] === 0) {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <div>Loading your location...</div>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
          Zoom: {zoomLevel}
        </div>
        <button 
          onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
          style={{ padding: '5px 10px', cursor: 'pointer' }}
        >
          +
        </button>
        <button 
          onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
          style={{ padding: '5px 10px', cursor: 'pointer' }}
        >
          -
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          background: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '5px',
          maxWidth: '300px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <MapContainer
        center={currentPosition}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <UpdateMapView coords={currentPosition} />
        
        <Marker position={currentPosition} icon={createCustomIcon('green')}>
          <Popup>
            Your Location<br />
            Lat: {currentPosition[0].toFixed(4)}, Lng: {currentPosition[1].toFixed(4)}
          </Popup>
        </Marker>
        
        {destination && (
          <Marker position={destination} icon={createCustomIcon('red')}>
            <Popup>Destination</Popup>
          </Marker>
        )}
        
        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            pathOptions={{ color: 'blue', weight: 4, opacity: 0.7 }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveTracking;