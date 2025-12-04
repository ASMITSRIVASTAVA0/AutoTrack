
// import React, { useEffect, useState } from 'react'
// import L from 'leaflet'
// import 'leaflet/dist/leaflet.css'

// const LiveTracking = ({ captainLocation }) => {
//   const mapRef = React.useRef(null)
//   const mapInstance = React.useRef(null)
//   const markerRef = React.useRef(null)

//   useEffect(() => {
//     // Initialize map
//     if (!mapInstance.current) {
//       mapInstance.current = L.map(mapRef.current).setView(
//         [captainLocation?.lat || 28.6139, captainLocation?.lng || 77.2090],
//         15
//       )

//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; OpenStreetMap contributors',
//         maxZoom: 19,
//       }).addTo(mapInstance.current)
//     }

//     // Update marker
//     if (captainLocation) {
//       if (markerRef.current) {
//         markerRef.current.setLatLng([captainLocation.lat, captainLocation.lng])
//       } else {
//         // Create custom icon
//         const captainIcon = L.divIcon({
//           html: `
//             <div class='relative flex items-center justify-center'>
//               <div class='absolute w-10 h-10 bg-blue-400 rounded-full opacity-30 animate-ping'></div>
//               <div class='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg'>
//                 <svg class='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
//                   <path d='M12 2C7.58 2 4 5.58 4 10c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z'/>
//                 </svg>
//               </div>
//             </div>
//           `,
//           className: '',
//           iconSize: [32, 32],
//           iconAnchor: [16, 16],
//         })

//         markerRef.current = L.marker(
//           [captainLocation.lat, captainLocation.lng],
//           { icon: captainIcon }
//         )
//           .bindPopup('<b>Your Location</b>')
//           .addTo(mapInstance.current)
//       }

//       mapInstance.current.setView([captainLocation.lat, captainLocation.lng], 15)
//     }

//     return () => {
//       // Cleanup on unmount if needed
//     }
//   }, [captainLocation])

//   return (
//     <div 
//       ref={mapRef} 
//       className='w-full h-full rounded-lg'
//       style={{ zIndex: 10 }}
//     ></div>
//   )
// }

// export default LiveTracking


import React, { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  // iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  // iconUrl: require('leaflet/dist/images/marker-icon.png'),
  // shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

const LiveTracking = ({ captainLocation, ride, isTracking = true }) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)
  const routeLayer = useRef(null)
  const [bearing, setBearing] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [accuracy, setAccuracy] = useState(10)
  const [lastUpdate, setLastUpdate] = useState('Just now')
  const [showRoute, setShowRoute] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [pulseActive, setPulseActive] = useState(false)
  
  // Mock route data (in production, this would come from props or API)
  const routeCoordinates = [
    [captainLocation?.lat || 28.6139, captainLocation?.lng || 77.2090],
    [28.6145, 77.2098],
    [28.6152, 77.2105],
    [28.6160, 77.2113],
    [28.6168, 77.2122],
    [28.6175, 77.2130],
    [28.6182, 77.2138],
    [28.6190, 77.2145],
    [28.6198, 77.2153]
  ]

  // Custom Map Theme
  const darkTheme = {
    tileLayer: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  }

  const lightTheme = {
    tileLayer: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  }

  // Initialize map with dark theme
  useEffect(() => {
    setMounted(true)
    
    if (!mapInstance.current && mapRef.current) {
      const center = captainLocation ? 
        [captainLocation.lat, captainLocation.lng] : 
        [28.6139, 77.2090]

      mapInstance.current = L.map(mapRef.current, {
        center: center,
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
        preferCanvas: true,
        layers: [
          L.tileLayer(darkTheme.tileLayer, {
            attribution: darkTheme.attribution,
            maxZoom: darkTheme.maxZoom,
            className: 'map-tiles'
          })
        ]
      })

      // Add custom zoom control with better styling
      L.control.zoom({
        position: 'topright',
        zoomInTitle: 'Zoom in',
        zoomOutTitle: 'Zoom out'
      }).addTo(mapInstance.current)

      // Add custom attribution
      L.control.attribution({
        position: 'bottomright',
        prefix: '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">Leaflet</a>'
      }).addTo(mapInstance.current)

      // Add scale control
      L.control.scale({
        position: 'bottomleft',
        imperial: false,
        metric: true
      }).addTo(mapInstance.current)

      // Fit bounds with padding
      if (ride?.pickup && ride?.destination) {
        const pickup = ride.pickup.coordinates || [captainLocation.lat, captainLocation.lng]
        const destination = ride.destination.coordinates || [28.6198, 77.2153]
        
        const bounds = L.latLngBounds([pickup, destination])
        mapInstance.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16
        })
      }

      // Add traffic layer (simulated)
      addTrafficLayer()
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  // Update map when captain location changes
  useEffect(() => {
    if (mapInstance.current && captainLocation) {
      const latlng = [captainLocation.lat, captainLocation.lng]
      
      // Update marker
      if (markerRef.current) {
        // Smooth transition for marker movement
        const currentPos = markerRef.current.getLatLng()
        const newPos = L.latLng(latlng)
        
        // Calculate bearing (direction)
        if (currentPos) {
          const bearing = calculateBearing(currentPos, newPos)
          setBearing(bearing)
          setSpeed(calculateSpeed(currentPos, newPos))
        }
        
        // Smooth move animation
        markerRef.current.setLatLng(latlng)
        
        // Rotate marker based on bearing
        const markerElement = markerRef.current.getElement()
        if (markerElement) {
          markerElement.style.transform = `rotate(${bearing}deg)`
        }
      } else {
        createCaptainMarker(latlng)
      }

      // Update last update time
      setLastUpdate('Just now')
      setAccuracy(Math.random() * 5 + 5) // Simulate accuracy change

      // Trigger pulse animation
      setPulseActive(true)
      setTimeout(() => setPulseActive(false), 1000)

      // If tracking is active, pan to position
      if (isTracking) {
        mapInstance.current.panTo(latlng, {
          animate: true,
          duration: 1.5,
          easeLinearity: 0.25
        })
      }
    }
  }, [captainLocation, isTracking])

  // Draw route when ride changes
  useEffect(() => {
    if (mapInstance.current && ride && showRoute) {
      drawRoute()
    }
  }, [ride, showRoute])

  useGSAP(() => {
    if (mounted) {
      gsap.from('.map-overlay-item', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.7)'
      })
    }
  }, [mounted])

  const createCaptainMarker = (latlng) => {
    // Create custom HTML marker
    const iconHtml = `
      <div class="relative captain-marker">
        <div class="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
        <div class="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50 border-2 border-white">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
          </svg>
        </div>
        <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3"/>
          </svg>
        </div>
      </div>
    `

    const icon = L.divIcon({
      html: iconHtml,
      className: 'custom-div-icon',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24]
    })

    markerRef.current = L.marker(latlng, {
      icon: icon,
      rotationAngle: bearing,
      rotationOrigin: 'center'
    })
      .bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-gray-800">Captain Location</h3>
          <p class="text-sm text-gray-600">Lat: ${latlng[0].toFixed(6)}</p>
          <p class="text-sm text-gray-600">Lng: ${latlng[1].toFixed(6)}</p>
          <p class="text-sm text-gray-600">Speed: ${speed.toFixed(1)} km/h</p>
          <p class="text-sm text-gray-600">Updated: ${lastUpdate}</p>
        </div>
      `)
      .addTo(mapInstance.current)
  }

  const drawRoute = () => {
    // Clear existing route
    if (routeLayer.current) {
      mapInstance.current.removeLayer(routeLayer.current)
    }

    // Draw new route with animation
    routeLayer.current = L.polyline(routeCoordinates, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.7,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: '10, 10',
      dashOffset: '0'
    }).addTo(mapInstance.current)

    // Add start and end markers using custom HTML
    if (routeCoordinates.length > 1) {
      // Start marker
      const startIcon = L.divIcon({
        html: `
          <div class="relative">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </div>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })

      // End marker
      const endIcon = L.divIcon({
        html: `
          <div class="relative">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })

      L.marker(routeCoordinates[0], { icon: startIcon })
        .bindPopup('<b>Pickup Point</b><br>Start location')
        .addTo(mapInstance.current)

      L.marker(routeCoordinates[routeCoordinates.length - 1], { icon: endIcon })
        .bindPopup('<b>Destination</b><br>End location')
        .addTo(mapInstance.current)
    }

    // Animate the route
    animateRoute()
  }

  const animateRoute = () => {
    const polyline = routeLayer.current
    if (polyline) {
      let offset = 0
      const animate = () => {
        offset = (offset - 1) % 10
        polyline.options.dashOffset = offset
        polyline.setStyle(polyline.options)
        requestAnimationFrame(animate)
      }
      animate()
    }
  }

  const addTrafficLayer = () => {
    // Simulated traffic data
    const trafficData = [
      { lat: 28.6145, lng: 77.2098, severity: 'low' },
      { lat: 28.6155, lng: 77.2105, severity: 'medium' },
      { lat: 28.6170, lng: 77.2120, severity: 'high' },
      { lat: 28.6180, lng: 77.2135, severity: 'low' }
    ]

    trafficData.forEach(point => {
      const color = point.severity === 'high' ? '#ef4444' : 
                   point.severity === 'medium' ? '#f59e0b' : 
                   '#10b981'
      
      const severityColor = point.severity === 'high' ? 'red' : 
                           point.severity === 'medium' ? 'yellow' : 'green'
      
      const icon = L.divIcon({
        html: `
          <div class="relative">
            <div class="w-6 h-6 bg-${severityColor}-500 rounded-full opacity-70 animate-pulse"></div>
            <div class="absolute inset-0 border-2 border-white rounded-full opacity-50"></div>
          </div>
        `,
        className: 'traffic-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })

      L.marker([point.lat, point.lng], { icon: icon })
        .bindPopup(`<b>Traffic Alert</b><br>${point.severity.toUpperCase()} congestion`)
        .addTo(mapInstance.current)
    })
  }

  const calculateBearing = (from, to) => {
    const φ1 = from.lat * Math.PI / 180
    const φ2 = to.lat * Math.PI / 180
    const λ1 = from.lng * Math.PI / 180
    const λ2 = to.lng * Math.PI / 180
    
    const y = Math.sin(λ2 - λ1) * Math.cos(φ2)
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1)
    const θ = Math.atan2(y, x)
    
    return ((θ * 180 / Math.PI) + 360) % 360
  }

  const calculateSpeed = (from, to) => {
    const R = 6371 // Earth's radius in km
    const φ1 = from.lat * Math.PI / 180
    const φ2 = to.lat * Math.PI / 180
    const Δφ = (to.lat - from.lat) * Math.PI / 180
    const Δλ = (to.lng - from.lng) * Math.PI / 180
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c // in km
    
    // Assuming 1 second between updates for speed calculation
    return distance * 3600 // km/h
  }

  const handleRecenter = () => {
    if (mapInstance.current && captainLocation) {
      mapInstance.current.setView([captainLocation.lat, captainLocation.lng], 15, {
        animate: true,
        duration: 1,
        easeLinearity: 0.25
      })
      
      // Add pulse effect to recenter button
      setPulseActive(true)
      setTimeout(() => setPulseActive(false), 500)
    }
  }

  const handleToggleRoute = () => {
    setShowRoute(!showRoute)
    if (routeLayer.current) {
      if (showRoute) {
        mapInstance.current.removeLayer(routeLayer.current)
      } else {
        drawRoute()
      }
    }
  }

  const handleToggleTraffic = () => {
    // Toggle traffic layer visibility
    const trafficIcons = document.querySelectorAll('.traffic-icon')
    trafficIcons.forEach(icon => {
      const parent = icon.parentElement
      parent.style.display = parent.style.display === 'none' ? 'block' : 'none'
    })
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-xl"
        style={{ zIndex: 1 }}
      />
      
      {/* Custom CSS for map */}
      <style jsx>{`
        .map-tiles {
          filter: invert(0.9) hue-rotate(180deg) brightness(0.8) contrast(1.2);
        }
        
        .leaflet-control-zoom {
          border: none !important;
          background: transparent !important;
        }
        
        .leaflet-control-zoom a {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #60a5fa !important;
          backdrop-filter: blur(10px);
        }
        
        .leaflet-control-zoom a:hover {
          background: linear-gradient(135deg, #334155 0%, #1e293b 100%) !important;
          color: #93c5fd !important;
        }
        
        .leaflet-control-attribution {
          background: rgba(15, 23, 42, 0.8) !important;
          backdrop-filter: blur(10px);
          color: #94a3b8 !important;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .captain-marker {
          transition: transform 0.3s ease;
        }
        
        .captain-marker:hover {
          transform: scale(1.1);
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      {/* Map Overlay Controls */}
      <div className="absolute top-4 right-4 z-20 space-y-3">
        {/* Recenter Button */}
        <button
          onClick={handleRecenter}
          className={`map-overlay-item group relative w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl hover:shadow-blue-500/30 hover:scale-110 transition-all duration-300 ${pulseActive ? 'animate-pulse' : ''}`}
          title="Recenter map"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        </button>

        {/* Route Toggle */}
        <button
          onClick={handleToggleRoute}
          className="map-overlay-item group relative w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl hover:shadow-emerald-500/30 hover:scale-110 transition-all duration-300"
          title={showRoute ? "Hide route" : "Show route"}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <svg className={`w-5 h-5 ${showRoute ? 'text-emerald-400' : 'text-gray-400'} group-hover:text-emerald-300 transition-colors`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.5 9c-.83 0-1.5.67-1.5 1.5S3.67 12 4.5 12 6 11.33 6 10.5 5.33 9 4.5 9zm0-4c-.83 0-1.5.67-1.5 1.5S3.67 8 4.5 8 6 7.33 6 6.5 5.33 5 4.5 5zM20 8h-8v2h8V8zm-8 6h8v2h-8v-2zm13-5.5c0-.83-.67-1.5-1.5-1.5S20 3.67 20 4.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM13 3v2h8V3h-8zm0 18h8v-2h-8v2zm8-8h-8v2h8v-2z"/>
          </svg>
        </button>

        {/* Traffic Toggle */}
        <button
          onClick={handleToggleTraffic}
          className="map-overlay-item group relative w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl hover:shadow-amber-500/30 hover:scale-110 transition-all duration-300"
          title="Toggle traffic"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <svg className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 10h-2v4h2v-4zm-8 0H8v4h2v-4zm-4 0H4v4h2v-4zm16 8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v12z"/>
          </svg>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            const layers = mapInstance.current._layers
            let currentLayer
            for (let key in layers) {
              if (layers[key]._url && layers[key]._url.includes('tile')) {
                currentLayer = layers[key]
                break
              }
            }
            
            if (currentLayer && currentLayer._url.includes('dark')) {
              currentLayer.setUrl(lightTheme.tileLayer)
            } else if (currentLayer) {
              currentLayer.setUrl(darkTheme.tileLayer)
            }
          }}
          className="map-overlay-item group relative w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl hover:shadow-purple-500/30 hover:scale-110 transition-all duration-300"
          title="Toggle theme"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
          </svg>
        </button>
      </div>

      {/* Location Info Panel */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="map-overlay-item bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                </svg>
              </div>
              <div className={`absolute -top-1 -right-1 w-5 h-5 ${pulseActive ? 'bg-green-500' : 'bg-green-400'} rounded-full border-2 border-gray-900 animate-pulse`} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Live Tracking</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 6v3h3v2h-3v3h-2v-3H8V9h3V6h2zm5 4.2C18 6.57 15.35 4 12 4s-6 2.57-6 6.2c0 2.34 1.95 5.44 6 9.14 4.05-3.7 6-6.8 6-9.14z"/>
                  </svg>
                  {speed.toFixed(1)} km/h
                </span>
                <span className="text-xs text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  {bearing.toFixed(0)}°
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                Updated {lastUpdate} • ±{accuracy.toFixed(0)}m
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ride Info Panel */}
      {ride && (
        <div className="absolute top-4 left-4 z-20">
          <div className="map-overlay-item bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Active Ride</h4>
                <p className="text-xs text-emerald-300 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
                  </svg>
                  {routeCoordinates.length} waypoints • 2.2 km
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                ETA: 8 min
              </div>
              <div className="text-xs text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  <circle cx="12" cy="12" r="5"/>
                </svg>
                65%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GPS Signal Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        {pulseActive && (
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-ping opacity-30"></div>
            <div className="absolute inset-8 border-4 border-cyan-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
            <div className="absolute inset-16 border-4 border-blue-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
          </div>
        )}
      </div>

      {/* Compass Overlay */}
      <div className="absolute bottom-20 right-4 z-20">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl flex items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs text-white/60">N</div>
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ transform: `translate(-50%, -50%) rotate(${bearing}deg)` }}
            >
              <div className="w-0 h-0 border-l-6 border-r-6 border-t-8 border-transparent border-t-red-500"></div>
            </div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-white/60">S</div>
            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-xs text-white/60">W</div>
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-white/60">E</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveTracking