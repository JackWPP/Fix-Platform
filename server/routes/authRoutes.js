const express = require('express');
const router = express.Router();
const { sendCode, register, login, loginWithCode, adminRegister } = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.post('/send-code', sendCode);
router.post('/register', register);
router.post('/login', login);
router.post('/login-with-code', loginWithCode);
router.post('/admin-register', auth, roleAuth(['admin']), adminRegister);

module.exports = router;