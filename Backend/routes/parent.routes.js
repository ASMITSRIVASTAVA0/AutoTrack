const express = require('express');
const router = express.Router();

const { body } = require("express-validator");


const parentController = require('../controllers/parent.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 6 characters long')
],
    parentController.registerParent
)

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 6 characters long')
],
    parentController.loginParent
)

router.post('/add-child/:childId', authMiddleware.authParent, parentController.addChild)

router.delete('/remove-child/:childId', authMiddleware.authParent, parentController.removeChild)

router.get('/profile', authMiddleware.authParent, parentController.getParentProfile)

router.get('/notifications', authMiddleware.authParent, parentController.getNotifications)

router.patch('/mark-notification-read/:notificationId', authMiddleware.authParent, parentController.markNotificationAsRead)

router.get('/child-location/:childId', authMiddleware.authParent, parentController.getChildLocation)

router.get('/logout', authMiddleware.authParent, parentController.logoutParent)

router.post('/send-request', [
    body('userEmail').isEmail().withMessage('Invalid Email')
], authMiddleware.authParent, parentController.sendChildRequest);

router.get('/pending-requests', authMiddleware.authParent, parentController.getPendingRequests);

router.delete('/cancel-request/:requestId', authMiddleware.authParent, parentController.cancelChildRequest);

// Update add-child to use request acceptance flow
router.post('/add-child', authMiddleware.authParent, parentController.addChild);

module.exports = router;