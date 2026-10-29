const express = require('express');
const activityController = require('../controllers/activityController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, activityController.getAll);
router.post('/', requireAuth, activityController.create);

module.exports = router;
