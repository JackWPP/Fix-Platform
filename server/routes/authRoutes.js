const express = require('express');
const router = express.Router();
const { sendCode, register, login } = require('../controllers/authController');

router.post('/send-code', sendCode);
router.post('/register', register);
router.post('/login', login);

module.exports = router;