const express = require('express');
const router = express.Router();
const { generateSummary, generateInsights } = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

router.post('/summary', authMiddleware, generateSummary);
router.post('/insights', authMiddleware, generateInsights);

module.exports = router;