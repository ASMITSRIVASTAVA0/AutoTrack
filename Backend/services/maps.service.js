const axios = require('axios');
const captainModel = require('../models/captain.model');

module.exports.getAddressCoordinate = async (address) => {
    if (!address) {
        throw new Error('Address is required');
    }

    const apiKey = process.env.OPENROUTE_SERVICE_API_KEY;
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}`;

    try {
        const response = await axios.get(url);
        
        if (response.data.features && response.data.features.length > 0) {
            const coordinates = response.data.features[0].geometry.coordinates;
            // OpenRouteService returns coordinates as [longitude, latitude]
            return {
                lat: coordinates[1], // latitude
                lng: coordinates[0]  // longitude
            };
        } else {
            throw new Error('Unable to fetch coordinates - no results found');
        }
    } catch (error) {
        console.error('OpenRouteService Geocoding Error:', error);
        throw new Error('Unable to fetch coordinates: ' + error.message);
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }
    console.log("=== getDistanceTime called ===");
    console.log("Origin coords received:", origin);
    console.log("Destination coords received:", destination);
    console.log("Origin type:", typeof origin, "Keys:", Object.keys(origin));
    console.log("Destination type:", typeof destination, "Keys:", Object.keys(destination));


    const apiKey = process.env.OPENROUTE_SERVICE_API_KEY;
    console.log("api key",apiKey.trim());
    if (!apiKey) {
        throw new Error('OpenRouteService API key is missing');
    }

    try {
        // Validate coordinates
        if (typeof origin.lat === 'undefined' || typeof origin.lng === 'undefined' ||
            typeof destination.lat === 'undefined' || typeof destination.lng === 'undefined') {
            throw new Error('Invalid coordinates format');
        }

        const originCoords = [parseFloat(origin.lng), parseFloat(origin.lat)];//same as input origin
        const destinationCoords = [parseFloat(destination.lng), parseFloat(destination.lat)];

        console.log("API Key present:", !!apiKey);
        console.log("Origin coords:", originCoords);
        console.log("Destination coords:", destinationCoords);

        const directionsUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';
        
        const requestBody = {
            coordinates: [originCoords, destinationCoords],
            instructions: false,
            format: 'json'
        };

        console.log("Request body:", JSON.stringify(requestBody, null, 2));

        const response = await axios.post(directionsUrl, requestBody, {
            headers: {
                'Authorization': apiKey.trim(),
                'Content-Type': 'application/json',
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
            },
            timeout: 10000 
            // 10 second timeout
        });

        console.log("Response status:", response.status);
        
        if (!response.data.routes || response.data.routes.length === 0) {
            throw new Error('No route found between the specified locations');
        }

        const distance = response.data.routes[0].summary.distance;
        const duration = response.data.routes[0].summary.duration;
        
        return {
            distance: { value: distance },
            duration: { value: duration }
        };

    } catch (err) {
        console.error('Full error details:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            headers: err.response?.headers
        });
        
        throw new Error('Unable to fetch distance and time: ' + (err.response?.data?.error?.message || err.message));
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
                $centerSphere: [[lng, lat], radius / 6371] // [longitude, latitude], radius in radians
            }
        },
        // status: 'active' 
        // Only find active captains
    });
    console.log(`Found ${captains.length}  captains within radius`);
    for (const captain of captains) {
        console.log(`Captain ID: ${captain._id}, socketid: ${captain.socketId} Location: ${captain.location.coordinates}`);
    }

    return captains;
}

