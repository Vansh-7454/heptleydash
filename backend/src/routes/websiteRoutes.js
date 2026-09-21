const express = require('express');
const websiteController = require('../controllers/websiteController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/', requireAuth, websiteController.getAll);
router.post('/check-domain-expiry', requireAuth, requireRole('admin', 'developer'), websiteController.checkExpiry);
router.post('/', requireAuth, requireRole('admin', 'developer'), websiteController.create);
router.get('/:id', requireAuth, websiteController.getById);
router.patch('/:id', requireAuth, requireRole('admin', 'developer'), websiteController.update);
router.delete('/:id', requireAuth, requireRole('admin'), websiteController.delete);

module.exports = router;
