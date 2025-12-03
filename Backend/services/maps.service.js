// http client for making api req (like fetch in node.js)
const axios = require('axios');

const captainModel = require('../models/captain.model');

// in-memory(ram) caching
const NodeCache = require('node-cache');

// Cache for geocoding results (24 hours)
const geocodeCache = new NodeCache({ stdTTL: 86400 });

// Load API keys from environment variables
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
const GRAPHHOPPER_API_KEY = process.env.GRAPHHOPPER_API_KEY;

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

    let lastError;

    // 1. First, try Geoapify Geocoding
    if (GEOAPIFY_API_KEY) {
        try {
            console.log("Attempting geocoding with Geoapify...");
            const geoapifyResult = await getAddressCoordinateGeoapify(address);
            
            // Cache the successful result
            geocodeCache.set(address, geoapifyResult);
            return geoapifyResult;
        } catch (error) {
            console.warn("Geoapify geocoding failed:", error.message);
            lastError = error;
        }
    }

    // 2. Fallback to OpenStreetMap Nominatim
    try {
        console.log("Attempting geocoding with OpenStreetMap Nominatim...");
        const osmResult = await getAddressCoordinateOSM(address);
        
        // Cache the successful result
        geocodeCache.set(address, osmResult);
        return osmResult;
    } catch (error) {
        console.warn("OpenStreetMap Nominatim geocoding failed:", error.message);
        lastError = error;
    }

    // If all services fail, throw the last error
    throw new Error(`All geocoding services failed. Last error: ${lastError.message}`);
};

// Geoapify Geocoding Implementation
async function getAddressCoordinateGeoapify(address) {

    // encodeURIComponent( input="a s m i t", output="a%20s%20m%20i%20t"), limit=return only top res
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}&limit=1`;

    const response = await axios.get(url, {
        timeout: 20000,
        headers: {
            'User-Agent': 'AutoTrack App srivastava1234asmit@gmail.com'
        }
    });

    if (response.data.features && response.data.features.length > 0) {
        const result = response.data.features[0];
        const coordinates = {
            lat: parseFloat(result.properties.lat),
            lng: parseFloat(result.properties.lon)
        };
        return coordinates;
    } else {
        throw new Error('Address not found with Geoapify');
    }
}

// OpenStreetMap Nominatim Geocoding Implementation (your existing function)
async function getAddressCoordinateOSM(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    // Respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'AutoTrack App srivastava1234asmit@gmail.com'
        },
        timeout: 20000
    });
    
    if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const coordinates = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
        };
        return coordinates;
    } else {
        throw new Error('Address not found with OpenStreetMap');
    }
}

// Main function with fallback logic for routing
module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    // Validate coordinates
    if (typeof origin.lat === 'undefined' || typeof origin.lng === 'undefined' ||
        typeof destination.lat === 'undefined' || typeof destination.lng === 'undefined') {
        throw new Error('Invalid coordinates format');
    }

    let lastError;

    // 1. First, try Geoapify Routing API
    if (GEOAPIFY_API_KEY) {
        try {
            console.log("Attempting routing with Geoapify...");
            const geoapifyResult = await getDistanceTimeGeoapify(origin, destination);
            return geoapifyResult;
        } catch (error) {
            console.warn("Geoapify routing failed:", error.message);
            lastError = error;
        }
    }

    // 2. If Geoapify fails, try GraphHopper
    if (GRAPHHOPPER_API_KEY) {
        try {
            console.log("Attempting routing with GraphHopper...");
            const graphHopperResult = await getDistanceTimeGraphHopper(origin, destination);
            return graphHopperResult;
        } catch (error) {
            console.warn("GraphHopper routing failed:", error.message);
            lastError = error;
        }
    }

    // 3. Final fallback to OSRM
    try {
        console.log("Attempting routing with OSRM...");
        const osrmResult = await getDistanceTimeOSRM(origin, destination);
        return osrmResult;
    } catch (error) {
        console.warn("OSRM routing failed:", error.message);
        lastError = error;
    }

    // If all services fail, throw the last error
    throw new Error(`All routing services failed. Last error: ${lastError.message}`);
};

// Geoapify Routing Implementation
async function getDistanceTimeGeoapify(origin, destination) {
    const waypoints = `${origin.lat},${origin.lng}|${destination.lat},${destination.lng}`;
    const url = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${GEOAPIFY_API_KEY}&format=json`;

    const response = await axios.get(url, { 
        timeout: 20000,
        headers: {
            'User-Agent': 'AutoTrack App srivastava1234asmit@gmail.com'
        }
    });

    if (response.data.features && response.data.features.length > 0) {
        const route = response.data.features[0].properties;
        // Geoapify returns distance in meters and time in seconds
        const distance = route.distance;
        const duration = route.time;

        console.log("Geoapify route found - Distance:", distance, "meters, Duration:", duration, "seconds");

        return {
            distance: { value: distance },
            duration: { value: duration }
        };
    } else {
        throw new Error('No route found with Geoapify');
    }
}

// GraphHopper Routing Implementation
async function getDistanceTimeGraphHopper(origin, destination) {
    const point = `${origin.lat},${origin.lng}`;
    const pointTo = `${destination.lat},${destination.lng}`;
    const url = `https://graphhopper.com/api/1/route?point=${point}&point=${pointTo}&vehicle=car&key=${GRAPHHOPPER_API_KEY}&type=json`;

    const response = await axios.get(url, { 
        timeout: 20000,
        headers: {
            'User-Agent': 'AutoTrack App srivastava1234asmit@gmail.com'
        }
    });

    if (response.data.paths && response.data.paths.length > 0) {
        const path = response.data.paths[0];
        // GraphHopper returns distance in meters and time in milliseconds
        const distance = path.distance;
        const duration = path.time / 1000; // Convert ms to seconds

        console.log("GraphHopper route found - Distance:", distance, "meters, Duration:", duration, "seconds");

        return {
            distance: { value: distance },
            duration: { value: duration }
        };
    } else {
        throw new Error('No route found with GraphHopper');
    }
}

// OSRM Routing Implementation (your existing function)
async function getDistanceTimeOSRM(origin, destination) {
    const originStr = `${origin.lng},${origin.lat}`;
    const destinationStr = `${destination.lng},${destination.lat}`;
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originStr};${destinationStr}?overview=false`;

    console.log("Using OSRM for routing");
    console.log("Request URL:", osrmUrl);

    const response = await axios.get(osrmUrl, { 
        timeout: 20000,
        headers: {
            'User-Agent': 'AutoTrack App srivastava1234asmit@gmail.com'
        }
    });

    console.log("OSRM Response status:", response.status);
    
    if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
        throw new Error('No route found with OSRM');
    }

    const route = response.data.routes[0];
    const distance = route.distance; // meters
    const duration = route.duration; // seconds
    
    console.log("OSRM route found - Distance:", distance, "meters, Duration:", duration, "seconds");
    
    return {
        distance: { value: distance },
        duration: { value: duration }
    };
}

module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {
    // Validate coordinates
    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates provided');
    }

    console.log(`Finding captains within ${radius} km of pickup coords: [${lat}, ${lng}]`);

    // radius in km

    // $geoWithIn is mongodb geospatial query, finds documents within specified area
    // $centerSphere defines circular area on sphere
    // mongodb require radius in radians, so radians=km/earthradius
    // coordinate order in mongodb=> $centerSphere:[[lng,lat],radius]
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius / 6371]//earth radius in km
            }
        },
    });
    
    console.log(`Found ${captains.length} captains within radius`);
    return captains;
}