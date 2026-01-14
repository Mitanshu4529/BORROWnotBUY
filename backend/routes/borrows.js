const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const auth = require('../middleware/auth');

// Protected routes
router.post('/', auth, borrowController.createBorrowRequest);
router.get('/active', auth, borrowController.getActiveBorrows);
router.get('/history', auth, borrowController.getBorrowHistory);
router.get('/received', auth, borrowController.getReceivedBorrowRequests);
router.put('/:borrowId/approve', auth, borrowController.approveBorrowRequest);
router.put('/:borrowId/return', auth, borrowController.markAsReturned);

module.exports = router;
