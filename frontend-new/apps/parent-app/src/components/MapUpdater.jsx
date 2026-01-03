import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

export default MapUpdater;