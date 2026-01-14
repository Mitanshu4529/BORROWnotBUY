const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', auth, notificationController.listNotifications);
router.put('/:id/read', auth, notificationController.markRead);

module.exports = router;
