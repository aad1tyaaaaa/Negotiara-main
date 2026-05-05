const express = require('express');
const router = express.Router();
const { startNegotiation, getNegotiationHistory, getNegotiationById, negotiateStep } = require('../controllers/negotiationController');
const { protect, authorize } = require('../middleware/auth');
const { validateStartNegotiation, validateNegotiateStep } = require('../validators/negotiationValidator');
const { getUserMetrics } = require('../controllers/metricsController');

router.post('/start', protect, authorize('SHIPPER', 'ADMIN'), validateStartNegotiation, startNegotiation);
router.post('/chat', protect, validateNegotiateStep, negotiateStep);
router.get('/history', protect, getNegotiationHistory);
router.get('/metrics', protect, getUserMetrics);
router.get('/:id', protect, getNegotiationById);

module.exports = router;

