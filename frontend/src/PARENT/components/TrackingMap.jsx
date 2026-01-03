import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define icons
const captainIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45]
});

const pickupIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45]
});

const destinationIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45]
});

// MapUpdater component
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

// Main TrackingMap component
export const TrackingMap = ({ 
  mapCenter, 
  captainLocation, 
  currentRide, 
  getRoutePolyline, 
  mapRef,
  pulseAnimation
}) => {
  return (
    <div className="h-96 rounded-xl overflow-hidden border border-white/20 shadow-2xl relative group/map">
      {/* Pulsing effect for map */}
      {pulseAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 animate-pulse z-10"></div>
      )}

      {/* CAPTAIN LOCATION, PICKUP POINT, DEST POINT SHOW IN MAP */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', backgroundColor: '#1a1a2e' }}
        whenCreated={map => mapRef.current = map}
      >
        <MapUpdater center={mapCenter} zoom={13} />
        {/* Dark theme tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Captain Location Marker with animation */}
        {captainLocation && (
          <Marker 
            position={[captainLocation.coordinates[1], captainLocation.coordinates[0]]}
            icon={captainIcon}
          >
            <Popup className="dark-popup">
              <div className="text-center p-2 bg-gray-900 text-white rounded-lg">
                <strong className="text-cyan-400">🚗 Captain</strong><br />
                {currentRide?.captain?.fullname?.firstname} {currentRide?.captain?.fullname?.lastname}<br />
                <em className="text-sm text-gray-400">Live tracking active</em>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pickup and Destination Markers */}
        {currentRide && (
          <>
            {currentRide.pickup && currentRide.pickup.location && (
              <Marker 
                position={[currentRide.pickup.location.coordinates[1], currentRide.pickup.location.coordinates[0]]}
                icon={pickupIcon}
              >
                <Popup className="dark-popup">
                  <div className="text-center p-2 bg-gray-900 text-white rounded-lg">
                    <strong className="text-amber-400">📍 Pickup Location</strong><br />
                    {currentRide.pickup.address}
                  </div>
                </Popup>
              </Marker>
            )}
            {currentRide.destination && currentRide.destination.location && (
              <Marker 
                position={[currentRide.destination.location.coordinates[1], currentRide.destination.location.coordinates[0]]}
                icon={destinationIcon}
              >
                <Popup className="dark-popup">
                  <div className="text-center p-2 bg-gray-900 text-white rounded-lg">
                    <strong className="text-rose-400">🎯 Destination</strong><br />
                    {currentRide.destination.address}
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}

        {/* Route Polyline */}
        {currentRide && captainLocation && getRoutePolyline().length > 0 && (
          <Polyline
            positions={getRoutePolyline()}
            color="#ec4899"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
};