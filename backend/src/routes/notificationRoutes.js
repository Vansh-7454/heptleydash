const express = require('express');
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, notificationController.getAll);
router.patch('/read-all', requireAuth, notificationController.markAllAsRead);
router.patch('/:id/read', requireAuth, notificationController.markAsRead);

module.exports = router;
