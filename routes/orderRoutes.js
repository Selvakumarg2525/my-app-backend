// At the top of orderRoutes.js
const authController = require('../controllers/authController');
// routes/orderRoutes.js
const express = require('express');
const orderController = require('../controllers/OrderController');
const router = express.Router();

router.post('/', orderController.createOrder);
router.post('/nearby', orderController.findNearbyOrders);
router.post('/:orderId/accept', orderController.acceptOrder); // Must be POST

router.post('/:orderId/deliver', orderController.confirmDelivery);
router.post('/:orderId/confirm-user', orderController.confirmDeliveryByUser);
router.post('/:orderId/review', orderController.submitReview);
router.post('/:orderId/pickup', orderController.confirmPickup);
// In your routes file
router.get('/captains/:captainId/vehicles', orderController.getCaptainVehicles);
router.get('/captain/:captainId/accepted', orderController.getCaptainAcceptedOrders);
router.get('/captain/:captainId/reviews', orderController.getCaptainReviews);
// Add to orderRoutes.js
router.get('/user/:userId/active', orderController.getUserActiveOrders);



module.exports = router;