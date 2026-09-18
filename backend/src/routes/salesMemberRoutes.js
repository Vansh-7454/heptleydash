const express = require('express');
const salesMemberController = require('../controllers/salesMemberController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/', requireAuth, salesMemberController.getAll);
router.post('/', requireAuth, requireRole('admin'), salesMemberController.create);
router.get('/:id', requireAuth, salesMemberController.getById);
router.patch('/:id', requireAuth, requireRole('admin'), salesMemberController.update);
router.patch('/:id/status', requireAuth, requireRole('admin'), salesMemberController.updateStatus);
router.delete('/:id', requireAuth, requireRole('admin'), salesMemberController.delete);

module.exports = router;
