const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const mapController = require('../controllers/map.controller');
const { body } = require('express-validator');

router.get('/get-coordinates',
    body('address').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getCoordinates
);

router.get('/get-distance-time',
    body('origin').isString().isLength({ min: 3 }),
    body('destination').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getDistanceTime
)



module.exports = router;