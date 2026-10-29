const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', requireAuth, dashboardController.getStats);
router.get('/db-check', requireAuth, dashboardController.dbCheck);

module.exports = router;
