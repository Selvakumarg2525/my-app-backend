const express = require('express');
const pricingController = require('../controllers/pricingController');
const router = express.Router();

router.get('/goods-types', pricingController.getGoodsTypes);
router.post('/calculate', pricingController.calculatePrice);

module.exports = router;