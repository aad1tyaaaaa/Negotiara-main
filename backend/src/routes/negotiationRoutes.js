const express = require('express');
const router = express.Router();
const { startNegotiation, getNegotiationHistory, getNegotiationById, negotiateStep } = require('../controllers/negotiationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/start', protect, authorize('SHIPPER', 'ADMIN'), startNegotiation);
router.post('/chat', protect, negotiateStep);
router.get('/history', protect, getNegotiationHistory);
router.get('/:id', protect, getNegotiationById);

module.exports = router;
