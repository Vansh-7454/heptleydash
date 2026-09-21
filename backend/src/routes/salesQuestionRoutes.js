const express = require('express');
const salesQuestionController = require('../controllers/salesQuestionController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/', requireAuth, salesQuestionController.getAll);
router.post('/', requireAuth, requireRole('admin', 'sales'), salesQuestionController.create);
router.get('/:id', requireAuth, salesQuestionController.getById);
router.post('/:id/answer', requireAuth, requireRole('admin', 'developer'), salesQuestionController.answer);
router.patch('/:id/answer', requireAuth, requireRole('admin', 'developer'), salesQuestionController.answer);
router.patch('/:id', requireAuth, salesQuestionController.update);
router.delete('/:id', requireAuth, requireRole('admin', 'sales'), salesQuestionController.delete);

module.exports = router;
