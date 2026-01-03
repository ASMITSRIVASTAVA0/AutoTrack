import { useState, useEffect } from 'react';

const useMouseTracking = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [parallaxLayers, setParallaxLayers] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Create parallax layers
    const layers = [];
    for (let i = 0; i < 12; i++) {
      layers.push({
        id: i,
        size: Math.random() * 50 + 20,
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: Math.random() * 0.2 + 0.1,
        delay: Math.random() * 5
      });
    }
    setParallaxLayers(layers);
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return { mousePosition, parallaxLayers };
};

export default useMouseTracking;