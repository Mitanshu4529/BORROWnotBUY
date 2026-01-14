const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/nearby-items', locationController.getNearbyItems);
router.get('/nearby-users', locationController.getNearbyUsers);

module.exports = router;
