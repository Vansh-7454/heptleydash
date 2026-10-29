const express = require('express');
const leadController = require('../controllers/leadController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, leadController.getAll);
router.post('/', requireAuth, leadController.create);
router.get('/:id', requireAuth, leadController.getById);
router.patch('/:id', requireAuth, leadController.update);
router.post('/:id/convert', requireAuth, leadController.convertLead);

module.exports = router;
