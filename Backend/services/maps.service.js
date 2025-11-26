// const axios = require('axios');
// const captainModel = require('../models/captain.model');

// module.exports.getAddressCoordinate = async (address) => {
//     if (!address) {
//         throw new Error('Address is required');
//     }

//     const apiKey = process.env.OPENROUTE_SERVICE_API_KEY;
//     const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}`;

//     try {
//         const response = await axios.get(url);
        
//         if (response.data.features && response.data.features.length > 0) {
//             const coordinates = response.data.features[0].geometry.coordinates;
//             // OpenRouteService returns coordinates as [longitude, latitude]
//             return {
//                 lat: coordinates[1], // latitude
//                 lng: coordinates[0]  // longitude
//             };
//         } else {
//             throw new Error('Unable to fetch coordinates - no results found');
//         }
//     } catch (error) {
//         console.error('OpenRouteService Geocoding Error:', error);
//         throw new Error('Unable to fetch coordinates: ' + error.message);
//     }
// }

// module.exports.getDistanceTime = async (origin, destination) => {
//     if (!origin || !destination) {
//         throw new Error('Origin and destination are required');
//     }

//     const apiKey = process.env.OPENROUTE_SERVICE_API_KEY;
    
//     if (!apiKey) {
//         throw new Error('OpenRouteService API key is missing');
//     }

//     try {
//         // Validate coordinates
//         if (typeof origin.lat === 'undefined' || typeof origin.lng === 'undefined' ||
//             typeof destination.lat === 'undefined' || typeof destination.lng === 'undefined') {
//             throw new Error('Invalid coordinates format');
//         }

//         const originCoords = [parseFloat(origin.lng), parseFloat(origin.lat)];
//         const destinationCoords = [parseFloat(destination.lng), parseFloat(destination.lat)];

//         console.log("API Key present:", !!apiKey);

//         // Use API key as query parameter instead of header
//         const directionsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${encodeURIComponent(apiKey)}`;
        
//         const requestBody = {
//             coordinates: [originCoords, destinationCoords],
//             instructions: false,
//             format: 'json'
//         };

//         console.log("Request URL (without key):", 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=***');
//         console.log("Request body:", JSON.stringify(requestBody, null, 2));

//         const response = await axios.post(directionsUrl, requestBody, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
//             },
//             timeout: 10000
//         });

//         console.log("Response status:", response.status);
        
//         if (!response.data.routes || response.data.routes.length === 0) {
//             throw new Error('No route found between the specified locations');
//         }

//         const distance = response.data.routes[0].summary.distance;
//         const duration = response.data.routes[0].summary.duration;
        
//         return {
//             distance: { value: distance },
//             duration: { value: duration }
//         };

//     } catch (err) {
//         console.error('Full error details:', {
//             message: err.message,
//             response: err.response?.data,
//             status: err.response?.status,
//         });
        
//         if (err.response?.status === 403) {
//             throw new Error('OpenRouteService blocked request from Render. The service may be blocking cloud deployment IPs.');
//         }
        
//         throw new Error('Unable to fetch distance and time: ' + (err.response?.data?.error?.message || err.message));
//     }
// }


// module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {
//     // Validate coordinates
//     if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
//         throw new Error('Invalid coordinates provided');
//     }

//     console.log(`Finding captains within ${radius} km of pickup coords: [${lat}, ${lng}]`);

//     // radius in km
//     const captains = await captainModel.find({
//         location: {
//             $geoWithin: {
//                 $centerSphere: [[lng, lat], radius / 6371] // [longitude, latitude], radius in radians
//             }
//         },
//         // status: 'active' 
//         // Only find active captains
//     });
//     console.log(`Found ${captains.length}  captains within radius`);
//     for (const captain of captains) {
//         console.log(`Captain ID: ${captain._id}, socketid: ${captain.socketId} Location: ${captain.location.coordinates}`);
//     }

//     return captains;
// }

const axios = require('axios');
const captainModel = require('../models/captain.model');
const NodeCache = require('node-cache');

// Cache for geocoding results (24 hours)
const geocodeCache = new NodeCache({ stdTTL: 86400 });

module.exports.getAddressCoordinate = async (address) => {
    if (!address) {
        throw new Error('Address is required');
    }

    // Check cache first
    const cached = geocodeCache.get(address);
    if (cached) {
        console.log('Returning cached geocode result');
        return cached;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    try {
        // Respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'AutoTrack App srivastava1234asmit@gmail.com'
            },
            timeout: 10000
        });
        
        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            const coordinates = {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
            };
            
            // Cache the result
            geocodeCache.set(address, coordinates);
            return coordinates;
        } else {
            throw new Error('Address not found');
        }
    } catch (error) {
        console.error('Geocoding Error:', error);
        throw new Error('Unable to fetch coordinates: ' + error.message);
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    try {
        // Validate coordinates
        if (typeof origin.lat === 'undefined' || typeof origin.lng === 'undefined' ||
            typeof destination.lat === 'undefined' || typeof destination.lng === 'undefined') {
            throw new Error('Invalid coordinates format');
        }

        const originStr = `${origin.lng},${origin.lat}`;
        const destinationStr = `${destination.lng},${destination.lat}`;
        
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originStr};${destinationStr}?overview=false`;
        
        console.log("Using OSRM for routing");
        console.log("Request URL:", osrmUrl);

        const response = await axios.get(osrmUrl, { 
            timeout: 10000 
        });

        console.log("OSRM Response status:", response.status);
        
        if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
            throw new Error('No route found between the specified locations');
        }

        const route = response.data.routes[0];
        const distance = route.distance; // meters
        const duration = route.duration; // seconds
        
        console.log("Route found - Distance:", distance, "meters, Duration:", duration, "seconds");
        
        return {
            distance: { value: distance },
            duration: { value: duration }
        };

    } catch (err) {
        console.error('OSRM Routing Error:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
        });
        
        throw new Error('Unable to fetch distance and time: ' + err.message);
    }
}

module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {
    // Validate coordinates
    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates provided');
    }

    console.log(`Finding captains within ${radius} km of pickup coords: [${lat}, ${lng}]`);

    // radius in km
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius / 6371]
            }
        },
        // status: 'active' 
    });
    
    console.log(`Found ${captains.length} captains within radius`);
    return captains;
}