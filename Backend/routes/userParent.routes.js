const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');

const userParentController = require('../controllers/userParent.controller');


router.get('/pending-parent-requests', authMiddleware.authUser, userParentController.getPendingParentRequests);
router.post('/accept-parent-request/:requestId', authMiddleware.authUser, userParentController.acceptParentRequest);
router.post('/reject-parent-request/:requestId', authMiddleware.authUser, userParentController.rejectParentRequest);


module.exports = router;