const express = require('express');
const router = express.Router();
const { login, googleLogin, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/me', authMiddleware, getMe);

module.exports = router;