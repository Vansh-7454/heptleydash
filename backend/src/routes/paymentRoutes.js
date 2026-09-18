const express = require('express');
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, paymentController.getAll);
router.post('/', requireAuth, paymentController.create);

module.exports = router;
