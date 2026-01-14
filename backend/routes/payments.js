const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/order', auth, paymentController.createOrder);
router.post('/confirm', auth, paymentController.confirmPayment);
router.post('/webhook', express.raw({ type: '*/*' }), paymentController.webhook);

module.exports = router;
