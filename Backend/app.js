const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');

connectToDb();

/*
app.use(cors());
*/
const corsOptions = {
  origin: [
    // 'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:5173',
    'https://autotrack-frontend.vercel.app', // Your future Vercel URL
    'https://*.vercel.app' // Allow all Vercel deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Simple request logger to help debug network issues from the browser
// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//     next();
// });



app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);


const mapService = require('./services/maps.service');

app.get('/test-getdisttime', async (req, res) => {
    try {
        const testResult = await mapService.getDistanceTime(
            { lat: 40.7128, lng: -74.0060 }, // New York
            { lat: 34.0522, lng: -118.2437 }  // Los Angeles
        );
        res.json(testResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = app;

