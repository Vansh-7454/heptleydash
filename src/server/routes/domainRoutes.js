const express = require('express');
const domainController = require('../controllers/domainController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/', requireAuth, domainController.getAll);
router.post('/', requireAuth, requireRole('admin', 'developer'), domainController.create);
router.get('/:id', requireAuth, domainController.getById);
router.patch('/:id', requireAuth, requireRole('admin', 'developer'), domainController.update);
router.delete('/:id', requireAuth, requireRole('admin'), domainController.delete);

module.exports = router;
