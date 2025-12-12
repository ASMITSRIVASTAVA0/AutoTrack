// package that loads environment variables from a .env file into process.env
const dotenv = require('dotenv');
dotenv.config();//,config reads .env file and loads vars into process.env


const express = require('express');//frawework for building web servers in Node.js
const app = express();// app is server application instance


const connectToDb = require('./db/db');
connectToDb();


const cors = require('cors');// cors(cross origin resource sharing) is security feature that control which frontend domains can access API
// object defining allowed origins and methods for CORS
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
      origin === allowedOrigin 
      || 
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

app.use(cors(corsOptions));//cors middleware is inbuild
app.options('*', cors(corsOptions));
//handles CORS preflight requests from browsers
// before making certain cross-origin requests, browsers send OPTIONS request to check server permissions, called preflight request
// app.options() handles OPTIONS HTTP method for all routes with CORS settings
// OPTIONS is used for preflight requests



app.use(express.json());//express.json() is middleware that parses incoming JSON request bodies, without this req.body would be undefined
app.use(express.urlencoded({ extended: true }));
// express.urlencoded() parses incoming  HTTP req body when content type is application/x-www-form-urlencoded which is default format for html form submissions
// after parsing, it makes form data available on req.body
// extended:true means nested obj when false means only simple key-value pairs



const cookieParser = require('cookie-parser');//reads cookies from browser requests
// cookie is small piece of data stored on client side and sent with requests
app.use(cookieParser());//cookieParser middleware makes cookies avaible on req.cookies



app.get('/', (req, res) => {
  res.json({ 
    message: 'AutoTrack Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});



const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');
const parentRoutes= require('./routes/parent.routes');
const userParentRoutes= require('./routes/userParent.routes');



// API routes
app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);
app.use("/parents", parentRoutes);
app.use("/user-parents", userParentRoutes);



// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error at app.js',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

module.exports = app;