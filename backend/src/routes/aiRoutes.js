const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// Public status check to inspect AI service readiness
router.get('/status', aiController.getStatus);

// Authenticated AI Endpoints (Protected by Auth & AI Rate Limiter)
router.use(requireAuth);
router.use(aiLimiter);

router.post('/customer-summary', aiController.getCustomerSummary);
router.post('/follow-up-recommendation', aiController.getFollowUpRecommendation);
router.post('/follow-up-message', aiController.getFollowUpMessage);
router.post('/lead-analysis', aiController.getLeadAnalysis);
router.post('/meeting-notes', aiController.processMeetingNotes);
router.post('/agent', aiController.processAgentChat);
router.post('/confirm-action', aiController.confirmAction);

module.exports = router;
