const express = require('express');
const followUpController = require('../controllers/followUpController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, followUpController.getAll);
router.post('/', requireAuth, followUpController.create);
router.patch('/:id/complete', requireAuth, followUpController.complete);
router.patch('/:id/cancel', requireAuth, followUpController.cancel);
router.patch('/:id', requireAuth, followUpController.update);
router.delete('/:id', requireAuth, followUpController.delete);

module.exports = router;
