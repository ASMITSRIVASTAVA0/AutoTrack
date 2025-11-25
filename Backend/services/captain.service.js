const captainModel = require('../models/captain.model');


module.exports.createCaptain = async ({
    firstname, lastname, email, password, color, plate, capacity, vehicleType
}) => {
    if (!firstname || !email || !password || !color || !plate || !capacity || !vehicleType) {
        throw new Error('All fields are required');
    }
    
    const captainData = {
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        },
        status: 'inactive',
        earned: 0,
        rating: 5,
        totalkm: 0,
        // Don't include location at all during registration
    };

    const captain = await captainModel.create(captainData);
    return captain;
}