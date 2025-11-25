// const dotenv = require('dotenv');
// dotenv.config();
// const express = require('express');
// const cors = require('cors');
// const app = express();
// const cookieParser = require('cookie-parser');
// const connectToDb = require('./db/db');
// const userRoutes = require('./routes/user.routes');
// const captainRoutes = require('./routes/captain.routes');
// const mapsRoutes = require('./routes/maps.routes');
// const rideRoutes = require('./routes/ride.routes');

// connectToDb();

// /*
// app.use(cors());
// */
// const corsOptions = {
//   origin: [
//     // 'http://localhost:3000',
//     'http://localhost:4000',
//     'http://localhost:5173',
//     'https://autotrack-frontend.vercel.app', // Your future Vercel URL
//     'https://*.vercel.app' // Allow all Vercel deployments
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
// };

// app.use(cors(corsOptions));

// app.options('*', cors(corsOptions));


// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Simple request logger to help debug network issues from the browser
// // app.use((req, res, next) => {
// //     console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
// //     next();
// // });



// app.get('/', (req, res) => {
//     res.send('Hello World');
// });

// app.use('/users', userRoutes);
// app.use('/captains', captainRoutes);
// app.use('/maps', mapsRoutes);
// app.use('/rides', rideRoutes);


// const mapService = require('./services/maps.service');

// app.get('/test-getdisttime', async (req, res) => {
//     try {
//         const testResult = await mapService.getDistanceTime(
//             { lat: 40.7128, lng: -74.0060 }, // New York
//             { lat: 34.0522, lng: -118.2437 }  // Los Angeles
//         );
//         res.json(testResult);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });



// module.exports = app;


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

// Enhanced CORS for production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://autotrack-frontend.vercel.app',
      'https://*.vercel.app'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      allowedOrigin.includes('*') && origin.endsWith('.vercel.app')
    )) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Health check for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'AutoTrack Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'AutoTrack Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);

const mapService = require('./services/maps.service');

app.get('/test-getdisttime', async (req, res) => {
  try {
    const testResult = await mapService.getDistanceTime(
      { lat: 40.7128, lng: -74.0060 },
      { lat: 34.0522, lng: -118.2437 }
    );
    res.json(testResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});


// comment
module.exports = app;