const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/profile/:userId', userController.getUserProfile);
router.get('/stats', auth, userController.getUserStats);

module.exports = router;
