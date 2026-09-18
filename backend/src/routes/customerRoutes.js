const express = require('express');
const customerController = require('../controllers/customerController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, customerController.getAll);
router.post('/', requireAuth, customerController.create);
router.get('/:id', requireAuth, customerController.getById);
router.patch('/:id', requireAuth, customerController.update);

module.exports = router;
