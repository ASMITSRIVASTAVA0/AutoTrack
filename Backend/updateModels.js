
const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
    try {
        await mongoose.connect(process.env.DB_CONNECT_ATLAS);
        console.log('Connected to MongoDB');
        
        const User = require('./models/user.model');
        const Parent = require('./models/parent.model');
        const Captain = require('./models/captain.model');
        
        // Update all users
        const userResult = await User.updateMany(
            { isOnline: { $exists: false } },
            { $set: { isOnline: false, lastSeen: new Date() } }
        );
        console.log(`Updated ${userResult.modifiedCount} users`);
        
        // Update all parents
        const parentResult = await Parent.updateMany(
            { isOnline: { $exists: false } },
            { $set: { isOnline: false, lastSeen: new Date() } }
        );
        console.log(`Updated ${parentResult.modifiedCount} parents`);
        
        // Update all captains
        const captainResult = await Captain.updateMany(
            { isOnline: { $exists: false } },
            { $set: { isOnline: false, lastSeen: new Date() } }
        );
        console.log(`Updated ${captainResult.modifiedCount} captains`);
        
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();